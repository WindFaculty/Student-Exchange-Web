#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/scripts/setup_autodeploy_vps.sh" >&2
  exit 1
fi

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
}

first_ipv4() {
  ip -4 -o addr show scope global | awk '{split($4,a,"/"); print a[1]; exit}'
}

read_env_value() {
  local file="$1"
  local key="$2"
  if [[ -f "$file" ]]; then
    grep -E "^${key}=" "$file" | tail -n1 | cut -d= -f2- || true
  fi
}

require_cmd ip
require_cmd awk
require_cmd sed
require_cmd grep
require_cmd cut
require_cmd cp
require_cmd install
require_cmd systemctl
require_cmd nginx
require_cmd openssl

REPO_DIR="${REPO_DIR:-/opt/student-exchange/app}"
REPO_FULL_NAME="${REPO_FULL_NAME:-WindFaculty/Student-Exchange-Web}"
BRANCH="${BRANCH:-main}"
SERVER_NAME="${SERVER_NAME:-$(first_ipv4)}"

LISTEN_HOST="${LISTEN_HOST:-127.0.0.1}"
LISTEN_PORT="${LISTEN_PORT:-9000}"
WEBHOOK_PATH="${WEBHOOK_PATH:-/webhook/github/deploy}"

BACKEND_ENV_FILE="${BACKEND_ENV_FILE:-/opt/student-exchange/shared/backend.env}"
WEBHOOK_ENV_FILE="${WEBHOOK_ENV_FILE:-/etc/student-exchange/webhook-listener.env}"
CIDR_ENV_FILE="${CIDR_ENV_FILE:-/etc/student-exchange/github-webhook-cidrs.env}"
ALLOWLIST_SNIPPET_FILE="${ALLOWLIST_SNIPPET_FILE:-/etc/nginx/snippets/github-webhook-allowlist.conf}"
NGINX_SITE_FILE="${NGINX_SITE_FILE:-/etc/nginx/sites-available/student-exchange.conf}"
SYSTEMD_DIR="${SYSTEMD_DIR:-/etc/systemd/system}"
NOTIFY_WEBHOOK_URL="${NOTIFY_WEBHOOK_URL:-}"

if [[ -z "$SERVER_NAME" ]]; then
  echo "Unable to detect SERVER_NAME. Set it manually, e.g.: SERVER_NAME=103.126.162.42" >&2
  exit 1
fi

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "Repository not found at $REPO_DIR. Clone/pull repo first." >&2
  exit 1
fi

if ! id -u deploy >/dev/null 2>&1; then
  echo "User 'deploy' does not exist. Run bootstrap first: sudo bash deploy/scripts/bootstrap_ubuntu.sh" >&2
  exit 1
fi

UPDATE_ALLOWLIST_SCRIPT="$REPO_DIR/deploy/scripts/update_github_webhook_allowlist.sh"
DEPLOY_SCRIPT="$REPO_DIR/deploy/scripts/deploy.sh"
WEBHOOK_LISTENER_SCRIPT="$REPO_DIR/deploy/listener/webhook_listener.py"
SERVICE_SRC="$REPO_DIR/deploy/systemd/student-exchange-webhook.service"
ALLOWLIST_SERVICE_SRC="$REPO_DIR/deploy/systemd/github-webhook-allowlist-update.service"
ALLOWLIST_TIMER_SRC="$REPO_DIR/deploy/systemd/github-webhook-allowlist-update.timer"

if [[ ! -x "$UPDATE_ALLOWLIST_SCRIPT" ]]; then
  chmod +x "$UPDATE_ALLOWLIST_SCRIPT"
fi
if [[ ! -x "$DEPLOY_SCRIPT" ]]; then
  chmod +x "$DEPLOY_SCRIPT"
fi
if [[ ! -x "$WEBHOOK_LISTENER_SCRIPT" ]]; then
  chmod +x "$WEBHOOK_LISTENER_SCRIPT"
fi

install -d -m 0755 /etc/student-exchange /etc/nginx/snippets
install -d -m 0755 /opt/student-exchange /opt/student-exchange/shared
install -d -m 0755 /var/log/student-exchange /var/lock/student-exchange
chown -R deploy:deploy /opt/student-exchange /var/log/student-exchange /var/lock/student-exchange

