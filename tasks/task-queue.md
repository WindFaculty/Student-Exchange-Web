# Task Queue - Student Exchange Pivot

Updated: 2026-03-05
Status values: TODO | DOING | DONE | BLOCKED

## Recent Updates
- DONE: Added root `ai-dev-system/` scaffold with Supervisor-pattern modules, workflows, prompts, tools, and tests.
- DONE: Added backend internal agentic proxy endpoints (`/internal/agentic/*`) with token and localhost guard.
- DONE: Added production compose services for `redis` and `agentic-sidecar` with health checks.
- DONE: Synced `agentic-prod-template-v2` configs/docs with Student Exchange multi-agent runtime context.
- DONE: Checkout now enforces required fields `customerName`, `customerAddress`, `customerPhone` and supports optional `customerEmail`.
- DONE: Profile update flow now stores reusable contact defaults (`phone`, `address`) for checkout prefill.
- DONE: Profile update now validates email format and phone number format on both frontend and backend.
- DONE: Updated phone validation rule to accept only `0xxxxxxxxx` or `+84xxxxxxxxx`.
- DONE: Added structured Vietnam address flow (province/district/ward + addressLine) for profile and checkout while keeping legacy address compatibility.
- DONE: Added public location lookup endpoints and admin on-demand sync endpoints for Vietnam administrative dataset.
- DONE: Added admin dashboard sync card and baseline local curated seed for Vietnam location references.

## Milestones

## M0 - Repo stabilization and build blockers
- Status: DONE
- Scope:
  - Maven Wrapper added for backend.
  - Frontend canonical pages selected; legacy duplicates removed.
  - TypeScript strict compile issues fixed.
  - Login routes split (`/login`, `/admin/login`).
- Verification:
  - `apps/frontend`: `npm run build` passes.
  - `apps/backend`: `./mvnw.cmd test` passes.

## M1 - Student Exchange backend foundation + session auth
- Status: DONE
- Scope:
  - New domain/entities: User, Listing, Order, Event, FAQ, SupportTicket and related items.
  - Flyway migration introduced.
  - Session auth with USER/ADMIN guards.
  - Seed data for demo accounts and module data.

## M2 - Listings + cart/order full-stack
- Status: DONE
- Scope:
  - Product/listing pages call backend APIs.
  - Cart and checkout use backend session cart.
  - Order success and tracking use backend order code.

## M3 - Events full-stack (CRUD + register)
- Status: DONE
- Scope:
  - Public event list/detail + registration wired to backend.
  - Admin events page supports CRUD and registration viewing.

## M4 - Support full-stack (FAQ + ticket + track)
- Status: DONE
- Scope:
  - FAQ from backend.
  - Contact creates support ticket in DB.
  - Tracking supports order and ticket by code + email.
  - Admin ticket status and reply actions wired.

## M5 - Unified admin portal
- Status: DONE
- Scope:
  - Admin dashboard/listings/orders/events/tickets routes active.
  - Backend and frontend role guard enabled.

## M6 - QA, docs, release baseline
- Status: DONE
- Scope:
  - Core docs updated for Student Exchange pivot.
  - Milestone task queue reset to new plan.
  - Build/test commands verified.

## M7 - Agentic template v2 rollout
- Status: DOING
- Scope:
  - Keep `agentic-prod-template-v2/` as the single template for new workflows.
  - Enforce schema validation + deterministic manifest checks in template v2.
  - Harden template v2 CI/security baseline.
  - Complete migration checklist in `tasks/template-v2-adoption.md`.
- Exit criteria:
  - v2 checks pass continuously for 2 weeks.
  - No stale manifest failures during the validation window.
  - Command/docs references migrated to v2 by default.

## M8 - Internal multi-agent runtime rollout
- Status: DOING
- Scope:
  - Introduce `ai-dev-system/` runtime with Redis + filesystem state model.
  - Wire backend internal proxy endpoints for manual CLI-triggered agent tasks.
  - Update deployment compose and VPS runbook for sidecar health checks.
  - Keep public `/api/*` behavior unchanged.
- Exit criteria:
  - Sidecar and backend health checks pass under production compose.
  - Internal endpoint auth guard blocks invalid/missing token requests.
  - Core backend regression tests remain green.

## Acceptance Checklist
1. Build & tooling
- [x] `npm run build` pass
- [x] `./mvnw.cmd test` pass

2. Auth/session
- [x] User/admin login by role
- [x] Admin routes require admin role

3. Listings/order
- [x] Listing browse/detail
- [x] Add cart/update/remove
- [x] Checkout + order tracking

4. Events
- [x] Public event browse/detail/register
- [x] Admin event CRUD + registrations

5. Support
- [x] FAQ from backend
- [x] Ticket create + tracking
- [x] Admin ticket status + reply

6. Regression
- [x] Core flows do not rely on localStorage mock data
