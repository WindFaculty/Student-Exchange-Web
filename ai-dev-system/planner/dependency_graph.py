from __future__ import annotations

from collections import defaultdict, deque
from typing import Any


class DependencyGraph:
    def topological_order(self, tasks: list[dict[str, Any]]) -> list[dict[str, Any]]:
        index: dict[str, dict[str, Any]] = {task["task_id"]: task for task in tasks}
        indegree = defaultdict(int)
        adjacency: dict[str, list[str]] = defaultdict(list)

        for task in tasks:
            indegree.setdefault(task["task_id"], 0)
            for dep in task.get("depends_on", []):
                if dep not in index:
                    continue
                adjacency[dep].append(task["task_id"])
                indegree[task["task_id"]] += 1

        queue = deque([task_id for task_id, degree in indegree.items() if degree == 0])
        ordered_ids: list[str] = []
        while queue:
            current = queue.popleft()
            ordered_ids.append(current)
            for nxt in adjacency[current]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)

        if len(ordered_ids) != len(index):
            return tasks
        return [index[task_id] for task_id in ordered_ids]
