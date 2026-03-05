# AI Dev System

Production-focused multi-agent runtime for Student Exchange.

## Runtime model
- Python sidecar orchestrator (Supervisor pattern)
- Redis as message bus and hot state
- Filesystem as durable queue/history/log storage
- FAISS local vector index in `memory/vector_db/faiss`

## Internal endpoints
- `GET /internal/health`
- `POST /internal/tasks/submit`
- `GET /internal/tasks/{task_id}`
- `POST /internal/tasks/{task_id}/cancel`

## Quick start
```bash
./scripts/setup_env.sh
./scripts/start_agent.sh
./scripts/submit_task.sh "build login flow"
```

`submit_task.sh` defaults to backend internal proxy at `http://127.0.0.1:18080/internal/agentic/tasks`.
