# Scripts & Commands

Every command, script, and environment variable reference. Run these from the `open-design/` directory unless specified otherwise.

---

## Root Scripts

From `open-design/package.json`:

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Starts daemon (port 7456) + web app (port 3000) via `dev.mjs` |
| `npm run package:win` | Packages project into Windows release zip (`scripts/package-win.mjs`) |
| `npm run typecheck` | Runs `tsc --noEmit` across all workspace packages concurrently (max 4) |

---

## Daemon Scripts

From `apps/daemon/` (`cd apps/daemon` first):

| Command | What It Does |
|---------|-------------|
| `pnpm run build` | TypeScript compilation → `dist/` |
| `pnpm run daemon` | Build + start daemon on port 7456 (`--no-open`) |
| `pnpm run dev` | Same as `daemon` |
| `pnpm run start` | Build + start daemon (opens browser) |
| `pnpm run test` | Vitest test suite |
| `pnpm run typecheck` | Full type checking (builds contracts + registry-protocol first) |

---

## Web Scripts

From `apps/web/` (`cd apps/web` first):

| Command | What It Does |
|---------|-------------|
| `pnpm run dev` | Next.js dev server with Turbopack on port 3000 |
| `pnpm run build` | Next.js production build |
| `pnpm run build:sidecar` | Sidecar TypeScript compilation |
| `pnpm run test` | Vitest tests (max 2 workers — browser environment) |
| `pnpm run typecheck` | TypeScript type checking |

---

## Package Commands

Typecheck individual packages:

```bash
pnpm --filter @open-design/contracts typecheck
pnpm --filter @open-design/host typecheck && pnpm --filter @open-design/host test
pnpm --filter @open-design/metatool typecheck && pnpm --filter @open-design/metatool test
pnpm --filter @open-design/release typecheck && pnpm --filter @open-design/release test
pnpm --filter @open-design/sidecar-proto typecheck && pnpm --filter @open-design/sidecar-proto test
pnpm --filter @open-design/sidecar typecheck && pnpm --filter @open-design/sidecar test
pnpm --filter @open-design/platform typecheck && pnpm --filter @open-design/platform test
pnpm --filter @open-design/contra... -- etc for remaining packages
```

---

## CLI Subcommands (`od`)

Run from any terminal with the daemon CLI installed:

| Command | Description |
|---------|-------------|
| `od` | Start daemon on port 7456 (opens browser) |
| `od --no-open` | Start daemon without opening browser |
| `od media generate` | Generate image/video/audio |
| `od brand ...` | Brand profile management |
| `od design-system ...` | Design system management |
| `od plugin validate <path>` | Validate a plugin folder |
| `od plugin install <path>` | Install a plugin from local folder |
| `od research ...` | Research operations |
| `od artifacts ...` | Artifact management |
| `od connectors ...` | Connector management |
| `od live-artifacts ...` | Live artifact management |
| `od handoff ...` | Project handoff |
| `od mcp install <config>` | Register MCP server |
| `od mcp remove <id>` | Remove MCP server |

---

## Tool Commands

From the tools packages:

```bash
# Dev lifecycle
pnpm tools-dev status --json
pnpm tools-dev logs --json
pnpm tools-dev check
pnpm tools-dev run web

# Packaging
pnpm tools-pack mac build --to all
pnpm tools-pack mac install
pnpm tools-pack mac cleanup
pnpm tools-pack win build --to nsis
pnpm tools-pack win install
pnpm tools-pack win cleanup
pnpm tools-pack linux build --to appimage
pnpm tools-pack linux install
pnpm tools-pack linux start --headless

# Services
pnpm tools-serve start updater
```

---

## Environment Variables Reference

| Variable | Used By | Purpose | Default |
|----------|---------|---------|---------|
| `DEEPSEEK_API_KEY` | daemon | API key for DeepSeek models | *required* |
| `OD_PORT` | daemon | Daemon listen port | `7456` |
| `OD_WEB_PORT` | daemon | Web app port for CSRF origin validation | *required* |
| `OD_DAEMON_DB` | daemon | SQLite database file path | `.od/app.sqlite` |
| `OD_WEB_OUTPUT_MODE` | web | Web output mode (`static` or `server`) | auto |
| `OD_ALLOWED_DEV_ORIGINS` | daemon | Additional allowed browser origins | empty |
| `COREPACK_ENABLE_DOWNLOAD_PROMPT` | root | Auto-approve corepack downloads | `0` (set by dev.mjs) |
| `BACKEND_URL` | sample-backend | Sample backend URL for MCP bridge | `http://localhost:8787` |
| `BACKEND_API_KEY` | sample-backend | Sample backend API key | `demo-key-123` |
| `PORT` | sample-backend | Sample backend listen port | `8787` |
| `API_KEY` | sample-backend | Sample backend API key | `demo-key-123` |

---

## API Endpoints (Daemon)

The daemon's Express server at `127.0.0.1:7456`:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chat` | Send a chat prompt (SSE streaming response) |
| `GET` | `/api/runs` | List runs |
| `GET` | `/api/runs/:id` | Run details |
| `POST` | `/api/runs/:id/cancel` | Cancel a run |
| `GET/POST/PUT/DELETE` | `/api/projects/...` | Project CRUD |
| `GET/PUT` | `/api/mcp/servers` | MCP server management |
| `POST` | `/api/media/generate` | Generate media |
| `GET/POST` | `/api/plugins/...` | Plugin management |
| `GET` | `/api/design-systems` | List design systems |
| `GET/POST` | `/api/library/...` | Asset library |
| `GET/POST` | `/api/memory/...` | Memory rules |
| `GET` | `/api/terminal/...` | Terminal PTY sessions |
| `GET` | `/api/open-design-public-metadata` | Public metadata |
| `POST` | `/api/artifacts/save` | Save artifact |
| `POST` | `/api/artifacts/lint` | Lint artifact |
| `GET` | `/artifacts/...` | Served artifact files |
| `GET` | `/frames/...` | Served frame files |
