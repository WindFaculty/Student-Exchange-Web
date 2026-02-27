#!/usr/bin/env bash
set -Eeuo pipefail

ENV_OUTPUT_FILE="${1:-/etc/student-exchange/github-webhook-cidrs.env}"
NGINX_OUTPUT_FILE="${2:-/etc/nginx/snippets/github-webhook-allowlist.conf}"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not installed." >&2
  exit 1
fi

mkdir -p "$(dirname "$ENV_OUTPUT_FILE")" "$(dirname "$NGINX_OUTPUT_FILE")"

META_JSON="$(curl -fsSL https://api.github.com/meta)"
CIDRS="$(printf '%s' "$META_JSON" | jq -r '.hooks | join(",")')"

if [[ -z "$CIDRS" || "$CIDRS" == "null" ]]; then
  echo "Failed to extract webhook CIDRs from GitHub meta API." >&2
  exit 1
fi

printf 'GITHUB_WEBHOOK_ALLOWED_CIDRS=%s\n' "$CIDRS" >"$ENV_OUTPUT_FILE"

{
  printf '# Generated at %s\n' "$(date -Iseconds)"
  printf '%s' "$META_JSON" | jq -r '.hooks[] | "allow " + . + ";"'
  printf 'deny all;\n'
} >"$NGINX_OUTPUT_FILE"

echo "Updated: $ENV_OUTPUT_FILE"
echo "Updated: $NGINX_OUTPUT_FILE"
