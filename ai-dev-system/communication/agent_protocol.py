from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class TaskStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLING = "CANCELLING"
    CANCELLED = "CANCELLED"


class TaskSubmitRequest(BaseModel):
    task_type: str = Field(default="build")
    objective: str = Field(min_length=1)
    workflow_id: str | None = None
    context: dict[str, Any] = Field(default_factory=dict)


class TaskSubmitResponse(BaseModel):
    task_id: str
    status: TaskStatus
    accepted_at: str


class TaskCancelResponse(BaseModel):
    task_id: str
    status: TaskStatus
    message: str


class TaskEvent(BaseModel):
    task_id: str
    step_id: str
    agent: str
    action: str
    output: dict[str, Any]
    timestamp: str = Field(default_factory=utc_now_iso)


class TaskRecord(BaseModel):
    task_id: str
    task_type: str
    objective: str
    workflow_id: str
    status: TaskStatus
    context: dict[str, Any] = Field(default_factory=dict)
    plan: list[dict[str, Any]] = Field(default_factory=list)
    events: list[dict[str, Any]] = Field(default_factory=list)
    result: dict[str, Any] | None = None
    error: str | None = None
    created_at: str = Field(default_factory=utc_now_iso)
    updated_at: str = Field(default_factory=utc_now_iso)


class HealthResponse(BaseModel):
    status: str
    redis_connected: bool
    queue_depth: int
    uptime_seconds: float
