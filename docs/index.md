# Open Design — Documentation

Local-first, BYOK design app. Your coding agent CLI is the design engine.

Generates web prototypes, live artifacts, decks, and images — exported to HTML, PDF, and PPTX. This fork is web-only and ships three tested agent runtimes: OpenCode, DeepSeek Reasonix, and BYOK OpenCode (all using DeepSeek models or any OpenAI-compatible endpoint).

- **Version:** 0.14.2
- **License:** Apache-2.0
- **Maintainer:** [exc33ded](https://github.com/exc33ded)

---

## Quick Start

```bash
# Requirements: Node 24, pnpm >= 10.33.2, DEEPSEEK_API_KEY
git clone https://github.com/exc33ded/open-design-revamped.git
cd open-design-revamped/open-design
corepack enable
pnpm install
npm run dev
# Open http://localhost:3000
```

---

## Table of Contents

| # | Section | Description |
|---|---------|-------------|
| 1 | [Getting Started](01-getting-started/index.md) | Prerequisites, install, run, verify, troubleshooting |
| 2 | [Architecture](02-architecture/index.md) | High-level architecture, data flow, security model, design patterns |
| 3 | [Apps](03-apps/index.md) | Daemon (Express + SQLite backend) and Web (Next.js 16 frontend) |
| 4 | [Packages](04-packages/index.md) | 14 shared internal packages — contracts, components, protocols, runtimes |
| 5 | [Plugins](05-plugins/index.md) | Plugin ecosystem — spec, authoring, atoms, design systems, scenarios, examples |
| 6 | [Agent Runtimes](06-agent-runtimes/index.md) | OpenCode, Reasonix, and BYOK agent adapters |
| 7 | [System Prompt](07-system-prompt/index.md) | How the agent's prompt is composed from stacked layers |
| 8 | [Tools](08-tools/index.md) | Dev tooling, CLI subcommands, packaging |
| 9 | [Sample Backend](09-sample-backend/index.md) | Zero-dependency Node backend for connecting external APIs |
| 10 | [Scripts & Commands](10-scripts-and-commands/index.md) | Every command, script, and environment variable |
| 11 | [Development](11-development/index.md) | Dev workflow, testing, packaging, extending |

---

## What This Project Produces

| Mode | Output | Export Formats |
|------|--------|---------------|
| `prototype` | Interactive single-page web artifact | HTML |
| `deck` | Slide presentation | HTML, PDF, PPTX |
| `live-artifact` | Dashboard, report, calculator, live UI | HTML |
| `image` | Generated image, poster, visual asset | PNG |
| `video` | Video clip, storyboard, motion | MP4 |
| `audio` | Voice, music, sonic branding | MP3/WAV |
| `design-system` | Reusable brand or interface system | HTML |
