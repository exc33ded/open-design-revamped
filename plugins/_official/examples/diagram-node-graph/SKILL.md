---
name: diagram-node-graph
description: Render any node/edge concept diagram (neural network, transformer, system architecture, flowchart, org chart, pipeline, state machine) as an interactive, self-contained CSS/SVG/JS diagram — real web search only when the topic names a known architecture, never the model's trained knowledge.
triggers:
  - "node graph"
  - "architecture diagram"
  - "neural network diagram"
  - "interactive diagram"
od:
  scenario: general
  mode: diagram
---

# Diagram: node graph

Not a template for one kind of diagram. One renderer, fed different
data, covers a transformer's attention blocks, a CNN's layers, a
microservice topology, an OAuth flow, an org chart, a state machine —
anything expressible as labeled nodes with labeled edges between them.
Never write a bespoke one-off diagram per request; always go through
the data model + renderer below.

## Step 1 — ground it before drawing it, no exceptions

If the request names a specific, real thing ("a transformer", "the
Kubernetes control plane", "OAuth2 authorization code flow") the node
count, labels, and connections are facts, not creative choices, and
recalling them from training data is exactly the failure mode this
step exists to prevent — a confident-looking diagram with the wrong
number of layers or a missing hop is worse than no diagram.

Search is mandatory for named-architecture requests. Query the
daemon's local search route — **not** the model's own knowledge —
before writing a single node:

```bash
curl -s "http://localhost:${OD_PORT:-7456}/api/tools/websearch?q=<url-encoded query>"
```

This runs the search from the daemon itself (`apps/daemon/src/routes/
websearch.ts`) against DuckDuckGo — there is no separate endpoint to
query and no other search step to run. Read the `results` array
(`title`/`url`/`snippet`/`engine` per hit).

**Search snippets alone are usually too thin to ground a diagram** —
DuckDuckGo's snippet is one truncated sentence, not real content. Pick
the 1–2 most relevant result URLs and fetch their actual page text
before committing to a node list:

```bash
curl -s "http://localhost:${OD_PORT:-7456}/api/tools/webfetch?url=<url-encoded page URL>"
```

This returns `{title, text, truncated}` — `text` is the page's
readable body content (nav/script/footer stripped), capped at 8,000
characters. Use *that* — not the search snippet — as the actual source
for node/edge/label decisions. The search step finds the right page;
the fetch step is what actually tells you what's on it. Skipping the
fetch and diagramming off snippets alone is a softer version of the
exact mistake Step 1 exists to prevent — you'd be grounding on a
one-sentence fragment instead of the real structure.

If `webfetch` errors (`FETCH_UNAVAILABLE`/`FETCH_UPSTREAM_ERROR`/
`UNSUPPORTED_CONTENT_TYPE`) on your top pick, try the next result
before giving up — unlike search itself, individual pages failing to
fetch isn't a hard stop, since other results usually cover the same
topic.

**If the route errors** (`SEARCH_UNAVAILABLE`/`SEARCH_UPSTREAM_ERROR`)
**stop and tell the user search is unavailable and the diagram can't be
grounded**; do not proceed by drawing the architecture from memory.
This is a hard stop, not a soft fallback — the whole point of this
step is that an unverified "transformer diagram" must never look
identical to a verified one. There is no second engine to retry —
this route only has one, so an error here really does mean "can't
ground this right now," not "try harder."

Purely illustrative/invented diagrams (the user's own product flow, a
hypothetical pipeline they're describing to you) skip this step —
there's nothing published to look up, so there's no memory-vs-search
question to begin with.

## Step 2 — one data model, one renderer

```js
// diagram data: the only thing that changes per request
const diagramData = {
  nodes: [
    // group = visual rank/column (0-based); layered layout positions by it
    { id: "input", label: "Input Embedding", group: 0 },
    { id: "attn1", label: "Multi-Head Attention", group: 1 },
    { id: "ffn1", label: "Feed Forward", group: 2 },
    { id: "output", label: "Output", group: 3 },
  ],
  edges: [
    { from: "input", to: "attn1" },
    { from: "attn1", to: "ffn1", label: "residual + norm" },
    { from: "ffn1", to: "output" },
  ],
};
```

```html
<div class="diagram-root" id="diagram-1">
  <svg class="diagram-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
    <g class="edges"></g>
    <g class="nodes"></g>
  </svg>
  <div class="diagram-tooltip" hidden></div>
</div>
<style>
  #diagram-1 { position: relative; width: 100%; height: 100%; }
  #diagram-1 .diagram-svg { width: 100%; height: 100%; display: block; }
  #diagram-1 .node-box { fill: var(--diagram-node-bg, #1e1e2e); stroke: var(--diagram-node-border, #6c7086); stroke-width: 1.5; cursor: pointer; transition: stroke 0.15s, fill 0.15s; }
  #diagram-1 .node-box:hover, #diagram-1 .node-box.active { stroke: var(--diagram-accent, #89b4fa); stroke-width: 2.5; }
  #diagram-1 .node-label { fill: var(--diagram-text, #cdd6f4); font: 500 15px system-ui, sans-serif; text-anchor: middle; pointer-events: none; }
  #diagram-1 .edge-path { fill: none; stroke: var(--diagram-edge, #45475a); stroke-width: 1.5; transition: stroke 0.15s, stroke-width 0.15s; }
  #diagram-1 .edge-path.active { stroke: var(--diagram-accent, #89b4fa); stroke-width: 2.5; }
  #diagram-1 .edge-label { fill: var(--diagram-text-dim, #a6adc8); font: 400 11px system-ui, sans-serif; text-anchor: middle; }
  #diagram-1 .diagram-tooltip { position: absolute; pointer-events: none; background: var(--diagram-node-bg, #1e1e2e); color: var(--diagram-text, #cdd6f4); border: 1px solid var(--diagram-node-border, #6c7086); border-radius: 6px; padding: 6px 10px; font: 400 13px system-ui, sans-serif; transform: translate(-50%, -120%); white-space: nowrap; }
</style>
<script>
(function renderNodeGraph(rootId, data) {
  const root = document.getElementById(rootId);
  const svg = root.querySelector(".diagram-svg");
  const edgesG = svg.querySelector(".edges");
  const nodesG = svg.querySelector(".nodes");
  const tooltip = root.querySelector(".diagram-tooltip");

  // Layered layout: column = group, row = order within group.
  const groups = {};
  data.nodes.forEach((n) => (groups[n.group] ??= []).push(n));
  const groupKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);
  const colWidth = 1600 / (groupKeys.length + 1);
  const pos = {};
  groupKeys.forEach((g, ci) => {
    const col = groups[g];
    const rowHeight = 900 / (col.length + 1);
    col.forEach((n, ri) => {
      pos[n.id] = { x: colWidth * (ci + 1), y: rowHeight * (ri + 1) };
    });
  });

  const NODE_W = 180, NODE_H = 56;
  data.edges.forEach((e) => {
    const a = pos[e.from], b = pos[e.to];
    if (!a || !b) return;
    const midX = (a.x + b.x) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "edge-path");
    path.setAttribute("d", `M ${a.x + NODE_W/2} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x - NODE_W/2} ${b.y}`);
    path.dataset.from = e.from; path.dataset.to = e.to;
    edgesG.appendChild(path);
    if (e.label) {
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("class", "edge-label");
      t.setAttribute("x", midX); t.setAttribute("y", (a.y + b.y) / 2 - 6);
      t.textContent = e.label;
      edgesG.appendChild(t);
    }
  });

  data.nodes.forEach((n) => {
    const p = pos[n.id];
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.dataset.id = n.id;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("class", "node-box");
    rect.setAttribute("x", p.x - NODE_W/2); rect.setAttribute("y", p.y - NODE_H/2);
    rect.setAttribute("width", NODE_W); rect.setAttribute("height", NODE_H);
    rect.setAttribute("rx", 8);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("class", "node-label");
    text.setAttribute("x", p.x); text.setAttribute("y", p.y + 5);
    text.textContent = n.label;
    g.appendChild(rect); g.appendChild(text);
    nodesG.appendChild(g);

    g.addEventListener("mouseenter", (ev) => {
      edgesG.querySelectorAll(`[data-from="${n.id}"],[data-to="${n.id}"]`)
        .forEach((el) => el.classList.add("active"));
      rect.classList.add("active");
      if (n.detail) {
        tooltip.textContent = n.detail;
        tooltip.hidden = false;
        const box = root.getBoundingClientRect();
        tooltip.style.left = `${(p.x / 1600) * box.width}px`;
        tooltip.style.top = `${(p.y / 900) * box.height}px`;
      }
    });
    g.addEventListener("mouseleave", () => {
      edgesG.querySelectorAll(".active").forEach((el) => el.classList.remove("active"));
      rect.classList.remove("active");
      tooltip.hidden = true;
    });
  });
})("diagram-1", diagramData);
</script>
```

Copy this skeleton verbatim per diagram, then only change `diagramData`
and the id suffix (`diagram-1` → `diagram-2`, ...) everywhere it
appears (the `id="diagram-1"` div, the CSS selector prefix, and the
final call) whenever more than one diagram lives in the same document
— unscoped ids/classes collide silently when a deck has multiple
diagram slides.

## Step 3 — embedding in a deck slide

This atom composes with the deck framework
(`od.mode: deck` skills) instead of replacing it: place the diagram
markup inside a `<section class="slide">`, sized to the slide's own
content area — do not fight the deck's outer scale-to-fit transform
with a second one inside the diagram. One `<svg viewBox="0 0 1600
900" preserveAspectRatio="xMidYMid meet">` per diagram scales cleanly
inside any container without extra JS.

Used standalone (no deck), the same skeleton drops straight into a
normal HTML page — nothing above depends on deck framework globals.

## What this is not

- Not a canvas/WebGL particle effect — this is nodes and edges someone
  needs to read and click, so it stays DOM + SVG for real hit-testing,
  text selection, and accessibility.
- Not mermaid/d3/vis.js — no dependency, no CDN fetch; the renderer
  above is the whole implementation.
- Not a fixed catalogue of diagram *kinds*. If the request is "draw
  the CI/CD pipeline" or "draw the CAP theorem trade-off triangle",
  the same `{nodes, edges}` shape handles it; don't invent a
  special-cased renderer per topic.

## Anti-patterns

- Drawing a real named architecture from memory because the search
  route errored, timed out, or "probably would have agreed anyway" —
  that is the exact behavior Step 1 forbids. Stop and say so instead.
- Fabricating specific counts ("12 attention heads", "50 layers") for
  a real named architecture without having searched — round to what's
  actually documented, or omit the number and label the block generically.
- Hardcoding pixel positions per node instead of using the layered
  layout pass — breaks the moment node count changes on the next edit.
- Calling DuckDuckGo directly instead of `/api/tools/websearch` — the
  daemon route is the single enforcement point; bypassing it reopens
  the "trust the model's judgment" gap
  this atom exists to close.
