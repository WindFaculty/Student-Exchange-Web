# Agent Reference

Current runtime source of truth:
- `ai-dev-system/` (active internal runtime)

Governance/template source of truth:
- `agentic-prod-template-v2/` (schema, manifest, and health gates)

## Runtime quick start
```powershell
cd ai-dev-system
python -m pip install -r requirements.txt
python -m pytest
python -m uvicorn orchestrator.app:app --host 127.0.0.1 --port 8090
```

## Template quick start
```powershell
cd agentic-prod-template-v2
python -m pip install -e .
python -m tools.validate_configs
python -m tools.index --mode write
python -m tools.doctor --strict
```
