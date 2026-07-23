# Atoms

Atoms are reusable building blocks that compose into pipeline stages. The daemon registers 22 atoms in `apps/daemon/src/plugins/atoms.ts`. Some have standalone plugin directories in `plugins/_official/atoms/`; others are implemented directly in the daemon as agent-level capabilities.

---

## Complete Atom Catalog (22 Atoms)

### Atoms with Plugin Directories (13)

These have `SKILL.md` + `open-design.json` in `plugins/_official/atoms/`:

| Atom | Used In | Description |
|------|---------|-------------|
| `discovery-question-form` | Discovery | Turn-1 question form for ambiguous briefs |
| `direction-picker` | Plan | 3-5 design direction options before committing |
| `todo-write` | Plan | TodoWrite-driven task breakdown |
| `critique-theater` | Critique | 5-dimension panel critique with scoring |
| `code-import` | Discovery | Walk an existing repo into structured index |
| `design-extract` | Discovery | Extract design tokens from reference material |
| `figma-extract` | Discovery | Pull Figma file tree and assets via REST |
| `token-map` | Discovery | Crosswalk source tokens onto active design system |
| `rewrite-plan` | Plan | Classifier + per-leaf step list for rewrites |
| `patch-edit` | Generate/Critique | Atomic unified-diff applier with safety gate |
| `build-test` | Generate/Export | Shell-out to typecheck + tests |
| `diff-review` | Critique/Export | Render rewrite as diff + summary + decision |
| `handoff` | Export/Share | Update artifact manifest + handoff ladder |

### Daemon-Level Atoms (9)

These are registered in the atom catalog but implemented directly by the agent or daemon without separate plugin directories:

| Atom | Used In | Description |
|------|---------|-------------|
| `file-read` | All stages | Read project files |
| `file-write` | Generate | Write project files to workspace |
| `file-edit` | Generate/Critique | Edit project files in-place |
| `live-artifact` | Generate | Create/refresh live artifacts |
| `research-search` | Discovery | Tavily-backed shallow research |
| `media-image` | Generate | Image generation through media providers |
| `media-video` | Generate | Video generation through media providers |
| `media-audio` | Generate | Audio generation through media providers |
| `connector` | All | Composio connector tool calls |

---

## Pipeline Atom Usage

Atoms are referenced by string id in pipeline stage definitions:

```json
{
  "pipeline": {
    "stages": [
      {
        "id": "discovery",
        "atoms": ["discovery-question-form", "research-search"]
      },
      {
        "id": "plan",
        "atoms": ["direction-picker", "todo-write"]
      },
      {
        "id": "generate",
        "atoms": ["file-write", "live-artifact"]
      },
      {
        "id": "critique",
        "atoms": ["critique-theater"],
        "repeat": true,
        "until": "critique.score>=4 || iterations>=3"
      },
      {
        "id": "handoff",
        "atoms": ["handoff", "diff-review"]
      }
    ]
  }
}
```

---

## Atom Selection by Workflow Lane

| Lane | Discovery | Plan | Generate | Critique |
|------|-----------|------|----------|----------|
| `import` | figma-extract, code-import, design-extract | token-map, rewrite-plan | file-write, file-edit, patch-edit | diff-review |
| `create` | discovery-question-form, research-search | direction-picker, todo-write | file-write, live-artifact, media-image/video/audio | critique-theater |
| `export` | file-read | — | file-write, handoff | diff-review |
| `share` | file-read | — | handoff | — |
| `deploy` | file-read | — | build-test, handoff | — |
| `refine` | file-read | — | patch-edit, file-edit | critique-theater, diff-review |
| `extend` | file-read | todo-write | file-write | critique-theater |

---

## Atom File Structure (Plugin Directory Atoms)

Each atom in `plugins/_official/atoms/` contains:

```text
discovery-question-form/
  SKILL.md              # Instructions for the agent
  open-design.json      # OD sidecar with metadata
```

Atoms with plugin directories have their own `SKILL.md` that the daemon loads and injects as context. Daemon-level atoms (like `file-write`, `media-image`) don't need separate `SKILL.md` — they're handled by the agent's built-in capabilities or the daemon's media adapters.

---

## Atom Status

All 22 atoms are `status: 'implemented'` in the daemon's atom catalog. The registry also supports `status: 'planned'` for forward-compatible manifest references — `od plugin doctor` warns but doesn't reject planned atoms.
