# Mission Control Remote Access (Tailscale)

This documents the stable setup for accessing Mission Control remotely via Tailscale.

## What broke (common failure mode)

Mission Control enforces a host allowlist via `MC_ALLOWED_HOSTS`.

When the device hostname changes in Tailscale (e.g., device renamed from `mac` to `openclaws-mac-mini`), requests to the new `*.tail*.ts.net` hostname can be rejected by the app with:

- `HTTP 403 Forbidden`

Even if Tailscale Serve is correctly configured.

## Canonical setup

### 1) Mission Control service

- Mission Control runs locally on the Mac mini at:
  - `http://127.0.0.1:3200`

### 2) Tailscale Serve

Expose Mission Control over the tailnet using Tailscale Serve:

```bash
sudo /Applications/Tailscale.app/Contents/MacOS/Tailscale serve --bg --https=443 http://127.0.0.1:3200
sudo /Applications/Tailscale.app/Contents/MacOS/Tailscale serve status
```

This publishes:

- `https://<device-hostname>.<tailnet>.ts.net/` → `http://127.0.0.1:3200`

### 3) Mission Control allowed hosts

Ensure the `.env` contains the actual Tailscale Serve hostname(s) in `MC_ALLOWED_HOSTS`.

Example:

```env
MC_ALLOWED_HOSTS=localhost,127.0.0.1,100.*,mac.tail1c85d6.ts.net,openclaws-mac-mini.tail1c85d6.ts.net
```

After updating `.env`, rebuild + restart:

```bash
cd /Users/maxopenclaw/.openclaw/workspace/repos/mission-control
npm run build
launchctl kickstart -k gui/$(id -u maxopenclaw)/com.openclaw.mission-control-v2
```

## Quick diagnostics

### Confirm Mission Control is healthy locally

```bash
curl -I http://127.0.0.1:3200/ | head
```

Expected: `307` redirect to `/login`.

### Confirm Tailscale Serve is active

```bash
sudo /Applications/Tailscale.app/Contents/MacOS/Tailscale serve status
```

### Confirm remote access works

From another tailnet device:

```bash
curl -I https://<device-hostname>.<tailnet>.ts.net/ | head
```

Expected: `307` redirect to `/login`.

If you see `403 Forbidden`, check `MC_ALLOWED_HOSTS` first.
