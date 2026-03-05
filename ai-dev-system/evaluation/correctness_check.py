from __future__ import annotations

from typing import Any


def check_correctness(task_result: dict[str, Any]) -> dict[str, Any]:
    has_error = bool(task_result.get("error"))
    status = task_result.get("status")
    return {
        "pass": not has_error and status == "COMPLETED",
        "status": status,
        "error": task_result.get("error"),
    }
