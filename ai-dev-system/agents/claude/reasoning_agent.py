from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from agents.providers.claude_client import ClaudeClient


class ReasoningAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(name="reasoning", provider="claude")
        self._client = ClaudeClient()

    def execute(self, objective: str, context: dict[str, Any], action: str) -> dict[str, Any]:
        provider_output = self._client.generate(objective=objective, context=context, action=action)
        details = "Generated structured reasoning for decomposition and decision gates."
        result = self._base_output(objective=objective, action=action, details=details)
        result["provider_response"] = provider_output.content
        result["provider_mode"] = provider_output.mode
        return result
