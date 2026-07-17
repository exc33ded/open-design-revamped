// One-shot dev: starts the daemon (port 7456) and the web app (port 3000).
// Usage: npm run dev  (or: node dev.mjs)
import { spawn } from 'node:child_process';

const children = [
  spawn('pnpm', ['run', 'daemon'], {
    cwd: new URL('./apps/daemon', import.meta.url),
    env: { ...process.env, OD_PORT: '7456', OD_WEB_PORT: '3000' },
    stdio: 'inherit',
    shell: true,
  }),
  spawn('pnpm', ['run', 'dev'], {
    cwd: new URL('./apps/web', import.meta.url),
    stdio: 'inherit',
    shell: true,
  }),
];

for (const child of children) {
  child.on('exit', (code) => {
    for (const other of children) other.kill();
    process.exit(code ?? 0);
  });
}
process.on('SIGINT', () => children.forEach((c) => c.kill()));
