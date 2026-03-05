from __future__ import annotations

from typing import Any


class TaskDecomposer:
    def decompose(self, objective: str, task_type: str) -> list[dict[str, Any]]:
        normalized = objective.lower()
        tasks: list[dict[str, Any]] = []

        tasks.append(
            {
                "task_id": "plan",
                "title": f"Plan objective: {objective}",
                "depends_on": [],
                "acceptance_criteria": ["Scope and dependencies are identified"],
            }
        )

        if any(keyword in normalized for keyword in ("bug", "error", "fix", "debug")):
            tasks.extend(
                [
                    {
                        "task_id": "reproduce",
                        "title": "Reproduce and isolate issue",
                        "depends_on": ["plan"],
                        "acceptance_criteria": ["Reproduction steps are deterministic"],
                    },
                    {
                        "task_id": "patch",
                        "title": "Implement safe fix",
                        "depends_on": ["reproduce"],
                        "acceptance_criteria": ["Fix addresses root cause"],
                    },
                    {
                        "task_id": "verify",
                        "title": "Validate fix and regression risk",
                        "depends_on": ["patch"],
                        "acceptance_criteria": ["Tests/checks pass for affected scope"],
                    },
                ]
            )
            return tasks

        tasks.extend(
            [
                {
                    "task_id": "research",
                    "title": "Collect technical context and constraints",
                    "depends_on": ["plan"],
                    "acceptance_criteria": ["Assumptions are explicit"],
                },
                {
                    "task_id": "implement",
                    "title": "Implement requested change",
                    "depends_on": ["research"],
                    "acceptance_criteria": ["Requested behavior is implemented"],
                },
                {
                    "task_id": "review",
                    "title": "Review quality and risks",
                    "depends_on": ["implement"],
                    "acceptance_criteria": ["Key risks and mitigations documented"],
                },
            ]
        )

        if task_type in {"build", "docs"}:
            tasks.append(
                {
                    "task_id": "document",
                    "title": "Update relevant docs",
                    "depends_on": ["review"],
                    "acceptance_criteria": ["Docs reflect latest behavior"],
                }
            )
        return tasks
