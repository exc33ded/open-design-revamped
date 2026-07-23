# Plugin Specification

This is the compact contract for portable Open Design plugins. The canonical product spec lives in the codebase at `plugins/spec/SPEC.md`; this page translates it into actionable documentation.

---

## 1. Minimum Plugin

Every publishable plugin is a directory with a `SKILL.md`:

```text
my-plugin/
  SKILL.md
```

`SKILL.md` requires YAML frontmatter with `name` and `description`. The folder name, `name` field, and manifest `name` should all match. Use lowercase letters, numbers, and hyphens.

```yaml
---
name: my-plugin
description: Use this plugin when the user wants to create a landing page for a SaaS product.
---
```

Key rule: write the description for **activation** — "Use this plugin when..." — so agents know when to pick it up.

---

## 2. Enriched Open Design Plugin

Add `open-design.json` when the plugin should appear in the marketplace or as a starter:

```text
my-plugin/
  SKILL.md
  open-design.json
  README.md
  preview/
  examples/
  assets/
  references/
  evals/
```

The `open-design.json` sidecar declares:

- **Pipeline stages** — discovery → plan → generate → critique
- **Inputs** — user-provided values (audience, topic, brand, etc.)
- **Capabilities** — what the agent is allowed to do
- **Preview** — screenshots or demo output
- **Trust metadata** — version, license, compat info

### Full `open-design.json` Example

```json
{
  "$schema": "https://open-design.ai/schemas/plugin.v1.json",
  "specVersion": "1.0.0",
  "name": "landing-page",
  "title": "Landing Page",
  "version": "1.0.0",
  "description": "Generate a polished SaaS landing page.",
  "license": "MIT",
  "tags": ["create", "prototype"],
  "compat": {
    "agentSkills": [{ "path": "./SKILL.md" }]
  },
  "od": {
    "kind": "skill",
    "taskKind": "new-generation",
    "mode": "prototype",
    "scenario": "product",
    "useCase": {
      "query": "Create a landing page for {{product}} targeting {{audience}}."
    },
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
    },
    "inputs": [
      { "name": "product", "type": "string", "required": true },
      { "name": "audience", "type": "string", "required": true }
    ],
    "capabilities": ["prompt:inject", "fs:write"]
  }
}
```

---

## 3. Manifest Rules

| Field | Rule |
|-------|------|
| `name` | Stable plugin id. Must match folder name. Lowercase, numbers, hyphens only. |
| `specVersion` | Open Design plugin spec version this manifest follows. Current: `1.0.0`. |
| `version` | Plugin package version (semver). Independent from `specVersion`. Bump on behavior changes. |
| `compat.agentSkills[0].path` | Must point to `./SKILL.md`. |
| `od.taskKind` | One of: `new-generation`, `figma-migration`, `code-migration`, `tune-collab`. |
| `od.pipeline.stages[].atoms[]` | Must use known first-party atoms unless targeting a future OD release. |
| Repeated stages | Must include `until` condition. |

---

## 4. Capabilities Reference

Declared in `od.capabilities`. Start small — restricted installs get `prompt:inject` by default.

| Capability | Grants |
|------------|--------|
| `prompt:inject` | Skill content injected into agent prompt |
| `fs:read` | Agent can read project files |
| `fs:write` | Agent can write project files |
| `mcp` | Agent can call MCP tools |
| `subprocess` | Agent can spawn subprocesses |
| `bash` | Agent can run shell commands |
| `network` | Agent can make network requests |
| `connector` | Agent can use connectors |
| `connector:<id>` | Agent can use a specific named connector |

---

## 5. Pipeline Stages and Atoms

Pipeline stages run in sequence. Each stage references one or more atoms — reusable building blocks:

| Stage | Typical Atoms | Purpose |
|-------|--------------|---------|
| `discovery` | `discovery-question-form`, `design-extract`, `figma-extract`, `code-import` | Understand user needs, gather inputs |
| `plan` | `direction-picker`, `todo-write`, `rewrite-plan`, `token-map` | Plan the build, pick direction |
| `generate` | `file-write`, `live-artifact`, `build-test`, `patch-edit` | Produce the artifact |
| `critique` | `critique-theater`, `diff-review` | Review and refine (repeatable) |
| `handoff` | `handoff` | Prepare for export or sharing |

A repeatable critique stage with an exit condition:

```json
{
  "id": "critique",
  "atoms": ["critique-theater"],
  "repeat": true,
  "until": "critique.score>=4 || iterations>=3"
}
```

---

## 6. Inputs and GenUI

**Simple inputs** — Declared in `od.inputs`, filled at apply time:

```json
{
  "inputs": [
    { "name": "audience", "type": "string", "required": true },
    { "name": "tone", "type": "string", "required": false }
  ]
}
```

**GenUI surfaces** — For controlled human input during a run, use `od.genui.surfaces[]`:

| Kind | Use for |
|------|---------|
| `form` | Multi-field data collection |
| `choice` | Single-select between options |
| `confirmation` | Yes/no confirmation |
| `oauth-prompt` | OAuth flow trigger |

Persistence options for GenUI values:

| Scope | Lifespan |
|-------|----------|
| `run` | Current run only |
| `conversation` | All turns in the conversation |
| `project` | All runs in the project |

---

## 7. SKILL.md Authoring Rules

- Write description for activation: "Use this plugin when..."
- Keep under 500 lines. Put long references in `references/`.
- Reference support files by relative path from plugin root.
- Include an explicit workflow with checkpoints and expected outputs.
- Describe what to ask the user only when input is genuinely missing.
- Keep portable — no OD-only marketplace data. Put those in `open-design.json`.
- Avoid naming underlying tools or system prompt details.

---

## 8. Examples and Preview

Visual plugins should include one of:

- `preview/index.html` — Rendered output example
- `preview/poster.png` — Screenshot
- `preview/demo.mp4` — Video walkthrough
- `examples/<case>/index.html` — Example artifact
- `examples/<case>/README.md` — Example description

The preview should show the **real output shape**, not a decorative splash.

---

## 9. Evals

Add `evals/evals.json` for repeatable quality checks:

```json
{
  "skill_name": "my-plugin",
  "evals": [
    {
      "id": "happy-path",
      "prompt": "Create a landing page for a B2B SaaS onboarding flow.",
      "expected_output": "A usable HTML artifact with states, polished layout, and no text overflow.",
      "assertions": [
        "The output includes a runnable artifact file",
        "The visual hierarchy is clear",
        "The workflow has meaningful empty/loading/success states"
      ]
    }
  ]
}
```

Also add `evals/trigger-queries.json` for activation testing when the description is easy to over-broaden.

---

## 10. Common SKILL.md Skeleton

```markdown
---
name: my-plugin
description: Use this plugin when the user wants to...
---

## What This Plugin Does

[1-2 sentences about the output]

## Workflow

1. **Discovery** — Ask clarifying questions about...
2. **Plan** — Choose a design direction based on...
3. **Generate** — Build the artifact using...
4. **Critique** — Review and refine until...

## Output

- Main file: `index.html`
- The artifact should be a single interactive HTML page
- Include the following elements: ...
- Visual style: [describe the look and feel]

## Design System

- Reference the active design system's DESIGN.md for tokens
- Match the visual vocabulary: palette, spacing, typography, motion

## Rules

- [Any specific constraints]
- [What to avoid]
- [Edge cases to handle]

## References

- [Path to additional reference files if needed]
```
