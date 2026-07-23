import { describe, expect, it, vi } from 'vitest';
import { runWebSearch } from '../src/routes/websearch.js';

function htmlResponse(html: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: async () => html,
  } as unknown as Response;
}

const SAMPLE_RESULT_HTML = `
<div class="result results_links results_links_deep web-result">
  <div class="result__body">
    <a rel="nofollow" class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FTransformer_(deep_learning)&amp;rut=abc">Transformer (deep learning) - Wikipedia</a>
    <a class="result__snippet" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FTransformer_(deep_learning)&amp;rut=abc">A standard transformer architecture...</a>
  </div>
</div>
`;

describe('runWebSearch', () => {
  it('parses DuckDuckGo HTML results and unwraps the redirect URL', async () => {
    const fetchImpl = vi.fn(async () => htmlResponse(SAMPLE_RESULT_HTML));
    const outcome = await runWebSearch('transformer architecture', fetchImpl as unknown as typeof fetch);
    expect(outcome).toEqual({
      ok: true,
      results: [
        {
          title: 'Transformer (deep learning) - Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Transformer_(deep_learning)',
          snippet: 'A standard transformer architecture...',
          engine: 'duckduckgo',
        },
      ],
    });
  });

  it('sends a browser-like User-Agent (DuckDuckGo 403s without one)', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => htmlResponse('<html></html>'));
    await runWebSearch('q', fetchImpl as unknown as typeof fetch);
    const call = fetchImpl.mock.calls[0];
    expect(call).toBeDefined();
    const init = call?.[1];
    expect((init?.headers as Record<string, string>)['User-Agent']).toMatch(/Mozilla/);
  });

  it('returns SEARCH_UNAVAILABLE — never falls back to model knowledge — when DuckDuckGo is unreachable', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    });
    const outcome = await runWebSearch('anything', fetchImpl as unknown as typeof fetch);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe('SEARCH_UNAVAILABLE');
    expect(outcome.status).toBe(502);
  });

  it('returns SEARCH_UPSTREAM_ERROR on a non-2xx DuckDuckGo response', async () => {
    const fetchImpl = vi.fn(async () => htmlResponse('', false, 403));
    const outcome = await runWebSearch('anything', fetchImpl as unknown as typeof fetch);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe('SEARCH_UPSTREAM_ERROR');
  });

  it('returns an empty result set (not an error) when the page has no results', async () => {
    const fetchImpl = vi.fn(async () => htmlResponse('<html><body>no results</body></html>'));
    const outcome = await runWebSearch('nonsense query', fetchImpl as unknown as typeof fetch);
    expect(outcome).toEqual({ ok: true, results: [] });
  });

  it('caps results at 10', async () => {
    const many = Array.from({ length: 15 }, (_, i) => `
      <div class="result">
        <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2F${i}">Result ${i}</a>
        <a class="result__snippet" href="#">snippet ${i}</a>
      </div>
    `).join('\n');
    const fetchImpl = vi.fn(async () => htmlResponse(many));
    const outcome = await runWebSearch('q', fetchImpl as unknown as typeof fetch);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.results).toHaveLength(10);
  });
});
