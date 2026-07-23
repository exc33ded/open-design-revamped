# OpenCode Agent Runtime

The primary and most-tested agent runtime in this fork. Uses the OpenCode CLI (`opencode-ai`) with DeepSeek models.

- **Adapter file:** `apps/daemon/src/runtimes/defs/opencode.ts`
- **Agent CLI:** `opencode-ai` — install with `npm i -g opencode-ai` (version 1.15+ required)
- **Models:** DeepSeek models (`deepseek/deepseek-v4-flash`, etc.)
- **API key:** `DEEPSEEK_API_KEY` environment variable
- **Stream format:** JSON event stream

---

## How It Works

1. The daemon checks for the `opencode` binary on the user's PATH
2. When selected, the daemon invokes `opencode` with the composed system prompt
3. OpenCode runs in the project working directory (`.od/projects/<id>/`)
4. The daemon parses OpenCode's JSON output stream into SSE events
5. The browser renders the streaming chat, file changes, and artifacts

---

## Execution Profile

OpenCode runs with the **filesystem execution profile** — the agent's current working directory is the project folder. Every file it creates, reads, or edits lives on disk. The web app's file panel and preview pick up changes in real time.

This means:
- The agent creates actual HTML/CSS/JS files in the project directory
- Users see files appear in the file panel as they're written
- HTML files in the project root auto-render in the preview pane
- No `<artifact>` blocks in the chat — files are the deliverable

---

## Configuration

### Required

- `opencode-ai` installed globally
- `DEEPSEEK_API_KEY` set in the daemon's environment

### Model Selection

The web UI's model picker shows available DeepSeek models. The daemon resolves the model identifier and passes it to OpenCode via CLI flags.

Typical models:
- `deepseek/deepseek-v4-flash` — Fast, general purpose
- `deepseek/deepseek-r1` — Reasoning-focused

---

## CLI Invocation

The daemon constructs an `opencode` command like:

```bash
opencode --model deepseek/deepseek-v4-flash --cwd .od/projects/<id> [flags...]
```

The exact flags depend on the runtime adapter's definition in `opencode.ts`. The adapter handles:
- Model flag format
- System prompt delivery (via file or stdin)
- MCP server configuration injection
- API key environment setup

---

## Stream Parsing

OpenCode emits structured JSON events on stdout. The daemon's `json-event-stream.ts` parser handles these event types:

- `tool_call` — Agent invoked a tool (read, write, edit, bash, glob, grep)
- `tool_result` — Result of the tool call
- `assistant_message` — Agent's text response
- `error` — Error during execution
- `final_result` — Run completed

Each event is forwarded to the browser as an SSE event, rendered in the chat pane, and persisted to SQLite.

---

## Troubleshooting

| Symptom | Likely Cause |
|---------|-------------|
| Agent not in picker | `opencode` not on PATH or wrong version |
| Empty output on run | `DEEPSEEK_API_KEY` not set or invalid |
| Agent exits immediately | OpenCode CLI version mismatch. Check `opencode --version` matches 1.15+ |
| Files not appearing | Agent didn't write to cwd. Check run log at `.od/runs/<run-id>/events.jsonl` |
