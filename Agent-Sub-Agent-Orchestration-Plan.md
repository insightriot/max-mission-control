# Agent + Sub-Agent Orchestration Plan

## Vision

Build an autonomous AI company where specialized agents handle different business functions, coordinated by an orchestrator.

## Core Principles

- **Hierarchy** — Orchestrator at top, specialists below
- **Specialization** — Each agent has defined role + skills
- **Input → Output flow** — Research/ingestion → Execution/delivery
- **Tool access** — Restricted by role (coach agents can't write, etc.)
- **Memory** — Shared knowledge base + per-agent context
- **Self-improving** — Monitor performance → adjust agent config

## Why This Matters

- You focus on strategy, agents execute
- Agents can work in parallel on different tasks
- Clear ownership = accountability
- Adding new agents = expanding capabilities

## Reference: Alex Finn's Setup

```
Henry (Chief of Staff) ← Orchestrator
├── Charlie (Infrastructure Engineer) ← Ops
├── Ralph (Forfaree / QA Manager) ← Ops
├──
├── ↓ INPUT SIGNAL
│   ├── Scout (Trend Analyst)
│   │
└── OUTPUT ACTION →
    ├── Quill (Content Writer)
    ├── Pixel (Thumbnail Designer)
    └── Echo (Social Media Manager)
```

**Key elements:**
- Hierarchical — Chief of Staff at top
- Specialized roles — Infrastructure, QA, Research, Content, Design, Social
- Tags per agent — Skills/capabilities
- Input/Output split — Research vs execution

## Current Setup (Your Agents)

| Agent | Role | Tools |
|-------|------|-------|
| Max (main) | Chief of Staff / Orchestrator | Full access |
| Coach Dan | Specialist (Dan Martell Coach) | exec, read, web_search, web_fetch |
| Coach Joe | Specialist (Joe Hudson Coach) | exec, read, web_search, web_fetch |

## Planned Mission Control Integration

### 1. Agent Registry Panel
- Agent list with cards
- Name, role, workspace, model
- Status (active, paused, disabled)

### 2. Tool Policy Matrix
- Visual grid: Agents × Tools
- Toggle switches for allow/deny
- Filter by category

### 3. API Key Management
- Secure storage for service keys
- Per-agent or shared
- Status (active, paused)

### 4. Org Chart Visualization
- Tree view of agents
- Parent-child relationships
- Click to edit

### 5. Sync to Gateway
- "Deploy" button → writes to openclaw.json
- Triggers gateway restart
- Rollback capability

## Implementation Phases

| Phase | Task |
|-------|------|
| 1 | DB schema + API endpoints |
| 2 | Agent list/detail UI |
| 3 | Tool policy matrix |
| 4 | API key management |
| 5 | Org chart visualization |
| 6 | Sync + deploy workflow |

## Related Docs

- OpenClaw multi-agent: https://docs.openclaw.ai/concepts/multi-agent
- Skills system: https://docs.openclaw.ai/tools/skills
