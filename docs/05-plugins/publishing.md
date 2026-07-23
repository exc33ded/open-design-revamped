# Plugin Publishing

How to distribute Open Design plugins across multiple agent ecosystems. Based on `plugins/spec/PUBLISHING-REGISTRIES.md`.

---

## Publishing Philosophy

Open Design plugins are intentionally shaped so one folder can travel everywhere. The safest model:

1. Keep source of truth in a public GitHub repository
2. Keep `SKILL.md` portable and registry-friendly
3. Add `open-design.json` as the Open Design sidecar
4. Publish to registries only after local validation passes

---

## Recommended Release Order

1. **Validate** the plugin folder locally
2. **Push** a public GitHub repository or open an Open Design PR
3. **Add** README install instructions for Open Design and generic Agent Skills
4. **Add** registry-specific badges and links
5. **Publish** to registries matching the plugin's audience
6. **Record** every published URL in the README and PR body

---

## Registry Matrix

| Target | Best For | Source Shape | Publish Strategy |
|--------|----------|-------------|-----------------|
| **Open Design** | OD marketplace, composer chips, pipelines, GenUI | `SKILL.md` + `open-design.json` | PR to Open Design or marketplace index entry |
| **skills.sh** | Agent Skills discovery across many agents | Public Git repo containing `SKILL.md` | `npx skills add owner/repo` |
| **ClawHub** | OpenClaw users installing skills or plugins | `SKILL.md` folder for skills | `clawhub skill publish ./my-skill` |
| **Standalone GitHub** | Source of truth, broad compatibility | Portable folder | Tag releases, document install commands |

---

## skills.sh Strategy

skills.sh indexes installable Agent Skills. The main install path is:

```bash
npx skills add owner/repo
npx skills add https://github.com/owner/repo/tree/main/path/to/skill
npx skills add ./my-local-skills
```

### Preparation

- Ensure the repo contains a valid `SKILL.md`
- Keep `open-design.json` additive — generic clients should ignore it
- Add install instructions to README:

```bash
npx skills add owner/repo --skill my-plugin
od plugin install https://github.com/owner/repo
```

- Add a badge once stable:

```markdown
[![skills.sh](https://skills.sh/b/owner/repo)](https://skills.sh/owner/repo)
```

- Tag the GitHub repo with relevant topics: `open-design-plugin`, `agent-skill`, `prototype`, `deck`, `hyperframes`, `design-system`

---

## ClawHub Strategy

ClawHub is the OpenClaw registry layer for skills and plugins.

### Skill Publishing (Recommended for OD Plugins)

Use this path for normal Open Design plugins — they're centered on `SKILL.md`:

```bash
npm i -g clawhub
clawhub login

clawhub skill publish ./my-skill \
  --slug my-skill \
  --name "My Skill" \
  --version 1.0.0 \
  --changelog "Initial release"
```

### Package Publishing (Only for OpenClaw Code Plugins)

Only use this when shipping an OpenClaw code plugin with compatibility metadata:

```bash
clawhub package publish <source> --family code-plugin --dry-run
clawhub package publish <source> --family code-plugin
```

### ClawHub Checklist

- Keep `SKILL.md` metadata accurate
- Declare required environment variables, tools, permissions, connectors, or network access in README and skill body
- Run dry run before making public
- Link back to canonical GitHub repo and Open Design PR
- Keep changelog honest and versioned
- Bump `version` in `open-design.json` for every publishable behavior change

---

## Standalone GitHub Strategy

For any plugin, GitHub should be the source of truth:

- Create a dedicated repo (or subpath in a mono-repo)
- Include `SKILL.md`, `open-design.json`, `README.md`, and preview
- Tag semantic versions (`v1.0.0`, `v1.1.0`)
- Document install commands for each target registry
- Keep a CHANGELOG.md

---

## Safety Checklist

Public skill registries are supply-chain surfaces. Before publishing:

- [ ] No hidden install scripts
- [ ] No automatic credential collection
- [ ] No network calls unless clearly declared why
- [ ] No destructive shell commands without explicit user confirmation
- [ ] Include `license`, `author`, source URL, version, and changelog
- [ ] Include validation output from `pnpm guard` and plugin manifest validation
- [ ] Prefer small example assets over large opaque archives

---

## PR Body Template

When opening or preparing a PR for a plugin:

```markdown
## Registry publishing

- Canonical source:
- Open Design PR:
- Open Design specVersion:
- Plugin version:
- Marketplace catalog version:
- skills.sh install:
- ClawHub listing:
- Other registries:

## Registry validation

- `pnpm guard`:
- `pnpm --filter @open-design/plugin-runtime typecheck`:
- `od plugin validate ./path/to/plugin`:
- `npx skills add ... --list`:
- `clawhub skill publish ./path --dry-run` or equivalent:
```

---

## References

- [skills.sh](https://skills.sh/) — Agent Skills registry
- [skills CLI](https://github.com/vercel-labs/skills) — Install CLI
- [ClawHub](https://clawhub.ai/) — OpenClaw registry
- [ClawHub Quickstart](https://github.com/openclaw/clawhub/blob/main/docs/quickstart.md)
