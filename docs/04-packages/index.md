# Packages

The `packages/` directory contains 14 shared internal packages that both apps consume. They follow strict dependency boundaries — each package owns a specific domain and must not cross into app-specific territory.

---

## Package Map

| Package | Domain | Consumed By |
|---------|--------|-------------|
| [contracts](contracts.md) | Pure TypeScript DTO layer | daemon, web |
| [components](components.md) | Shared React UI primitives | web |
| [host](host.md) | Web/desktop host bridge | web |
| [sidecar-proto](sidecar-proto.md) | Sidecar business protocol | daemon, web, sidecar, platform |
| [sidecar](sidecar.md) | Sidecar runtime primitives | daemon, web |
| [platform](platform.md) | OS process primitives | daemon, web, sidecar |
| [release](release.md) | Release-domain primitives | daemon |
| [plugin-runtime](plugin-runtime.md) | Plugin runtime execution | daemon |
| [registry-protocol](registry-protocol.md) | Registry protocol | daemon |
| [metatool](metatool.md) | Internal metadata helpers | tooling |
| [agui-adapter](agui-adapter.md) | AGUI protocol adapter | daemon |
| [diagnostics](diagnostics.md) | Diagnostic utilities | daemon |
| [download](download.md) | Download utilities | daemon |
| [launcher-proto](launcher-proto.md) | Launcher protocol | daemon, sidecar |

---

## Boundary Rules

These rules are enforced by convention and documented in `packages/AGENTS.md`:

1. **`contracts`** must stay pure TypeScript — no Node filesystem/process APIs, no browser APIs, no Express/Next.js/SQLite dependencies.

2. **`components`** may depend on React types/runtime only. Product workflows and app-specific layout belong in the apps.

3. **`host`** models renderer-facing host capabilities. Keeps `window.__od__` access out of app UI code.

4. **`sidecar-proto`** owns the sidecar business protocol constants. `sidecar` and `platform` must not hard-code Open Design app/source/mode constants — they consume them from `sidecar-proto`.

5. **`sidecar`** provides generic sidecar runtime primitives. It must not hard-code Open Design-specific IPC business messages.

6. **`platform`** provides generic OS process primitives. It consumes `sidecar-proto` descriptors and must not hard-code `--od-stamp-*` details.

7. **`release`** is purely computational — no file I/O, no network calls, no build tool spawning.

8. **Tests** live in each package's `tests/` directory, sibling to `src/`. Never add `*.test.ts` files under `src/`.

9. **No `packages/shared`** — it was removed. For new shared types, choose the right boundary: DTOs in `contracts`, sidecar protocol in `sidecar-proto`, generic runtime in `sidecar`, generic OS in `platform`.

---

## Common Commands

```bash
# Typecheck individual packages
pnpm --filter @open-design/contracts typecheck
pnpm --filter @open-design/components typecheck
pnpm --filter @open-design/host typecheck
pnpm --filter @open-design/sidecar-proto typecheck
pnpm --filter @open-design/sidecar typecheck
pnpm --filter @open-design/platform typecheck
pnpm --filter @open-design/release typecheck
pnpm --filter @open-design/plugin-runtime typecheck
pnpm --filter @open-design/registry-protocol typecheck
pnpm --filter @open-design/metatool typecheck
pnpm --filter @open-design/agui-adapter typecheck
pnpm --filter @open-design/diagnostics typecheck
pnpm --filter @open-design/download typecheck
pnpm --filter @open-design/launcher-proto typecheck

# Test packages (where tests exist)
pnpm --filter @open-design/host test
pnpm --filter @open-design/metatool test
pnpm --filter @open-design/release test
pnpm --filter @open-design/sidecar-proto test
pnpm --filter @open-design/sidecar test
pnpm --filter @open-design/platform test

# Typecheck everything
pnpm typecheck
```
