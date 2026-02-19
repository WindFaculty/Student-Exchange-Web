# Migration Guide: v1 -> v2

## Why migrate
v2 provides stricter config contracts, deterministic manifest checks, and stronger CI/security defaults.

## Compatibility model
- v1 remains available as a legacy fallback for existing flows.
- v2 is the recommended default for all new work.

## Step-by-step migration
1. Copy or adopt `agentic-prod-template-v2/` in your repo.
2. Update `configs/project.yaml` and `configs/agents.yaml` to your project context.
3. Validate schemas:
```powershell
python -m tools.validate_configs
```
4. Generate manifest snapshot:
```powershell
python -m tools.index --mode write
```
5. Run strict health checks:
```powershell
python -m tools.doctor --strict
```
6. Update CI/docs to reference v2 commands by default.

## Major differences from v1
- Configs are schema-validated by default.
- `tools.index` supports `--mode write|check` with deterministic metadata.
- `tools.doctor --strict` fails on stale/missing manifest contracts.
- Security workflow uses gitleaks + Python dependency auditing.

## Rollback plan
If migration blocks delivery, continue using v1 commands while keeping v2 in parallel.
Re-run migration after resolving schema or manifest issues.
