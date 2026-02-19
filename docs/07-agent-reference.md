# Agent Reference

This repository keeps in-repo reference templates for agentic workflows:
- `agentic-prod-template/` (v1 legacy)
- `agentic-prod-template-v2/` (v2 recommended default)

## Version matrix
| Template | Status | Intended use |
|---|---|---|
| `agentic-prod-template/` | Legacy (hotfix only) | Backward compatibility with existing automation |
| `agentic-prod-template-v2/` | Active default | New setup, stricter checks, generalized config |

## Why v2 is default
- Config schemas enforced via `tools.validate_configs`
- Deterministic manifest snapshot contract (`tools.index --mode write/check`)
- Strict health gate (`tools.doctor --strict`)
- Hardened CI and security workflows

## Quick start (v2)
```powershell
cd agentic-prod-template-v2
python -m pip install -e .
python -m tools.validate_configs
python -m tools.index --mode write
python -m tools.doctor --strict
```

## Legacy fallback (v1)
```powershell
cd agentic-prod-template
python -m tools.doctor
python -m tools.index
```

## Migration
- Migration guide: `agentic-prod-template-v2/docs/migration_from_v1.md`
- Keep manifest snapshots committed in `agentic-prod-template-v2/data/rag/manifests/`.
