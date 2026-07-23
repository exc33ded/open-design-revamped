# Development Guide

How to work on Open Design itself — extending, testing, packaging, and contributing.

---

## Dev Workflow

### One-Command Start

```bash
npm run dev
```

This spawns the daemon (port 7456) and web app (port 3000). Both watch for changes — daemon rebuilds with `tsc`, web uses Next.js Turbopack.

### Manual Two-Process

For debugging individual processes:

```bash
# Terminal 1
cd apps/daemon
OD_WEB_PORT=3000 pnpm run daemon

# Terminal 2
cd apps/web
pnpm run dev
```

### After Code Changes

| What Changed | What to Do |
|-------------|-----------|
| **Daemon source** | Restart daemon (it rebuilds with `tsc` on start) |
| **Web source** | Turbopack hot-reloads automatically |
| **Packages** | Rebuild the consuming app |
| **Plugin content** | Restart daemon so it rescans `_official/` |
| **Design system** | Restart daemon so it rescans registry |

---

## TypeScript and Type Checking

### Typecheck Everything

```bash
pnpm typecheck
# Runs tsc --noEmit across all workspace packages (max concurrency: 4)
```

### Individual Packages

```bash
pnpm --filter @open-design/daemon typecheck
pnpm --filter @open-design/web typecheck
pnpm --filter @open-design/contracts typecheck
# ... etc for each package
```

### Daemon Typecheck (Special)

The daemon typecheck requires contracts and registry-protocol to be built first because it imports their compiled types:

```bash
pnpm --filter @open-design/contracts build
pnpm --filter @open-design/registry-protocol build
pnpm --filter @open-design/daemon typecheck
```

---

## Testing

### Daemon Tests

```bash
cd apps/daemon
pnpm run test       # vitest
```

### Web Tests

```bash
cd apps/web
pnpm run test       # vitest --maxWorkers=2 (browser env constraints)
```

### Package Tests

```bash
pnpm --filter @open-design/host test
pnpm --filter @open-design/metatool test
pnpm --filter @open-design/release test
pnpm --filter @open-design/sidecar-proto test
pnpm --filter @open-design/sidecar test
pnpm --filter @open-design/platform test
```

---

## Code Organization Rules

### Test Files
- Tests live in `tests/` directory, sibling to `src/`
- Never add `*.test.ts` or `*.test.tsx` files under `src/`

### Package Boundaries (from `packages/AGENTS.md`)

| Package | Must Not Depend On |
|---------|-------------------|
| `contracts` | Node filesystem/process, browser APIs, Express, Next.js, SQLite, daemon internals |
| `components` | App-specific workflows, layouts, daemon logic |
| `sidecar` | Open Design-specific app keys, IPC business messages |
| `platform` | Hard-coded `--od-stamp-*` args, Open Design app/source/mode constants |
| `release` | File I/O, network calls, build tool spawning |

### Plugin Rules (from `plugins/AGENTS.md`)

- `_official/` — Bundled first-party plugins. Daemon boot scanner only walks this tree.
- `spec/` — Authoring kit, not installed as catalog.
- Keep `SKILL.md` portable — OD-only metadata in `open-design.json`.
- Do not import app-private code from plugin content.
- New bundled plugins: `plugins/_official/<tier>/<plugin-id>/`.
- New spec examples: `plugins/spec/examples/<plugin-id>/`.
- Bilingual docs: When editing `README.md`, `SPEC.md`, `CONTRIBUTING.md`, or `AGENT-DEVELOPMENT.md`, update `*.zh-CN.md` mirrors.
- Prefer TypeScript for project scripts. Avoid new `.js`/`.mjs`/`.cjs` files.

---

## Extending Open Design

### Adding an Agent Runtime

1. Create or locate the adapter in `apps/daemon/src/runtimes/defs/<agent>.ts`
2. Register it in `apps/daemon/src/runtimes/registry.ts`:

```typescript
import { myAgentDef } from './defs/my-agent.js';

const BASE_AGENT_DEFS: RuntimeAgentDef[] = [
  opencodeAgentDef,
  byokOpenCodeAgentDef,
  reasonixAgentDef,
  myAgentDef,  // added
];
```

3. Verify the agent CLI is findable: `runtimes/detection.ts` checks PATH
4. Rebuild: `cd apps/daemon && pnpm run build`

### Adding a Design System

1. Create a folder: `plugins/_official/design-systems/<system-id>/`
2. Add `DESIGN.md` with token definitions
3. Add `manifest.json` with metadata
4. Restart daemon — registry rescans at startup

### Adding a Plugin

1. Follow the [Plugin Authoring Guide](../05-plugins/authoring.md)
2. Create your plugin folder with `SKILL.md` + `open-design.json`
3. For bundled: place in `plugins/_official/<tier>/<plugin-id>/`
4. Restart daemon for bundled plugins
5. Validate: `od plugin validate ./path/to/plugin`

### Adding a Package

1. Create the folder: `packages/<name>/`
2. Add `package.json` with name `@open-design/<name>` and `"type": "module"`
3. Add to `pnpm-workspace.yaml` if custom path (already covered by `packages/*`)
4. Respect the boundary rules — choose the right domain
5. No `packages/shared` — it was removed and must not be restored

---

## Packaging for Windows

```bash
npm run package:win
# Runs scripts/package-win.mjs → builds daemon + web → produces zip
```

Output: `release/OpenDesign-X.X.X-win-x64.zip`

The packaging script:
1. Builds the daemon (`tsc`)
2. Builds the web app (`next build`)
3. Packages everything into a zip

---

## Debugging

### Run Logs

Each agent run produces a log at `.od/runs/<run-id>/events.jsonl`:

```bash
cat .od/runs/<run-id>/events.jsonl
```

This contains every event the agent emitted — tool calls, results, messages, errors.

### Daemon Logs

The daemon outputs to stdout/stderr. When running with `npm run dev`, both daemon and web output are interleaved in the terminal.

### Web Dev Tools

Open browser DevTools at http://localhost:3000:
- **Network tab** — Watch SSE `/api/chat` connections
- **Console tab** — React warnings and errors
- **Application tab** — localStorage state

### Port Conflicts

```bash
# Windows
netstat -ano | findstr "7456\|3000"

# macOS/Linux
lsof -i :7456 -i :3000
```

---

## Project Structure Quick Reference

```
open-design/
├── apps/
│   ├── daemon/          # Express + SQLite backend (7456)
│   └── web/             # Next.js 16 frontend (3000)
├── packages/            # 14 shared packages
├── plugins/
│   ├── _official/       # Bundled plugins (atoms, design systems, examples, scenarios)
│   ├── community/       # Community plugins
│   ├── registry/        # Marketplace manifests
│   └── spec/            # Plugin spec + authoring kit
├── tools/               # Dev/pack/serve tooling
├── scripts/             # Packaging scripts
├── release/             # Built artifacts
├── dev.mjs              # One-shot dev launcher
├── package.json         # Root monorepo config
├── pnpm-workspace.yaml  # Workspace definition
└── run.md               # Windows-specific notes
```
