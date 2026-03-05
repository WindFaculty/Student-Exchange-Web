from __future__ import annotations

from typing import Any


def detect_hallucination(claims: list[str], references: list[str]) -> dict[str, Any]:
    reference_set = {ref.strip().lower() for ref in references}
    unsupported = [claim for claim in claims if claim.strip().lower() not in reference_set]
    return {
        "unsupported_count": len(unsupported),
        "unsupported_claims": unsupported,
        "pass": len(unsupported) == 0,
    }
