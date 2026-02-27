#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/scripts/bootstrap_ubuntu.sh" >&2
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl gnupg jq python3 nginx certbot python3-certbot-nginx

install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

source /etc/os-release
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
  >/etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

if ! id -u deploy >/dev/null 2>&1; then
  useradd -m -s /bin/bash deploy
fi

usermod -aG docker deploy

install -d -m 0755 /opt/student-exchange
install -d -m 0755 /opt/student-exchange/shared
install -d -m 0755 /var/log/student-exchange
install -d -m 0755 /var/lock/student-exchange
install -d -m 0755 /etc/student-exchange

chown -R deploy:deploy /opt/student-exchange
chown -R deploy:deploy /var/log/student-exchange
chown -R deploy:deploy /var/lock/student-exchange

echo "Bootstrap complete."
echo "Next:"
echo "1) Clone repo to /opt/student-exchange/app"
echo "2) Copy deploy/systemd/webhook-listener.env.example -> /etc/student-exchange/webhook-listener.env"
echo "3) Copy deploy/env/backend.env.example -> /opt/student-exchange/shared/backend.env"
