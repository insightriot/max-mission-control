#!/usr/bin/env bash
set -euo pipefail

# End-to-end remote health check for Mission Control + OpenClaw gateway via Tailscale Serve.
# Intended to be run on the Mac mini.

MC_HOST_DEFAULT="openclaws-mac-mini.tail1c85d6.ts.net"
MC_HOST="${MC_HOST:-$MC_HOST_DEFAULT}"

MC_URL="https://${MC_HOST}/api/health"
GATEWAY_BASE="https://${MC_HOST}:8443"
GATEWAY_WS="https://${MC_HOST}:8443/ws"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

note() {
  echo "==> $*" >&2
}

note "Checking Mission Control HTTP (${MC_URL})"
MC_CODE=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 8 "$MC_URL" || true)
if [[ "$MC_CODE" != "200" ]]; then
  fail "Mission Control health endpoint returned HTTP $MC_CODE"
fi

note "Checking OpenClaw gateway HTTP (${GATEWAY_BASE}/)"
GW_CODE=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 8 "${GATEWAY_BASE}/" || true)
if [[ "$GW_CODE" != "200" ]]; then
  fail "Gateway control UI returned HTTP $GW_CODE"
fi

# WebSocket health checks are tricky to validate with curl over HTTPS because
# many servers/proxies handle the upgrade path differently. We do two checks:
# 1) local WS upgrade (direct to 127.0.0.1:18789) must return 101
# 2) remote gateway UI must be reachable over Tailscale Serve (HTTP 200)

note "Checking OpenClaw gateway WebSocket upgrade locally (http://127.0.0.1:18789/ws)"
LOCAL_WS_LINE=$(curl -sS -i --max-time 8 \
  -H 'Connection: Upgrade' \
  -H 'Upgrade: websocket' \
  -H 'Sec-WebSocket-Version: 13' \
  -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
  "http://127.0.0.1:18789/ws" | head -n 1 || true)

if echo "$LOCAL_WS_LINE" | grep -q "101"; then
  note "OK: Local WebSocket upgrade accepted (101)"
else
  fail "Local WebSocket upgrade not accepted. First line: $LOCAL_WS_LINE"
fi

note "All checks passed."
