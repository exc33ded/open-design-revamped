// One-shot dev: starts the daemon (port 7456) and the web app (port 3000).
// Usage: npm run dev  (or: node dev.mjs)
import { spawn } from 'node:child_process';
import net from 'node:net';

const PORTS = [7456, 3000];

function checkPort(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '127.0.0.1');
  });
}

for (const port of PORTS) {
  if (!(await checkPort(port))) {
    console.error(`Port ${port} is already in use. Another Open Design instance is probably running.`);
    console.error('Stop it first (or find it with: netstat -ano | findstr ' + port + ') and rerun.');
    process.exit(1);
  }
}

const env = {
  ...process.env,
  // Corepack's interactive "download pnpm? [Y/n]" prompt stalls a
  // non-interactive spawn; auto-approve it.
  COREPACK_ENABLE_DOWNLOAD_PROMPT: '0',
};

const children = [
  spawn('pnpm run daemon', {
    cwd: new URL('./apps/daemon', import.meta.url),
    env: { ...env, OD_PORT: '7456', OD_WEB_PORT: '3000' },
    stdio: 'inherit',
    shell: true,
  }),
  spawn('pnpm run dev', {
    cwd: new URL('./apps/web', import.meta.url),
    env,
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
