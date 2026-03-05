from __future__ import annotations

from agents.providers.base_client import BaseProviderClient


class GeminiClient(BaseProviderClient):
    def __init__(self) -> None:
        super().__init__(
            provider="gemini",
            api_key_env="AGENTIC_GEMINI_API_KEY",
            endpoint_env="AGENTIC_GEMINI_ENDPOINT",
            model_env="AGENTIC_GEMINI_MODEL",
            default_model="gemini-2.5-pro",
        )
