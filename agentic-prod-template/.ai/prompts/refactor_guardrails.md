# Refactor Guardrails

Allowed:
- Rename local variables for clarity
- Extract a small helper to reduce duplication
- Add docstrings/comments for tricky logic

Not allowed without approval:
- Mass formatting across the repo
- Architectural rewrites
- Dependency upgrades
- Large-scale renames across modules
- Changes to task workflow rules in `docs/00-context.md` and `tasks/task-queue.md`
