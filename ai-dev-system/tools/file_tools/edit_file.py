from __future__ import annotations

from pathlib import Path


def replace_in_file(path: str, old: str, new: str) -> bool:
    file_path = Path(path)
    content = file_path.read_text(encoding="utf-8")
    if old not in content:
        return False
    file_path.write_text(content.replace(old, new), encoding="utf-8")
    return True
