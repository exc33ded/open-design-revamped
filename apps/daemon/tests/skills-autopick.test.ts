import { describe, expect, it } from 'vitest';
import { autoPickSkillIds } from '../src/skills.js';

function skill(id: string, triggers: unknown[] = []) {
  return { id, triggers } as never;
}

const skills = [
  skill('ui-ux-pro-max'),
  skill('graphify', ['knowledge graph']),
  skill('banner-design', ['banner']),
  skill('design'),
  skill('open-design-landing'),
  skill('open-design-landing:hero'),
  skill('ckm:ui-styling'),
];

describe('autoPickSkillIds', () => {
  it('picks a skill on explicit slash invocation', () => {
    expect(autoPickSkillIds(skills, '/graphify this repo please')).toEqual(['graphify']);
  });

  it('picks a multi-word skill by bare name, hyphenated or spaced', () => {
    expect(autoPickSkillIds(skills, 'use ui-ux-pro-max for this page')).toEqual(['ui-ux-pro-max']);
    expect(autoPickSkillIds(skills, 'apply ui ux pro max styling')).toEqual(['ui-ux-pro-max']);
  });

  it('picks via frontmatter trigger phrases', () => {
    expect(autoPickSkillIds(skills, 'make me a promo banner for the launch')).toEqual(['banner-design']);
  });

  it('never picks single-word ids from bare prose, only explicit invocation', () => {
    expect(autoPickSkillIds(skills, 'design a nice dashboard')).toEqual([]);
    expect(autoPickSkillIds(skills, 'run /design on this')).toEqual(['design']);
  });

  it('never picks derived example ids and caps the pick count', () => {
    const picked = autoPickSkillIds(
      skills,
      '/graphify a banner with ui-ux-pro-max using open-design-landing:hero',
      2,
    );
    expect(picked).toHaveLength(2);
    expect(picked).not.toContain('open-design-landing:hero');
  });

  it('matches namespace-prefixed plugin ids on their tail', () => {
    expect(autoPickSkillIds(skills, 'apply ui styling to the cards')).toEqual(['ckm:ui-styling']);
    expect(autoPickSkillIds(skills, 'run /ui-styling here')).toEqual(['ckm:ui-styling']);
  });

  it('returns empty for empty or non-string input', () => {
    expect(autoPickSkillIds(skills, '')).toEqual([]);
    expect(autoPickSkillIds(skills, null)).toEqual([]);
    expect(autoPickSkillIds(null, 'hello')).toEqual([]);
  });
});
