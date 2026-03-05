from __future__ import annotations

from time import perf_counter
from typing import Any, Callable


def benchmark(fn: Callable[..., Any], *args: Any, **kwargs: Any) -> dict[str, Any]:
    started = perf_counter()
    value = fn(*args, **kwargs)
    elapsed_ms = (perf_counter() - started) * 1000
    return {"elapsed_ms": round(elapsed_ms, 3), "result": value}
