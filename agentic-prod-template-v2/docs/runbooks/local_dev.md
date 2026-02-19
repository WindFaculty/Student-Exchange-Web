# Local Development Runbook (Template)

## Prerequisites
1. Python 3.11+
2. `git` and `rg`
3. Project-specific runtime dependencies (customize for your stack)

## Install template tooling
```powershell
cd agentic-prod-template-v2
python -m pip install -e .
```

If template location differs from the default nested layout, set:
```powershell
$env:TARGET_REPO_PATH="."
```

## Validate configs
```powershell
python -m tools.validate_configs
```

## Create or refresh manifest snapshot
```powershell
python -m tools.index --mode write
```

## Verify snapshot consistency
```powershell
python -m tools.index --mode check
```

## Full strict check
```powershell
python -m tools.doctor --strict
```

## Common issues
1. `ModuleNotFoundError: tools`
   - Run commands from `agentic-prod-template-v2/`.
2. Manifest check fails
   - Rebuild snapshot with `--mode write` after structure changes.
3. Config schema failures
   - Inspect key path in the validation error and update YAML accordingly.
