// Web search for grounding generation (diagrams, decks) in real facts
// instead of the model's trained knowledge. This route is the single
// enforcement point: it returns real DuckDuckGo results or a hard error,
// never a silent success the caller could mistake for "search ran". Skills
// call this route instead of scraping DuckDuckGo themselves, so parsing,
// timeouts, and the unreachable/blocked error all live in one place.
//
// Runs from each user's own machine (this is an internal grounding step,
// not a user-facing search surface) — deliberately not centralized through
// a hosted metasearch instance. A single hosted IP scraping DuckDuckGo for
// every user's queries concentrates exactly the rate-limit/CAPTCHA risk a
// search step is trying to avoid; distributed per-user requests don't.
//
// Single-engine (DuckDuckGo HTML) by design, not aspiration: Mojeek,
// Startpage, Ecosia, and Bing were all tried live against this endpoint
// before writing this file and each blocked/CAPTCHA'd a scripted request
// or has since changed its markup. There is no free multi-engine fallback
// to add here without a paid API — this route has no redundancy, and its
// SEARCH_UNAVAILABLE error means exactly that.

import { load } from 'cheerio';
import type { Express } from 'express';
import type { RouteDeps } from '../server-context.js';

export interface RegisterWebSearchRoutesDeps extends RouteDeps<'http'> {}

const DUCKDUCKGO_HTML_URL = 'https://html.duckduckgo.com/html/';
const SEARCH_TIMEOUT_MS = 10_000;
const MAX_RESULTS = 10;
// DuckDuckGo's HTML endpoint 403s requests without a browser-like UA.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  engine: string;
}

export type WebSearchOutcome =
  | { ok: true; results: WebSearchResult[] }
  | { ok: false; status: number; code: string; message: string };

// Results wrap the real target in a DDG redirect: `//duckduckgo.com/l/
// ?uddg=<url-encoded-target>&rut=...`. Unwrap it so callers get the real
// URL, not a DDG link they'd have to follow themselves.
function unwrapDuckDuckGoRedirect(href: string): string {
  const match = href.match(/[?&]uddg=([^&]+)/);
  const encoded = match?.[1];
  if (!encoded) return href;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return href;
  }
}

// Pure enough to unit-test without booting the daemon: takes a fetch
// implementation so tests can substitute one without touching the network.
export async function runWebSearch(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<WebSearchOutcome> {
  const url = `${DUCKDUCKGO_HTML_URL}?q=${encodeURIComponent(query)}`;
  let upstream: Response;
  try {
    upstream = await fetchImpl(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
    });
  } catch (err) {
    // No LLM-memory fallback: the caller (a skill) must surface this as a
    // failed search, not silently proceed from trained knowledge.
    return {
      ok: false,
      status: 502,
      code: 'SEARCH_UNAVAILABLE',
      message: `DuckDuckGo unreachable: ${String(err)}`,
    };
  }
  if (!upstream.ok) {
    return {
      ok: false,
      status: 502,
      code: 'SEARCH_UPSTREAM_ERROR',
      message: `DuckDuckGo returned ${upstream.status}`,
    };
  }

  const html = await upstream.text();
  const $ = load(html);
  const results: WebSearchResult[] = [];
  $('.result').each((_, el) => {
    if (results.length >= MAX_RESULTS) return;
    const link = $(el).find('.result__a').first();
    const title = link.text().trim();
    const href = link.attr('href');
    if (!title || !href) return;
    const snippet = $(el).find('.result__snippet').text().trim();
    results.push({
      title,
      url: unwrapDuckDuckGoRedirect(href),
      snippet,
      engine: 'duckduckgo',
    });
  });

  return { ok: true, results };
}

export function registerWebSearchRoutes(app: Express, ctx: RegisterWebSearchRoutesDeps) {
  const { sendApiError } = ctx.http;

  app.get('/api/tools/websearch', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      return sendApiError(res, 400, 'BAD_REQUEST', 'q is required');
    }
    const outcome = await runWebSearch(q);
    if (!outcome.ok) {
      return sendApiError(res, outcome.status, outcome.code, outcome.message);
    }
    res.json({ query: q, results: outcome.results });
  });
}
