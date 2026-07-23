# Getting Started

## Requirements

- **Node 24** (the repo requires `~24`). A `.node-version` file sits in the repo root.
- **pnpm ≥ 10.33.2** and `< 11`. Enable with `corepack enable`.
- At least one agent CLI on your PATH:
  - [OpenCode](https://opencode.ai) 1.15+ — `npm i -g opencode-ai`
  - [DeepSeek Reasonix](https://github.com/esengine/DeepSeek-Reasonix) — `npm i -g reasonix`
- A `DEEPSEEK_API_KEY` environment variable ([get one here](https://platform.deepseek.com)), or any OpenAI-compatible API key for the BYOK provider flow.

### Setting Up Node 24

Using [fnm](https://github.com/Schniz/fnm) (recommended):

```bash
fnm install 24
fnm default 24
```

Hook fnm into your shell so new terminals pick it up. PowerShell example:

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

Verify with `node --version` — it must print `v24.x`.

---

## Install

```bash
git clone https://github.com/exc33ded/open-design-revamped.git
cd open-design-revamped/open-design
corepack enable
pnpm install
```

---

## Run

### One Command (Recommended)

```bash
npm run dev
```

This runs `dev.mjs`, which starts both processes:

- **Daemon** (API server on port 7456) — with `OD_WEB_PORT=3000` already set
- **Web app** (Next.js on port 3000)

Then open **http://localhost:3000**.

### Manual Two-Process Setup

If you prefer separate terminals:

**Terminal 1 — Daemon:**

```bash
cd apps/daemon
OD_WEB_PORT=3000 pnpm run daemon
```

PowerShell: `$env:OD_WEB_PORT = "3000"; pnpm run daemon`

**Terminal 2 — Web:**

```bash
cd apps/web
pnpm run dev
```

**`OD_WEB_PORT=3000` is required.** Without it, the daemon rejects browser requests with a 403 (CSRF origin check).

---

## Verify

```bash
curl http://127.0.0.1:7456/api/health    # expect {"ok":true,...}
curl http://localhost:3000               # expect HTTP 200
```

In the app, pick the OpenCode or Reasonix agent, choose a DeepSeek model (for example `deepseek/deepseek-v4-flash`), and send a prompt. Generated files land in the project workspace.

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DEEPSEEK_API_KEY` | API key for DeepSeek models | *required* |
| `OD_PORT` | Daemon listen port | `7456` |
| `OD_WEB_PORT` | Web app port (for CSRF validation) | `3000` |
| `OD_DAEMON_DB` | SQLite database path | `.od/app.sqlite` |
| `OD_WEB_OUTPUT_MODE` | Web output mode (`static` or `server`) | auto |
| `OD_ALLOWED_DEV_ORIGINS` | Additional allowed browser origins | empty |
| `COREPACK_ENABLE_DOWNLOAD_PROMPT` | Auto-approve corepack downloads | `0` (set by dev.mjs) |

---

## Troubleshooting

| Symptom | Cause and Fix |
|---------|---------------|
| `ECONNREFUSED 127.0.0.1:7456` in web logs | Daemon is not running. Restart `npm run dev`. |
| 403 on API calls | Daemon started without `OD_WEB_PORT=3000`. |
| Build fails on engine check | Wrong Node version. Confirm `node --version` prints v24.x. |
| Agent run fails with "empty output" | Usually a permission or API key problem. Check `DEEPSEEK_API_KEY` is set in the daemon's environment. See run log in `.od/runs/<run-id>/events.jsonl`. |
| Stale parse error after editing files | Turbopack held a half-applied edit. Restart the web dev server. |
| Port 7456 or 3000 already in use | Another instance is running. Check with `netstat -ano | grep -E ':(7456|3000)'`. |
| Agent not found in picker | The agent CLI is not on your PATH. Install it globally with npm. |
| `pnpm` not found after `corepack enable` | Restart your terminal or run `corepack prepare pnpm@10.33.2 --activate`. |

---

## Windows-Specific Notes

- The `tools-dev` desktop build is currently broken — use the two-process web setup above.
- PowerShell users: use `$env:VAR = "value"` instead of `VAR=value` for environment variables.
- Port check: `netstat -ano | findstr "7456\|3000"` — LISTENING means alive.
- The root `npm run dev` spawns both processes using PowerShell-compatible commands.
