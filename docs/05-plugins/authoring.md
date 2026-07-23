# Plugin Authoring

Step-by-step guide for building an Open Design plugin. Based on `plugins/spec/AGENT-DEVELOPMENT.md`.

---

## Prerequisites

Before creating a plugin, read these files in the codebase:

1. `plugins/spec/SPEC.md` — The plugin specification contract
2. `docs/schemas/open-design.plugin.v1.json` — JSON schema for manifests
3. A nearby example under `plugins/_official/examples/` or `plugins/spec/examples/`

---

## Build Procedure

### Step 1: Choose a Plugin ID

Pick a lowercase id using hyphens. Examples:

- `landing-page`
- `saas-pricing`
- `social-carousel`
- `import-screenshot-to-prototype`

The id must match your folder name and the `name` fields in both `SKILL.md` frontmatter and `open-design.json`.

### Step 2: Create the Folder

For a new bundled plugin: `plugins/_official/examples/<plugin-id>/`

For a new spec example: `plugins/spec/examples/<plugin-id>/`

Minimum files:

```text
<plugin-id>/
  SKILL.md              # Portable agent skill
  open-design.json      # Open Design sidecar
  README.md             # Human-readable description
```

Optional files (add when they help the agent produce better results):

```text
  preview/index.html    # Rendered output preview
  preview/poster.png    # Screenshot preview
  examples/             # Example artifacts
  assets/               # Static assets for agent reference
  references/           # Extended reference material
  evals/evals.json      # Repeatable quality checks
```

### Step 3: Write SKILL.md

The `SKILL.md` is the portable agent contract. It should work in any Agent Skills-compatible agent, not just Open Design.

**Key elements:**

1. **YAML frontmatter** with `name` and `description`:

```yaml
---
name: landing-page
description: Use this plugin when the user wants to create a polished SaaS landing page.
---
```

2. **What the plugin does** — One or two sentences.

3. **Workflow** — Clear, numbered steps with checkpoints and expected outputs at each stage.

4. **Output specification** — What files the agent should produce, what they should contain.

5. **Design rules** — Visual vocabulary, constraints, things to avoid.

6. **References** — Relative paths to `references/` files if the agent needs extended docs.

**Rules:**

- Keep it under 500 lines. Move long material to `references/`.
- Write the description for activation — "Use this plugin when..."
- Keep it portable. No OD-only marketplace data.
- Reference support files by relative path from plugin root.
- Describe what to ask the user only when input is genuinely missing.

### Step 4: Write open-design.json

The `open-design.json` declares everything Open Design needs: pipeline, inputs, capabilities, preview info, marketplace metadata.

**Required fields:** `name`, `title`, `version`, `specVersion`, `description`, `license`, `tags`, `compat`, `od`

**The `od` block must include:**

- `kind` — Always `"skill"` for skill plugins
- `taskKind` — One of: `new-generation`, `figma-migration`, `code-migration`, `tune-collab`
- `mode` — The primary output type (prototype, deck, live-artifact, image, video, hyperframes, audio, design-system)
- `pipeline` — Stage definitions with atom references

**Pipeline atoms must use known first-party atoms:**

| Atom | When to Use |
|------|------------|
| `discovery-question-form` | Need upfront questions from the user |
| `direction-picker` | Multiple design directions to choose between |
| `todo-write` | Multi-step build that needs tracking |
| `file-write` | Generating project files |
| `live-artifact` | Creating interactive/live artifacts |
| `critique-theater` | Needs design review with scoring |
| `diff-review` | Compare before/after versions |
| `handoff` | Export or share the result |
| `patch-edit` | Incremental edits to existing files |
| `rewrite-plan` | Refactoring or rewriting |
| `design-extract` | Extract design tokens from reference |
| `token-map` | Map design tokens to system |
| `code-import` | Import from codebase |
| `figma-extract` | Import from Figma |
| `build-test` | Build and test output |

### Step 5: Add Preview and Examples

Visual plugins must include at least one preview:

- `preview/index.html` — A real rendered output
- `preview/poster.png` — Screenshot of the output

The preview shows the **actual output shape**, not a decorative splash.

### Step 6: Add Evals (Optional but Recommended)

Create `evals/evals.json`:

```json
{
  "skill_name": "landing-page",
  "evals": [
    {
      "id": "happy-path",
      "prompt": "Create a landing page for a B2B SaaS product.",
      "expected_output": "A usable HTML artifact with hero, features, pricing, and CTA.",
      "assertions": [
        "The output includes a runnable artifact file",
        "The visual hierarchy is clear",
        "Includes hero section with CTA"
      ]
    }
  ]
}
```

---

## Quality Bar Checklist

Before considering a plugin done, confirm:

- [ ] `SKILL.md` has a clear "Use this plugin when..." description
- [ ] The workflow states expected output files or handoff result
- [ ] `open-design.json` validates against the v1 schema
- [ ] `specVersion` and plugin `version` are explicit
- [ ] Pipeline atoms are known first-party atoms or clearly marked future work
- [ ] Declared capabilities are the minimum needed
- [ ] Visual plugins include a preview or concrete example output
- [ ] Share, deploy, connector, and network plugins require explicit user confirmation before externally visible actions

---

## Validation Commands

Run these before submitting:

```bash
# Basic code quality
pnpm guard

# Typecheck the plugin runtime
pnpm --filter @open-design/plugin-runtime typecheck

# Validate a specific plugin (requires built daemon)
od plugin validate ./plugins/_official/examples/<plugin-id>
od plugin install ./plugins/_official/examples/<plugin-id>
```
