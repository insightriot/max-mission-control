---
# ============================================================================
# MACHINE ZONE — agents write, humans don't edit by hand.
# Maintained by the deducer (Phase 2) on bootstrap and the compiler
# (Phase 3+) on subsequent reconciliations.
#
# Schema reference: CONVENTIONS.md → "STATUS.md schema" section.
#
# Placeholder syntax:
#   - "{{name}}" tokens in quoted scalar fields are filled by the renderer
#     using the project's portfolio.yaml entry, recent git activity, and
#     linked goal candidates.
#   - List fields (depends_on, related_to, used_by, blocks, contributes_to)
#     are seeded as [] and the renderer rewrites the full line from
#     portfolio.yaml + goal-candidate cross-references.
#   - last_human_update is intentionally absent at bootstrap. It is set by
#     the human reviewer when accepting/refining a deducer draft and is
#     never written by the deducer. The deducer's human-edit detection
#     rule treats its presence as one signal that the prose middle has
#     been touched (see CONVENTIONS.md → human-edit detection).
# ============================================================================

version: 1                          # STATUS.md schema version

project: "max-mission-control"           # matches portfolio.yaml id
parent: "brett"            # venture id
kind: "infrastructure"                    # product | infrastructure | utility | archive
state: "active"                  # active | maintenance | paused | shipped | killed
lifecycle: "maintain"          # exploration | validation | build | ship | maintain | continuous

# Cross-project edges — copied verbatim from portfolio.yaml at render time.
depends_on: []
related_to: []
used_by: []
blocks: []

# Goal linkage — confident matches use the {venture, target} object form;
# ambiguous candidates surface as {status: tbd, question: "..."} entries
# for the review pass to resolve rather than hide.
contributes_to: []

# Activity-related fields (last_agent_update, activity_signal,
# days_since_last_commit, metrics, delta) are intentionally absent at
# bootstrap — Phase 3's compiler is the sole writer.
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
