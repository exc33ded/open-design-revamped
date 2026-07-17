# sample-backend

Zero-dependency Node backend used to test Open Design's "connect to your backend" features.

## Run

```bash
node server.mjs          # REST API on http://localhost:8787, API key: demo-key-123
node test.mjs            # self-check (server must be running)
```

## Connect to Open Design

Register the MCP bridge so agents can call the backend:

```bash
curl -X POST http://127.0.0.1:7456/api/mcp/servers -H 'Content-Type: application/json' -d '{
  "id": "sample-backend",
  "name": "Sample Backend",
  "transport": "stdio",
  "command": "node",
  "args": ["E:/Projects/open-design/sample-backend/mcp-server.mjs"],
  "enabled": true
}'
```

Tools exposed: `list_products`, `create_order`, `get_stats`.
