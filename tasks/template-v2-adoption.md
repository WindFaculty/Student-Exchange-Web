# Template v2 Adoption Checklist

Owner: Platform/Tooling
Target: Move default workflows from `agentic-prod-template` (v1) to `agentic-prod-template-v2`.

## Checklist
- [ ] Update internal docs/commands to reference v2 by default
- [ ] Ensure `python -m tools.validate_configs` passes in CI
- [ ] Ensure `python -m tools.index --mode check` passes in CI
- [ ] Ensure `python -m tools.doctor --strict` passes in CI
- [ ] Verify security workflow (gitleaks + pip-audit) runs green
- [ ] Validate Docker runner path resolves `python -m tools.doctor --strict`
- [ ] Publish migration note to team (`docs/07-agent-reference.md` + v2 migration doc)

## Deprecate-ready criteria for v1
- [ ] 100% command docs migrated to v2 defaults
- [ ] v2 checks pass continuously for 2 weeks
- [ ] No stale manifest failures in pipeline during the 2-week window
