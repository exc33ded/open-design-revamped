# Daemon

The daemon is the central orchestrator. It's an Express 5 API server with a SQLite database that spawns and manages coding agent CLIs.

- **Package:** `@open-design/daemon` (v0.14.2)
- **Entry:** `apps/daemon/bin/od.mjs` → `dist/cli.js`
- **Port:** `127.0.0.1:7456` (configurable via `OD_PORT`)
- **Database:** SQLite with WAL mode at `.od/app.sqlite`
- **Files:** 145 TypeScript source files in `apps/daemon/src/`

---

## Entry Point: The `od` CLI

The daemon ships as both a library and a CLI. The `od` binary is defined in `package.json`:

```json
"bin": { "od": "./bin/od.mjs" }
```

Running `od` without arguments starts the daemon. Running `od <subcommand>` dispatches to specific operations:

| Subcommand | What It Does |
|------------|-------------|
| *(default)* | Start daemon on port 7456 |
| `media generate` | Generate image/video/audio (sends request to running daemon) |
| `brand ...` | Brand management operations |
| `design-system ...` | Design system registry operations |
| `plugin validate` | Validate a plugin folder |
| `research ...` | Research operations |
| `artifacts ...` | Artifact management |
| `connectors ...` | Connector tooling |
| `live-artifacts ...` | Live artifact tooling |
| `handoff ...` | Project handoff operations |
| `mcp install/remove` | MCP server management |

The main CLI logic is in `cli.ts` (380KB), the `--no-open` flag skips opening the browser.

---

## Subsystem Map

The daemon's `src/` directory organizes 145 files into 30 subdirectories plus standalone modules:

### `runtimes/` — Agent Runtime Framework (37 files)

The core of agent orchestration. Contains:

- **`defs/`** — 26 agent adapter definitions, one file per agent: `opencode.ts`, `reasonix.ts`, `byok-opencode.ts`, `claude.ts`, `codex.ts`, `copilot.ts`, `cursor-agent.ts`, `hermes.ts`, `kimi.ts`, `kilo.ts`, `kiro.ts`, `qwen.ts`, `pi.ts`, `devin.ts`, `trae-cli.ts`, `vibe.ts`, `aider.ts`, `amp.ts`, `antigravity.ts`, `deepseek.ts`, `grok-build.ts`, `mimo.ts`, `qoder.ts`, `shared.ts`
- **`registry.ts`** — Only 3 are registered in the web-only fork: OpenCode, BYOK-OpenCode, and Reasonix
- **Core runtime files:** `types.ts` (RuntimeAgentDef), `launch.ts`, `invocation.ts`, `runs.ts`, `chat-run-lifecycle.ts`, `auth.ts`, `env.ts`, `models.ts`, `mcp.ts`, `paths.ts`, `executables.ts`, `json-event-stream.ts`, `plain-stream.ts`, `terminal-control.ts`, `terminal-launch.ts`

### `prompts/` — System Prompt Composition (8 files)

How the agent's system prompt is built:

| File | Purpose |
|------|---------|
| `official-system.ts` | The base "expert designer" prompt (adapted from claude.ai/design) |
| `system.ts` | Master composer — stacks design system + skill on top |
| `discovery.ts` | Discovery and planning rules |
| `directions.ts` | Direction picking logic |
| `deck-framework.ts` | Slide deck framework (1920×1080 canvas, nav, keyboard) |
| `panel.ts` | Critique panel generation |
| `media-contract.ts` | Media generation contract |
| `research-contract.ts` | Research contract |

### `routes/` — Express Route Handlers (24 files)

Each route file handles a specific API surface:

| File | Handles |
|------|---------|
| `chat.ts` | Main chat endpoint — accepts prompts, spawns agents, streams SSE |
| `runs.ts` | Run lifecycle (list, details, cancel) |
| `projects/` | Project CRUD, settings, templates |
| `media.ts` | Image/video/audio generation |
| `genui.ts` | GenUI (forms, choices, confirmations during agent runs) |
| `deploy.ts` | Deploy and export operations |
| `handoff.ts` | Project handoff |
| `library.ts` | Asset library management |
| `memory.ts` | Memory rules and hooks |
| `routine.ts` | Automation routines |
| `terminal.ts` | Terminal PTY sessions |
| `design-systems.ts` | Design system browsing and installation |
| `design-system-tool.ts` | Design system CLI tooling |
| `live-artifact.ts` | Live artifact management |
| `social-share.ts` | Social sharing |
| `telemetry.ts` | Telemetry endpoint |
| `daemon.ts` | Daemon status and health |
| `host-tools.ts` | Host tool bridge |
| `plugins/` | Plugin installation and management |
| `automation.ts` | Automation ingestion and proposals |
| `static-resource.ts` | Static file serving |
| `vela.ts` | Vela integration |
| `xai.ts` | X.AI integration |
| `active-context.ts` | Active conversation context |
| `whats-new.ts` | What's new content |
| `open-design-public-metadata.ts` | Public metadata |
| `project/` | Project-specific operations |

