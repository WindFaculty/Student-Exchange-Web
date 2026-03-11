# Test Plan (Lite)

## Test Levels
- Smoke tests: must pass for every demo
- Functional happy path: must pass for core flows
- Edge cases: validation, empty states
- Security basics: input validation, auth checks (if enabled)

## Smoke Tests (minimum)
- ST1: Frontend loads, routes render without crash
- ST2: Backend starts, /api/health returns ok
- ST3: Core flow works end-to-end (define per project)

## Functional Tests (examples)
- FT1: Create item -> item appears in list
- FT2: Update item -> detail reflects change
- FT3: Delete item -> removed from list

## Security Basics
- SB1: Backend validates request payloads
- SB2: No secrets committed
- SB3: CORS restricted appropriately (dev vs prod)
