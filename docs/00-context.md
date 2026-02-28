# Project Context

Last Updated: 2026-02-19

## Project
- Name: Student Exchange Web Platform
- One-liner: Full-stack Student Exchange platform with listings, events, support, and admin operations.
- Stack: Spring Boot + React + Tailwind + MySQL 8.0

## Current Phase
- Phase: BASELINE READY

## Current Focus
- Pivot from IoT legacy contract to Student Exchange clean-cut contract.
- Keep frontend and backend contracts synchronized under `/api`.
- Roll out `agentic-prod-template-v2` as default agentic workflow baseline.

## Current State
- Frontend build passes (`npm run build`).
- Backend tests pass (`./mvnw.cmd test`).
- Core flows are backend-driven (no localStorage mock for business data).

## Milestone Snapshot
- M0: DONE
- M1: DONE
- M2: DONE
- M3: DONE
- M4: DONE
- M5: DONE
- M6: DONE
- M7: TODO

## Main Risks
- No automated frontend test suite yet.
- Session auth is MVP scope only (not distributed/stateless).

## Environments
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`

## Notes
- Continue with small, demo-safe increments.
- Any new schema change must be introduced via Flyway migration.
