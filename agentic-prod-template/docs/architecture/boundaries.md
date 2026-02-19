# Module Boundaries

Backend (`apps/backend/src/main/java/com/ssg/iot`):
- `controller`: request mapping and response shaping
- `service`: business rules
- `repository`: persistence queries
- `domain`: JPA entities
- `dto`: API payload models
- `config`: app configuration (for example CORS)
- `exception`: centralized error handling

Frontend (`apps/frontend/src`):
- `pages`: route-level screens
- `components`: reusable UI parts
- `api`: HTTP clients
- `utils`: shared helper functions

Boundary rules:
- Keep controllers thin and move logic into services.
- Do not call repositories directly from controllers.
- Keep API calls centralized in frontend `api` modules.
