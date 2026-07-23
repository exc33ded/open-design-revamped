# Agent Runtimes

Agent runtimes are the bridge between the daemon and external coding agent CLIs. Each runtime adapter translates the daemon's needs (prompt delivery, stream parsing, MCP injection) into the agent's specific CLI flags and output format.

- **Defined:** 26 adapters in `apps/daemon/src/runtimes/defs/`
- **Active:** 3 registered in `apps/daemon/src/runtimes/registry.ts`
- **Type:** All conform to the `RuntimeAgentDef` interface in `runtimes/types.ts`

---

## Architecture

### RuntimeAgentDef Interface

Every agent adapter implements this contract:

```typescript
interface RuntimeAgentDef {
  id: string;                    // Unique identifier (e.g., "opencode")
  label: string;                 // Display name
  models: string[];              // Supported model identifiers
  streamFormat: StreamFormat;    // How to parse agent output
  // ... CLI flags, env vars, auth, MCP config, etc.
}
```

### How Agents Are Detected

1. `runtimes/detection.ts` checks which agent CLIs are on the user's PATH
2. `platform` package provides the binary discovery logic
3. Only agents found on PATH appear in the web UI's agent picker
4. `runtimes/registry.ts` lists the active agent defs — add an entry there to enable additional runtimes

---

## Active Runtimes (Web-Only Fork)

Three runtimes are active in this fork. The other 23 adapter files remain on disk (some helpers are imported by `server.ts`) but are not registered.

| Runtime | Agent CLI | Models | Details |
|---------|-----------|--------|---------|
| [OpenCode](opencode.md) | `opencode-ai` (npm package) | DeepSeek models | Primary filesystem agent |
| [Reasonix](reasonix.md) | `reasonix` (npm package) | DeepSeek models | Reasoning-focused agent |
| [BYOK OpenCode](byok-opencode.md) | `opencode-ai` | Any OpenAI-compatible | Text-artifact mode, bring your own key |

---

## Enabling Additional Agent Runtimes

To activate a runtime that exists in `defs/` but isn't registered:

1. Open `apps/daemon/src/runtimes/registry.ts`
2. Import the agent def:

```typescript
import { claudeAgentDef } from './defs/claude.js';
```

3. Add it to the `BASE_AGENT_DEFS` array:

```typescript
const BASE_AGENT_DEFS: RuntimeAgentDef[] = [
  opencodeAgentDef,
  byokOpenCodeAgentDef,
  reasonixAgentDef,
  claudeAgentDef,  // newly added
];
```

4. Rebuild the daemon: `cd apps/daemon && pnpm run build`

**Note:** Only the three registered runtimes have been tested end-to-end in this fork. Other adapters may need updates for current CLI versions.

---

## Defined (Inactive) Runtimes

These 23 adapter files exist in `defs/` but are not registered:

`aider.ts`, `amp.ts`, `antigravity.ts`, `claude.ts`, `codebuddy.ts`, `codex.ts`, `copilot.ts`, `cursor-agent.ts`, `deepseek.ts`, `devin.ts`, `grok-build.ts`, `hermes.ts`, `kilo.ts`, `kimi.ts`, `kiro.ts`, `mimo.ts`, `pi.ts`, `qoder.ts`, `qwen.ts`, `shared.ts`, `trae-cli.ts`, `vibe.ts`

---

## Agent Lifecycle

For every chat run:

1. **Auth** — `runtimes/auth.ts` resolves API keys from environment or config
2. **Env** — `runtimes/env.ts` builds the environment for the agent process
3. **Models** — `runtimes/models.ts` resolves the model identifier
4. **MCP** — `runtimes/mcp.ts` injects registered MCP server configs
5. **Launch** — `runtimes/launch.ts` spawns the agent process in the project working directory
6. **Invocation** — `runtimes/invocation.ts` sends the composed prompt
7. **Stream** — `runtimes/json-event-stream.ts` or `runtimes/plain-stream.ts` parses output into events
8. **Runs** — `runtimes/runs.ts` manages run lifecycle, cancellation, and artifact collection
9. **Persistence** — `runtimes/chat-run-lifecycle.ts` persists events and messages to SQLite

### Key Files in `runtimes/`

| File | Purpose |
|------|---------|
| `types.ts` | RuntimeAgentDef interface and related types |
| `registry.ts` | Agent registration — add entries here to enable runtimes |
| `launch.ts` | Agent process spawning |
| `invocation.ts` | Prompt delivery to agent |
| `runs.ts` | Run lifecycle management |
| `chat-run-lifecycle.ts` | Per-run state and persistence |
| `auth.ts` | API key resolution |
| `env.ts` | Agent process environment |
| `models.ts` | Model resolution |
| `mcp.ts` | MCP tool injection |
| `json-event-stream.ts` | Structured event stream parsing |
| `plain-stream.ts` | Plain stdout stream parsing |
| `detection.ts` | Agent CLI detection on PATH |
| `executables.ts` | Binary resolution |
| `terminal-control.ts` | Terminal handling |
| `terminal-launch.ts` | PTY terminal launch |
| `paths.ts` | Path resolution for agent working dirs |
| `run-artifacts.ts` | Artifact collection after runs |
| `run-lifecycle-analytics.ts` | Run analytics tracking |
