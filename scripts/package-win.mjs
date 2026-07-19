// Packages Open Design into a zero-setup Windows zip:
// portable Node 24 + built daemon (with node_modules) + static web build + launcher.
// Usage: node scripts/package-win.mjs   (run on Windows, from repo root)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGE = path.join(ROOT, 'release', 'stage', 'OpenDesign');
const CACHE = path.join(ROOT, 'release', 'cache');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

function run(cmd, cwd = ROOT) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// 1. Clean stage
fs.rmSync(path.join(ROOT, 'release', 'stage'), { recursive: true, force: true });
fs.mkdirSync(STAGE, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });

// 2. Build web (static export -> apps/web/out) and daemon
run('pnpm --filter @open-design/web build');
run('pnpm --filter @open-design/daemon build');

// 3. Deploy daemon with production node_modules (workspace deps resolved)
run(`pnpm --filter @open-design/daemon deploy --legacy --prod "${path.join(STAGE, 'apps', 'daemon')}"`);

// 4. Copy web static export. PROJECT_ROOT in the daemon resolves to two levels
// above apps/daemon, so mirroring the repo layout means zero config.
fs.cpSync(path.join(ROOT, 'apps', 'web', 'out'), path.join(STAGE, 'apps', 'web', 'out'), {
  recursive: true,
});

// 5. Portable Node runtime (latest v24 win-x64), cached across runs
const index = await (await fetch('https://nodejs.org/dist/index.json')).json();
const nodeVersion = index.find((r) => r.version.startsWith('v24.')).version;
const nodeZip = path.join(CACHE, `node-${nodeVersion}-win-x64.zip`);
if (!fs.existsSync(nodeZip)) {
  console.log(`\nDownloading Node ${nodeVersion}...`);
  const url = `https://nodejs.org/dist/${nodeVersion}/node-${nodeVersion}-win-x64.zip`;
  fs.writeFileSync(nodeZip, Buffer.from(await (await fetch(url)).arrayBuffer()));
}
run(`powershell -NoProfile -Command "Expand-Archive -Force '${nodeZip}' '${CACHE}'"`);
fs.cpSync(path.join(CACHE, `node-${nodeVersion}-win-x64`), path.join(STAGE, 'node'), {
  recursive: true,
});

// 6. Launcher. The daemon opens the browser itself when run without --no-open.
fs.writeFileSync(
  path.join(STAGE, 'Open Design.cmd'),
  [
    '@echo off',
    'title Open Design',
    'set "OD_PORT=7456"',
    'cd /d "%~dp0apps\\daemon"',
    '"%~dp0node\\node.exe" dist\\cli.js',
    'pause',
    '',
  ].join('\r\n'),
);

// 7. Zip it
const outZip = path.join(ROOT, 'release', `OpenDesign-${version}-win-x64.zip`);
fs.rmSync(outZip, { force: true });
run(`powershell -NoProfile -Command "Compress-Archive -Path '${STAGE}' -DestinationPath '${outZip}'"`);
console.log(`\nDone: ${outZip}`);
