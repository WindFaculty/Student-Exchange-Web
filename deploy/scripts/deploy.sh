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
WORKTREE_ROOT="${WORKTREE_ROOT:-/opt/student-exchange/worktrees}"
KEEP_FAILED_WORKTREE="${KEEP_FAILED_WORKTREE:-false}"
DEPLOY_SOURCE_DIR="$REPO_DIR"
DEPLOYED_FROM_TEMP_WORKTREE="false"
TEMP_WORKTREE_DIR=""

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

list_dirty_worktree_entries() {
  git status --short --untracked-files=all
}

has_dirty_worktree() {
  [[ -n "$(list_dirty_worktree_entries)" ]]
}

log_dirty_worktree_warning() {
  local status_output
  status_output="$(list_dirty_worktree_entries)"

  if [[ -z "$status_output" ]]; then
    return
  fi

  log "Repository checkout at $REPO_DIR has local modifications."
  while IFS= read -r line; do
    log "dirty: $line"
  done <<<"$status_output"
  log "Deployment will continue from a temporary clean worktree."
  log "Clean or stash the base checkout later so webhook tooling under deploy/ stays in sync with git."
}

cleanup_temp_worktree() {
  local exit_code="$1"

  if [[ -z "$TEMP_WORKTREE_DIR" || ! -d "$TEMP_WORKTREE_DIR" ]]; then
    exit "$exit_code"
  fi

  if [[ "$exit_code" -ne 0 && "$KEEP_FAILED_WORKTREE" == "true" ]]; then
    log "Preserving failed deployment worktree at $TEMP_WORKTREE_DIR"
    exit "$exit_code"
  fi

  git -C "$REPO_DIR" worktree remove --force "$TEMP_WORKTREE_DIR" >/dev/null 2>&1 || rm -rf "$TEMP_WORKTREE_DIR" || true
  git -C "$REPO_DIR" worktree prune >/dev/null 2>&1 || true
  exit "$exit_code"
}

prepare_temp_worktree() {
  mkdir -p "$WORKTREE_ROOT"
  TEMP_WORKTREE_DIR="$(mktemp -d "$WORKTREE_ROOT/deploy-${TARGET_SHA:0:12}-XXXXXX")"
  log "Preparing temporary deployment worktree at $TEMP_WORKTREE_DIR"

  if ! git worktree add --force --detach "$TEMP_WORKTREE_DIR" "$TARGET_SHA"; then
    log "Failed to prepare temporary worktree for commit $TARGET_SHA"
    notify "failed" "Deployment failed while preparing temporary worktree for sha=$TARGET_SHA"
    exit 1
  fi

  DEPLOY_SOURCE_DIR="$TEMP_WORKTREE_DIR"
  COMPOSE_FILE="$DEPLOY_SOURCE_DIR/docker-compose.prod.yml"
  DEPLOYED_FROM_TEMP_WORKTREE="true"
}

mkdir -p "$(dirname "$LOCK_FILE")" "$(dirname "$LAST_SUCCESSFUL_SHA_FILE")" "$(dirname "$DEPLOY_LOG_FILE")"
touch "$DEPLOY_LOG_FILE"
exec >>"$DEPLOY_LOG_FILE" 2>&1
trap 'cleanup_temp_worktree "$?"' EXIT

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

if has_dirty_worktree; then
  log_dirty_worktree_warning
  prepare_temp_worktree
else
  log "Checking out commit $TARGET_SHA"
  if ! git checkout --detach "$TARGET_SHA"; then
    log "Failed to check out commit $TARGET_SHA into $REPO_DIR"
    notify "failed" "Deployment failed during git checkout for sha=$TARGET_SHA"
    exit 1
  fi
fi

export BACKEND_ENV_FILE
log "Running docker compose deployment from $DEPLOY_SOURCE_DIR"
docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

healthcheck_ok() {
  curl -fsS "$HEALTHCHECK_URL" >/dev/null
}

for ((i = 1; i <= HEALTHCHECK_RETRIES; i++)); do
  if healthcheck_ok; then
    echo "$TARGET_SHA" > "$LAST_SUCCESSFUL_SHA_FILE"
    if [[ "$DEPLOYED_FROM_TEMP_WORKTREE" == "true" ]]; then
      log "Deployment successful. sha=$TARGET_SHA source=temp-worktree"
    else
      log "Deployment successful. sha=$TARGET_SHA source=repo-checkout"
    fi
    notify "success" "Deployment successful for sha=$TARGET_SHA"
    docker compose -f "$COMPOSE_FILE" ps
    exit 0
  fi

  log "Healthcheck attempt $i/$HEALTHCHECK_RETRIES failed (backend unhealthy). Retrying in $HEALTHCHECK_SLEEP_SECONDS seconds."
  sleep "$HEALTHCHECK_SLEEP_SECONDS"
done

log "Deployment failed. Backend health checks did not recover."
notify "failed" "Deployment failed for sha=$TARGET_SHA because health checks did not recover."
exit 1
