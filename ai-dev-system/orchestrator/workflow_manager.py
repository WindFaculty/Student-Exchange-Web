from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


class WorkflowManager:
    def __init__(self, workflows_root: Path):
        self._workflows_root = workflows_root

    def resolve_workflow(self, task_type: str, workflow_id: str | None = None) -> dict[str, Any]:
        selected = workflow_id or self._default_for_task_type(task_type)
        path = self._workflows_root / f"{selected}.yaml"
        if not path.exists():
            fallback = self._workflows_root / "build_project.yaml"
            path = fallback
        with path.open("r", encoding="utf-8") as f:
            workflow = yaml.safe_load(f) or {}
        workflow.setdefault("workflow_id", selected)
        workflow.setdefault("steps", [])
        return workflow

    def _default_for_task_type(self, task_type: str) -> str:
        normalized = task_type.lower()
        if normalized in {"debug", "bugfix", "fix"}:
            return "debug_pipeline"
        if normalized in {"research", "investigate"}:
            return "research_pipeline"
        if normalized in {"docs", "documentation"}:
            return "documentation_pipeline"
        return "build_project"
