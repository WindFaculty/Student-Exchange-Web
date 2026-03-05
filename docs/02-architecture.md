# Architecture - Student Exchange

Updated: 2026-02-28

## High-level

```text
Browser (React/Vite :5173)
  -> REST /api (with credentials: include)
Spring Boot API (:8080)
  -> Service layer
  -> JPA Repositories
MySQL 8.0

Session (HttpSession): USER + CART
Flyway: versioned schema migration

Internal agentic runtime:
Ops CLI
  -> Backend internal endpoint (/internal/agentic/*, localhost + token)
  -> Python sidecar (:18082 host bind -> :8090 container)
  -> Redis queue/pub-sub
  -> Filesystem state (ai-dev-system/tasks,memory,logs,workspace)
```

## Backend Layers
- `controller`: auth, listings, cart, orders, events, support, admin, health
- `service`: business rules + mapping
- `repository`: Spring Data JPA repositories
- `domain`: entities + enums
- `dto`: request/response contracts
- `common`: page response and unified API errors

## Main Domain Model
- `User` (`USER` | `ADMIN`)
- `Listing`
- `Order`, `OrderItem`
- `Event`, `EventRegistration`
- `Faq`
- `SupportTicket`

## Frontend Structure
- `src/api/*`: contract-based API clients
- `src/context/AuthContext.tsx`: session user state
- `src/context/CartContext.tsx`: server cart state
- `src/pages/*`: canonical pages by module
- `src/layouts/*`: main/admin layouts

## Security and Access
- Session auth endpoints: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Backend role guard in `SessionAuthService`
- Admin APIs under `/api/admin/**` require `ADMIN`
- Frontend protected routes enforce auth + role
- Agentic endpoints under `/internal/agentic/**` require `X-Internal-Token`
- Agentic endpoints only accept localhost traffic when `agentic.internal.allow-localhost=true`

## Data and Migration
- Flyway migration: `apps/backend/src/main/resources/db/migration/V1__init_schema.sql`
- JPA `ddl-auto=validate` in runtime profile
- Test profile uses MySQL + Flyway

## Error Contract
- Unified JSON errors:
  - `timestamp`
  - `status`
  - `message`
  - `path`
