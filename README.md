# Student Exchange Web Platform

Student Exchange full-stack platform built with Spring Boot + React + Tailwind.

## Current Status (2026-02-16)
- Frontend build: `npm run build` passes.
- Backend test: `./mvnw.cmd test` passes.
- Contract pivoted to Student Exchange domain with base API `/api`.
- Main flows wired to backend APIs (no localStorage mock for core business data):
  - Listings and cart/order
  - Events and registrations
  - Support FAQ/ticket/track
  - Admin portal for listings/orders/events/tickets

## Tech Stack
- Backend: Spring Boot 3, Spring Data JPA, Flyway
- Frontend: React + Vite + Tailwind
- Database: Microsoft SQL Server
- Auth: Server session auth (`USER`, `ADMIN`), no JWT in MVP

## Repo Structure
- `apps/backend` - Spring Boot backend
- `apps/frontend` - React frontend
- `docs` - scope, architecture, API, UI, decisions
- `tasks` - milestone tracker

## Prerequisites
- Java 17+ (Java 21 LTS recommended)
- Node.js 18+
- SQL Server (local or remote)

## Environment Variables (Backend)
- `DB_URL` default: `jdbc:sqlserver://localhost:1433;databaseName=student_exchange;encrypt=true;trustServerCertificate=true`
- `DB_USERNAME` default: `student_exchange_web`
- `DB_PASSWORD` default: `wind_faculty`

## Run Backend
```powershell
cd apps/backend
.\mvnw.cmd spring-boot:run
```

Backend URL: `http://localhost:8080`

Notes:
- Pressing `Ctrl+C` stops Spring Boot normally. Maven may still print `BUILD FAILURE` / `exit code: 1` after manual stop.
- If you run with Java 25, JDK compatibility warnings from Maven/Tomcat may appear; prefer Java 21 LTS for a cleaner local run.
- If startup fails with `Port 8080 was already in use`, free the old process first: `netstat -ano | findstr :8080` then `taskkill /PID <PID> /F`.

Health check:
```powershell
curl http://localhost:8080/api/health
```

## Run Frontend
```powershell
cd apps/frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Build / Test
```powershell
cd apps/frontend
npm run build

cd ../backend
.\mvnw.cmd test
```

## Demo Accounts (Seed)
- Admin: `admin` / `admin123`
- User: `student1` / `user123`

## Key Routes
- User: `/login`, `/products`, `/products/:id`, `/cart`, `/checkout`, `/events`, `/support`
- Admin: `/admin/login`, `/admin`, `/admin/listings`, `/admin/orders`, `/admin/events`, `/admin/tickets`

## References
- API: `docs/03-api.md`
- Architecture: `docs/02-architecture.md`
- Scope: `docs/01-scope.md`
- Task queue: `tasks/task-queue.md`
