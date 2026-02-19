# Scope - Student Exchange Pivot

Updated: 2026-02-16

## Goals (MVP)

### G1. Session Auth
- User login/logout/me via backend session.
- Admin login/logout/me via same auth flow with role guard.

### G2. Listings Module
- Public listing browse/search/filter/detail.
- Logged-in users can create/update/delete their own listings.
- Admin can manage all listings.

### G3. Cart + Order Module
- Session cart in backend.
- Checkout creates order from cart.
- Order tracking by `orderCode + email`.
- Admin can view orders and update status.

### G4. Events Module
- Public event list/detail.
- Public/user registration to events.
- Logged-in user can view own registrations.
- Admin CRUD events and view registrants.

### G5. Support Module
- FAQ from database with category + search.
- Create support ticket.
- Track ticket by `ticketCode + email`.
- Admin can filter tickets, update status, reply.

### G6. Admin Portal
- Unified admin area for listings, orders, events, support.
- Backend + frontend role checks.

## Non-goals (this phase)
- JWT auth
- Realtime chat support
- Payment gateway integration
- Multi-tenant vendor model
- Complex recommendation engine

## Constraints
- Stack fixed: Spring Boot + React + Tailwind + SQL Server
- API base fixed: `/api`
- Session auth only for MVP
- Flyway migration for schema changes
- Clean cut from IoT legacy contract (no backward compatibility)

## Demo-ready Criteria
- Frontend build passes (`npm run build`).
- Backend test passes (`./mvnw.cmd test`).
- No core business flow depends on localStorage mock.
- End-to-end demo flows:
  1. Listings -> Cart -> Checkout -> Track order
  2. Events -> Register -> Admin sees registrations
  3. Support ticket -> Admin update/reply -> User track ticket
