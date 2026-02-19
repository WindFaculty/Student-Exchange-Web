# Agent Rules (v2)

1. Read project context docs and active tasks before implementation.
2. Work on exactly one scoped task per session unless explicitly requested otherwise.
3. Use a feature branch; do not push directly to `main`.
4. Modify only files required for the request.
5. Prefer small, reviewable diffs and provide a concise diff summary.
6. Do not invent APIs; verify contracts from source and cite file paths.
7. Definition of Done:
   1) Build/test checks pass for changed scope
   2) Security and secret hygiene checks pass
   3) Docs/tasks updated when behavior or scope changes
8. Safety:
   - Prefer read-only exploration before edits.
   - Avoid destructive commands unless explicitly requested.
