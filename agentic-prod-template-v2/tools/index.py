from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from tools._utils import is_excluded, load_yaml, sha256_file, template_root, write_json


def resolve_repo_root(arg_repo_root: str | None) -> Path:
    root = template_root()
    if arg_repo_root:
        return (root / arg_repo_root).resolve()
    env_value = os.getenv("TARGET_REPO_PATH")
    if env_value:
        return (root / env_value).resolve()
    return (root / "..").resolve()


def build_manifest(repo_root: Path) -> dict[str, object]:
    project_config = load_yaml(template_root() / "configs" / "project.yaml")
    rag = project_config.get("rag", {})
    include_globs: list[str] = list(rag.get("include_globs", []))
    exclude_globs: list[str] = list(rag.get("exclude_globs", []))

    collected_paths: set[Path] = set()
    for pattern in include_globs:
        for candidate in repo_root.glob(pattern):
            if candidate.is_file():
                collected_paths.add(candidate.resolve())

    files: list[dict[str, object]] = []
    for file_path in sorted(collected_paths):
        rel_path = file_path.relative_to(repo_root).as_posix()
        if is_excluded(rel_path, exclude_globs):
            continue
        files.append(
            {
                "path": rel_path,
                "sha256": sha256_file(file_path),
                "size": file_path.stat().st_size,
            }
        )

    return {
        "schema_version": 1,
        "repo_root": repo_root.as_posix(),
        "file_count": len(files),
        "files": files,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Write/check deterministic RAG manifest snapshot.")
    parser.add_argument("--mode", choices=["write", "check"], required=True)
    parser.add_argument("--repo-root", dest="repo_root", default=None)
    args = parser.parse_args(argv)

    repo_root = resolve_repo_root(args.repo_root)
    manifest_root = template_root() / "data" / "rag" / "manifests"
    sources_path = manifest_root / "sources.json"
    ingest_path = manifest_root / "last_ingest.json"
    manifest = build_manifest(repo_root)

    if args.mode == "write":
        write_json(sources_path, manifest)
        write_json(
            ingest_path,
            {
                "last_ingest_at": datetime.now(timezone.utc).isoformat(),
                "file_count": manifest["file_count"],
                "repo_root": repo_root.as_posix(),
            },
        )
        print(f"[index] wrote manifest: {sources_path}")
        return 0

    if not sources_path.exists():
        print(f"[index] FAILED: missing manifest {sources_path}")
        return 1

    existing = load_yaml(sources_path)
    if existing != manifest:
        print("[index] FAILED: manifest is stale. Run with --mode write.")
        return 1

    print("[index] OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
