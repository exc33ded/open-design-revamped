import { opencodeAgentDef } from './defs/opencode.js';
import { byokOpenCodeAgentDef } from './defs/byok-opencode.js';
import { reasonixAgentDef } from './defs/reasonix.js';
import { readLocalAgentProfileDefs as readLocalAgentProfileDefsFromFile } from './local-profiles.js';
import type { RuntimeAgentDef } from './types.js';

// ponytail: web-only fork exposes only the runtimes tested end-to-end
// (opencode + reasonix via DeepSeek, byok-opencode for BYOK providers).
// Other def files remain on disk because server.ts imports helpers from
// them; re-add here to re-enable an agent.
const BASE_AGENT_DEFS: RuntimeAgentDef[] = [
  opencodeAgentDef,
  byokOpenCodeAgentDef,
  reasonixAgentDef,
];

export function readLocalAgentProfileDefs(
  baseDefs: RuntimeAgentDef[] = BASE_AGENT_DEFS,
): RuntimeAgentDef[] {
  return readLocalAgentProfileDefsFromFile(baseDefs);
}

export const AGENT_DEFS: RuntimeAgentDef[] = [
  ...BASE_AGENT_DEFS,
  ...readLocalAgentProfileDefs(BASE_AGENT_DEFS),
];

const ids = new Set();
for (const def of AGENT_DEFS) {
  if (ids.has(def.id)) {
    throw new Error(`Duplicate agent definition id: ${def.id}`);
  }
  ids.add(def.id);
}

export function getAgentDef(id: string): RuntimeAgentDef | null {
  return AGENT_DEFS.find((a) => a.id === id) || null;
}
