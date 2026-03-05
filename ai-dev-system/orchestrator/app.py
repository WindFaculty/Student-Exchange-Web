from __future__ import annotations

import os
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml
from fastapi import Depends, FastAPI, Header, HTTPException, status

from communication.agent_protocol import (
    HealthResponse,
    TaskCancelResponse,
    TaskRecord,
    TaskStatus,
    TaskSubmitRequest,
    TaskSubmitResponse,
)
from communication.event_stream import EventStream
from communication.message_bus import BusConfig, RedisMessageBus
from orchestrator.agent_router import AgentRouter
from orchestrator.state_manager import StateManager
from orchestrator.task_dispatcher import TaskDispatcher
from orchestrator.workflow_manager import WorkflowManager
from planner.task_planner import TaskPlanner


APP_START = time.time()
BASE_DIR = Path(__file__).resolve().parents[1]
SYSTEM_CONFIG_PATH = BASE_DIR / "config" / "system.yaml"


def _load_yaml_defaults() -> dict[str, Any]:
    if not SYSTEM_CONFIG_PATH.exists():
        return {}
    with SYSTEM_CONFIG_PATH.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


@dataclass
class RuntimeSettings:
    host: str
    port: int
    internal_token: str
    redis_url: str
    queue_key: str
    events_channel: str
    task_root: Path
    workflows_root: Path
    max_workers: int


def load_settings() -> RuntimeSettings:
    defaults = _load_yaml_defaults().get("system", {})
    host = os.getenv("AGENTIC_HOST", defaults.get("host", "0.0.0.0"))
    port = int(os.getenv("AGENTIC_PORT", str(defaults.get("port", 8090))))
    internal_token = os.getenv(
        defaults.get("internal_token_env", "AGENTIC_INTERNAL_TOKEN"),
        os.getenv("AGENTIC_INTERNAL_TOKEN", ""),
    )
    redis_url = os.getenv(
        defaults.get("redis_url_env", "AGENTIC_REDIS_URL"),
        defaults.get("redis_url_default", "redis://localhost:6379/0"),
    )
    queue_key = os.getenv("AGENTIC_QUEUE_KEY", defaults.get("queue_key", "agentic:queue:tasks"))
    events_channel = os.getenv(
        "AGENTIC_EVENTS_CHANNEL",
        defaults.get("events_channel", "agentic:events"),
    )
    task_root = Path(os.getenv("AGENTIC_TASK_ROOT", str(BASE_DIR / "tasks")))
    workflows_root = Path(os.getenv("AGENTIC_WORKFLOWS_ROOT", str(BASE_DIR / "workflows")))
    max_workers = int(os.getenv("AGENTIC_MAX_WORKERS", str(defaults.get("max_workers", 4))))
    return RuntimeSettings(
        host=host,
        port=port,
        internal_token=internal_token,
        redis_url=redis_url,
        queue_key=queue_key,
        events_channel=events_channel,
        task_root=task_root,
        workflows_root=workflows_root,
        max_workers=max_workers,
    )


settings = load_settings()

app = FastAPI(title="ai-dev-system", version="1.0.0")

bus = RedisMessageBus(
    BusConfig(
        redis_url=settings.redis_url,
        queue_key=settings.queue_key,
        events_channel=settings.events_channel,
    )
)
state_manager = StateManager(task_root=settings.task_root)
workflow_manager = WorkflowManager(workflows_root=settings.workflows_root)
planner = TaskPlanner()
router = AgentRouter()
event_stream = EventStream(bus=bus)
dispatcher = TaskDispatcher(
    state_manager=state_manager,
    workflow_manager=workflow_manager,
    planner=planner,
    router=router,
    bus=bus,
    event_stream=event_stream,
    max_workers=settings.max_workers,
)


def verify_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    if not settings.internal_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal token is not configured",
        )
    if x_internal_token != settings.internal_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal token",
        )


@app.on_event("startup")
def on_startup() -> None:
    dispatcher.start()


@app.on_event("shutdown")
def on_shutdown() -> None:
    dispatcher.stop()
    bus.close()


@app.get("/internal/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        redis_connected=bus.ping(),
        queue_depth=bus.queue_depth(),
        uptime_seconds=round(time.time() - APP_START, 3),
    )


@app.post("/internal/tasks/submit", response_model=TaskSubmitResponse)
def submit_task(
    request: TaskSubmitRequest,
    _: None = Depends(verify_internal_token),
) -> TaskSubmitResponse:
    workflow = workflow_manager.resolve_workflow(
        task_type=request.task_type,
        workflow_id=request.workflow_id,
    )
    task_id = str(uuid.uuid4())
    record = TaskRecord(
        task_id=task_id,
        task_type=request.task_type,
        objective=request.objective,
        workflow_id=workflow["workflow_id"],
        status=TaskStatus.QUEUED,
        context=request.context,
    )
    dispatcher.submit(record)
    return TaskSubmitResponse(task_id=task_id, status=TaskStatus.QUEUED, accepted_at=record.created_at)


@app.get("/internal/tasks/{task_id}", response_model=TaskRecord)
def get_task(task_id: str, _: None = Depends(verify_internal_token)) -> TaskRecord:
    record = state_manager.get_task(task_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return record


@app.post("/internal/tasks/{task_id}/cancel", response_model=TaskCancelResponse)
def cancel_task(task_id: str, _: None = Depends(verify_internal_token)) -> TaskCancelResponse:
    record = state_manager.request_cancel(task_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return TaskCancelResponse(task_id=task_id, status=record.status, message="Cancel requested")
