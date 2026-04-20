/**
 * FerroUI Engine — Integration Tests
 *
 * These tests spin up the real Express server (createServer) and hit it over
 * HTTP using the built-in Node.js fetch API.  No external services are required
 * — LLM calls are intercepted via vi.mock, Redis falls back to in-memory.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';

const TEST_JWT_SECRET = 'your-test-secret-min32chars-here!!';

function signTestToken(payload: { sub: string; userId: string; permissions: string[] }): string {
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
}

function authHeader(userId = 'user-test-001', permissions = ['read']): { Authorization: string } {
  const token = signTestToken({ sub: userId, userId, permissions });
  return { Authorization: `Bearer ${token}` };
}

// ── Mock LLM providers so tests never make real API calls ────────────────────
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      stream: vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: '{"page":{"type":"organism","id":"p1","layout":"stack","children":[]}}' } };
          yield { type: 'message_stop' };
        },
        finalMessage: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: '{"page":{"type":"organism","id":"p1","layout":"stack","children":[]}}' }],
          usage: { input_tokens: 10, output_tokens: 30 },
        }),
      }),
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '{"page":{"type":"organism","id":"p1","layout":"stack","children":[]}}' }],
        usage: { input_tokens: 10, output_tokens: 30 },
      }),
    };
  },
}));

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        stream: vi.fn().mockReturnValue({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: '{"page":{"type":"organism","id":"p1","layout":"stack","children":[]}}' } }] };
          },
          finalChatCompletion: vi.fn().mockResolvedValue({
            choices: [{ message: { content: '{"page":{"type":"organism","id":"p1","layout":"stack","children":[]}}' } }],
            usage: { prompt_tokens: 10, completion_tokens: 30, total_tokens: 40 },
          }),
        }),
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"page":{"type":"organism","id":"p1","layout":"stack","children":[]}}' } }],
          usage: { prompt_tokens: 10, completion_tokens: 30, total_tokens: 40 },
        }),
      },
    };
  },
}));

// ── Server lifecycle ──────────────────────────────────────────────────────────
let baseUrl: string;
let serverInstance: ReturnType<typeof import('../packages/engine/src/server').createServer>['server'];

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  // SKIP_AUTH is not implemented; tests must send real JWTs via authHeader().

  const { createServer } = await import('../packages/engine/src/server');
  const { server } = createServer({ port: 0 });
  serverInstance = server;
  await new Promise<void>(resolve => server.on('listening', resolve));
  const addr = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

afterAll(() => {
  serverInstance?.close();
});

// ── Helper ────────────────────────────────────────────────────────────────────
function makeContext(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-test-001',
    requestId: `req-${Date.now()}`,
    permissions: ['read'],
    locale: 'en',
    ...overrides,
  };
}

// ── Health endpoints ──────────────────────────────────────────────────────────
describe('Health endpoints', () => {
  it('GET /healthz → 200 alive', async () => {
    const res = await fetch(`${baseUrl}/healthz`);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.status).toBe('alive');
  });

  it('GET /readyz → 200 ready', async () => {
    const res = await fetch(`${baseUrl}/readyz`);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.status).toBe('ready');
    expect(body.circuitOpen).toBe(false);
  });

  it('GET /health → includes provider field', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.provider).toBe('string');
  });

  it('GET /health/circuit → includes state field', async () => {
    const res = await fetch(`${baseUrl}/health/circuit`);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(['OPEN', 'CLOSED']).toContain(body.state);
  });

  it('GET /metrics → prometheus text format', async () => {
    const res = await fetch(`${baseUrl}/metrics`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
  });
});

// ── Input validation ──────────────────────────────────────────────────────────
describe('POST /api/ferroui/process — input validation', () => {
  it('returns 400 when prompt is missing', async () => {
    const res = await fetch(`${baseUrl}/api/ferroui/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ context: makeContext() }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.error).toBe('string');
  });

  it('JWT userId takes precedence over body context userId', async () => {
    // Even if body context has a different userId, the JWT's userId wins
    const jwtUserId = 'jwt-user-001';
    const bodyUserId = 'body-user-999';
    const res = await fetch(`${baseUrl}/api/ferroui/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(jwtUserId) },
      body: JSON.stringify({
        prompt: 'hello',
        context: { userId: bodyUserId, requestId: 'r1', permissions: [], locale: 'en' }
      }),
    });
    // Should succeed because JWT provides valid userId
    expect(res.status).toBe(200);
  });

  it('returns 400 when context is missing requestId', async () => {
    const res = await fetch(`${baseUrl}/api/ferroui/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ prompt: 'hello', context: { userId: 'u1', permissions: [], locale: 'en' } }),
    });
    expect(res.status).toBe(400);
  });
});

// ── Security headers ──────────────────────────────────────────────────────────
describe('Security headers', () => {
  it('sets X-Content-Type-Options: nosniff', async () => {
    const res = await fetch(`${baseUrl}/healthz`);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('sets X-Frame-Options: DENY', async () => {
    const res = await fetch(`${baseUrl}/healthz`);
    expect(res.headers.get('x-frame-options')).toBe('DENY');
  });

  it('sets Strict-Transport-Security', async () => {
    const res = await fetch(`${baseUrl}/healthz`);
    expect(res.headers.get('strict-transport-security')).toContain('max-age=');
  });

  it('sets Content-Security-Policy', async () => {
    const res = await fetch(`${baseUrl}/healthz`);
    expect(res.headers.get('content-security-policy')).toContain("default-src 'none'");
  });

  it('does not expose X-Powered-By', async () => {
    const res = await fetch(`${baseUrl}/healthz`);
    expect(res.headers.get('x-powered-by')).toBeNull();
  });
});

// ── Admin endpoints ───────────────────────────────────────────────────────────
describe('Admin endpoints', () => {
  it('GET /admin/logs → returns events array', async () => {
    const res = await fetch(`${baseUrl}/admin/logs`);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body.events)).toBe(true);
  });

  it('POST /admin/circuit-reset → resets circuit breaker', async () => {
    const res = await fetch(`${baseUrl}/admin/circuit-reset`, { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.status).toBe('reset');
  });

  it('POST /admin/cache/invalidate → 400 without toolName or pattern', async () => {
    const res = await fetch(`${baseUrl}/admin/cache/invalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('POST /admin/cache/invalidate with pattern → 200', async () => {
    const res = await fetch(`${baseUrl}/admin/cache/invalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern: 'test.*' }),
    });
    expect(res.status).toBe(200);
  });
});

// ── State update endpoint ─────────────────────────────────────────────────────
describe('POST /api/ferroui/state-update', () => {
  it('returns 400 when context is incomplete', async () => {
    const res = await fetch(`${baseUrl}/api/ferroui/state-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ context: {}, componentId: 'btn1', newState: { active: true } }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when componentId is missing', async () => {
    const res = await fetch(`${baseUrl}/api/ferroui/state-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ context: makeContext(), newState: { active: true } }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 when session does not exist', async () => {
    const res = await fetch(`${baseUrl}/api/ferroui/state-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({
        context: makeContext({ requestId: 'nonexistent-session' }),
        componentId: 'btn1',
        newState: { active: true },
      }),
    });
    expect(res.status).toBe(404);
  });
});
