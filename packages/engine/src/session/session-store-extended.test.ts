import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  RedisSessionStore,
  InMemorySessionStore,
  createSessionStore,
  setRedisClient,
  type SessionState,
} from './session-store.js';

function makeSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    id: 'sess-1',
    userId: 'user-1',
    permissions: ['read'],
    conversationContext: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    lastActivityAt: new Date('2024-01-01T00:00:00Z'),
    ttlSeconds: 300,
    ...overrides,
  };
}

// ── RedisSessionStore ─────────────────────────────────────────────────────────

describe('RedisSessionStore', () => {
  function makeClient() {
    return {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
    };
  }

  it('returns undefined when key not found', async () => {
    const client = makeClient();
    const store = new RedisSessionStore(client);
    expect(await store.get('missing')).toBeUndefined();
  });

  it('serialises and retrieves session', async () => {
    const client = makeClient();
    const session = makeSession({ id: 'rs-1' });
    client.get.mockResolvedValue(JSON.stringify(session));
    const store = new RedisSessionStore(client);
    const result = await store.get('rs-1');
    expect(result?.userId).toBe('user-1');
    expect(result?.createdAt).toBeInstanceOf(Date);
  });

  it('set calls client.set with PX TTL', async () => {
    const client = makeClient();
    const store = new RedisSessionStore(client);
    await store.set('rs-2', makeSession({ id: 'rs-2', ttlSeconds: 60 }));
    expect(client.set).toHaveBeenCalledWith(
      'ferroui:session:rs-2',
      expect.any(String),
      { PX: 60_000 },
    );
  });

  it('set uses 3600s TTL when ttlSeconds is 0', async () => {
    const client = makeClient();
    const store = new RedisSessionStore(client);
    await store.set('rs-z', makeSession({ id: 'rs-z', ttlSeconds: 0 }));
    expect(client.set).toHaveBeenCalledWith(
      'ferroui:session:rs-z',
      expect.any(String),
      { PX: 3_600_000 },
    );
  });

  it('delete calls client.del with prefixed key', async () => {
    const client = makeClient();
    const store = new RedisSessionStore(client);
    await store.delete('rs-3');
    expect(client.del).toHaveBeenCalledWith('ferroui:session:rs-3');
  });

  it('touch updates lastActivityAt and re-sets', async () => {
    const client = makeClient();
    const session = makeSession({ id: 'rs-4' });
    client.get.mockResolvedValue(JSON.stringify(session));
    const store = new RedisSessionStore(client);
    await store.touch('rs-4');
    expect(client.set).toHaveBeenCalled();
  });

  it('touch is no-op when session not found', async () => {
    const client = makeClient();
    const store = new RedisSessionStore(client);
    await store.touch('nonexistent');
    expect(client.set).not.toHaveBeenCalled();
  });
});

// ── InMemorySessionStore — touch with zero TTL ────────────────────────────────

describe('InMemorySessionStore — defaultTtl branch', () => {
  it('touch with ttlSeconds=0 uses default TTL', async () => {
    const store = new InMemorySessionStore({ ttlSeconds: 300 });
    const session = makeSession({ id: 'imts-1', ttlSeconds: 0 });
    await store.set('imts-1', session);
    await store.touch('imts-1');
    expect(await store.get('imts-1')).toBeDefined();
  });

  it('touch on nonexistent session is a no-op', async () => {
    const store = new InMemorySessionStore();
    await store.touch('ghost');
    expect(await store.get('ghost')).toBeUndefined();
  });
});

// ── createSessionStore factory ────────────────────────────────────────────────

describe('createSessionStore', () => {
  afterEach(() => {
    delete process.env.REDIS_URL;
    setRedisClient(undefined as never);
  });

  it('returns InMemorySessionStore when no REDIS_URL', () => {
    const store = createSessionStore();
    expect(store).toBeInstanceOf(InMemorySessionStore);
  });

  it('returns RedisSessionStore when REDIS_URL set and client injected', () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    const mockClient = { get: vi.fn(), set: vi.fn(), del: vi.fn() };
    setRedisClient(mockClient);
    const store = createSessionStore();
    expect(store).toBeInstanceOf(RedisSessionStore);
  });

  it('warns and falls back to InMemory when REDIS_URL set but no client', () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createSessionStore();
    expect(store).toBeInstanceOf(InMemorySessionStore);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('REDIS_URL set but no Redis client'));
    warnSpy.mockRestore();
  });

  it('respects SESSION_TTL_SECONDS env var', () => {
    process.env.SESSION_TTL_SECONDS = '7200';
    const store = createSessionStore();
    expect(store).toBeInstanceOf(InMemorySessionStore);
    delete process.env.SESSION_TTL_SECONDS;
  });
});
