# Done Log

## 2026-03-02
- T021: Added user contact defaults (`phone`, `address`) to profile API, DB schema, and profile UI.
- T022: Updated checkout flow to prefill from profile and require full name, address, and phone while allowing optional email.
- T023: Extended order contract with `customerPhone` and updated admin/profile/track-order views to display phone and optional email fallback.
- T024: Enforced profile update validation for email and phone format (frontend pre-check + backend DTO validation).
- T025: Narrowed phone validation rule to Vietnam formats: `0xxxxxxxxx` or `+84xxxxxxxxx`.
- T026: Added Vietnam structured address support for profile and checkout (`addressLine`, `provinceCode`, `districtCode`, `wardCode`) while preserving legacy `address`.
- T027: Added public location lookup APIs and admin on-demand sync APIs for Vietnam administrative data.
- T028: Added Vietnam location reference tables + sync state in Flyway and baseline seed from local curated dataset.
- T029: Added admin dashboard sync card and reusable frontend `AddressPicker` with lazy level loading.

## 2024-12-19
- T001: Bootstrap backend + frontend skeleton ✓
- T002: Tailwind design system + layout shell ✓
- T003: Database schema + entities ✓
- T004: Product repository + service layer ✓
- T005: Product API endpoints ✓
- T006: Frontend product list page with filters ✓
- T007: Frontend product detail page ✓
- T008: Cart backend (session-based) ✓
- T009: Cart frontend (add/remove/update) ✓
- T010: Checkout backend (order creation) ✓
- T011: Checkout frontend (form + order summary) ✓
- T012: Order confirmation page ✓
- T013: Admin auth backend ✓
- T014: Admin auth frontend ✓
- T015: Admin product CRUD backend ✓
- T016: Admin product CRUD frontend ✓
- T017: Admin order list backend ✓
- T018: Admin order list frontend ✓
- T019: Admin order status update ✓
- T020: Seed data + polish ✓

- Notes: MVP implementation completed! All features working:
  - Customer flow: Browse products → Add to cart → Checkout → Order confirmation
  - Admin flow: Login → Manage products → View orders → Update order status
  - Seed data: 25 IoT products across 4 categories, default admin user (admin/admin123)
  - Ready for testing and demo

