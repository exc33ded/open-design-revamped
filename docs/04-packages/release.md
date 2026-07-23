# Package: release

**`@open-design/release`** — Pure release-domain primitives.

## Purpose

Owns everything related to versioning, release channels, and release metadata. Pure computational layer — no side effects.

## Key Contents

- **Release channel names** — Stable, beta, nightly, etc.
- **Version parsing/formatting** — Semver parsing and comparison
- **Metadata field derivation** — Computed metadata from release inputs
- **Storage prefixes** — Where release artifacts live
- **Release namespaces** — Namespace conventions for releases
- **App identity data** — Product name, version, identifiers

## Rules

- **Must not** read/write files
- **Must not** call GitHub/R2/S3
- **Must not** spawn build tools
- **Must not** own workflow execution — purely data computation

## Consumers

- `@open-design/daemon` — version display, release channel logic

## Commands

```bash
pnpm --filter @open-design/release typecheck
pnpm --filter @open-design/release test
```
