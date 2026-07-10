# Open Design

Local-first, BYOK design app. Your coding agent CLI is the design engine.

Generates **web · desktop · mobile prototypes**, **live artifacts**, **decks**, **images**, **video**, and **HyperFrames** motion graphics — exported to HTML / PDF / PPTX / MP4. Runs on any CLI agent (Claude Code, Codex, Cursor, Gemini, Copilot, etc.) or any OpenAI-compatible endpoint.

**License:** Apache-2.0. [LICENSE](LICENSE)

---

## Quick start

```bash
git clone https://github.com/exc33ded/open-design-revamped.git
cd open-design-revamped
corepack enable && pnpm install
pnpm tools-dev run web
```

Node ~24, pnpm 10.33.x.

## Architecture

Frontend (Next.js 16) / Electron ⇄ local daemon (Express + SQLite) ⇄ spawned agent CLI.

- Daemon binds to 127.0.0.1, SSRF-guarded at the proxy edge.
- Everything runs locally. No telemetry, no cloud round-trip.

## Maintainer

Mohammed Sarim — [github.com/exc33ded](https://github.com/exc33ded)

This project is a revamped fork; original work licensed under Apache-2.0 (see [LICENSE](LICENSE)).
