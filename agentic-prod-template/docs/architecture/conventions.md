# Coding Conventions

Workflow conventions:
- Read `docs/00-context.md` and `tasks/task-queue.md` first.
- Work on one task per session.
- Keep changes scoped to the requested task.
- Update task/docs files when a task status changes.

Backend conventions:
- Java 25, Spring Boot, Maven Wrapper (`.\mvnw.cmd`).
- Keep DTOs separate from entities.
- Use service layer for business rules.

Frontend conventions:
- React + TypeScript + Vite + Tailwind.
- Lint with `npm run lint`.
- Keep reusable UI in `components` and route views in `pages`.
