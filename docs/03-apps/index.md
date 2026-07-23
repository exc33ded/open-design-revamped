# Apps

Open Design has exactly two deployable applications in `apps/`: the **daemon** (backend) and the **web** (frontend). They communicate over localhost — the web app's Next.js dev server rewrites `/api/*` requests to the daemon on port 7456.

---

## In This Section

- [Daemon](daemon.md) — Express API server + SQLite database + agent orchestration
- [Web](web.md) — Next.js 16 React SPA, 200+ components, 13 providers, custom router

---

## How Web and Daemon Talk

In development, the web app's `next.config.ts` proxies API calls:

```
Browser fetch("/api/*")        → Next.js rewrites → http://127.0.0.1:7456/api/*
Browser fetch("/artifacts/*")  → Next.js rewrites → http://127.0.0.1:7456/artifacts/*
Browser fetch("/frames/*")     → Next.js rewrites → http://127.0.0.1:7456/frames/*
```

The daemon validates the origin using `OD_WEB_PORT`. If the browser origin doesn't match, the daemon returns 403.

Chat messages flow over SSE (Server-Sent Events) — the daemon spawns an agent, captures its output, and streams events back to the browser in real time. File changes are broadcast through the same SSE channel so the file panel and preview update live.
