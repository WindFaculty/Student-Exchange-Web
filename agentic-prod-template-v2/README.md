# Agentic Production Template v2 (Student Exchange Context)

This template is the governance/config baseline for the in-repo runtime at `ai-dev-system/`.

## What is covered
- Schema-validated configs under `configs/`
- Deterministic RAG manifest snapshots (`tools.index`)
- Strict health checks (`tools.doctor --strict`)
- Agent role/model mapping for supervisor pattern

## Quick start
Run from `agentic-prod-template-v2/`:

```powershell
python -m pip install -e .
python -m tools.validate_configs
python -m tools.index --mode write
python -m tools.doctor --strict
```

## Commands
- Validate schema contracts:
```powershell
python -m tools.validate_configs
```

- Write manifest snapshot:
```powershell
python -m tools.index --mode write
```

- Check manifest freshness:
```powershell
python -m tools.index --mode check
```

- Full strict checks:
```powershell
python -m tools.doctor --strict
```
