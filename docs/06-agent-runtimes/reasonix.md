# DeepSeek Reasonix Agent Runtime

A reasoning-focused agent runtime that uses the DeepSeek Reasonix CLI with DeepSeek models.

- **Adapter file:** `apps/daemon/src/runtimes/defs/reasonix.ts`
- **Agent CLI:** `reasonix` — install with `npm i -g reasonix`
- **Models:** DeepSeek models
- **API key:** `DEEPSEEK_API_KEY` environment variable
- **Stream format:** Agent-specific JSON stream

---

## How It Works

1. The daemon checks for the `reasonix` binary on the user's PATH
2. When selected, the daemon invokes `reasonix` with the composed system prompt
3. Reasonix runs in the project working directory
4. The daemon parses Reasonix's output stream into SSE events
5. The browser renders the streaming chat and file changes

---

## Execution Profile

Like OpenCode, Reasonix runs with the **filesystem execution profile**. The agent works directly on the project's file system.

---

## When to Use Reasonix

Reasonix is optimized for tasks that benefit from explicit reasoning chains:

- Complex multi-step designs requiring careful planning
- Design system creation and token mapping
- Critique and refinement workflows
- Migrations and code transformations

---

## Configuration

### Required

- `reasonix` installed globally (`npm i -g reasonix`)
- `DEEPSEEK_API_KEY` set in the daemon's environment

### Model Selection

The model picker shows DeepSeek models. Reasonix works best with reasoning-capable models like `deepseek/deepseek-r1`.

---

## Stream Format

Reasonix uses its own structured output format. The daemon's adapter translates Reasonix-specific events into the common SSE event schema.

---

## Troubleshooting

| Symptom | Likely Cause |
|---------|-------------|
| Agent not in picker | `reasonix` not on PATH |
| Run fails immediately | `DEEPSEEK_API_KEY` not set or Reasonix version mismatch |
| Strange output format | The adapter may need updating for a newer Reasonix version. Check run log. |
