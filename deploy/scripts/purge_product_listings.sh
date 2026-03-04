#!/usr/bin/env bash
set -Eeuo pipefail

BACKEND_ENV_FILE="${BACKEND_ENV_FILE:-/opt/student-exchange/shared/backend.env}"
ASSUME_YES="false"

usage() {
  cat <<'EOF'
Usage:
  bash deploy/scripts/purge_product_listings.sh [--yes] [--backend-env <path>]

Description:
  Delete all records from `listings` table (source for /products page).
  This script reads DB_URL, DB_USERNAME, DB_PASSWORD from backend env file.

Options:
  --yes                 Skip confirmation prompt.
  --backend-env <path>  Override backend env file path.
  -h, --help            Show help.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes)
      ASSUME_YES="true"
      shift
      ;;
    --backend-env)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --backend-env" >&2
        exit 1
      fi
      BACKEND_ENV_FILE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ ! -f "$BACKEND_ENV_FILE" ]]; then
  echo "Backend env file not found: $BACKEND_ENV_FILE" >&2
  exit 1
fi

read_env() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "$BACKEND_ENV_FILE" | head -n 1 | cut -d= -f2- || true)"
  echo "$value"
}

DB_URL="$(read_env DB_URL)"
DB_USERNAME="$(read_env DB_USERNAME)"
DB_PASSWORD="$(read_env DB_PASSWORD)"

if [[ -z "$DB_URL" || -z "$DB_USERNAME" || -z "$DB_PASSWORD" ]]; then
  echo "Missing DB_URL/DB_USERNAME/DB_PASSWORD in $BACKEND_ENV_FILE" >&2
  exit 1
fi

if [[ "$DB_URL" =~ ^jdbc:mysql://([^/:?]+)(:([0-9]+))?/([^?;]+) ]]; then
  DB_HOST="${BASH_REMATCH[1]}"
  DB_PORT="${BASH_REMATCH[3]:-3306}"
  DB_NAME="${BASH_REMATCH[4]}"
else
  echo "Unsupported DB_URL format: $DB_URL" >&2
  echo "Expected: jdbc:mysql://<host>:<port>/<database>?..." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but not found in PATH." >&2
  exit 1
fi

DOCKER_NETWORK_ARGS=()
if [[ "$DB_HOST" == "localhost" || "$DB_HOST" == "127.0.0.1" ]]; then
  DOCKER_NETWORK_ARGS+=(--network host)
fi

run_mysql_scalar() {
  local sql="$1"
  docker run --rm "${DOCKER_NETWORK_ARGS[@]}" -e "MYSQL_PWD=$DB_PASSWORD" mysql:8.0 \
    mysql \
      --protocol=TCP \
      --host="$DB_HOST" \
      --port="$DB_PORT" \
      --user="$DB_USERNAME" \
      --database="$DB_NAME" \
      --batch \
      --raw \
      --skip-column-names \
      --execute="$sql" 2>/dev/null
}

run_mysql_exec() {
  local sql="$1"
  docker run --rm "${DOCKER_NETWORK_ARGS[@]}" -e "MYSQL_PWD=$DB_PASSWORD" mysql:8.0 \
    mysql \
      --protocol=TCP \
      --host="$DB_HOST" \
      --port="$DB_PORT" \
      --user="$DB_USERNAME" \
      --database="$DB_NAME" \
      --batch \
      --raw \
      --execute="$sql"
}

BEFORE_COUNT="$(run_mysql_scalar "SELECT COUNT(*) FROM listings;")"

echo "Target database : $DB_NAME"
echo "Target host:port: $DB_HOST:$DB_PORT"
echo "Table           : listings"
echo "Current rows    : $BEFORE_COUNT"

if [[ "$ASSUME_YES" != "true" ]]; then
  read -r -p "Delete all rows in listings? Type 'yes' to continue: " confirm
  if [[ "$confirm" != "yes" ]]; then
    echo "Cancelled."
    exit 0
  fi
fi

run_mysql_exec "DELETE FROM listings;"
AFTER_COUNT="$(run_mysql_scalar "SELECT COUNT(*) FROM listings;")"

echo "Done. listings rows after delete: $AFTER_COUNT"
