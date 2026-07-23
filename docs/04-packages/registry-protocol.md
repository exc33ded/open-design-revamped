# Package: registry-protocol

**`@open-design/registry-protocol`** — Registry protocol definitions.

## Purpose

Defines the protocol for plugin registries — how plugin catalogs are structured, indexed, and consumed by the daemon. Used to fetch and index plugin manifests from marketplace sources.

## Consumers

- `@open-design/daemon` — reads registry manifests for plugin discovery

## Commands

```bash
pnpm --filter @open-design/registry-protocol typecheck
```
