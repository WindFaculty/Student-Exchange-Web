from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import requests


@dataclass
class ProviderResponse:
    mode: str
    content: str
    raw: dict[str, Any] | None = None


class BaseProviderClient:
    def __init__(
        self,
        provider: str,
        api_key_env: str,
        endpoint_env: str,
        model_env: str,
        default_model: str,
    ) -> None:
        self.provider = provider
        self.api_key_env = api_key_env
        self.endpoint_env = endpoint_env
        self.model_env = model_env
        self.default_model = default_model

    def generate(self, objective: str, context: dict[str, Any], action: str) -> ProviderResponse:
        api_key = os.getenv(self.api_key_env, "").strip()
        endpoint = os.getenv(self.endpoint_env, "").strip()
        model = os.getenv(self.model_env, self.default_model).strip()

        if not api_key or not endpoint:
            return ProviderResponse(
                mode="stub",
                content=f"[stub:{self.provider}] {action} for objective '{objective}'",
            )

        payload = {
            "model": model,
            "objective": objective,
            "action": action,
            "context": context,
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        try:
            response = requests.post(endpoint, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            content = str(data.get("content") or data.get("output") or data)
            return ProviderResponse(mode="remote", content=content, raw=data)
        except Exception as exc:
            return ProviderResponse(
                mode="stub",
                content=f"[fallback:{self.provider}] {action} for objective '{objective}' (error: {exc})",
            )
