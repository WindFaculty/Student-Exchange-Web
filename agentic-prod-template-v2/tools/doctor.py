from __future__ import annotations

import argparse
import shutil
import sys

from tools import index, validate_configs


def _check_tooling() -> list[str]:
    issues: list[str] = []
    if sys.version_info < (3, 11):
        issues.append("Python 3.11+ is required")
    for cmd in ["git", "rg"]:
        if shutil.which(cmd) is None:
            issues.append(f"Missing required command: {cmd}")
    return issues


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run strict template health checks.")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--repo-root", default=None)
    args = parser.parse_args(argv)

    issues = _check_tooling()
    if issues:
        for issue in issues:
            print(f"[doctor] FAILED: {issue}")
        return 1 if args.strict else 0

    validate_code = validate_configs.main()
    if validate_code != 0:
        return validate_code

    index_code = index.main(["--mode", "check", "--repo-root", args.repo_root] if args.repo_root else ["--mode", "check"])
    if index_code != 0:
        return index_code

    print("[doctor] OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
