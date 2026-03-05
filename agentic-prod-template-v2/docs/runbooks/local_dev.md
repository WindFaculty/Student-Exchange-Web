# Local Development Runbook

## Prerequisites
1. Python 3.11+
2. Java 17+, Node.js 20+, Docker
3. `git` and `rg`

## Agentic template tooling checks
```powershell
cd agentic-prod-template-v2
python -m pip install -e .
python -m tools.validate_configs
python -m tools.index --mode write
python -m tools.doctor --strict
```

## Sidecar runtime local checks
```powershell
cd ../ai-dev-system
python -m pip install -r requirements.txt
python -m pytest
python -m uvicorn orchestrator.app:app --host 127.0.0.1 --port 8090
```

## Redis local
```powershell
docker run --rm -p 6379:6379 redis:7.4-alpine
```

## Common issues
1. `tools` module not found:
- Run commands from `agentic-prod-template-v2/`.
2. Sidecar cannot connect Redis:
- Ensure `AGENTIC_REDIS_URL` points to active Redis.
3. Internal token mismatch:
- Align `AGENTIC_INTERNAL_TOKEN` between backend and sidecar env.
