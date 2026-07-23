# Scenarios

Scenarios are preset workflow configurations that pre-select pipeline stages, atoms, modes, and system prompt behavior for common use cases. They live in `plugins/_official/scenarios/`.

---

## Scenario Catalog

### od-default
The fallback scenario when no specific one is chosen. Balanced pipeline: discovery → plan → generate. Works for general-purpose design tasks.

### od-new-generation
**For:** Creating a brand-new artifact from scratch.

Pipeline: discovery-question-form → direction-picker → todo-write → generate → critique-theater (repeatable)

Best paired with: `create` lane plugins, `prototype` or `deck` modes.

### od-design-refine
**For:** Improving or iterating on an existing artifact.

Pipeline: file-read → plan (evaluate current state) → patch-edit → critique-theater (repeatable) → diff-review

Best paired with: `refine` lane plugins. Reads existing files first, makes targeted edits.

### od-figma-migration
**For:** Migrating a Figma design into HTML/CSS.

Pipeline: figma-extract → token-map → plan → generate → critique-theater (repeatable)

Best paired with: `import` lane plugins. Uses Figma-specific discovery atoms.

### od-code-migration
**For:** Migrating from an existing codebase or framework.

Pipeline: code-import → design-extract → token-map → rewrite-plan → generate → diff-review

Best paired with: `import` lane plugins for framework migrations (Next.js export, React export, Vue export).

### od-media-generation
**For:** Generating images, videos, or audio.

Pipeline: discovery-question-form → plan → generate (media-specific) → critique

Best paired with: Media-focused plugins. Uses media adapters instead of file-write atoms.

### od-plugin-authoring
**For:** Creating or improving Open Design plugins.

Pipeline: discovery (understand what the plugin should do) → todo-write → generate (write SKILL.md + open-design.json) → critique → handoff

Best paired with: `extend` lane plugins.

### od-nextjs-export
**For:** Exporting an artifact as a Next.js project.

Pipeline: file-read → plan (structure for Next.js) → generate (scaffold Next.js files) → build-test → handoff

Best paired with: `export` lane plugins targeting React/Next.js.

### od-react-export
**For:** Exporting an artifact as a React project.

Pipeline: file-read → plan (structure for React) → generate (scaffold React files) → build-test → handoff

Best paired with: `export` lane plugins targeting React.

### od-vue-export
**For:** Exporting an artifact as a Vue project.

Pipeline: file-read → plan (structure for Vue) → generate (scaffold Vue files) → build-test → handoff

Best paired with: `export` lane plugins targeting Vue.

### od-tune-collab
**For:** Collaborative tuning and refinement.

Pipeline: file-read → plan → patch-edit → critique-theater → diff-review

Best paired with: `share`, `deploy`, or `refine` lane plugins.

### od-share-to-community
**For:** Preparing an artifact for community sharing.

Pipeline: file-read → handoff → diff-review

Best paired with: `share` lane plugins. Streamlined for quick export/share flows.

### od-web-effect-extractor
**For:** Extracting visual effects and animation patterns from web pages.

Pipeline: design-extract → token-map → plan → generate (recreate effects)

Best paired with: `import` lane plugins focused on animation/effects.

---

## How Scenarios Work

A scenario pre-configures:

1. **Pipeline stages** — Which stages run and in what order
2. **Default atoms** — Which atoms are active in each stage
3. **System prompt layers** — Any additional system prompt injection
4. **Mode preference** — Suggested output mode (prototype, deck, etc.)

When a user picks a plugin, the scenario sets the pipeline baseline. The plugin can override or extend it through its own `od.pipeline` definition.

---

## Scenario File Structure

Each scenario lives in `plugins/_official/scenarios/<scenario-id>/`:

```text
od-new-generation/
  SKILL.md              # Scenario instructions for the agent
  open-design.json      # OD sidecar with pipeline and metadata
```

Scenarios are regular plugins in structure — they use the same plugin spec and can declare pipelines just like any other plugin. The difference is semantic: scenarios represent workflow patterns rather than specific output types.
