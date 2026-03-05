from __future__ import annotations

from tools.system_tools.shell_exec import shell_exec


def git_status(cwd: str | None = None) -> dict[str, object]:
    return shell_exec("git status --short", cwd=cwd, timeout=60)


def git_diff(cwd: str | None = None) -> dict[str, object]:
    return shell_exec("git diff", cwd=cwd, timeout=60)
