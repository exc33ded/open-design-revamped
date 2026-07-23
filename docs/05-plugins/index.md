# Plugins

Plugins are the heart of Open Design's extensibility. A plugin is a portable agent skill — a folder containing a `SKILL.md` file plus an optional `open-design.json` sidecar. Plugins define what the agent builds, how it builds it, and what pipeline stages it goes through.

---

## What a Plugin Is

At minimum, a plugin is:

```text
my-plugin/
  SKILL.md
```

`SKILL.md` is a Markdown file with YAML frontmatter containing `name` and `description`. This is the portable contract that works with any coding agent that understands Agent Skills.

For Open Design specifically, you add `open-design.json` to declare pipeline stages, inputs, capabilities, previews, and marketplace metadata.

---

## Plugin Directory Structure

The `plugins/` directory serves two roles:

### `plugins/_official/` — Bundled First-Party Plugins

The daemon scans this tree at startup and registers everything inside as `source_kind='bundled'`. These are pre-installed and always available.

| Subdirectory | Count | Description |
|-------------|-------|-------------|
| [atoms/](atoms.md) | 13 + 9 daemon-level | Reusable pipeline building blocks |
| [design-systems/](design-systems.md) | 143 | Brand and aesthetic design presets |
| [examples/](examples.md) | 184 | Full plugin examples by category |
| [scenarios/](scenarios.md) | 13 | Workflow scenario presets |
| [video-templates/](video-templates.md) | 63 | Video frame templates with previews |
| [image-templates/](image-templates.md) | 45 | Image generation templates with previews |

### `plugins/spec/` — Plugin Authoring Kit

The portable specification, templates, and examples for building, testing, and publishing plugins. Contains:

- [SPEC.md](spec.md) — The plugin specification contract
- [Authoring Guide](authoring.md) — Step-by-step build procedure
- [Publishing Guide](publishing.md) — Registry distribution strategy
- **Templates** — Starter templates for new plugins
- **Examples** — Reference implementations

### `plugins/community/` — Community Plugins

User-contributed plugins. Not pre-installed — they appear through the registry system when users install them.

### `plugins/registry/` — Registry Manifests

Default `open-design-marketplace.json` files for official and community catalogs. These feed the Plugins Available/Sources UI in the web app.

---

## How Plugins Work

### System Prompt Composition

When a user selects a plugin and design system, the daemon composes the agent's system prompt by stacking layers:

```
Layer 1: Official designer prompt (expert designer identity + workflow + output rules)
Layer 2: Discovery and planning rules
Layer 3: Active design system DESIGN.md (full content injected)
Layer 4: Active plugin SKILL.md (full content injected)
Layer 5: Deck framework (if deck mode — 1920×1080 canvas, nav, keyboard)
```

Each layer adds context that shapes how the agent behaves, what it produces, and what design system vocabulary it uses.

### Pipeline Stages

Plugins define multi-stage pipelines using reusable atoms:

```json
{
  "pipeline": {
    "stages": [
      { "id": "discovery", "atoms": ["discovery-question-form"] },
      { "id": "plan", "atoms": ["direction-picker", "todo-write"] },
      { "id": "generate", "atoms": ["file-write", "live-artifact"] },
      {
        "id": "critique",
        "atoms": ["critique-theater"],
        "repeat": true,
        "until": "critique.score>=4 || iterations>=3"
      }
    ]
  }
}
```

Stages run in sequence. A stage marked `repeat: true` runs repeatedly until its `until` condition is met — this drives the critique/refine loop.

### Workflow Taxonomy

Every plugin fits into one primary lane:

| Lane | Use When | Typical taskKind |
|------|----------|-----------------|
| `import` | Bring external sources into OD | `figma-migration` or `code-migration` |
| `create` | Generate a new artifact | `new-generation` |
| `export` | Convert an artifact to downstream format | `tune-collab` or `code-migration` |
| `share` | Publish/send to collaborators | `tune-collab` |
| `deploy` | Ship to hosted infrastructure | `code-migration` or `tune-collab` |
| `refine` | Improve existing artifact | `tune-collab` |
| `extend` | Help authors create more plugins | `new-generation` |

### Create Modes

The `od.mode` field determines the agent's primary output type:

| Mode | Output |
|------|--------|
| `prototype` | Interactive single-page web artifact |
| `deck` | Slide deck artifact |
| `live-artifact` | Dashboard, report, calculator, live UI |
| `image` | Generated image, poster, ad, visual asset |
| `video` | Video clip, storyboard, motion package |
| `hyperframes` | HyperFrames-ready HTML motion composition |
| `audio` | Voice, music, sonic branding |
| `design-system` | Reusable brand or interface system |

---

## Quick Start: Using a Plugin

1. Open the web app at http://localhost:3000
2. Select a design system from the Design Systems picker
3. Pick a plugin from the Plugins rail or composer menu
4. Fill in any inputs the plugin asks for
5. Send your prompt

The agent will follow the plugin's pipeline, using the design system's visual vocabulary, and produce artifacts in your project workspace.

---

## Key Plugin Files Reference

| File | Purpose |
|------|---------|
| `SKILL.md` | Portable agent skill — workflow, rules, expected outputs |
| `open-design.json` | OD-specific sidecar — pipeline, inputs, preview, capabilities |
| `README.md` | Human-readable plugin description |
| `DESIGN.md` | (Design systems only) Design token file |
| `manifest.json` | (Design systems only) Metadata manifest |
| `preview/` | Preview images or HTML |
| `examples/` | Example outputs |
| `assets/` | Static assets the agent can reference |
| `references/` | Extended reference material for the agent |
| `evals/` | Repeatable quality checks |
