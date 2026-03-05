from __future__ import annotations

from agents.claude.architect_agent import ArchitectAgent
from agents.claude.reasoning_agent import ReasoningAgent
from agents.claude.reviewer_agent import ReviewerAgent
from agents.codex.coder_agent import CoderAgent
from agents.codex.debug_agent import DebugAgent
from agents.codex.refactor_agent import RefactorAgent
from agents.gemini.docs_agent import DocsAgent
from agents.gemini.research_agent import ResearchAgent
from agents.gemini.search_agent import SearchAgent
from agents.supervisor.supervisor_agent import SupervisorAgent


class AgentRouter:
    def __init__(self) -> None:
        self._agents = {
            "supervisor": SupervisorAgent(),
            "planner": ReasoningAgent(),
            "research": ResearchAgent(),
            "coder": CoderAgent(),
            "reviewer": ReviewerAgent(),
            "debugger": DebugAgent(),
            "docs": DocsAgent(),
            "architect": ArchitectAgent(),
            "search": SearchAgent(),
            "refactor": RefactorAgent(),
        }

    def get_agent(self, agent_name: str):
        key = agent_name.lower()
        if key not in self._agents:
            raise KeyError(f"Unknown agent: {agent_name}")
        return self._agents[key]
