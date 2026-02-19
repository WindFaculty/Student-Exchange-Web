# Module Boundaries (Template)

Define boundaries so agents avoid cross-layer leakage.

Typical backend boundaries:
- `controller` or `api`: transport adapters and request/response shaping
- `service`: business logic and orchestration
- `repository` or `data`: persistence queries
- `domain`: entities and value objects
- `dto` or `contract`: API payload models

Typical frontend boundaries:
- `pages` or `routes`: route-level screens
- `components`: reusable UI parts
- `api`: HTTP clients
- `state` or `context`: state containers
- `utils`: pure shared helpers

Rules:
- Keep transport layers thin.
- Keep data access out of transport layers.
- Centralize API clients for frontend.
