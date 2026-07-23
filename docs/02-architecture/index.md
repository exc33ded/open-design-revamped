# Architecture

## Overview

Open Design follows a **Client-Server + Agent Orchestrator** pattern. The frontend talks to a local daemon, which spawns coding agent CLIs as child processes. Everything runs locally — no telemetry, no cloud round-trip.

```
Browser (localhost:3000)
    │  Next.js rewrites /api/* → daemon on 127.0.0.1:7456
    ▼
Daemon (Express on 127.0.0.1:7456)
    │  Receives chat requests → resolves project → composes system prompt
    │  System prompt = official designer identity
    │                + discovery/planning layer
    │                + active DESIGN.md
    │                + active SKILL.md
    │                + deck framework (if deck mode)
    │
    ├─► Spawns agent CLI (opencode / reasonix / byok-opencode)
    │       │  Agent runs in project working directory (.od/projects/<id>/)
    │       │  Reads/writes HTML/CSS/JS artifacts
    │       ▼
    │   Agent output stream (JSON events / stdout / SSE)
    │       │
    │       ▼
    │   Daemon parses stream → SSE to browser
    │       │
    │       ▼
    │   Browser renders streaming chat + file changes in real time
    │
    ├─► SQLite (.od/app.sqlite) — WAL mode
    │       Tables: projects, conversations, messages, plugins,
    │               design_systems, media_tasks, routines,
    │               brands, library, memory_rules, mcp_servers
    │
    └─► File System (.od/projects/<id>/)
            Agent working directory with HTML artifacts, sketches, uploads
```

## Agent Lifecycle

A single user message triggers this full pipeline:

1. **User sends prompt** in the web UI
2. **Daemon resolves context** — project, conversation, active design system, active plugin skill
3. **System prompt composed** — layers are stacked: official designer prompt → discovery rules → DESIGN.md content → SKILL.md content → deck framework (for decks)
4. **Agent selected** — based on user's choice (OpenCode, Reasonix, or BYOK)
5. **Agent process spawned** — CLI invoked with composed prompt, project cwd, MCP tools
6. **Output streamed** — daemon parses stdout/JSON events and forwards as SSE to browser
7. **Artifacts persisted** — messages, file changes, and run events written to SQLite + filesystem

## Monorepo Layout

The project uses **pnpm workspaces** with four workspace roots defined in `pnpm-workspace.yaml`:

```
open-design/
├── apps/
│   ├── daemon/         # @open-design/daemon — Express API server + SQLite
│   └── web/            # @open-design/web   — Next.js 16 React SPA
├── packages/           # 14 shared internal packages
├── plugins/            # Plugin content (officials, community, spec kit)
├── tools/              # Dev/pack/serve tooling
├── scripts/            # Packaging scripts
└── release/            # Built artifacts (cached)
```

## Security Model

- **Loopback only** — Daemon binds to `127.0.0.1:7456`, never exposed to LAN
- **CSRF origin guard** — `OD_WEB_PORT` must match browser origin or requests get 403
- **SSRF-guarded proxy** — Daemon's HTTP outbound is restricted at the proxy edge
- **BYOK** — User provides their own API keys; no keys shipped or proxied
- **No telemetry** — No data leaves the machine; analytics is opt-in only
- **Managed workspaces** — Agent processes run in isolated `.od/projects/<id>/` directories

## Design Patterns

### Plugin Architecture
Every design workflow is a plugin — a portable folder with `SKILL.md` + optional `open-design.json`. The system prompt is composed by stacking layers, making agent behavior fully customizable. Plugins define pipeline stages using reusable atoms.

### Agent Runtime Abstraction
The `RuntimeAgentDef` type defines a unified interface for any coding agent CLI. Each adapter translates between the daemon's needs (prompt delivery, stream parsing, MCP injection) and the agent's specific CLI flags and output format. 26 adapters are defined; 3 are active in the web-only fork.

### Pipeline Pattern
Plugins define multi-stage pipelines: **discovery → plan → generate → critique**. Stages use atoms (reusable steps) and critique stages can repeat with exit conditions like `critique.score>=4 || iterations>=3`.

### Critique Theater
A unique design review pattern: multiple "panelists" critique a design artifact with scored feedback, displayed in a theater UI component in the browser.

### SSE Streaming
The daemon streams agent output to the browser via Server-Sent Events, supporting multiple stream formats — agent-specific JSON events, plain stdout, stderr, and ACP JSON-RPC.

### Local-First Data
SQLite with WAL mode stores all metadata. Agent artifacts live in `.od/projects/<id>/`. No cloud dependency for any core operation.

### Custom Frontend Router
Instead of React Router, a custom `useSyncExternalStore`-based router hooks into `pushState`/`popstate` for deep-linkable URLs with minimal overhead.
