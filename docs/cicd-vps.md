# CI/CD Production (GitHub -> VPS)

This runbook implements the flow:

1. Developer merges code into `main`.
2. GitHub Actions runs CI (`frontend build`, `backend test`).
3. GitHub webhook sends `push` event to VPS endpoint.
4. VPS verifies source/signature and deploys selected commit SHA with Docker Compose.

## 1) Repository Artifacts

- CI workflow: `.github/workflows/ci.yml`
- Production compose: `docker-compose.prod.yml`
- Backend container: `apps/backend/Dockerfile`
- Frontend container: `apps/frontend/Dockerfile`
- Agentic sidecar container: `ai-dev-system/Dockerfile`
- Agentic scripts: `ai-dev-system/scripts/`
- Deploy script: `deploy/scripts/deploy.sh`
- Rollback script: `deploy/scripts/rollback.sh`
- Webhook RCA script: `deploy/scripts/audit_webhook_404.sh`
- Webhook listener: `deploy/listener/webhook_listener.py`
- Nginx template: `deploy/nginx/student-exchange.conf`
- systemd unit: `deploy/systemd/student-exchange-webhook.service`

## 2) One-Time VPS Setup (Ubuntu 22.04/24.04)

On VPS:

```bash
sudo bash deploy/scripts/bootstrap_ubuntu.sh
```

Clone and set ownership:

```bash
sudo -u deploy git clone git@github.com:WindFaculty/Student-Exchange-Web.git /opt/student-exchange/app
sudo chown -R deploy:deploy /opt/student-exchange
sudo chmod +x /opt/student-exchange/app/deploy/scripts/*.sh
sudo chmod +x /opt/student-exchange/app/deploy/scripts/audit_webhook_404.sh
sudo chmod +x /opt/student-exchange/app/deploy/listener/webhook_listener.py
```

## 3) Configure Secrets and Environment

Backend env:

```bash
sudo cp /opt/student-exchange/app/deploy/env/backend.env.example /opt/student-exchange/shared/backend.env
sudo chown deploy:deploy /opt/student-exchange/shared/backend.env
sudo chmod 600 /opt/student-exchange/shared/backend.env
```

Set internal agentic variables in `/opt/student-exchange/shared/backend.env`:
- `AGENTIC_ENABLED`
- `AGENTIC_INTERNAL_TOKEN`
- `AGENTIC_INTERNAL_ALLOW_LOCALHOST`
- `AGENTIC_SIDECAR_BASE_URL`

Webhook listener env:

```bash
sudo cp /opt/student-exchange/app/deploy/systemd/webhook-listener.env.example /etc/student-exchange/webhook-listener.env
sudo chmod 600 /etc/student-exchange/webhook-listener.env
```

Update required values in `/etc/student-exchange/webhook-listener.env`:
- `GITHUB_WEBHOOK_SECRET`
- `GITHUB_WEBHOOK_ALLOWED_CIDRS`
- `NOTIFY_WEBHOOK_URL` (optional)

Generate latest GitHub webhook CIDRs:

```bash
sudo bash /opt/student-exchange/app/deploy/scripts/update_github_webhook_allowlist.sh \
  /etc/student-exchange/github-webhook-cidrs.env \
  /etc/nginx/snippets/github-webhook-allowlist.conf
```

Then append `/etc/student-exchange/github-webhook-cidrs.env` values into `/etc/student-exchange/webhook-listener.env`.
You can automate this with systemd timer:

```bash
sudo cp /opt/student-exchange/app/deploy/systemd/github-webhook-allowlist-update.service /etc/systemd/system/
sudo cp /opt/student-exchange/app/deploy/systemd/github-webhook-allowlist-update.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now github-webhook-allowlist-update.timer
```

## 4) Enable Webhook Listener (systemd)

```bash
sudo cp /opt/student-exchange/app/deploy/systemd/student-exchange-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now student-exchange-webhook
sudo systemctl status student-exchange-webhook
```

