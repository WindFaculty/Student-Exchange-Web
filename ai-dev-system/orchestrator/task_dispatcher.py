from __future__ import annotations

import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from communication.agent_protocol import TaskEvent, TaskRecord, TaskStatus
from communication.event_stream import EventStream
from communication.message_bus import RedisMessageBus
from orchestrator.agent_router import AgentRouter
from orchestrator.state_manager import StateManager
from orchestrator.workflow_manager import WorkflowManager
from planner.task_planner import TaskPlanner


LOGGER = logging.getLogger(__name__)


class TaskDispatcher:
    def __init__(
        self,
        state_manager: StateManager,
        workflow_manager: WorkflowManager,
        planner: TaskPlanner,
        router: AgentRouter,
        bus: RedisMessageBus,
        event_stream: EventStream,
        max_workers: int = 4,
    ) -> None:
        self._state_manager = state_manager
        self._workflow_manager = workflow_manager
        self._planner = planner
        self._router = router
        self._bus = bus
        self._event_stream = event_stream
        self._pool = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="agentic-worker")
        self._stop_event = threading.Event()
        self._consumer_thread: threading.Thread | None = None

    def start(self) -> None:
        if self._consumer_thread and self._consumer_thread.is_alive():
            return
        self._consumer_thread = threading.Thread(target=self._consume_loop, daemon=True, name="agentic-consumer")
        self._consumer_thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._consumer_thread and self._consumer_thread.is_alive():
            self._consumer_thread.join(timeout=5)
        self._pool.shutdown(wait=False, cancel_futures=True)

    def submit(self, task_record: TaskRecord) -> None:
        self._state_manager.create_task(task_record)
        self._bus.queue_task({"task_id": task_record.task_id})
        self._event_stream.emit(
            "task.queued",
            {"task_id": task_record.task_id, "objective": task_record.objective},
        )

    def _consume_loop(self) -> None:
        while not self._stop_event.is_set():
            try:
                payload = self._bus.pop_task(timeout_seconds=1)
                if not payload:
                    continue
                task_id = str(payload.get("task_id", "")).strip()
                if not task_id:
                    continue
                self._pool.submit(self._run_task, task_id)
            except Exception:
                LOGGER.error("Failed to consume task from queue", exc_info=True)

    def _run_task(self, task_id: str) -> None:
        record = self._state_manager.get_task(task_id)
        if not record:
            return
        if record.status != TaskStatus.QUEUED:
            return

        self._state_manager.update_task(task_id, status=TaskStatus.RUNNING)
        self._event_stream.emit("task.started", {"task_id": task_id})

        try:
            plan = self._planner.build_plan(objective=record.objective, task_type=record.task_type)
            record = self._state_manager.update_task(task_id, plan=plan)
            workflow = self._workflow_manager.resolve_workflow(
                task_type=record.task_type,
                workflow_id=record.workflow_id,
            )

            context = dict(record.context)
            for step in workflow.get("steps", []):
                latest = self._state_manager.get_task(task_id)
                if latest and latest.status == TaskStatus.CANCELLING:
                    self._state_manager.update_task(
                        task_id,
                        status=TaskStatus.CANCELLED,
                        result={"message": "Task was cancelled"},
                    )
                    self._event_stream.emit("task.cancelled", {"task_id": task_id})
                    return

                step_id = step.get("id", "step")
                agent_name = step.get("agent", "supervisor")
                action = step.get("action", "execute")
                agent = self._router.get_agent(agent_name)
                output = agent.execute(objective=record.objective, context=context, action=action)
                context[step_id] = output

                event = TaskEvent(
                    task_id=task_id,
                    step_id=step_id,
                    agent=agent_name,
                    action=action,
                    output=output,
                ).model_dump()
                self._state_manager.append_event(task_id, event)
                self._event_stream.emit("task.step.completed", event)

            self._state_manager.update_task(
                task_id,
                status=TaskStatus.COMPLETED,
                result={
                    "summary": f"Workflow completed: {workflow.get('workflow_id', 'unknown')}",
                    "context": context,
                },
            )
            self._event_stream.emit("task.completed", {"task_id": task_id})
        except Exception as exc:
            self._state_manager.update_task(
                task_id,
                status=TaskStatus.FAILED,
                error=str(exc),
            )
            self._event_stream.emit("task.failed", {"task_id": task_id, "error": str(exc)})
            LOGGER.error("Task execution failed for %s", task_id, exc_info=True)
