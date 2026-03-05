from __future__ import annotations

from typing import Any

import requests


def web_search(query: str, endpoint: str) -> dict[str, Any]:
    response = requests.get(endpoint, params={"q": query}, timeout=10)
    response.raise_for_status()
    return response.json()
