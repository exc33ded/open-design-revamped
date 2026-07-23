# Package: sidecar-proto

**`@open-design/sidecar-proto`** — Open Design sidecar business protocol.

## Purpose

Defines the business-level protocol for sidecar processes. Owns the constants, types, and schemas that describe how Open Design's sidecar processes communicate with the main daemon.

## Key Contents

- **App/mode/source constants** — Which app is running, in what mode, from what source
- **Namespace validation** — Rules for sidecar namespace naming
- **Stamp descriptors** — Five stamp fields: `app`, `mode`, `namespace`, `ipc`, `source`
- **IPC message schema** — Business message format for sidecar ↔ daemon communication
- **Status shapes** — Sidecar lifecycle status types
- **Error semantics** — Error codes and shapes
- **Default product path constants** — Standard paths for Open Design installation

## Rules

- This is the **single source of truth** for sidecar stamp fields
- `sidecar` and `platform` packages consume from here — they must not duplicate constants
- Does not contain runtime logic — just types and constants

## Consumers

- `@open-design/daemon` — knows the sidecar protocol
- `@open-design/web` — knows the sidecar protocol
- `@open-design/sidecar` — consumes protocol constants
- `@open-design/platform` — consumes stamp descriptors

## Commands

```bash
pnpm --filter @open-design/sidecar-proto typecheck
pnpm --filter @open-design/sidecar-proto test
```
