# Package: download

**`@open-design/download`** — Download utilities.

## Purpose

Provides download primitives — fetching files, tracking progress, resuming interrupted downloads. Used by the daemon for downloading plugins, assets, and updates.

## Consumers

- `@open-design/daemon` — downloads plugins, design system assets

## Commands

```bash
pnpm --filter @open-design/download typecheck
```
