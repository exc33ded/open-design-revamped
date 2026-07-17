// Minimal MCP stdio server bridging agents to the sample backend REST API.
// Zero dependencies — hand-rolled JSON-RPC 2.0 over newline-delimited stdio.
// Run: node mcp-server.mjs   (expects sample-backend on http://localhost:8787)
// ponytail: hand-rolled protocol subset (initialize/tools), swap to
// @modelcontextprotocol/sdk if more MCP surface is ever needed.

const BASE = process.env.BACKEND_URL ?? 'http://localhost:8787';
const KEY = process.env.BACKEND_API_KEY ?? 'demo-key-123';

const TOOLS = [
  {
    name: 'list_products',
    description: 'List products in the store backend. Optional category filter.',
    inputSchema: {
      type: 'object',
      properties: { category: { type: 'string', description: 'coffee | merch | gear' } },
    },
  },
  {
    name: 'create_order',
    description: 'Create an order for a product in the store backend.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        quantity: { type: 'number' },
      },
      required: ['productId', 'quantity'],
    },
  },
  {
    name: 'get_stats',
    description: 'Get store stats: product count, order count, revenue, categories.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callBackend(method, path, body) {
  const resp = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'X-API-Key': KEY, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: resp.status, body: await resp.json() };
}

async function runTool(name, args = {}) {
  if (name === 'list_products') {
    const q = args.category ? `?category=${encodeURIComponent(args.category)}` : '';
    return callBackend('GET', `/api/products${q}`);
  }
  if (name === 'create_order') {
    return callBackend('POST', '/api/orders', { productId: args.productId, quantity: args.quantity });
  }
  if (name === 'get_stats') return callBackend('GET', '/api/stats');
  throw new Error(`unknown tool: ${name}`);
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

let buffer = '';
process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let req;
    try { req = JSON.parse(line); } catch { continue; }
    if (req.method === 'initialize') {
      send({
        jsonrpc: '2.0', id: req.id,
        result: {
          protocolVersion: req.params?.protocolVersion ?? '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'sample-backend', version: '1.0.0' },
        },
      });
    } else if (req.method === 'tools/list') {
      send({ jsonrpc: '2.0', id: req.id, result: { tools: TOOLS } });
    } else if (req.method === 'tools/call') {
      try {
        const out = await runTool(req.params.name, req.params.arguments);
        send({
          jsonrpc: '2.0', id: req.id,
          result: { content: [{ type: 'text', text: JSON.stringify(out.body) }], isError: out.status >= 400 },
        });
      } catch (err) {
        send({
          jsonrpc: '2.0', id: req.id,
          result: { content: [{ type: 'text', text: String(err.message ?? err) }], isError: true },
        });
      }
    } else if (req.id !== undefined) {
      send({ jsonrpc: '2.0', id: req.id, error: { code: -32601, message: `method not found: ${req.method}` } });
    }
  }
});
