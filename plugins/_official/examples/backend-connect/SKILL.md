---
name: backend-connect
description: |
  Connect a local backend code folder (any language), analyze it in depth into BACKEND.md,
  interview the user about frontend stack, pages, and look via question forms, then generate
  a frontend wired to the backend's real endpoints.
triggers:
  - "connect backend"
  - "connect my backend"
  - "frontend for my backend"
  - "build a frontend for this API"
  - "backend folder"
od:
  mode: prototype
  scenario: backend-connect
---

# Backend Connect

You build a frontend for the user's existing backend. The workflow is strict and
phased. Never skip a phase, never reorder, and never invent endpoints that are
not in the analyzed source.

## Phase 0 — Locate the backend folder

The backend folder is `metadata.backendDir` (also present in `linkedDirs`, so
you can read it). If no backend folder is linked, STOP and ask the user to link
their backend code folder with the working-directory picker in the composer.
Do not guess a folder and do not proceed without one.

## Phase 1 — Analyze the backend in depth

Read the backend source thoroughly — entry point, routing, handlers/controllers,
models/schemas, config, env usage, middleware, and any README. Any language:
identify the framework from the code, not from assumptions. Trace every route to
its handler and read the handler body — parameter names, validation, and the
actual response shape come from code, not from route names.

Write **`BACKEND.md`** in the project with exactly these sections:

1. **Overview** — what the backend does, in a few sentences.
2. **Stack** — language, framework, notable libraries, storage.
3. **How to run** — the concrete command(s) and any required env vars.
4. **Base URL & auth** — detected host/port (from `listen(...)`, config, env
   defaults) and the auth scheme (header name, key/token source, or none).
   Mark anything you could not detect as `(unknown — will ask)`.
5. **Endpoints** — a table: method, path, query/body params with types,
   response shape (real JSON keys), auth required. One row per endpoint.
   Include example request/response pairs for the non-trivial ones.
6. **Data models** — each entity with its fields and types.
7. **Suggested pages** — the frontend pages this API naturally supports
   (e.g. products list → product detail → cart for a shop API), one line each
   on what the page shows and which endpoints it uses.
8. **CORS** — whether the backend sends CORS headers. If it does not, say so
   and note the consequence (browser calls from another origin will fail).

Then post a concise chat summary of the understanding (stack, endpoint count,
auth, suggested pages) and tell the user `BACKEND.md` has the full detail.

## Phase 2 — Interview the user (question forms)

In the SAME turn as the analysis summary, emit a `<question-form>` covering
every decision generation needs. Pre-fill everything you detected; only ask
what the code could not answer. Required questions:

- **Stack**: `Vite + React + shadcn/ui + Tailwind`, `Next.js`, or
  `Plain HTML + CSS + JS (no build step)`.
- **Pages**: multi-select seeded from BACKEND.md's Suggested pages, plus a
  free-text option for pages you did not suggest.
- **Look & feel**: style direction (e.g. minimal / dashboard-dense / playful /
  brand color), free text allowed.
- **Base URL**: pre-filled with the detected value for the user to confirm or
  edit.
- **Auth**: if the API needs a key/token, where the user wants it (env/config
  value they paste, or a login form when the backend has a login endpoint).

If the answers reveal a gap (e.g. a chosen page needs an endpoint that doesn't
exist), say so plainly and ask one follow-up form — do not silently improvise
missing API surface.

## Phase 3 — Generate the wired frontend

Only after the form answers arrive. Build for the chosen stack:

- **One API config module** (`src/lib/api.(ts|js)` or `js/api.js` for plain
  HTML) holding the base URL and auth header logic in a single place, plus one
  named function per endpoint the pages use. All page code calls these
  functions — no inline fetch URLs scattered through components.
- **Every page the user picked**, wired to real endpoints with loading, empty,
  and error states. Render real fields from the response shapes in BACKEND.md —
  before wiring each call, re-verify the path and shape against the backend
  source.
- **Plain HTML target**: separate `.html` file per page, shared `css/` and
  `js/`, `index.html` as the entry.
- **Vite/Next target**: standard scaffold layout, router with one route per
  page, base URL in the stack's env convention (`VITE_API_URL` /
  `NEXT_PUBLIC_API_URL`) with the confirmed value as the default.
- **`README.md`** — how to run the frontend, how to point it at the backend,
  and the CORS note from Phase 1 if the backend lacks CORS headers.

Close with a short chat summary: pages built, endpoints wired, how to run both
halves together. If any endpoint could not be wired as analyzed, say exactly
which and why — never present unwired UI as connected.

### Maintain `DESIGN.md` alongside the pages

This project has no bundled design system attached (the "Look & feel"
answer is free text, not a catalogue pick), so nothing else records what
was actually designed. Keep a project-local **`DESIGN.md`** — descriptive,
not prescriptive: it documents what this project's pages actually use, not
a template to follow from outside.

Before writing the first page, create it from the "Look & feel" answer and
whatever you decide as you build the first page:

```markdown
# Design — <project name>

Look & feel direction: <the Phase 2 answer, verbatim or lightly summarized>

## Palette
<hex values + role, e.g. `#1a1a1a` background, `#5b8def` primary action>

## Typography
<font stack, scale (h1/h2/body/small), weight choices>

## Spacing & layout
<base unit, grid/flex pattern, page max-width, card/section rhythm>

## Components
<one entry per recurring pattern as it's introduced: button styles, table
style, empty/loading/error state treatment, form layout — name it once,
reuse the name in later entries instead of re-describing it>
```

Before styling each subsequent page, **read `DESIGN.md` first** and reuse
its existing palette/type/component entries — don't re-derive a button
style or spacing unit from scratch per page, and don't silently drift the
accent color page to page. When a page introduces a genuinely new pattern
(e.g. the first page with a modal, or the first data table), add that
entry to `DESIGN.md` in the same turn you write the page — the file stays
in sync with the pages, not a one-time snapshot from before any page
existed. Mention in the closing chat summary that `DESIGN.md` has the full
record, the same way you point at `BACKEND.md` for the API side.
