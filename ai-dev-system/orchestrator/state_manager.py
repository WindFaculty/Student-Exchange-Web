from __future__ import annotations

import json
import sqlite3
import threading
from pathlib import Path
from typing import Any

from communication.agent_protocol import TaskRecord, TaskStatus, utc_now_iso


class StateManager:
    def __init__(self, task_root: Path):
        self._task_root = task_root
        self._db_path = task_root / "task_state.db"
        self._queue_path = task_root / "task_queue.json"
        self._history_path = task_root / "task_history.json"
        self._lock = threading.RLock()
        self._ensure_layout()

    def _ensure_layout(self) -> None:
        self._task_root.mkdir(parents=True, exist_ok=True)
        if not self._queue_path.exists():
            self._queue_path.write_text("[]", encoding="utf-8")
        if not self._history_path.exists():
            self._history_path.write_text("[]", encoding="utf-8")
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self._db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS task_state (
                    task_id TEXT PRIMARY KEY,
                    status TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def _read_json(self, path: Path) -> list[Any]:
        if not path.exists():
            return []
        raw = path.read_text(encoding="utf-8").strip()
        if not raw:
            return []
        return json.loads(raw)

    def _write_json(self, path: Path, payload: list[Any]) -> None:
        path.write_text(json.dumps(payload, ensure_ascii=True, indent=2), encoding="utf-8")

    def _save_record(self, record: TaskRecord) -> None:
        payload_json = json.dumps(record.model_dump(), ensure_ascii=True)
        with sqlite3.connect(self._db_path) as conn:
            conn.execute(
                """
                INSERT INTO task_state(task_id, status, payload_json, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(task_id) DO UPDATE SET
                    status=excluded.status,
                    payload_json=excluded.payload_json,
                    updated_at=excluded.updated_at
                """,
                (
                    record.task_id,
                    record.status.value,
                    payload_json,
                    record.created_at,
                    record.updated_at,
                ),
            )
            conn.commit()

    def create_task(self, record: TaskRecord) -> None:
        with self._lock:
            self._save_record(record)
            queue = self._read_json(self._queue_path)
            queue.append({"task_id": record.task_id, "queued_at": record.created_at})
            self._write_json(self._queue_path, queue)

    def get_task(self, task_id: str) -> TaskRecord | None:
        with sqlite3.connect(self._db_path) as conn:
            row = conn.execute(
                "SELECT payload_json FROM task_state WHERE task_id = ?",
                (task_id,),
            ).fetchone()
        if not row:
            return None
        return TaskRecord.model_validate(json.loads(row[0]))

    def update_task(self, task_id: str, **changes: Any) -> TaskRecord:
        with self._lock:
            existing = self.get_task(task_id)
            if not existing:
                raise KeyError(f"Task not found: {task_id}")
            updated = existing.model_copy(update={**changes, "updated_at": utc_now_iso()})
            self._save_record(updated)
            if updated.status != TaskStatus.QUEUED:
                self._dequeue_task(task_id)
            if updated.status in {TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED}:
                self._append_history(updated)
            return updated

    def append_event(self, task_id: str, event_payload: dict[str, Any]) -> TaskRecord:
        with self._lock:
            record = self.get_task(task_id)
            if not record:
                raise KeyError(f"Task not found: {task_id}")
            events = list(record.events)
            events.append(event_payload)
            return self.update_task(task_id, events=events)

    def request_cancel(self, task_id: str) -> TaskRecord | None:
        record = self.get_task(task_id)
        if not record:
            return None
        if record.status in {TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED}:
            return record
        return self.update_task(task_id, status=TaskStatus.CANCELLING)

    def _dequeue_task(self, task_id: str) -> None:
        queue = self._read_json(self._queue_path)
        filtered = [entry for entry in queue if entry.get("task_id") != task_id]
        if len(filtered) != len(queue):
            self._write_json(self._queue_path, filtered)

    def _append_history(self, record: TaskRecord) -> None:
        history = self._read_json(self._history_path)
        for existing in history:
            if existing.get("task_id") == record.task_id:
                existing.update(
                    {
                        "status": record.status.value,
                        "updated_at": record.updated_at,
                        "result": record.result,
                        "error": record.error,
                    }
                )
                self._write_json(self._history_path, history)
                return
        history.append(
            {
                "task_id": record.task_id,
                "task_type": record.task_type,
                "objective": record.objective,
                "workflow_id": record.workflow_id,
                "status": record.status.value,
                "created_at": record.created_at,
                "updated_at": record.updated_at,
                "result": record.result,
                "error": record.error,
            }
        )
        self._write_json(self._history_path, history)
