#!/usr/bin/env bash
set -Eeuo pipefail

# Usage:
#   sudo bash deploy/scripts/audit_webhook_404.sh <domain> [ip]
# Example:
#   sudo bash deploy/scripts/audit_webhook_404.sh example.com 103.126.162.42

DOMAIN="${1:-}"
IP_ADDRESS="${2:-}"
ENV_FILE="${ENV_FILE:-/etc/student-exchange/webhook-listener.env}"

if [[ -z "$DOMAIN" ]]; then
  echo "Usage: sudo bash deploy/scripts/audit_webhook_404.sh <domain> [ip]" >&2
  exit 1
fi

print_section() {
  echo
  echo "==== $1 ===="
}

normalize_path() {
  local path="$1"
  if [[ -z "$path" ]]; then
    path="/"
  fi
  if [[ "$path" != /* ]]; then
    path="/$path"
  fi
  if [[ "$path" != "/" ]]; then
    path="${path%/}"
  fi
  echo "$path"
}

safe_run() {
  local cmd="$1"
  echo "\$ $cmd"
  bash -lc "$cmd" || true
}

extract_status() {
  local response="$1"
  echo "$response" | awk 'toupper($1) ~ /^HTTP\// { code=$2 } END { if (code == "") code="000"; print code }'
}

extract_body() {
  local response="$1"
  awk 'BEGIN { body = 0 } body { print } /^\r?$/ { body = 1 }' <<< "$response"
}

classify_response() {
  local label="$1"
  local code="$2"
  local body="$3"
  local compact_body
  compact_body="$(echo "$body" | tr -d '\r\n\t')"

  case "$code" in
    404)
      if echo "$compact_body" | grep -qi '"message":"not found"'; then
        echo "[$label] 404 from listener JSON (likely path mismatch between WEBHOOK_PATH and incoming URL)."
      else
        echo "[$label] 404 likely from Nginx vhost/location mismatch."
      fi
      ;;
    502)
      echo "[$label] 502 from Nginx (listener down or upstream webhook port mismatch)."
      ;;
    401)
      echo "[$label] 401 (invalid/missing webhook signature)."
      ;;
    403)
      echo "[$label] 403 (CIDR allowlist blocked request)."
      ;;
    500)
      if echo "$compact_body" | grep -qi "secret is not configured"; then
        echo "[$label] 500 (GITHUB_WEBHOOK_SECRET missing on server)."
      else
        echo "[$label] 500 (server-side listener/deploy startup error)."
      fi
      ;;
    202)
      echo "[$label] 202 accepted/ignored (listener route reachable)."
      ;;
    *)
      echo "[$label] HTTP $code (inspect response body and upstream logs)."
      ;;
  esac
}

read_env_value() {
  local key="$1"
  if [[ -f "$ENV_FILE" ]]; then
    grep -E "^${key}=" "$ENV_FILE" | tail -n1 | cut -d= -f2- || true
  fi
}

EXPECTED_PATH="$(normalize_path "$(read_env_value WEBHOOK_PATH)")"
if [[ -z "$EXPECTED_PATH" || "$EXPECTED_PATH" == "/" ]]; then
  EXPECTED_PATH="/webhook/github/deploy"
fi

print_section "0) Context"
echo "Date: $(date -Iseconds)"
echo "Domain: $DOMAIN"
if [[ -n "$IP_ADDRESS" ]]; then
  echo "IP: $IP_ADDRESS"
fi
echo "Env file: $ENV_FILE"
echo "Expected webhook path: $EXPECTED_PATH"

print_section "1) Nginx active configuration"
if command -v rg >/dev/null 2>&1; then
  safe_run "sudo nginx -T 2>&1 | rg -n \"server_name|default_server|webhook/github/deploy|proxy_pass|listen 443|listen 80\""
else
  safe_run "sudo nginx -T 2>&1 | grep -nE \"server_name|default_server|webhook/github/deploy|proxy_pass|listen 443|listen 80\""
fi
safe_run "ls -l /etc/nginx/sites-enabled/"
safe_run "sudo nginx -t"

print_section "2) Listener runtime checks"
safe_run "sudo systemctl --no-pager status student-exchange-webhook"
safe_run "sudo journalctl -u student-exchange-webhook -n 200 --no-pager"
safe_run "sudo grep -E \"^(WEBHOOK_PATH|LISTEN_HOST|LISTEN_PORT|GITHUB_EXPECTED_REPO|GITHUB_EXPECTED_REF|GITHUB_WEBHOOK_ALLOWED_CIDRS)=\" \"$ENV_FILE\""

print_section "3) Local listener probes"
safe_run "curl -iS http://127.0.0.1:9000/healthz"
LOCAL_POST_RESPONSE="$(curl -iS -X POST "http://127.0.0.1:9000${EXPECTED_PATH}" -H "Content-Type: application/json" -d '{}' 2>&1 || true)"
echo "$LOCAL_POST_RESPONSE"
LOCAL_POST_STATUS="$(extract_status "$LOCAL_POST_RESPONSE")"
LOCAL_POST_BODY="$(extract_body "$LOCAL_POST_RESPONSE")"

print_section "4) Public endpoint probes"
HTTPS_RESPONSE="$(curl -iS "https://${DOMAIN}${EXPECTED_PATH}" 2>&1 || true)"
echo "$HTTPS_RESPONSE"
HTTPS_STATUS="$(extract_status "$HTTPS_RESPONSE")"
HTTPS_BODY="$(extract_body "$HTTPS_RESPONSE")"

HTTP_DOMAIN_RESPONSE="$(curl -iS "http://${DOMAIN}${EXPECTED_PATH}" 2>&1 || true)"
echo "$HTTP_DOMAIN_RESPONSE"
HTTP_DOMAIN_STATUS="$(extract_status "$HTTP_DOMAIN_RESPONSE")"
HTTP_DOMAIN_BODY="$(extract_body "$HTTP_DOMAIN_RESPONSE")"

IP_STATUS="N/A"
IP_BODY=""
if [[ -n "$IP_ADDRESS" ]]; then
  IP_RESPONSE="$(curl -iS "http://${IP_ADDRESS}${EXPECTED_PATH}" 2>&1 || true)"
  echo "$IP_RESPONSE"
  IP_STATUS="$(extract_status "$IP_RESPONSE")"
  IP_BODY="$(extract_body "$IP_RESPONSE")"
fi

print_section "5) Quick classification"
classify_response "local listener POST" "$LOCAL_POST_STATUS" "$LOCAL_POST_BODY"
classify_response "public HTTPS" "$HTTPS_STATUS" "$HTTPS_BODY"
classify_response "public HTTP (domain)" "$HTTP_DOMAIN_STATUS" "$HTTP_DOMAIN_BODY"
if [[ -n "$IP_ADDRESS" ]]; then
  classify_response "public HTTP (ip)" "$IP_STATUS" "$IP_BODY"
fi

print_section "6) Drift checks"
if command -v rg >/dev/null 2>&1; then
  safe_run "sudo nginx -T 2>&1 | rg -n \"location = ${EXPECTED_PATH}|location = ${EXPECTED_PATH}/|proxy_pass http://student_exchange_webhook\""
else
  safe_run "sudo nginx -T 2>&1 | grep -nE \"location = ${EXPECTED_PATH}|location = ${EXPECTED_PATH}/|proxy_pass http://student_exchange_webhook\""
fi
echo "If GitHub Delivery still reports 404, compare delivery response body with the matrix in docs/cicd-vps.md."
