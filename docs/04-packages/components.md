# Package: components

**`@open-design/components`** — Shared React UI primitives and primitive CSS.

## Purpose

Houses reusable React components that are shared across the web app. Focuses on UI primitives — buttons, cards, modals, tooltips, icons, and their CSS. Keeps product-specific workflows, layouts, and compositions in the app layer.

## Rules

- May depend on React types and runtime only
- Product workflows and app-specific layout/styling must stay in `apps/web`
- Does not depend on any app-private code or providers

## Consumers

- `@open-design/web` — imports shared components

## Commands

```bash
pnpm --filter @open-design/components typecheck
```
