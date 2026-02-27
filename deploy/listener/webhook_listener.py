#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import hmac
import ipaddress
import json
import os
import re
import subprocess
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


LISTEN_HOST = os.getenv("LISTEN_HOST", "127.0.0.1")
LISTEN_PORT = int(os.getenv("LISTEN_PORT", "9000"))
WEBHOOK_PATH = os.getenv("WEBHOOK_PATH", "/webhook/github/deploy")

GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "")
GITHUB_EXPECTED_REPO = os.getenv("GITHUB_EXPECTED_REPO", "WindFaculty/Student-Exchange-Web")
GITHUB_EXPECTED_REF = os.getenv("GITHUB_EXPECTED_REF", "refs/heads/main")
GITHUB_WEBHOOK_ALLOWED_CIDRS = os.getenv("GITHUB_WEBHOOK_ALLOWED_CIDRS", "")

DEPLOY_SCRIPT = os.getenv("DEPLOY_SCRIPT", "/opt/student-exchange/app/deploy/scripts/deploy.sh")

SHA_RE = re.compile(r"^[0-9a-f]{40}$")
ALLOWED_CIDRS = [
    ipaddress.ip_network(cidr.strip()) for cidr in GITHUB_WEBHOOK_ALLOWED_CIDRS.split(",") if cidr.strip()
]


def _is_allowed_ip(candidate_ip: str) -> bool:
    if not ALLOWED_CIDRS:
        return False
    ip = ipaddress.ip_address(candidate_ip)
    return any(ip in net for net in ALLOWED_CIDRS)


class Handler(BaseHTTPRequestHandler):
    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/healthz":
            self._json(200, {"status": "ok"})
            return
        self._json(404, {"message": "not found"})

    def do_POST(self) -> None:
        if self.path != WEBHOOK_PATH:
            self._json(404, {"message": "not found"})
            return

        if not GITHUB_WEBHOOK_SECRET:
            self._json(500, {"message": "server webhook secret is not configured"})
            return

        forwarded = self.headers.get("X-Forwarded-For", "")
        client_ip = forwarded.split(",")[0].strip() if forwarded else self.client_address[0]
        if not _is_allowed_ip(client_ip):
            self._json(403, {"message": "ip is not allowed"})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        payload = self.rfile.read(content_length)

        signature = self.headers.get("X-Hub-Signature-256", "")
        if not signature.startswith("sha256="):
            self._json(401, {"message": "missing signature"})
            return

        expected_signature = "sha256=" + hmac.new(
            GITHUB_WEBHOOK_SECRET.encode("utf-8"), payload, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_signature):
            self._json(401, {"message": "invalid signature"})
            return

        event = self.headers.get("X-GitHub-Event", "")
        if event != "push":
            self._json(202, {"message": "ignored: event is not push"})
            return

        try:
            body = json.loads(payload.decode("utf-8"))
        except json.JSONDecodeError:
            self._json(400, {"message": "invalid JSON payload"})
            return

        repo_full_name = body.get("repository", {}).get("full_name", "")
        if repo_full_name != GITHUB_EXPECTED_REPO:
            self._json(202, {"message": "ignored: repository mismatch"})
            return

        ref = body.get("ref", "")
        if ref != GITHUB_EXPECTED_REF:
            self._json(202, {"message": "ignored: ref mismatch"})
            return

        sha = body.get("after", "")
        if not isinstance(sha, str) or not SHA_RE.fullmatch(sha):
            self._json(400, {"message": "invalid commit sha"})
            return

        try:
            subprocess.Popen([DEPLOY_SCRIPT, sha], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except OSError as exc:
            self._json(500, {"message": f"failed to start deploy script: {exc}"})
            return

        self._json(202, {"message": "deployment accepted", "sha": sha})

    def log_message(self, format: str, *args) -> None:
        print(f"[webhook-listener] {self.address_string()} - {format % args}")


def main() -> None:
    if not ALLOWED_CIDRS:
        raise RuntimeError("GITHUB_WEBHOOK_ALLOWED_CIDRS is empty; refusing to start.")
    server = ThreadingHTTPServer((LISTEN_HOST, LISTEN_PORT), Handler)
    print(f"Webhook listener running on {LISTEN_HOST}:{LISTEN_PORT} path={WEBHOOK_PATH}")
    server.serve_forever()


if __name__ == "__main__":
    main()
