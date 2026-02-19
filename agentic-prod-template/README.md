# Agentic Production Reference (Antigravity + Codex)

> Legacy track (v1): this folder is maintained for backward compatibility and hotfixes only.
> Recommended default for new adoption is `agentic-prod-template-v2/`.

This folder is kept inside the main repository as a synchronized reference for agentic workflows.
It is aligned with the current project:

- Backend: Spring Boot (Java 25, Maven Wrapper)
- Frontend: React + Vite + Tailwind
- Database: Microsoft SQL Server

What it provides:
- Agent rules, DoD, and PR checklist in `.ai/`
- Project and safety configs in `configs/`
- RAG-oriented docs structure in `docs/`
- Local helper tools in `tools/`

## Usage in this repository
1. Keep `agentic-prod-template/` as reference material for legacy Antigravity/Codex flows.
2. Prefer new updates in `agentic-prod-template-v2/`.
3. Rebuild local manifest index when docs/code structure changes.

## Quick commands
Run from `agentic-prod-template/`:

```powershell
python -m tools.doctor
python -m tools.index
```

By default, `tools.index` targets the parent repository (`../`) through `TARGET_REPO_PATH`.

## Customize when needed
- `configs/project.yaml`
- `configs/tools_allowlist.yaml`
- `.env.example` (then create `.env` locally)
- `.github/workflows/*` (enable only workflows you actually use)
