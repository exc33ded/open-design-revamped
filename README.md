# Open Design

Local-first, BYOK design app. Your coding agent CLI is the design engine.

Generates web prototypes, live artifacts, decks, and images, exported to HTML, PDF, and PPTX. This fork is web-only and ships the agent runtimes that are tested end to end: OpenCode and DeepSeek Reasonix (both driven by DeepSeek models), plus a BYOK path for any OpenAI-compatible endpoint.

**License:** Apache-2.0. [LICENSE](LICENSE)

**Maintainer:** Mohammed Sarim, [github.com/exc33ded](https://github.com/exc33ded). This project is a revamped fork; original work licensed under Apache-2.0.

## Requirements

- **Node 24** (the repo requires `~24`)
- **pnpm 10.33.x or newer**
- At least one agent CLI on your PATH:
  - [OpenCode](https://opencode.ai) 1.15+ (`npm i -g opencode-ai`)
  - [DeepSeek Reasonix](https://github.com/esengine/DeepSeek-Reasonix) (`npm i -g reasonix`)
- A `DEEPSEEK_API_KEY` environment variable (get one at [platform.deepseek.com](https://platform.deepseek.com)), or any OpenAI-compatible key for the BYOK provider flow

## Run it

### 1. Get Node 24

Using [fnm](https://github.com/Schniz/fnm) (recommended, a `.node-version` file is in the repo root):

```bash
fnm install 24
fnm default 24
```

Make sure fnm is hooked into your shell so new terminals pick it up. PowerShell profile example:

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

Verify: `node --version` must print `v24.x`.

### 2. Install dependencies

```bash
git clone https://github.com/exc33ded/open-design-revamped.git
cd open-design-revamped
corepack enable
pnpm install
```

### 3. Start everything

```bash
npm run dev
```

This runs `dev.mjs`, which starts both processes:

- the **daemon** (API server, port 7456), started with the required `OD_WEB_PORT=3000`
- the **web app** (Next.js, port 3000)

Then open **http://localhost:3000**.

### 4. Verify

```bash
curl http://127.0.0.1:7456/api/health    # expect {"ok":true,...}
curl http://localhost:3000               # expect HTTP 200
```

In the app, pick the OpenCode or Reasonix agent, choose a DeepSeek model (for example `deepseek/deepseek-v4-flash`), and send a prompt. Files land in the project workspace.

## Manual two-process setup

If you prefer separate terminals instead of `npm run dev`:

Terminal 1 (daemon):

```bash
cd apps/daemon
OD_WEB_PORT=3000 pnpm run daemon
```

PowerShell: `$env:OD_WEB_PORT = "3000"; pnpm run daemon`

Terminal 2 (web):

```bash
cd apps/web
pnpm run dev
```

`OD_WEB_PORT=3000` is required. Without it the daemon rejects the browser's requests with a 403 (CSRF origin check).

## Connect your own backend

`examples/sample-backend/` is a zero-dependency Node backend (REST API plus an MCP stdio bridge) that shows how agents talk to an external backend:

```bash
cd examples/sample-backend
node server.mjs     # REST API on http://localhost:8787, API key: demo-key-123
node test.mjs       # self-check, requires the server to be running
```

Register the MCP bridge with the daemon so agents can call it:

```bash
curl -X PUT http://127.0.0.1:7456/api/mcp/servers -H 'Content-Type: application/json' -d '{
  "servers": [{
    "id": "sample-backend",
    "label": "Sample Backend",
    "transport": "stdio",
    "enabled": true,
    "command": "node",
    "args": ["<absolute-path>/examples/sample-backend/mcp-server.mjs"]
  }]
}'
```

Agents then get three tools: `list_products`, `create_order`, and `get_stats`. Point the bridge at your real backend with the `BACKEND_URL` and `BACKEND_API_KEY` environment variables.

## Architecture

Frontend (Next.js 16) talks to a local daemon (Express + SQLite), which spawns the agent CLI per run.

- The daemon binds to 127.0.0.1 and is SSRF-guarded at the proxy edge.
- Everything runs locally. No telemetry, no cloud round-trip.
- Agent runtimes live in `apps/daemon/src/runtimes/defs/`. Only tested runtimes are registered in `registry.ts`; add an entry there to enable another agent.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:7456` in web logs | Daemon is not running. Restart `npm run dev`. |
| 403 on API calls | Daemon started without `OD_WEB_PORT=3000`. |
| Build fails on engine check | Wrong Node version. Confirm `node --version` prints v24.x. |
| Agent run fails with "empty output" | Usually a permission or API key problem. Check `DEEPSEEK_API_KEY` is set in the daemon's environment, and see the run log in `.od/runs/<run-id>/events.jsonl`. |
| Stale parse error after editing files | Turbopack held a half-applied edit. Restart the web dev server. |

See [run.md](run.md) for additional Windows-specific notes.
