from __future__ import annotations

from agents.providers.base_client import BaseProviderClient


class CodexClient(BaseProviderClient):
    def __init__(self) -> None:
        super().__init__(
            provider="codex",
            api_key_env="AGENTIC_CODEX_API_KEY",
            endpoint_env="AGENTIC_CODEX_ENDPOINT",
            model_env="AGENTIC_CODEX_MODEL",
            default_model="codex-latest",
        )