if [[ ! -f "$BACKEND_ENV_FILE" ]]; then
  echo "WARNING: $BACKEND_ENV_FILE does not exist yet. Deploy may fail until DB env is configured." >&2
fi

EXISTING_SECRET="$(read_env_value "$WEBHOOK_ENV_FILE" "GITHUB_WEBHOOK_SECRET")"
WEBHOOK_SECRET="${GITHUB_WEBHOOK_SECRET:-$EXISTING_SECRET}"
if [[ -z "$WEBHOOK_SECRET" ]]; then
  WEBHOOK_SECRET="$(openssl rand -hex 32)"
fi

bash "$UPDATE_ALLOWLIST_SCRIPT" "$CIDR_ENV_FILE" "$ALLOWLIST_SNIPPET_FILE"
CIDRS="$(read_env_value "$CIDR_ENV_FILE" "GITHUB_WEBHOOK_ALLOWED_CIDRS")"
if [[ -z "$CIDRS" ]]; then
  echo "Failed to load webhook CIDRs from $CIDR_ENV_FILE" >&2
  exit 1
fi

cat >"$WEBHOOK_ENV_FILE" <<EOF
LISTEN_HOST=$LISTEN_HOST
LISTEN_PORT=$LISTEN_PORT
WEBHOOK_PATH=$WEBHOOK_PATH

GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
GITHUB_EXPECTED_REPO=$REPO_FULL_NAME
GITHUB_EXPECTED_REF=refs/heads/$BRANCH
GITHUB_WEBHOOK_ALLOWED_CIDRS=$CIDRS

DEPLOY_SCRIPT=$DEPLOY_SCRIPT
REPO_DIR=$REPO_DIR
BRANCH=$BRANCH
COMPOSE_FILE=$REPO_DIR/docker-compose.prod.yml
BACKEND_ENV_FILE=$BACKEND_ENV_FILE
LAST_SUCCESSFUL_SHA_FILE=/opt/student-exchange/shared/last_successful_sha
DEPLOY_LOG_FILE=/var/log/student-exchange/deploy.log
LOCK_FILE=/var/lock/student-exchange/deploy.lock
HEALTHCHECK_URL=http://127.0.0.1:18080/api/health
HEALTHCHECK_RETRIES=30
HEALTHCHECK_SLEEP_SECONDS=2
NOTIFY_WEBHOOK_URL=$NOTIFY_WEBHOOK_URL
EOF
chmod 600 "$WEBHOOK_ENV_FILE"

cp -f "$SERVICE_SRC" "$SYSTEMD_DIR/"
cp -f "$ALLOWLIST_SERVICE_SRC" "$SYSTEMD_DIR/"
cp -f "$ALLOWLIST_TIMER_SRC" "$SYSTEMD_DIR/"

cat >"$NGINX_SITE_FILE" <<EOF
upstream student_exchange_frontend {
    server 127.0.0.1:18081;
}

upstream student_exchange_backend {
    server 127.0.0.1:18080;
}

upstream student_exchange_webhook {
    server 127.0.0.1:9000;
}

server {
    listen 80;
    server_name $SERVER_NAME;
    client_max_body_size 50m;

    location $WEBHOOK_PATH {
        include /etc/nginx/snippets/github-webhook-allowlist.conf;
        proxy_pass http://student_exchange_webhook;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    location /api/ {
        proxy_pass http://student_exchange_backend/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
    }

    location /ws/ {
        proxy_pass http://student_exchange_backend/ws/;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        proxy_pass http://student_exchange_frontend;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
    }
}
EOF

ln -sfn "$NGINX_SITE_FILE" /etc/nginx/sites-enabled/student-exchange.conf
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl daemon-reload
systemctl enable --now student-exchange-webhook
systemctl enable --now github-webhook-allowlist-update.timer
systemctl restart student-exchange-webhook
systemctl reload nginx

sudo -u deploy "$DEPLOY_SCRIPT" || true

echo
echo "Auto-deploy setup complete."
echo "GitHub webhook settings:"
echo "  Payload URL : http://$SERVER_NAME$WEBHOOK_PATH"
echo "  Content type: application/json"
echo "  Secret      : $WEBHOOK_SECRET"
echo "  Event       : Just the push event"
echo
echo "Quick checks:"
echo "  systemctl --no-pager status student-exchange-webhook"
echo "  journalctl -u student-exchange-webhook -f"
echo "  tail -f /var/log/student-exchange/deploy.log"
