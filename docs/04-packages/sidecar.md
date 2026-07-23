# Package: sidecar

**`@open-design/sidecar`** — Generic sidecar runtime primitives.

## Purpose

Provides the runtime machinery for managing sidecar processes — starting, stopping, communicating, and monitoring child processes that run alongside the main application.

## Key Contents

- **Bootstrap** — Sidecar process startup sequence
- **IPC transport** — Inter-process communication layer
- **Path/runtime resolution** — Finding sidecar binaries and resolving runtime paths
- **Launch environment** — Environment variable construction for sidecar processes
- **JSON runtime file helpers** — Reading/writing sidecar runtime metadata files

## Rules

- Must be generic — no Open Design-specific app keys or IPC business messages
- Consumes protocol constants from `@open-design/sidecar-proto`
- Does not hard-code product-specific behavior

## Consumers

- `@open-design/daemon` — manages agent sidecar processes
- `@open-design/web` — manages browser-side sidecar instances

## Commands

```bash
pnpm --filter @open-design/sidecar typecheck
pnpm --filter @open-design/sidecar test
```
