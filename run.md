# Running Open Design locally (Windows)

## Quick start (one command)

```bash
npm run dev
```

That runs `dev.mjs`, which starts both processes: the **daemon** (API, port 7456,
with the required `OD_WEB_PORT=3000` already set) and the **web app** (Next.js,
port 3000). Then open http://localhost:3000.

## Prerequisites

- **Node 24** (repo requires `~24`). A `.node-version` file is in the repo root;
  with fnm hooked into your shell (`fnm env --use-on-cd`), the right version
  activates automatically on `cd`. One-time setup: `fnm install 24 && fnm default 24`.
- **pnpm >= 10.33.2**

## Manual two-process setup (if you don't want dev.mjs)

Daemon (terminal 1):

```bash
cd apps/daemon
OD_WEB_PORT=3000 pnpm run daemon
```

- `pnpm run daemon` = build (`tsc`) + `node dist/cli.js --no-open`
- **`OD_WEB_PORT=3000` is required** — without it the daemon 403s the web app's
  requests (CSRF origin check).
- PowerShell: `$env:OD_WEB_PORT = "3000"; pnpm run daemon`

Web app (terminal 2):

```bash
cd apps/web
pnpm run dev    # next dev --turbopack, serves on port 3000
```

## Connecting your own backend (example)

`examples/sample-backend/` is a zero-dependency Node backend (REST + MCP bridge)
showing how agents connect to an external backend. See its README:
start it with `node server.mjs`, register the MCP bridge via
`PUT /api/mcp/servers`, and agents can then call `list_products`,
`create_order`, and `get_stats` against it.

## Verify

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:7456/api/health   # expect 200
```

Then open http://localhost:3000.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:7456` in web logs | Daemon not running — restart step 2 |
| 403 on API calls | Daemon started without `OD_WEB_PORT=3000` |
| Daemon build fails on engine check | Wrong Node — redo step 1, confirm `node --version` is 24 |
| Stale parse error in dev server after files changed | Turbopack HMR holding a half-applied edit — restart `pnpm run dev` |
| Port check | `netstat -ano | grep -E ':(7456|3000)'` — LISTENING means alive, only TIME_WAIT means dead |

Note: the `tools-dev` desktop build is currently broken — use the two-process web setup above.
