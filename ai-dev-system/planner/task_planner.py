from __future__ import annotations

from typing import Any

from planner.dependency_graph import DependencyGraph
from planner.task_decomposer import TaskDecomposer


class TaskPlanner:
    def __init__(self) -> None:
        self._decomposer = TaskDecomposer()
        self._graph = DependencyGraph()

    def build_plan(self, objective: str, task_type: str) -> list[dict[str, Any]]:
        tasks = self._decomposer.decompose(objective=objective, task_type=task_type)
        return self._graph.topological_order(tasks)
