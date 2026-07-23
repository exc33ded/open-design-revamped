# BYOK OpenCode Agent Runtime

The Bring Your Own Key (BYOK) runtime lets you use any OpenAI-compatible API endpoint with Opencode as the agent. It's the escape hatch for using models and providers beyond DeepSeek.

- **Adapter file:** `apps/daemon/src/runtimes/defs/byok-opencode.ts`
- **Agent CLI:** `opencode-ai`
- **Models:** Any model from any OpenAI-compatible endpoint
- **API key:** User-provided (configured through the web UI)
- **Stream format:** JSON event stream
- **Execution profile:** `text_artifact` (no filesystem tools)

---

## How It Differs from Standard OpenCode

### Text-Artifact Execution Profile

Unlike the standard OpenCode runtime (filesystem), BYOK runs with `text_artifact` execution:

- **No file tools** — The agent cannot create, read, or edit files on disk
- **No project working directory** — No filesystem access at all
- **Output via `<artifact>` blocks** — The agent wraps its output in `<artifact type="text/html">...</artifact>` blocks
- **Browser extracts and displays the artifact** — The web app parses these blocks and renders them for the user

### Provider Flexibility

- Works with any OpenAI-compatible API endpoint, not just DeepSeek
- User configures their API key and endpoint URL through the web UI's BYOK settings
- Model list is fetched from the user's configured endpoint

---

## System Prompt Differences

The BYOK execution profile swaps these prompt sections:

**Filesystem** (standard OpenCode):
> You operate inside a filesystem-backed project: the project folder is your current working directory, and every file you create... lives there.

**Text-artifact** (BYOK):
> You operate in a text-artifact API run with no filesystem tools. The user sees your chat output directly, and the canonical deliverable is the complete HTML you emit inside a source-code `<artifact>` block.

---

## Use Cases

BYOK is useful when:

- You want to use models from providers other than DeepSeek (OpenAI, Anthropic, Google, local Ollama, etc.)
- You don't need persistent project files and prefer chat-based artifact delivery
- You're evaluating different models for design tasks
- You have an enterprise OpenAI-compatible endpoint with custom models

---

## Configuration

### Setup in the Web UI

1. Open Settings → Agent selection
2. Choose "BYOK OpenCode"
3. Enter your API endpoint URL (must be OpenAI-compatible)
4. Enter your API key
5. Pick a model from the fetched model list

### Environment

No environment variables are required at the daemon level — all configuration is done through the web UI. The daemon passes credentials to the agent process.

---

## Limitations

- No persistent file artifacts — output exists only in the chat
- No file panel or preview pane integration for generated files
- No deck export (PDF/PPTX export requires files on disk)
- No multi-file projects — all output is a single HTML artifact
- No design system file injection (DESIGN.md is injected into the prompt but the agent can't read external files)
