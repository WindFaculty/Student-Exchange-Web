from __future__ import annotations

from agents.providers.base_client import BaseProviderClient


class ClaudeClient(BaseProviderClient):
    def __init__(self) -> None:
        super().__init__(
            provider="claude",
            api_key_env="AGENTIC_CLAUDE_API_KEY",
            endpoint_env="AGENTIC_CLAUDE_ENDPOINT",
            model_env="AGENTIC_CLAUDE_MODEL",
            default_model="claude-sonnet",
        )
