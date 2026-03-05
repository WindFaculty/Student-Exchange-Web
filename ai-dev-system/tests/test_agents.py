from __future__ import annotations

from orchestrator.agent_router import AgentRouter
from planner.task_decomposer import TaskDecomposer
from planner.task_planner import TaskPlanner


def test_router_resolves_core_agents() -> None:
    router = AgentRouter()
    for name in ["supervisor", "research", "coder", "reviewer", "debugger", "docs"]:
        agent = router.get_agent(name)
        result = agent.execute("test objective", {}, "execute")
        assert result["agent"]
        assert result["provider"]


def test_decomposer_builds_debug_plan_for_bug_objective() -> None:
    decomposer = TaskDecomposer()
    plan = decomposer.decompose("Fix checkout bug", task_type="debug")
    ids = [item["task_id"] for item in plan]
    assert ids == ["plan", "reproduce", "patch", "verify"]


def test_task_planner_returns_ordered_plan() -> None:
    planner = TaskPlanner()
    plan = planner.build_plan("Implement profile update", task_type="build")
    assert plan[0]["task_id"] == "plan"
    assert any(item["task_id"] == "implement" for item in plan)
