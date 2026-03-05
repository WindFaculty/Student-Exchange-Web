from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from agents.providers.claude_client import ClaudeClient


class ReviewerAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(name="reviewer", provider="claude")
        self._client = ClaudeClient()

    def execute(self, objective: str, context: dict[str, Any], action: str) -> dict[str, Any]:
        provider_output = self._client.generate(objective=objective, context=context, action=action)
        details = "Reviewed output for correctness, risk, and regression impact."
        result = self._base_output(objective=objective, action=action, details=details)
        result["provider_response"] = provider_output.content
        result["provider_mode"] = provider_output.mode
        return result
