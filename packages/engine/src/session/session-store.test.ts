import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySessionStore, SessionState } from './session-store.js';

function makeSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    id: 'sess-1',
    userId: 'user-1',
    permissions: ['read'],
    conversationContext: [],
    createdAt: new Date(),
    lastActivityAt: new Date(),
    ttlSeconds: 300,
    ...overrides,
  };
}

describe('InMemorySessionStore', () => {
  let store: InMemorySessionStore;

  beforeEach(() => {
    store = new InMemorySessionStore({ ttlSeconds: 300 });
  });

  it('creates and retrieves a session', async () => {
    const session = makeSession({ id: 'sess-get', userId: 'alice' });
    await store.set(session.id, session);
    const retrieved = await store.get(session.id);
    expect(retrieved?.userId).toBe('alice');
  });

  it('returns undefined for missing session', async () => {
    expect(await store.get('nonexistent')).toBeUndefined();
  });

  it('deletes sessions', async () => {
    const session = makeSession({ id: 'sess-del' });
    await store.set(session.id, session);
    await store.delete(session.id);
    expect(await store.get(session.id)).toBeUndefined();
  });

  it('expires sessions after TTL', async () => {
    const session = makeSession({ id: 'sess-exp', ttlSeconds: 1 });
    await store.set(session.id, session);
    await new Promise(r => setTimeout(r, 1100));
    expect(await store.get(session.id)).toBeUndefined();
  });

  it('touch updates lastActivityAt', async () => {
    const session = makeSession({ id: 'sess-touch' });
    await store.set(session.id, session);
    const before = session.lastActivityAt.getTime();
    await new Promise(r => setTimeout(r, 5));
    await store.touch(session.id);
    const after = (await store.get(session.id))!.lastActivityAt.getTime();
    expect(after).toBeGreaterThan(before);
  });

  it('stores conversation context', async () => {
    const session = makeSession({
      id: 'sess-ctx',
      conversationContext: ['hello', 'world'],
    });
    await store.set(session.id, session);
    const retrieved = await store.get(session.id);
    expect(retrieved?.conversationContext).toEqual(['hello', 'world']);
  });
});
