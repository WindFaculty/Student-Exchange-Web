#!/usr/bin/env bash
set -euo pipefail

OBJECTIVE="${1:-Implement requested task safely}"
BASE_URL="${AGENTIC_BASE_URL:-http://127.0.0.1:18080}"
TOKEN="${AGENTIC_INTERNAL_TOKEN:-}"
TASK_TYPE="${AGENTIC_TASK_TYPE:-build}"
WORKFLOW_ID="${AGENTIC_WORKFLOW_ID:-}"

if [[ -n "$WORKFLOW_ID" ]]; then
  WORKFLOW_JSON=", \"workflowId\":\"$WORKFLOW_ID\""
else
  WORKFLOW_JSON=""
fi

curl -fsS -X POST "$BASE_URL/internal/agentic/tasks" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: $TOKEN" \
  -d "{\"taskType\":\"$TASK_TYPE\",\"objective\":\"$OBJECTIVE\"$WORKFLOW_JSON}"

echo
