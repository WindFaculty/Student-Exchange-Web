# Agent Reference

This repository keeps one in-repo reference template for agentic workflows:
- `agentic-prod-template-v2/` (active default)

## Why this template is default
- Config schemas enforced via `tools.validate_configs`
- Deterministic manifest snapshot contract (`tools.index --mode write/check`)
- Strict health gate (`tools.doctor --strict`)
- Hardened CI and security workflows

## Quick start
```powershell
cd agentic-prod-template-v2
python -m pip install -e .
python -m tools.validate_configs
python -m tools.index --mode write
python -m tools.doctor --strict
```
