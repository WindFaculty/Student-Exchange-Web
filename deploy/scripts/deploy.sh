#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-/opt/student-exchange/app}"
BRANCH="${BRANCH:-main}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPO_DIR/docker-compose.prod.yml}"
BACKEND_ENV_FILE="${BACKEND_ENV_FILE:-/opt/student-exchange/shared/backend.env}"
LOCK_FILE="${LOCK_FILE:-/var/lock/student-exchange/deploy.lock}"
LAST_SUCCESSFUL_SHA_FILE="${LAST_SUCCESSFUL_SHA_FILE:-/opt/student-exchange/shared/last_successful_sha}"
DEPLOY_LOG_FILE="${DEPLOY_LOG_FILE:-/var/log/student-exchange/deploy.log}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:18080/api/health}"
HEALTHCHECK_RETRIES="${HEALTHCHECK_RETRIES:-30}"
HEALTHCHECK_SLEEP_SECONDS="${HEALTHCHECK_SLEEP_SECONDS:-2}"
NOTIFY_WEBHOOK_URL="${NOTIFY_WEBHOOK_URL:-}"

log() {
  echo "[$(date -Iseconds)] $*"
}

notify() {
  local status="$1"
  local message="$2"

  if [[ -z "$NOTIFY_WEBHOOK_URL" ]]; then
    return
  fi

  curl -fsS -X POST "$NOTIFY_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"status\":\"$status\",\"message\":\"$message\"}" >/dev/null || true
}

mkdir -p "$(dirname "$LOCK_FILE")" "$(dirname "$LAST_SUCCESSFUL_SHA_FILE")" "$(dirname "$DEPLOY_LOG_FILE")"
touch "$DEPLOY_LOG_FILE"
exec >>"$DEPLOY_LOG_FILE" 2>&1

TARGET_SHA="${1:-}"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  log "Another deployment is running. Exiting."
  notify "skipped" "Deployment skipped because another run is active."
  exit 1
fi

log "Deployment request received. branch=$BRANCH sha=${TARGET_SHA:-<auto>}"

cd "$REPO_DIR"
git fetch --prune origin

if [[ -z "$TARGET_SHA" ]]; then
  TARGET_SHA="$(git rev-parse "origin/$BRANCH")"
fi

if ! [[ "$TARGET_SHA" =~ ^[0-9a-fA-F]{40}$ ]]; then
  log "Invalid commit SHA: $TARGET_SHA"
  notify "failed" "Deployment rejected due to invalid SHA: $TARGET_SHA"
  exit 1
fi

if ! git cat-file -e "$TARGET_SHA^{commit}" 2>/dev/null; then
  log "Commit does not exist locally: $TARGET_SHA"
  notify "failed" "Deployment rejected because commit does not exist: $TARGET_SHA"
  exit 1
fi

if ! git merge-base --is-ancestor "$TARGET_SHA" "origin/$BRANCH"; then
  log "Commit is not reachable from origin/$BRANCH: $TARGET_SHA"
  notify "failed" "Deployment rejected because commit is outside origin/$BRANCH: $TARGET_SHA"
  exit 1
fi

log "Checking out commit $TARGET_SHA"
git checkout --detach "$TARGET_SHA"

export BACKEND_ENV_FILE
log "Running docker compose deployment"
docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

for ((i = 1; i <= HEALTHCHECK_RETRIES; i++)); do
  if curl -fsS "$HEALTHCHECK_URL" >/dev/null; then
    echo "$TARGET_SHA" > "$LAST_SUCCESSFUL_SHA_FILE"
    log "Deployment successful. sha=$TARGET_SHA"
    notify "success" "Deployment successful for sha=$TARGET_SHA"
    docker compose -f "$COMPOSE_FILE" ps
    exit 0
  fi

  log "Healthcheck attempt $i/$HEALTHCHECK_RETRIES failed. Retrying in $HEALTHCHECK_SLEEP_SECONDS seconds."
  sleep "$HEALTHCHECK_SLEEP_SECONDS"
done

log "Deployment failed. Backend health check did not recover."
notify "failed" "Deployment failed for sha=$TARGET_SHA because healthcheck did not recover."
exit 1
