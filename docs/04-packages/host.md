# Package: host

**`@open-design/host`** — Web/desktop host bridge contract.

## Purpose

Models renderer-facing host capabilities and helpers. The host layer abstracts the environment the UI renders in — web browser or Electron desktop shell. Keeps `window.__od__` access out of app UI code so components don't need to know which host they're running in.

## Rules

- May depend on browser types
- Keeps host capability detection centralized
- App UI code should import from here, not access `window.__od__` directly

## Consumers

- `@open-design/web` — uses for host capability detection

## Commands

```bash
pnpm --filter @open-design/host typecheck
pnpm --filter @open-design/host test
```
