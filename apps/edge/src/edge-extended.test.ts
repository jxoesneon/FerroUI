/**
 * Edge Worker tests.
 *
 * Hono's `app.fetch(req, env)` is the correct way to pass Cloudflare Worker
 * bindings in tests. `app.request()` does NOT propagate the env object to
 * `c.env` — that only works with `app.fetch()`.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import app from './index.js';

function makeEnv(overrides: Record<string, string> = {}) {
  return {
    GEMINI_API_KEY: 'test-key',
    FERROUI_DEBUG: 'false',
    FERROUI_ENGINE_URL: 'http://engine:4000',
    ...overrides,
  };
}

describe('Edge Worker — /api/layout', () => {
  it('returns 500 when API key is missing', async () => {
    const req = new Request('http://localhost/api/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hello' }),
    });
    const res = await app.fetch(req, makeEnv({ GEMINI_API_KEY: '' }));
    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('API Key missing');
  });

  it('returns 500 when Gemini throws (invalid key)', async () => {
    const req = new Request('http://localhost/api/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test prompt' }),
    });
    const res = await app.fetch(req, makeEnv({ GEMINI_API_KEY: 'invalid-for-test' }));
    expect(res.status).toBe(500);
  });
});

describe('Edge Worker — /api/stream', () => {
  it('returns SSE content-type', async () => {
    const req = new Request('http://localhost/api/stream');
    const res = await app.fetch(req, makeEnv());
    expect(res.headers.get('content-type')).toContain('text/event-stream');
  });
});

describe('Edge Worker — /api/tools/call', () => {
  afterEach(() => vi.restoreAllMocks());

  it('proxies tool call to engine and returns result', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, result: 'done' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'get_user', args: { id: '1' } }),
    });
    const res = await app.fetch(req, makeEnv());
    expect(mockFetch).toHaveBeenCalledWith(
      'http://engine:4000/api/tools/call',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(res.status).toBe(200);
  });

  it('returns 502 when engine responds with error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad Gateway', { status: 503 })));

    const req = new Request('http://localhost/api/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'bad_tool', args: {} }),
    });
    const res = await app.fetch(req, makeEnv());
    expect(res.status).toBe(502);
  });

  it('returns 400 when request body is malformed JSON', async () => {
    const req = new Request('http://localhost/api/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await app.fetch(req, makeEnv());
    expect(res.status).toBe(400);
  });

  it('returns 400 when upstream fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const req = new Request('http://localhost/api/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 't', args: {} }),
    });
    const res = await app.fetch(req, makeEnv());
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('ECONNREFUSED');
  });
});
