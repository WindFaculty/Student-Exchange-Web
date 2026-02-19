# Definition of Done

A change is considered done only if:
1. Backend compiles and tests pass for the changed area (`cd apps/backend && .\mvnw.cmd test`).
2. Frontend quality gates pass for the changed area (`cd apps/frontend && npm run lint && npm run build`).
3. If tests are missing, an explicit test plan is provided.
4. No secrets were added to the repository.
5. Relevant docs/specs/task files are updated when behavior or status changes.
6. The change is scoped to the requested feature/bug (no unrelated refactors).
