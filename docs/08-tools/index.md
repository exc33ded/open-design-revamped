# Tools

The `tools/` directory contains three tooling packages for development lifecycle, packaging/release, and fixture services. Currently only the tool definitions exist — the actual tool packages (`tools/dev`, `tools/pack`, `tools/serve`) live in the full distribution.

---

## Tool Categories

### tools/dev — Development Lifecycle Control Plane

The primary development toolchain.

- Package: `@open-design/tools-dev`
- Binary: `tools-dev`

**Key commands:**

```bash
pnpm tools-dev status --json       # Show daemon + web status
pnpm tools-dev logs --json         # Show recent logs
pnpm tools-dev check               # Health check
pnpm tools-dev run web             # Foreground daemon + web (for Playwright tests)
```

### tools/pack — Packaging and Release

Builds, installs, and manages packaged application artifacts.

- Package: `@open-design/tools-pack`
- Binary: `tools-pack`

**Key commands:**

```bash
# macOS
pnpm tools-pack mac build --to all
pnpm tools-pack mac install
pnpm tools-pack mac cleanup

# Windows
pnpm tools-pack win build --to nsis
pnpm tools-pack win install
pnpm tools-pack win inspect --expr "document.title"
pnpm tools-pack win cleanup

# Linux
pnpm tools-pack linux build --to appimage
pnpm tools-pack linux install
pnpm tools-pack linux install --headless
pnpm tools-pack linux start --headless
pnpm tools-pack linux stop --headless
pnpm tools-pack linux build --containerized
```

### tools/serve — Fixture Services

Runs local fixture services for development and testing.

- Package: `@open-design/tools-serve`
- Binary: `tools-serve`

**Key commands:**

```bash
pnpm tools-serve start updater    # Start update server fixture
```

---

## The `od` CLI

The daemon ships as the `od` binary. All subcommands dispatch through `apps/daemon/bin/od.mjs` → `dist/cli.js`.

### Core Commands

| Command | Description |
|---------|-------------|
| `od` | Start the daemon on port 7456 (default) |
| `od --no-open` | Start daemon without opening browser |

### Media

| Command | Description |
|---------|-------------|
| `od media generate` | Generate image, video, or audio via the running daemon |

### Brand Management

| Command | Description |
|---------|-------------|
| `od brand ...` | Create, list, edit, or delete brand profiles |

### Design Systems

| Command | Description |
|---------|-------------|
| `od design-system ...` | Manage design systems — install, list, validate |

### Plugins

| Command | Description |
|---------|-------------|
| `od plugin validate <path>` | Validate a plugin folder against the spec |
| `od plugin install <path>` | Install a plugin from a local folder |

### Artifacts

| Command | Description |
|---------|-------------|
| `od artifacts ...` | Manage project artifacts |

### Connectors

| Command | Description |
|---------|-------------|
| `od connectors ...` | Manage external service connectors |

### Live Artifacts

| Command | Description |
|---------|-------------|
| `od live-artifacts ...` | Manage live artifacts |

### Handoff

| Command | Description |
|---------|-------------|
| `od handoff ...` | Project handoff operations |

### MCP Management

| Command | Description |
|---------|-------------|
| `od mcp install <config>` | Install an MCP server |
| `od mcp remove <id>` | Remove an MCP server |

### Research

| Command | Description |
|---------|-------------|
| `od research ...` | Research workflow operations |

---

## Tools Boundary Rules

From `tools/AGENTS.md`:

- **Test location:** Tool tests in `tests/` directory, sibling to `src/`. No `*.test.ts` under `src/`.
- **Orchestration layers:** Must consume primitives from `@open-design/sidecar-proto`, `@open-design/sidecar`, `@open-design/platform`.
- **Do not hand-build:** `--od-stamp-*` args, process-scan regexes, runtime tokens, process roles.
- **Port flags are authoritative:** `--daemon-port` and `--web-port`. Internal env vars: `OD_PORT` and `OD_WEB_PORT`.
- **No `NEXT_PORT`** — use `--web-port`.
- **Pack-specific resources** belong under `tools/pack/resources/`.
- **No root `pnpm build` aggregate** — use package-scoped builds.

---

## Retired Tools

- `tools/pr` / `@open-design/tools-pr` — retired. Maintainer PR-duty workflows now live outside the product workspace in `PerishCode/duty`.
