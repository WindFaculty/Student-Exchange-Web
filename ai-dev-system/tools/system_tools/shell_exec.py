from __future__ import annotations

import subprocess


def shell_exec(command: str, cwd: str | None = None, timeout: int = 120) -> dict[str, object]:
    process = subprocess.run(
        command,
        shell=True,
        cwd=cwd,
        timeout=timeout,
        capture_output=True,
        text=True,
        check=False,
    )
    return {
        "exit_code": process.returncode,
        "stdout": process.stdout,
        "stderr": process.stderr,
        "success": process.returncode == 0,
    }
