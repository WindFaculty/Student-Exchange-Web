# Agent Rules (Applies to Antigravity + Codex)

1. Read `docs/00-context.md` and `tasks/task-queue.md` before implementation.
2. Work on exactly one task per session unless explicitly requested otherwise.
3. Work in a feature branch. Never push directly to `main`.
4. Only modify files needed for the request. Avoid drive-by refactors.
5. Prefer small, reviewable diffs. Provide a patch/diff summary.
6. Never invent APIs. If unclear, search the repo and cite file paths.
7. Definition of Done:
   1) Backend build/test passes for changed scope (`cd apps/backend && .\mvnw.cmd test`)
   2) Frontend checks pass for changed scope (`cd apps/frontend && npm run lint && npm run build`)
   3) No secrets added
   4) Update docs/tasks when behavior, scope, or status changes
8. Safety:
   - Default to read-only actions.
   - Ask before enabling network access or destructive commands.
