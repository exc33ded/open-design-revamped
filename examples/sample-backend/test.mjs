// Self-check for sample-backend. Run: node test.mjs (with server.mjs running).
const BASE = 'http://localhost:8787';
const H = { 'X-API-Key': 'demo-key-123', 'Content-Type': 'application/json' };
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; } else console.log('ok:', msg); };

const r = (p, o) => fetch(BASE + p, o).then(async (x) => ({ status: x.status, body: await x.json() }));

const health = await r('/health');
assert(health.body.ok === true, 'health');

const noAuth = await fetch(BASE + '/api/products');
assert(noAuth.status === 401, 'rejects missing API key');

const list = await r('/api/products', { headers: H });
assert(list.body.products.length >= 3, 'lists seed products');

const created = await r('/api/products', { method: 'POST', headers: H, body: JSON.stringify({ name: 'Test Grinder', price: 55, category: 'gear' }) });
assert(created.status === 201, 'creates product');

const bad = await r('/api/products', { method: 'POST', headers: H, body: JSON.stringify({ name: 'no price' }) });
assert(bad.status === 400, 'validates product body');

const order = await r('/api/orders', { method: 'POST', headers: H, body: JSON.stringify({ productId: 'p1', quantity: 2 }) });
assert(order.status === 201, 'creates order');

const orders = await r('/api/orders', { headers: H });
assert(orders.body.orders[0].total === 29, 'joins product and computes total');

const stats = await r('/api/stats', { headers: H });
assert(stats.body.revenue >= 29 && stats.body.orderCount >= 1, 'stats aggregate');

const gone = await r(`/api/products/${created.body.product.id}`, { method: 'DELETE', headers: H });
assert(gone.status === 200, 'deletes product');

console.log('done');
