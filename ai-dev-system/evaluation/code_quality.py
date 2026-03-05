from __future__ import annotations

from typing import Any


def score_code_quality(result: dict[str, Any]) -> dict[str, Any]:
    checks = {
        "has_result": bool(result),
        "has_summary": bool(result.get("summary")),
        "has_context": isinstance(result.get("context"), dict),
    }
    score = int(sum(1 for value in checks.values() if value) / len(checks) * 100)
    return {"score": score, "checks": checks}
