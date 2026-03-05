from __future__ import annotations

import sys
from pathlib import Path

import jsonschema

from tools._utils import load_yaml, template_root


def validate_file(config_name: str, schema_name: str) -> None:
    root = template_root()
    config_path = root / "configs" / config_name
    schema_path = root / "configs" / "schemas" / schema_name
    if not config_path.exists():
        raise FileNotFoundError(f"Missing config file: {config_path}")
    if not schema_path.exists():
        raise FileNotFoundError(f"Missing schema file: {schema_path}")

    config = load_yaml(config_path)
    schema = load_yaml(schema_path)
    jsonschema.validate(instance=config, schema=schema)


def main() -> int:
    try:
        validate_file("project.yaml", "project.schema.json")
        validate_file("agents.yaml", "agents.schema.json")
        validate_file("tools_allowlist.yaml", "tools_allowlist.schema.json")
        validate_file("models.yaml", "models.schema.json")
    except Exception as exc:
        print(f"[validate_configs] FAILED: {exc}")
        return 1

    print("[validate_configs] OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
