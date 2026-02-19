# API Surface Summary

Public endpoints:
- Product catalog and product detail APIs
- Cart APIs (session-based)
- Checkout/order creation APIs

Admin endpoints:
- Admin login
- Product CRUD
- Order list/detail/status update

Canonical API contract:
- `docs/03-api.md`

Validation rule:
- Do not invent endpoints.
- If unclear, confirm via controller source in `apps/backend/src/main/java/com/ssg/iot/controller`.