### `http/` — HTTP Layer

- `adapter.ts` — Request/response adapters
- `error.ts` — Error handling
- `origin-validation.ts` — CSRF origin guard using `OD_WEB_PORT`
- `oauth.ts` — OAuth flow handling
- `parse.ts` — Request body parsing
- `tool-request-auth.ts` — Tool call authentication

### `storage/` — Database Layer

- `daemon-db.ts` — SQLite configuration (supports Postgres too)
- `project-storage.ts` — Project-scoped storage
- `aws-sigv4.ts` — AWS S3 signature for external storage

### `plugins/` — Plugin Management

Handles plugin installation, persistence, enrichment, and sharing. Walks `plugins/_official/` at startup to register bundled plugins.

### `design-systems/` — Design System Registry

Scans `plugins/_official/design-systems/*/` for `DESIGN.md` + `manifest.json` pairs and registers them for agent context injection.

### `media/` + `media-adapters/` — Media Generation

Image, video, and audio generation via agent-driven prompts. Media adapters handle format conversion, sizing, and quality tuning.

### `critique/` — Agent Critique Loop

Manages the critique theater flow — parses panelist output, scores feedback, and drives iteration loops with exit conditions. Includes test fixtures.

### `agent-protocol/` — Agent Communication

Protocol definitions for ACP (Agent Communication Protocol), core stream handling, and pi-rpc transport.

### Other Subsystems

| Directory | Purpose |
|-----------|---------|
| `craft/` | Craft reference section loading |
| `deploy/` | Deploy to hosting providers |
| `genui/` | GenUI surface generation |
| `integrations/` | External service integrations |
| `logging/` | Structured logging |
| `metrics/` | Prometheus metrics |
| `projects/` | Project lifecycle management |
| `qa/` | Quality assurance tooling |
| `registry/` | Plugin registry operations |
| `research/` | Research workflow |
| `sidecar/` | Sidecar process management |
| `tools/` | CLI tooling bridges |
| `brands/` | Brand profile management |
| `figma/` | Figma integration |

---

## Key Standalone Modules

These are top-level files in `src/` that own critical responsibilities:

| File | Responsibilities |
|------|-----------------|
| `cli.ts` (380KB) | Main CLI entry — dispatches subcommands, starts daemon |
| `server.ts` (367KB) | The giant Express app — all routes, middleware, SSE |
| `db.ts` (81KB) | SQLite schema, queries, migrations |
| `craft.ts` | Loads craft reference sections for agent context |
| `agents.ts` | Agent CLI detection on the system PATH |
| `mcp.ts` | MCP protocol handling and tool injection |
| `memory.ts` | Memory rule extraction and application |
| `skills.ts` | Skill loading and injection |
| `deploy.ts` | Deploy orchestrator |
| `deck-export.ts` | HTML → PPTX export via pptxgenjs |
| `pdf-export.ts` | HTML → PDF export via pdf-lib |
| `handoff-cli.ts` | CLI handoff commands |
| `artifacts-cli.ts` | Artifact CLI commands |

---

## Database Schema

The SQLite database (`.od/app.sqlite`, WAL mode) contains these key tables:

| Table | Purpose |
|-------|---------|
| `projects` | Project metadata (name, cwd, design system, settings) |
| `conversations` | Chat conversation threads within projects |
| `messages` | Individual chat messages (user prompts, agent responses) |
| `plugins` | Installed/enabled plugins |
| `design_systems` | Registered design system presets |
| `media_tasks` | Image/video/audio generation tasks and statuses |
| `routines` | Automation routines and schedules |
| `brands` | User-created brand profiles |
| `library` | Asset library entries |
| `memory_rules` | Extracted memory rules per project/conversation |
| `mcp_servers` | Registered MCP server configurations |

---

## Build and Run

```bash
# Build
cd apps/daemon
pnpm run build          # tsc -p tsconfig.json → dist/

# Run (requires OD_WEB_PORT)
OD_WEB_PORT=3000 pnpm run daemon   # build + node dist/cli.js --no-open

# Typecheck
pnpm run typecheck

# Test
pnpm run test           # vitest
```
