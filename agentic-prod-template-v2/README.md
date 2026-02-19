# Agentic Production Template v2 (Generalized)

This template provides a production-ready baseline for agentic workflows in polyglot repositories.
It is designed for both internal teams and OSS adopters.

Versioning in this repository:
- `agentic-prod-template/` -> v1 (legacy, compatibility path)
- `agentic-prod-template-v2/` -> v2 (recommended default)

## What v2 adds
- Schema-validated configs (`configs/*.yaml` + `configs/schemas/*.json`)
- Deterministic RAG manifest snapshots with `write/check` modes
- Strict doctor checks for toolchain + schema + manifest freshness
- Hardened CI/security workflow baseline

## Quick Start (5 minutes)
Run from `agentic-prod-template-v2/`:

```powershell
python -m pip install -e .
python -m tools.validate_configs
python -m tools.index --mode write
python -m tools.doctor --strict
```

Defaults:
- Index target repo: parent folder (`../`) unless `TARGET_REPO_PATH` is set.
- Manifest location: `data/rag/manifests/`.
- If your template is mounted at repository root, set `TARGET_REPO_PATH=.`.

## Customize for your project
1. Update metadata and rules:
- `configs/project.yaml`
- `configs/agents.yaml`
- `configs/tools_allowlist.yaml`

2. Validate config contracts:
```powershell
python -m tools.validate_configs
```

3. Refresh snapshot after doc/code structure changes:
```powershell
python -m tools.index --mode write
```

## Validate before PR
```powershell
python -m tools.validate_configs
python -m tools.index --mode check
python -m tools.doctor --strict
```

## Containerized check
Run from `agentic-prod-template-v2/docker/`:
```powershell
docker compose up --build
```

## Directory map
- `.ai/`: agent guardrails, DoD, prompt templates
- `configs/`: project and safety settings
- `docs/`: architecture notes, runbooks, migration docs
- `tools/`: local CLI helpers (`doctor`, `index`, `validate_configs`)
- `data/rag/manifests/`: committed manifest snapshots
