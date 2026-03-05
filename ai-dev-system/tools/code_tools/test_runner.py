from __future__ import annotations

from tools.code_tools.run_code import run_command


def run_tests(command: list[str], cwd: str | None = None) -> dict[str, object]:
    code, stdout, stderr = run_command(command=command, cwd=cwd, timeout=600)
    return {"exit_code": code, "stdout": stdout, "stderr": stderr, "success": code == 0}
