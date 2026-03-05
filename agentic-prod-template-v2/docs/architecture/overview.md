# Architecture Overview

This repository has two coordinated runtime planes:

1. Product runtime:
- Frontend: React/Vite (`apps/frontend`)
- Backend: Spring Boot (`apps/backend`)
- Database: MySQL 8.0

2. Agentic runtime:
- Python sidecar (`ai-dev-system`)
- Supervisor pattern orchestration
- Redis queue/pub-sub + filesystem durable state

Integration boundary:
- Backend exposes internal-only endpoints under `/internal/agentic/*`.
- Backend proxies trusted internal requests to sidecar `/internal/*`.
- Public `/api/*` contract for end users remains unchanged.
