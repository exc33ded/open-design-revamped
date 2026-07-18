import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { listClaudeCommandSkills, listSkills } from '../src/skills.js';

let root: string;

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'od-cmd-skills-'));
  const skillDir = path.join(root, 'skills', 'cmdn-design');
  await mkdir(skillDir, { recursive: true });
  await writeFile(
    path.join(skillDir, 'SKILL.md'),
    '---\nname: design\ndescription: Design partner\n---\nParent routing rules here.\n',
  );
  const cmdDir = path.join(root, 'commands', 'cmdn-design');
  await mkdir(cmdDir, { recursive: true });
  await writeFile(
    path.join(cmdDir, 'checkup.md'),
    '---\ndescription: Rapid health scan\n---\nInvoke the skill with tool `checkup` and target: $ARGUMENTS\n',
  );
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('listClaudeCommandSkills', () => {
  it('surfaces command stubs as group:name skills composed with the parent body', async () => {
    const parents = await listSkills(path.join(root, 'skills'));
    const cmds = await listClaudeCommandSkills(path.join(root, 'commands'), parents);
    expect(cmds).toHaveLength(1);
    const checkup = cmds[0]!;
    expect(checkup.id).toBe('cmdn-design:checkup');
    expect(checkup.description).toBe('Rapid health scan');
    // $ARGUMENTS placeholder is rewritten, parent body appended, and the
    // entry inherits the parent's dir so side files stage into the cwd.
    expect(checkup.body).not.toContain('$ARGUMENTS');
    expect(checkup.body).toContain('Parent routing rules here.');
    expect(checkup.dir).toBe(path.join(root, 'skills', 'cmdn-design'));
  });

  it('returns empty for a missing commands root', async () => {
    await expect(
      listClaudeCommandSkills(path.join(root, 'nope'), []),
    ).resolves.toEqual([]);
  });
});
