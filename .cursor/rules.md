# Cursor Rules (Lite Stateful Dev Kit)

You are working in a small/medium project using Spring Boot + React + Tailwind.

Operational rules:
1. Read docs/00-context.md and tasks/task-queue.md before doing anything.
2. Work on exactly one task per session (the next TODO task).
3. Do not expand scope beyond docs/01-scope.md.
4. Keep changes minimal; avoid large refactors unless the task requires it.
5. After completing the task:
   - mark task DONE in tasks/task-queue.md
   - append an entry in tasks/done.md
   - update docs/00-context.md (phase, focus, next tasks, issues)
   - if a key decision was made, add it to docs/06-decisions.md
6. Prefer production-ready defaults:
   - Backend: validation, error handling, consistent response shape
   - Frontend: loading/empty/error states
7. If assumptions are needed, choose safe defaults and record them in docs/06-decisions.md.

Output expectations:
- Provide concrete file edits (paths + contents or patches).
- Ensure code compiles/runs locally.
