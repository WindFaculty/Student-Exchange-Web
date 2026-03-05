from __future__ import annotations

import queue
import time
from pathlib import Path
from typing import Any

from communication.event_stream import EventStream
from communication.message_bus import BusConfig, RedisMessageBus
from orchestrator.agent_router import AgentRouter
from orchestrator.state_manager import StateManager
from orchestrator.task_dispatcher import TaskDispatcher
from orchestrator.workflow_manager import WorkflowManager
from planner.task_planner import TaskPlanner


class FakeBus:
    def __init__(self) -> None:
        self._queue: queue.Queue[dict[str, Any]] = queue.Queue()
        self.published: list[dict[str, Any]] = []

    def ping(self) -> bool:
        return True

    def queue_task(self, task_payload: dict[str, Any]) -> None:
        self._queue.put(task_payload)

    def pop_task(self, timeout_seconds: int = 1) -> dict[str, Any] | None:
        try:
            return self._queue.get(timeout=timeout_seconds)
        except queue.Empty:
            return None

    def publish_event(self, event_payload: dict[str, Any]) -> None:
        self.published.append(event_payload)

    def queue_depth(self) -> int:
        return self._queue.qsize()

    def close(self) -> None:
        return


def test_workflow_manager_resolves_defaults() -> None:
    root = Path(__file__).resolve().parents[1] / "workflows"
    manager = WorkflowManager(root)
    workflow = manager.resolve_workflow(task_type="debug")
    assert workflow["workflow_id"] == "debug_pipeline"
    assert len(workflow["steps"]) >= 1


def test_dispatcher_processes_task_end_to_end(tmp_path: Path) -> None:
    fake_bus = FakeBus()
    state_manager = StateManager(task_root=tmp_path)
    workflow_manager = WorkflowManager(Path(__file__).resolve().parents[1] / "workflows")
    dispatcher = TaskDispatcher(
        state_manager=state_manager,
        workflow_manager=workflow_manager,
        planner=TaskPlanner(),
        router=AgentRouter(),
        bus=fake_bus,  # type: ignore[arg-type]
        event_stream=EventStream(fake_bus),  # type: ignore[arg-type]
        max_workers=2,
    )
    dispatcher.start()
    from communication.agent_protocol import TaskRecord, TaskStatus

    task = TaskRecord(
        task_id="task-001",
        task_type="build",
        objective="Implement test feature",
        workflow_id="build_project",
        status=TaskStatus.QUEUED,
    )
    dispatcher.submit(task)

    deadline = time.time() + 10
    while time.time() < deadline:
        current = state_manager.get_task(task.task_id)
        if current and current.status in {TaskStatus.COMPLETED, TaskStatus.FAILED}:
            break
        time.sleep(0.1)

    dispatcher.stop()
    final_state = state_manager.get_task(task.task_id)
    assert final_state is not None
    assert final_state.status == TaskStatus.COMPLETED
    assert final_state.result is not None


def test_message_bus_can_be_patched_with_fakeredis(monkeypatch) -> None:
    import fakeredis
    import redis

    fake_client = fakeredis.FakeRedis(decode_responses=True)
    monkeypatch.setattr(redis.Redis, "from_url", lambda *_args, **_kwargs: fake_client)

    bus = RedisMessageBus(BusConfig("redis://unused", "q:test", "events:test"))
    assert bus.ping() is True
    bus.queue_task({"task_id": "abc"})
    popped = bus.pop_task(timeout_seconds=1)
    assert popped == {"task_id": "abc"}
