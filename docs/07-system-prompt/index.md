# System Prompt

The agent's system prompt is not a single static block — it's composed at runtime by stacking multiple layers. Each layer adds context that shapes how the agent behaves, what it produces, and what visual vocabulary it uses.

---

## Composition Architecture

The prompt is assembled in `apps/daemon/src/prompts/system.ts` by stacking layers:

```
┌─────────────────────────────────────────────┐
│  Layer 1: OFFICIAL DESIGNER PROMPT          │
│  │ Expert designer identity                 │
│  │ Workflow rules (understand → explore →   │
│  │   plan → build → verify)                 │
│  │ Output guidelines (naming, line count,   │
│  │   color, inspection, content, CSS)       │
│  │ React/Babel pinned versions              │
│  │ Deck framework rules                     │
│  │ Tweaks panel rules                       │
│  │ Verification (static + visual)           │
│  │ What you don't do                        │
│  └─────────────────────────────────────────  │
│                 ↓ injected below             │
│  Execution context (filesystem or            │
│    text-artifact) + workflow handoff         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Layer 2: DISCOVERY & PLANNING              │
│  │ discovery.ts — When to ask questions,    │
│  │   how to discover user needs             │
│  │ directions.ts — Direction picking logic  │
│  │ panel.ts — Critique panel generation     │
│  └─────────────────────────────────────────  │
│  For deck mode: deck-framework.ts           │
│  For media mode: media-contract.ts          │
│  For research mode: research-contract.ts    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Layer 3: ACTIVE DESIGN SYSTEM              │
│  │ Full content of the selected             │
│  │ DESIGN.md file injected verbatim         │
│  │ Includes: colors, typography, spacing,   │
│  │   border radius, shadows, motion         │
│  └─────────────────────────────────────────  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Layer 4: ACTIVE PLUGIN SKILL               │
│  │ Full content of the selected             │
│  │ SKILL.md file injected verbatim          │
│  │ Includes: workflow, output spec,         │
│  │   design rules, reference paths          │
│  └─────────────────────────────────────────  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Layer 5: DECK FRAMEWORK (deck mode only)   │
│  │ Fixed 1920×1080 canvas skeleton          │
│  │ Scale-to-fit, prev/next, keyboard,       │
│  │   counter, position restore, print       │
│  │ Agent fills in slide content only        │
│  └─────────────────────────────────────────  │
└─────────────────────────────────────────────┘
```

---

## Layer 1: Official Designer Prompt

Source: `apps/daemon/src/prompts/official-system.ts`

This is the base prompt adapted from claude.ai/design. It establishes:

### Identity
"You are an expert designer working with the user as a manager. You produce design artifacts on behalf of the user using HTML."

### Workflow
1. **Understand the user's needs** — clarify output, fidelity, options, constraints, and design system
2. **Explore provided resources** — read DESIGN.md, attached files, workspace files; batch reads efficiently
3. **Plan with TodoWrite** — lay out todos before building, update as you go
4. **Build the project files** — write main HTML + any supporting files to the project root
5. **Finish** — short summary of what was written and what changed

### Output Guidelines
- Descriptive file names from the brief (`landing-page.html`, `pricing.html`)
- Versioned copies for revisions (`landing-v2.html`)
- Files under ~1000 lines; split into CSS/JSX files when needed
- Decks: persist position to localStorage
- Match visual vocabulary of the provided design system
- Don't inherit Open Design app chrome colors
- No `scrollIntoView` — use other DOM scroll methods

### Content Guidelines
- No filler text, placeholder sections, or stat-slop
- Ask before adding extra sections or copy
- Vocalize the system up front (colors, type scale, layout)
- Appropriate scales: 1920×1080 slides never below 24px, mobile 44px min hit targets, 12pt print minimum
- Avoid AI slop tropes: aggressive gradients, gratuitous emoji, rounded-box-left-border-accent
- CSS power moves welcome: `text-wrap: pretty`, CSS Grid, container queries, `color-mix()`, `@scope`, view transitions

### Execution Profiles

The prompt uses placeholder substitution to swap between two execution modes:

**Filesystem profile** (OpenCode, Reasonix):
> You operate inside a filesystem-backed project: the project folder is your current working directory, and every file you create with Write, Edit, or Bash lives there.

**Text-artifact profile** (BYOK):
> You operate in a text-artifact API run with no filesystem tools. The user sees your chat output directly, and the canonical deliverable is the complete HTML you emit inside a source-code `<artifact>` block.

---

## Layer 2: Discovery & Planning

Source: `apps/daemon/src/prompts/discovery.ts`, `directions.ts`

These layers add rules for:
- When and how to ask clarifying questions
- How to present design direction options
- How the critique panel generates and scores feedback
- When a direction picker should appear vs. when the agent should proceed

---

## Layer 3: Active Design System (DESIGN.md)

The full content of the user's selected design system is injected. This includes:
- Color palette (primary, background, text, border, accent)
- Typography scale (display, heading, body, caption — sizes, weights, line heights)
- Spacing scale (unit-based grid)
- Border radius tokens
- Shadow elevations
- Motion timing and easing

The agent is instructed to "match the visual vocabulary" — it reads these tokens and applies them to every artifact.

---

## Layer 4: Active Plugin Skill (SKILL.md)

The full content of the selected plugin's `SKILL.md` is injected. This provides:
- Workflow steps and checkpoints
- Expected output files
- Design rules and constraints specific to the plugin
- References to additional material in `references/`

---

## Layer 5: Deck Framework

Source: `apps/daemon/src/prompts/deck-framework.ts`

When the output mode is `deck`, a fixed framework skeleton is injected:

- 1920×1080 canvas with scale-to-fit
- Previous/Next navigation
- Slide counter (1-indexed)
- Keyboard navigation (arrow keys, home, end)
- Position restore (persisted to localStorage)
- Print-to-PDF support
- Slide tagging with `data-screen-label="01 Title"`

The agent copies this skeleton verbatim and fills in slide content — it does not invent its own scaling or navigation.

---

## Website Clone Mode

Source: `apps/daemon/src/prompts/official-system.ts` (renderer options)

When a project has intent `web-clone`, the copyright guardrail bullet is swapped:

**Normal** (default):
> Don't recreate copyrighted designs (other companies' distinctive UI patterns, branded visual elements). Help the user build something original instead.

**Clone mode**:
> This is a Website Clone run: the user explicitly asked for a faithful local reproduction of an existing site. Reproduce its layout, visuals, assets, fonts, and copy faithfully — do NOT silently swap in placeholder branding or original artwork. Record trademarks and copyrighted media in a pre-deploy replacement checklist so the user decides what to replace before publishing.

---

## Prompt Files Reference

| File | Purpose |
|------|---------|
| `official-system.ts` | Base expert designer prompt with execution profile templating |
| `system.ts` | Master composer — assembles all layers |
| `discovery.ts` | Discovery and planning rules |
| `directions.ts` | Direction picking logic |
| `deck-framework.ts` | Fixed deck skeleton (1920×1080, nav, keyboard, print) |
| `panel.ts` | Critique panel generation and scoring |
| `media-contract.ts` | Media generation contract |
| `research-contract.ts` | Research workflow contract |
