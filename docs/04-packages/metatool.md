# Package: metatool

**`@open-design/metatool`** — Internal metadata helpers.

## Purpose

Provides reusable hash/check/write mechanics for repository-local tool build outputs. Each concrete tool (dev, pack, serve) owns its own `meta.json`; metatool provides the primitives to work with that metadata.

## Consumers

- Tooling packages — uses metatool primitives for build output tracking

## Commands

```bash
pnpm --filter @open-design/metatool typecheck
pnpm --filter @open-design/metatool test
```
