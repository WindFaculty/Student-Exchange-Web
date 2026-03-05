#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export AGENTIC_HOST="${AGENTIC_HOST:-0.0.0.0}"
export AGENTIC_PORT="${AGENTIC_PORT:-8090}"
export AGENTIC_REDIS_URL="${AGENTIC_REDIS_URL:-redis://127.0.0.1:6379/0}"

python -m uvicorn orchestrator.app:app --host "$AGENTIC_HOST" --port "$AGENTIC_PORT"
