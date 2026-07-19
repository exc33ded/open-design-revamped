// Sample backend for Open Design connection testing. Zero dependencies.
// Run: node server.mjs   (port 8787, API key: demo-key-123)
//
// REST surface:
//   GET    /health                     — no auth
//   GET    /api/products               — list (filter: ?category=, ?minPrice=)
//   POST   /api/products               — create {name, price, category}
//   GET    /api/products/:id           — read
//   PUT    /api/products/:id           — update
//   DELETE /api/products/:id           — delete
//   GET    /api/orders                 — list orders with product details joined
//   POST   /api/orders                 — create {productId, quantity}
//   GET    /api/products-summary       — {count, avgPrice} from products
//   GET    /api/stats                  — revenue + counts aggregate
// All /api/* routes require header:  X-API-Key: demo-key-123

import http from 'node:http';
import crypto from 'node:crypto';

const PORT = process.env.PORT ?? 8787;
const API_KEY = process.env.API_KEY ?? 'demo-key-123';

const products = new Map([
  ['p1', { id: 'p1', name: 'Ember Roast Beans 250g', price: 14.5, category: 'coffee' }],
  ['p2', { id: 'p2', name: 'Nimbus Mug', price: 9.0, category: 'merch' }],
  ['p3', { id: 'p3', name: 'Pour-over Kit', price: 32.0, category: 'gear' }],
]);
const orders = new Map();

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  };
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...corsHeaders() });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let data = '';
  for await (const chunk of req) data += chunk;
  try { return data ? JSON.parse(data) : {}; } catch { return null; }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { ...corsHeaders(), 'Access-Control-Max-Age': 86400 });
    return res.end();
  }

  if (path === '/health') return json(res, 200, { ok: true, uptime: process.uptime() });

  if (path.startsWith('/api/')) {
    if (req.headers['x-api-key'] !== API_KEY) {
      return json(res, 401, { error: 'invalid or missing X-API-Key' });
    }
  } else {
    return json(res, 404, { error: 'not found' });
  }

  if (path === '/api/products-summary' && req.method === 'GET') {
    const prices = [...products.values()].map((p) => p.price);
    const count = prices.length;
    const avgPrice = count ? Number((prices.reduce((a, b) => a + b, 0) / count).toFixed(2)) : 0;
    return json(res, 200, { count, avgPrice });
  }

  const productMatch = path.match(/^\/api\/products\/([\w-]+)$/);

  if (path === '/api/products' && req.method === 'GET') {
    let list = [...products.values()];
    const category = url.searchParams.get('category');
    const minPrice = url.searchParams.get('minPrice');
    if (category) list = list.filter((p) => p.category === category);
    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    return json(res, 200, { products: list });
  }

  if (path === '/api/products' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body || typeof body.name !== 'string' || typeof body.price !== 'number') {
      return json(res, 400, { error: 'name (string) and price (number) required' });
    }
    const id = crypto.randomUUID().slice(0, 8);
    const product = { id, name: body.name, price: body.price, category: body.category ?? 'misc' };
    products.set(id, product);
    return json(res, 201, { product });
  }

  if (productMatch) {
    const product = products.get(productMatch[1]);
    if (!product) return json(res, 404, { error: 'product not found' });
    if (req.method === 'GET') return json(res, 200, { product });
    if (req.method === 'PUT') {
      const body = await readBody(req);
      if (!body) return json(res, 400, { error: 'invalid JSON' });
      Object.assign(product, body, { id: product.id });
      return json(res, 200, { product });
    }
    if (req.method === 'DELETE') {
      products.delete(product.id);
      return json(res, 200, { deleted: product.id });
    }
  }

  if (path === '/api/orders' && req.method === 'GET') {
    const list = [...orders.values()].map((o) => ({
      ...o,
      product: products.get(o.productId) ?? null,
      total: (products.get(o.productId)?.price ?? 0) * o.quantity,
    }));
    return json(res, 200, { orders: list });
  }

  if (path === '/api/orders' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body || !products.has(body.productId) || !(body.quantity > 0)) {
      return json(res, 400, { error: 'valid productId and quantity > 0 required' });
    }
    const id = crypto.randomUUID().slice(0, 8);
    const order = { id, productId: body.productId, quantity: body.quantity, createdAt: new Date().toISOString() };
    orders.set(id, order);
    return json(res, 201, { order });
  }

  if (path === '/api/stats' && req.method === 'GET') {
    let revenue = 0;
    for (const o of orders.values()) revenue += (products.get(o.productId)?.price ?? 0) * o.quantity;
    return json(res, 200, {
      productCount: products.size,
      orderCount: orders.size,
      revenue: Number(revenue.toFixed(2)),
      byCategory: [...products.values()].reduce((acc, p) => {
        acc[p.category] = (acc[p.category] ?? 0) + 1;
        return acc;
      }, {}),
    });
  }

  return json(res, 404, { error: 'not found' });
});

server.listen(PORT, () => console.log(`sample-backend listening on http://localhost:${PORT} (API key: ${API_KEY})`));
