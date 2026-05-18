---
activity_signal: quiet
blocks: []
contributes_to: []
days_since_last_commit: 6
delta: aligned
depends_on: []
drift_callout: null
kind: infrastructure
last_agent_update: '2026-05-18T14:27:34Z'
lifecycle: maintain
parent: brett
project: max-mission-control
related_to: []
state: active
used_by: []
version: 1
---

# STATUS — max-mission-control

<!-- mps:section=focus owner=agent hash=1466a787 generated=2026-05-11T20:29:27Z -->
## Focus

> **Drift detected:** Declared `state: active` but no commits in over 90 days — this project looks dormant. Consider flipping `state:` to `paused` in portfolio.yaml or restarting work.

Max Mission Control (`insightriot/max-mission-control`) is the live **Mission Control v2** dashboard service — an open-source, single-pane-of-glass UI for AI agent orchestration. It runs as `com.openclaw.mission-control-v2` from `~/workspace/repos/mission-control`, listening on `:3200`. Core capabilities include a 26-panel task board, agent/session monitoring, real-time WebSocket + SSE updates, cost tracking, and multi-gateway integration (currently OpenClaw). The stack is Next.js 16 / React 19 / TypeScript / SQLite (WAL, no external dependencies).
<!-- mps:end -->

<!-- mps:section=current_sprint owner=agent hash=a5a2b9cc generated=2026-05-11T20:29:27Z -->
## Current sprint

**Drift alert: declared `state: active` but zero commits in the last 30 days (and no commits detected in over 90 days).** No planning directory exists and no daily-log entries reference this project. The service appears to be running in a stable-but-dormant maintenance posture rather than under active development. (low signal — needs human input)
<!-- mps:end -->

<!-- mps:section=next_actions owner=agent hash=f70dd268 generated=2026-05-11T20:29:27Z -->
## Next Actions

- **Audit the live `:3200` service to confirm it is still healthy and up-to-date** — the repo has had no commits in 90+ days and the declared `state: active` no longer matches observed activity; verifying the running instance prevents silent drift from becoming an outage.
- **Update `state:` in `portfolio.yaml` from `active` to `paused` (or restart work with a scoped sprint)** — resolving the drift callout keeps the portfolio dashboard accurate and surfaces whether intentional maintenance-mode or neglect is the cause.
- **Document any known gaps or desired improvements in a `.planning/` directory or README roadmap section** — the repo currently has no planning artifacts, making it impossible to resume work or hand off context without archaeology.
<!-- mps:end -->

<!-- mps:section=decision_rules owner=human hash=fb3cb17f generated=2026-05-11T20:29:27Z -->
## Decision rules (project-specific)

- Service runs locally; no Redis, Postgres, or Docker required — keep zero-external-dependency constraint before adding new integrations.
- Alpha software caveat in README: APIs, DB schemas, and config formats may change — breaking changes require README/changelog update before merge. (low signal — needs human input)
<!-- mps:end -->

<!-- mps:section=blockers owner=agent hash=741b2ac8 generated=2026-05-11T20:29:27Z -->
## Blockers / decisions needed

No explicit blockers recorded. The primary risk is unacknowledged dormancy: the service is live on `:3200` but has received no commits in 90+ days with no planning artifacts to indicate what comes next. (low signal — needs human input)
<!-- mps:end -->

<!-- mps:section=deferred owner=human hash=2f70150c generated=2026-05-11T20:29:27Z -->
## Deferred (revisit after current phase)

- Additional gateway integrations beyond OpenClaw (noted in README roadmap as "more coming soon") — no timeline or active work detected.
- Any feature work implied by the README roadmap section — deferred pending decision on whether to resume active development. (low signal — needs human input)
<!-- mps:end -->

<!-- mps:section=links owner=agent hash=5f70259b generated=2026-05-11T20:29:27Z -->
## Links

- Repo: `insightriot/max-mission-control` (origin remote for `~/workspace/repos/mission-control`)
- Live service: `com.openclaw.mission-control-v2` on `:3200`
- README: covers Quick Start, API Reference, Environment Variables, Deployment, and Roadmap sections
<!-- mps:end -->

---

<!-- ========================================================================
     MACHINE ZONE — recent reality (auto-rewritten by the compiler).
     Empty at bootstrap; populated on first daily compiler run in Phase 3+.
     Do not edit by hand.
     ======================================================================== -->

## Recent reality

_Populated by the compiler on first daily run._
