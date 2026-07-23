# Sample Backend

The sample backend (`sample-backend/` at the repo root, not inside `open-design/`) demonstrates how agents connect to an external backend. It's a zero-dependency Node.js application — a REST API server plus an MCP stdio bridge.

---

## Purpose

Shows the full "connect your backend" pattern:

1. Run a backend REST API
2. Create an MCP bridge that wraps the API as tools
3. Register the bridge with the Open Design daemon
4. Agents call the bridge as MCP tools during runs

---

## Architecture

```
Agent Process (opencode)
    │  MCP protocol over stdio
    ▼
MCP Bridge (mcp-server.mjs)
    │  HTTP requests with X-API-Key header
    ▼
REST API (server.mjs on localhost:8787)
    │  CRUD operations on in-memory store
    ▼
Products + Orders (in-memory Map)
```

---

## REST API (server.mjs)

Listens on `localhost:8787`. Uses in-memory data (not persistent) for demonstration.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check with uptime |
| `GET` | `/api/products` | API key | List products (optional `?category=` and `?minPrice=`) |
| `POST` | `/api/products` | API key | Create product `{name, price, category}` |
| `GET` | `/api/products/:id` | API key | Get single product |
| `PUT` | `/api/products/:id` | API key | Update product |
| `DELETE` | `/api/products/:id` | API key | Delete product |
| `GET` | `/api/orders` | API key | List orders with joined product details |
| `POST` | `/api/orders` | API key | Create order `{productId, quantity}` |
| `GET` | `/api/products-summary` | API key | Aggregate `{count, avgPrice}` |
| `GET` | `/api/stats` | API key | Revenue + order counts + by-category breakdown |

### Authentication

All `/api/*` routes require `X-API-Key: demo-key-123` header. Configurable via environment:

```bash
PORT=8787 API_KEY=my-secret-key node server.mjs
```

### Sample Data

Pre-loaded with 3 products:

| ID | Name | Price | Category |
|----|------|-------|----------|
| `p1` | Ember Roast Beans 250g | $14.50 | coffee |
| `p2` | Nimbus Mug | $9.00 | merch |
| `p3` | Pour-over Kit | $32.00 | gear |

---

## MCP Bridge (mcp-server.mjs)

A hand-rolled JSON-RPC 2.0 stdio server that exposes the REST API as MCP tools. Zero dependencies — uses Node's built-in `http`, `crypto`, and `fs`.

### Exposed Tools

| Tool | Schema | Calls REST Endpoint |
|------|--------|-------------------|
| `list_products` | `{category?: string}` | `GET /api/products?category=` |
| `create_order` | `{productId: string, quantity: number}` | `POST /api/orders` |
| `get_stats` | `{}` | `GET /api/stats` |

### MCP Protocol

Implements the minimum MCP methods:
- `initialize` — Handshake with protocol version
- `tools/list` — Returns tool definitions with JSON schemas
- `tools/call` — Executes a tool and returns result

The bridge reads newline-delimited JSON-RPC 2.0 messages on stdin and writes responses to stdout. This is the `stdio` transport — the daemon spawns the bridge as a child process and communicates through pipes.

### Configuration

```bash
BACKEND_URL=http://localhost:8787 BACKEND_API_KEY=demo-key-123 node mcp-server.mjs
```

Defaults point at `http://localhost:8787` with `demo-key-123`.

---

## Connecting to Open Design

### Step 1: Start the Backend

```bash
cd sample-backend
node server.mjs
# → listening on http://localhost:8787 (API key: demo-key-123)
```

### Step 2: Register the MCP Bridge

```bash
curl -X PUT http://127.0.0.1:7456/api/mcp/servers \
  -H 'Content-Type: application/json' \
  -d '{
    "servers": [{
      "id": "sample-backend",
      "label": "Sample Backend",
      "transport": "stdio",
      "enabled": true,
      "command": "node",
      "args": ["<absolute-path>/sample-backend/mcp-server.mjs"]
    }]
  }'
```

Replace `<absolute-path>` with the full path to `sample-backend/mcp-server.mjs`.

### Step 3: Test

```bash
node test.mjs
# Runs a self-check against the REST API (server must be running)
```

### Step 4: Use from an Agent

After registration, agents get three new tools: `list_products`, `create_order`, `get_stats`. In the web UI, send a prompt like:

> "Show me all coffee products and create an order for the Pour-over Kit."

The agent will call `list_products` with `category: "coffee"`, then `create_order` with `productId: "p3"`.

---

## Adapting for Your Backend

To connect your own backend:

1. **Write an MCP bridge** similar to `mcp-server.mjs` — map your API endpoints to MCP tools
2. **Register the bridge** with the daemon via `PUT /api/mcp/servers`
3. **Configure** environment variables (`BACKEND_URL`, `BACKEND_API_KEY`) pointing at your real backend

The pattern is:
- The bridge translates MCP tool calls into HTTP requests
- Your backend serves a REST API with whatever data and logic you need
- The daemon injects the MCP tools into the agent's environment
- Agents discover and call the tools during design tasks

---

## Files

| File | Purpose |
|------|---------|
| `server.mjs` | REST API server (product CRUD, orders, stats) |
| `mcp-server.mjs` | MCP stdio bridge (JSON-RPC 2.0 over stdin/stdout) |
| `test.mjs` | Self-check script for the REST API |
| `README.md` | Quick-start documentation |
