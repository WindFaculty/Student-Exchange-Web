from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BaseAgent(ABC):
    def __init__(self, name: str, provider: str):
        self.name = name
        self.provider = provider

    @abstractmethod
    def execute(self, objective: str, context: dict[str, Any], action: str) -> dict[str, Any]:
        raise NotImplementedError

    def _base_output(self, objective: str, action: str, details: str) -> dict[str, Any]:
        return {
            "agent": self.name,
            "provider": self.provider,
            "action": action,
            "objective": objective,
            "details": details,
        }
