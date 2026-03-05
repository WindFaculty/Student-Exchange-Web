from __future__ import annotations

from pathlib import Path

from tools.file_tools.edit_file import replace_in_file
from tools.file_tools.read_file import read_file
from tools.file_tools.write_file import write_file


def test_file_tools_read_write_edit(tmp_path: Path) -> None:
    target = tmp_path / "notes.txt"
    write_file(str(target), "hello world")
    assert read_file(str(target)) == "hello world"
    replaced = replace_in_file(str(target), "world", "agent")
    assert replaced is True
    assert read_file(str(target)) == "hello agent"
