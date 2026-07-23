import { describe, expect, it, vi } from 'vitest';
import { runWebFetch } from '../src/routes/webfetch.js';

function htmlResponse(html: string, opts: { ok?: boolean; status?: number; contentType?: string } = {}): Response {
  const { ok = true, status = 200, contentType = 'text/html; charset=utf-8' } = opts;
  return {
    ok,
    status,
    headers: { get: (name: string) => (name.toLowerCase() === 'content-type' ? contentType : null) },
    text: async () => html,
  } as unknown as Response;
}

const SAMPLE_PAGE = `
<html>
<head><title>Transformer (deep learning) - Wikipedia</title></head>
<body>
  <nav>site nav noise</nav>
  <script>trackingCode();</script>
  <article>
    <h1>Transformer</h1>
    <p>A standard transformer architecture consists of an encoder and a decoder.</p>
  </article>
  <footer>footer noise</footer>
</body>
</html>
`;

describe('runWebFetch', () => {
  it('extracts title and body text, stripping nav/script/footer noise', async () => {
    const fetchImpl = vi.fn(async () => htmlResponse(SAMPLE_PAGE));
    const outcome = await runWebFetch('https://en.wikipedia.org/wiki/Transformer', fetchImpl as unknown as typeof fetch);
    expect(outcome.ok).toBe(true);
    expect(outcome.title).toBe('Transformer (deep learning) - Wikipedia');
    expect(outcome.text).toContain('A standard transformer architecture consists of an encoder and a decoder.');
    expect(outcome.text).not.toContain('site nav noise');
    expect(outcome.text).not.toContain('trackingCode');
    expect(outcome.text).not.toContain('footer noise');
  });

  it('rejects non-http(s) URLs', async () => {
    const outcome = await runWebFetch('file:///etc/passwd');
    expect(outcome.ok).toBe(false);
    expect(outcome.code).toBe('BAD_REQUEST');
  });

  it('rejects malformed URLs', async () => {
    const outcome = await runWebFetch('not a url');
    expect(outcome.ok).toBe(false);
    expect(outcome.code).toBe('BAD_REQUEST');
  });

  it('returns FETCH_UNAVAILABLE when the target is unreachable', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    });
    const outcome = await runWebFetch('https://example.com/', fetchImpl as unknown as typeof fetch);
    expect(outcome.ok).toBe(false);
    expect(outcome.code).toBe('FETCH_UNAVAILABLE');
  });

  it('returns FETCH_UPSTREAM_ERROR on a non-2xx response', async () => {
    const fetchImpl = vi.fn(async () => htmlResponse('', { ok: false, status: 404 }));
    const outcome = await runWebFetch('https://example.com/missing', fetchImpl as unknown as typeof fetch);
    expect(outcome.ok).toBe(false);
    expect(outcome.code).toBe('FETCH_UPSTREAM_ERROR');
  });

  it('rejects non-HTML content types', async () => {
    const fetchImpl = vi.fn(async () => htmlResponse('{}', { contentType: 'application/json' }));
    const outcome = await runWebFetch('https://example.com/api', fetchImpl as unknown as typeof fetch);
    expect(outcome.ok).toBe(false);
    expect(outcome.code).toBe('UNSUPPORTED_CONTENT_TYPE');
  });

  it('truncates very long pages and flags truncation', async () => {
    const longBody = `<html><body><p>${'a'.repeat(20_000)}</p></body></html>`;
    const fetchImpl = vi.fn(async () => htmlResponse(longBody));
    const outcome = await runWebFetch('https://example.com/long', fetchImpl as unknown as typeof fetch);
    expect(outcome.ok).toBe(true);
    expect(outcome.truncated).toBe(true);
    expect(outcome.text?.length).toBe(8_000);
  });
});
