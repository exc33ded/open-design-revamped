# Package: plugin-runtime

**`@open-design/plugin-runtime`** — Plugin runtime execution environment.

## Purpose

Provides the execution environment for Open Design plugins — loading, validating, and running plugin logic. Used by the daemon to activate plugins and inject their behavior into agent runs.

## Consumers

- `@open-design/daemon` — loads and executes plugins during agent runs

## Commands

```bash
pnpm --filter @open-design/plugin-runtime typecheck
```
