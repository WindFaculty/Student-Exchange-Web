from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from agents.providers.gemini_client import GeminiClient


class SearchAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(name="search", provider="gemini")
        self._client = GeminiClient()

    def execute(self, objective: str, context: dict[str, Any], action: str) -> dict[str, Any]:
        provider_output = self._client.generate(objective=objective, context=context, action=action)
        details = "Executed focused search queries and extracted top findings."
        result = self._base_output(objective=objective, action=action, details=details)
        result["provider_response"] = provider_output.content
        result["provider_mode"] = provider_output.mode
        return result
