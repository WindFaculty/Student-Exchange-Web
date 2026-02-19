# Decisions Log

## 2026-02-09
- Decision: Use Microsoft SQL Server as primary runtime database.
- Why: Align with project deployment target and local team environment.
- Tradeoff: Local setup heavier than in-memory-only development.

## 2026-02-12
- Decision: Pivot domain from IoT shop to Student Exchange.
- Why: Product direction changed; old contract no longer matched target demo.
- Tradeoff: Breaks backward compatibility with old frontend/backend endpoints.

## 2026-02-13
- Decision: Use clean-cut API base `/api` and remove IoT legacy contract.
- Why: Reduce dual-contract complexity and unblock full-stack delivery.
- Tradeoff: Requires coordinated refactor on both frontend and backend.

## 2026-02-14
- Decision: Auth model uses server session (`USER`/`ADMIN`), no JWT in MVP.
- Why: Faster implementation for milestone delivery and admin guard.
- Tradeoff: Less suitable for stateless multi-service scaling.

## 2026-02-16
- Decision: Standardize schema changes with Flyway and set JPA to validate.
- Why: Ensure controlled DB evolution and repeatable setup.
- Tradeoff: Migration discipline required for every schema update.

## 2026-02-16
- Decision: Core business flows must not rely on localStorage mock data.
- Why: Demo-readiness requires backend-backed behavior and traceable records.
- Tradeoff: Higher integration effort before UI polish.