## 5) Configure Nginx + TLS

Copy config template and replace `<YOUR_DOMAIN>`:

```bash
sudo cp /opt/student-exchange/app/deploy/nginx/student-exchange.conf /etc/nginx/sites-available/student-exchange.conf
sudo ln -sf /etc/nginx/sites-available/student-exchange.conf /etc/nginx/sites-enabled/student-exchange.conf
sudo nginx -t
sudo systemctl reload nginx
```

Issue TLS cert:

```bash
sudo certbot --nginx -d <YOUR_DOMAIN>
sudo certbot renew --dry-run
```

## 6) First Deploy and Health Verification

```bash
sudo -u deploy /opt/student-exchange/app/deploy/scripts/deploy.sh
curl -fsS http://127.0.0.1:18080/api/health
curl -fsS http://127.0.0.1:18082/internal/health
```

## 7) GitHub Setup

### Required workflow status checks
GitHub repository settings:
- Branch protection for `main`
- Require pull request before merge
- Require status checks to pass
- Include administrators

Expected checks:
- `frontend-build`
- `backend-test`

### Webhook
Create webhook in GitHub:
- Payload URL: `https://<YOUR_DOMAIN>/webhook/github/deploy`
- Content type: `application/json`
- Secret: same as `GITHUB_WEBHOOK_SECRET` on VPS
- Event: `Just the push event`
- Active: enabled

Note: GitHub webhooks do not follow `301/302` redirects. The payload URL must return `2xx` directly.
Do not use IP + HTTP as a production webhook URL, because virtual-host drift can silently return `404`.
Treat `deploy/scripts/setup_autodeploy_vps.sh` as source of truth; if emergency manual changes are made, backport them to repo immediately.

## 8) Webhook RCA (404 / delivery failures)

When a delivery fails, capture the GitHub delivery ID, exact response status, and response body first.
Then run:

```bash
sudo bash /opt/student-exchange/app/deploy/scripts/audit_webhook_404.sh <YOUR_DOMAIN> [<SERVER_IP>]
```

The script checks:
- Active Nginx routing and server blocks (`nginx -T`)
- Listener process and runtime env (`systemd`, `journalctl`, env file)
- Local and public endpoint probes
- Quick classification based on status/body patterns

Quick matrix:
- `404` + HTML body: likely Nginx vhost/location mismatch
- `404` + `{"message":"not found"}`: listener path mismatch (`WEBHOOK_PATH`)
- `502`: listener down or upstream mismatch
- `401`: webhook secret/signature mismatch
- `403`: GitHub IP blocked by allowlist
- `500` + `secret is not configured`: missing `GITHUB_WEBHOOK_SECRET`

After any Nginx/systemd change, run one manual GitHub **Redeliver** and confirm `202` before closing incident.

## 9) Rollback

Rollback to last successful SHA:

```bash
sudo -u deploy /opt/student-exchange/app/deploy/scripts/rollback.sh
```

Rollback to a specific SHA:

```bash
sudo -u deploy /opt/student-exchange/app/deploy/scripts/rollback.sh <commit-sha>
```

## 10) Operations

Useful commands:

```bash
sudo journalctl -u student-exchange-webhook -f
sudo tail -f /var/log/nginx/student-exchange-webhook.access.log
sudo tail -f /var/log/student-exchange/deploy.log
sudo -u deploy docker compose -f /opt/student-exchange/app/docker-compose.prod.yml ps
curl -fsS http://127.0.0.1:18082/internal/health
```

Clear `/products` data (`listings` table only):

```bash
sudo -u deploy bash /opt/student-exchange/app/deploy/scripts/purge_product_listings.sh --yes
```

## 11) Known Note About Flyway Migration V5

`V5__update_iot_highlights_categories.sql` was rewritten during cross-database migration and now targets MySQL 8.0 syntax.
If a deployed database already recorded the previous checksum for V5, run Flyway repair once before next migration:

```bash
# Example (inside backend runtime context)
# flyway repair
```
