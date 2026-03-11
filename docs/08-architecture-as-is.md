# Architecture As-Is

Updated: 2026-02-28

This document describes current implementation state from the codebase.

## 1. Runtime Topology

```text
Frontend (React + Vite, :5173)
  -> /api (credentials include)
Backend (Spring Boot, :8080)
  -> Services -> Repositories -> MySQL 8.0

Backend session:
- USER (authenticated session user)
- CART (session cart)
```

## 2. Backend Modules (Implemented)
- Auth: login/logout/me with session role (`USER`, `ADMIN`)
- Listings: public + user-owned + admin management
- Cart/Order: session cart, checkout, order code tracking
- Events: public browse, registration, admin CRUD and registrations
- Support: FAQ, ticket create/track, admin ticket management
- Health: `/api/health`

## 3. Data Layer
- Flyway migration in `db/migration/V1__init_schema.sql`
- Main tables:
  - `users`
  - `listings`
  - `orders`, `order_items`
  - `events`, `event_registrations`
  - `faqs`
  - `support_tickets`

## 4. Frontend State and APIs
- Auth state: `AuthContext` using `/api/auth/*`
- Cart state: `CartContext` using `/api/cart*`
- API clients under `src/api/*` mapped to backend contract.
- Core routes use backend data; no localStorage for core business flows.

## 5. Admin Portal (Implemented)
- `/admin` dashboard with summary counts.
- `/admin/listings` CRUD listings.
- `/admin/orders` status updates.
- `/admin/events` CRUD + registration viewer.
- `/admin/tickets` status update + reply.

## 6. Known Gaps
- No automated frontend test suite yet.
- API docs and UI docs must stay synchronized with future changes.
- Session auth is MVP-level and not designed for stateless distributed auth.
