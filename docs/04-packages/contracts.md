# Package: contracts

**`@open-design/contracts`** — Pure TypeScript DTO layer shared by web and daemon.

## Purpose

Defines the typed contract between the frontend and backend. Every API request type, response type, SSE event shape, and configuration interface lives here. This package is the single source of truth for what the two apps agree on.

## Rules

- **Must not** depend on Node.js filesystem/process APIs
- **Must not** depend on browser APIs (no `window`, `document`, `fetch`)
- **Must not** depend on Express, Next.js, SQLite, or daemon internals
- **Must not** depend on the sidecar control-plane protocol
- TypeScript only — no runtime code, no I/O, no side effects

## Key Types

This package defines types for:

- **API DTOs** — Request and response shapes for all daemon endpoints
- **SSE Events** — Chat stream event types, file change events, status updates
- **Plugin Types** — Plugin manifest shape, capabilities, pipeline stages
- **Runtime Types** — `ExecutionProfile` (filesystem vs text-artifact)
- **Analytics Config** — Telemetry event shapes
- **Configuration** — Daemon/web config interfaces

## Consumers

- `@open-design/daemon` — uses types for API implementation
- `@open-design/web` — uses types for API consumption and rendering

## Commands

```bash
pnpm --filter @open-design/contracts typecheck
pnpm --filter @open-design/contracts build    # tsc (no runtime, compiles declarations)
```
