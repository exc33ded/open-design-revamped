// Fetches a single URL and extracts readable page text. Exists because
// /api/tools/websearch alone isn't enough to ground generation: DuckDuckGo
// snippets are one-sentence fragments, not real content — a model grounding
// a diagram off snippets alone is still mostly guessing. The pattern real
// search tools use is search (candidates) -> fetch (full content of the
// picked candidate); this route is the fetch half.

import { load } from 'cheerio';
import type { Express } from 'express';
import type { RouteDeps } from '../server-context.js';

export interface RegisterWebFetchRoutesDeps extends RouteDeps<'http'> {}

const FETCH_TIMEOUT_MS = 10_000;
const MAX_TEXT_CHARS = 8_000;
// Same UA as websearch.ts — plenty of sites 403 a bare Node fetch.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
// Non-content elements stripped before text extraction.
const STRIP_SELECTORS = 'script, style, nav, header, footer, aside, noscript, svg, form, iframe';

export interface WebFetchOutcome {
  ok: boolean;
  status?: number;
  code?: string;
  message?: string;
  title?: string;
  text?: string;
  truncated?: boolean;
}

// Pure enough to unit-test without booting the daemon: takes a fetch
// implementation so tests can substitute one without touching the network.
export async function runWebFetch(
  targetUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<WebFetchOutcome> {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { ok: false, status: 400, code: 'BAD_REQUEST', message: 'url is not a valid URL' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, status: 400, code: 'BAD_REQUEST', message: 'url must be http(s)' };
  }

  let upstream: Response;
  try {
    upstream = await fetchImpl(parsed.toString(), {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    return {
      ok: false,
      status: 502,
      code: 'FETCH_UNAVAILABLE',
      message: `could not reach ${parsed.hostname}: ${String(err)}`,
    };
  }
  if (!upstream.ok) {
    return { ok: false, status: 502, code: 'FETCH_UPSTREAM_ERROR', message: `${parsed.hostname} returned ${upstream.status}` };
  }
  const contentType = upstream.headers.get('content-type') ?? '';
  if (!contentType.includes('html')) {
    return { ok: false, status: 415, code: 'UNSUPPORTED_CONTENT_TYPE', message: `not HTML: ${contentType || 'unknown'}` };
  }

  const html = await upstream.text();
  const $ = load(html);
  $(STRIP_SELECTORS).remove();
  const title = $('title').first().text().trim();
  const text = $('body').text().replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  const truncated = text.length > MAX_TEXT_CHARS;
  return {
    ok: true,
    title,
    text: truncated ? text.slice(0, MAX_TEXT_CHARS) : text,
    truncated,
  };
}

export function registerWebFetchRoutes(app: Express, ctx: RegisterWebFetchRoutesDeps) {
  const { sendApiError } = ctx.http;

  app.get('/api/tools/webfetch', async (req, res) => {
    const url = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!url) {
      return sendApiError(res, 400, 'BAD_REQUEST', 'url is required');
    }
    const outcome = await runWebFetch(url);
    if (!outcome.ok) {
      return sendApiError(res, outcome.status ?? 502, outcome.code ?? 'FETCH_ERROR', outcome.message ?? 'fetch failed');
    }
    res.json({ url, title: outcome.title, text: outcome.text, truncated: outcome.truncated });
  });
}
