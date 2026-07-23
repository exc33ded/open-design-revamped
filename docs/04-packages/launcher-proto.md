# Package: launcher-proto

**`@open-design/launcher-proto`** — Launcher protocol definitions.

## Purpose

Defines the protocol for the packaged application launcher — how the desktop launcher communicates with the daemon and web processes during app startup.

## Consumers

- `@open-design/daemon` — launcher communication
- `@open-design/sidecar` — launcher-side sidecar management

## Commands

```bash
pnpm --filter @open-design/launcher-proto typecheck
```
