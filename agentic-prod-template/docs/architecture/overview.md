# Architecture Overview (Synced)

This folder mirrors high-signal architecture references for this repository.
Use these files for quick RAG retrieval, and treat root docs as canonical:

- `docs/02-architecture.md`
- `docs/03-api.md`
- `docs/04-ui.md`

Current system shape:
- Frontend: React + Vite + Tailwind (`apps/frontend`, port `5173`)
- Backend: Spring Boot REST API (`apps/backend`, port `8080`)
- Data: Microsoft SQL Server
- Auth model: simple admin login for MVP (session-based), no JWT required

Supporting architecture docs in this folder:
- `boundaries.md`
- `conventions.md`
- `data-model.md`
- `api.md`
