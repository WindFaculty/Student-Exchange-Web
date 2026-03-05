from __future__ import annotations

import subprocess


def run_command(command: list[str], cwd: str | None = None, timeout: int = 120) -> tuple[int, str, str]:
    process = subprocess.run(
        command,
        cwd=cwd,
        timeout=timeout,
        capture_output=True,
        text=True,
        check=False,
    )
    return process.returncode, process.stdout, process.stderr
