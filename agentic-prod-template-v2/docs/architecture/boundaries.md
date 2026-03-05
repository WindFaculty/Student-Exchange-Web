# Module Boundaries

## Backend boundaries (`apps/backend`)
- `controller`: HTTP transport adapters (`/api/*`, `/internal/agentic/*`)
- `service`: business logic and sidecar gateway client
- `repository`: JPA persistence adapters
- `domain`: entities and enums
- `dto`: API payload contracts
- `config`: web, websocket, and internal endpoint guards

## Sidecar boundaries (`ai-dev-system`)
- `orchestrator`: workflow management and dispatch
- `planner`: decomposition and dependency planning
- `agents`: role-based agent implementations
- `communication`: redis bus, protocol, event stream
- `tools`: modular tool adapters
- `evaluation`: quality checks and benchmark utilities

## Boundary rules
- No public Nginx route to sidecar endpoints.
- Backend business APIs under `/api/*` must not depend on agentic availability.
- Agentic filesystem state stays under `ai-dev-system/{tasks,memory,logs,workspace}`.
