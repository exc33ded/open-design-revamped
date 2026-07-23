# Package: platform

**`@open-design/platform`** — Generic OS process primitives.

## Purpose

Provides low-level operating system process utilities — finding executables, spawning processes, matching running processes, and serializing runtime stamps.

## Key Contents

- **Stamp serialization** — Converts runtime stamp descriptors to CLI arguments
- **Command parsing** — Parses command strings for agent invocation
- **Process matching/search** — Find running processes by pattern or stamp
- **Toolchain bin discovery** — Shared source of truth for finding tool binaries on the user's PATH (used by both the daemon agent resolver and the packaged sidecar PATH builder)

## Rules

- Consumes stamp descriptors from `@open-design/sidecar-proto`
- Must not hard-code `--od-stamp-*` argument details
- Must not hard-code Open Design-specific app/mode/source constants
- The toolchain helper here is the **single source of truth** for binary discovery — `apps/daemon/src/agents.ts` and `apps/packaged/src/sidecars.ts` both consume it

## Consumers

- `@open-design/daemon` — finds agent CLIs, spawns processes
- `@open-design/web` — process management from UI
- `@open-design/sidecar` — process spawning for sidecars

## Commands

```bash
pnpm --filter @open-design/platform typecheck
pnpm --filter @open-design/platform test
```
