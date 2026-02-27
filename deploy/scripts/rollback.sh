#!/usr/bin/env bash
set -Eeuo pipefail

LAST_SUCCESSFUL_SHA_FILE="${LAST_SUCCESSFUL_SHA_FILE:-/opt/student-exchange/shared/last_successful_sha}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TARGET_SHA="${1:-}"
if [[ -z "$TARGET_SHA" ]]; then
  if [[ ! -f "$LAST_SUCCESSFUL_SHA_FILE" ]]; then
    echo "No rollback SHA found at $LAST_SUCCESSFUL_SHA_FILE" >&2
    exit 1
  fi
  TARGET_SHA="$(tr -d '[:space:]' <"$LAST_SUCCESSFUL_SHA_FILE")"
fi

if [[ -z "$TARGET_SHA" ]]; then
  echo "Rollback SHA is empty." >&2
  exit 1
fi

exec "$SCRIPT_DIR/deploy.sh" "$TARGET_SHA"
