import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SemanticCache } from './semantic-cache';

describe('SemanticCache', () => {
  let cache: SemanticCache;

  beforeEach(() => {
    cache = SemanticCache.getInstance();
    cache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates consistent keys based on prompt, permissions, userId, and tool outputs', async () => {
    const prompt = 'test prompt';
    const permissions = ['read', 'write'];
    const userId = 'user-1';
    const toolOutputs = { a: 1, b: 2 };
    const layout = { component: 'Dashboard', props: {} } as any;

    await cache.set(prompt, permissions, userId, toolOutputs, layout);

    // Same input should hit cache
    const cached = await cache.get(prompt, permissions, userId, toolOutputs);
    expect(cached).toEqual(layout);

    // Different prompt should miss
    expect(await cache.get('other', permissions, userId, toolOutputs)).toBeUndefined();

    // Different permissions should miss
    expect(await cache.get(prompt, ['read'], userId, toolOutputs)).toBeUndefined();

    // Different userId should miss (Session-Scoped)
    expect(await cache.get(prompt, permissions, 'user-2', toolOutputs)).toBeUndefined();

    // Different tool outputs should miss
    expect(await cache.get(prompt, permissions, userId, { a: 1 })).toBeUndefined();
    
    // Order of tool outputs shouldn't matter if we normalize
    expect(await cache.get(prompt, permissions, userId, { b: 2, a: 1 })).toEqual(layout);
    
    // Order of permissions shouldn't matter
    expect(await cache.get(prompt, ['write', 'read'], userId, toolOutputs)).toEqual(layout);
  });

  it('handles TTL expiration', async () => {
    const prompt = 'test prompt';
    const permissions = ['read'];
    const userId = 'user-1';
    const toolOutputs = {};
    const layout = { component: 'Dashboard', props: {} } as any;

    await cache.set(prompt, permissions, userId, toolOutputs, layout);

    // Advance time by 4 minutes (less than 5 min TTL)
    vi.advanceTimersByTime(4 * 60 * 1000);
    expect(await cache.get(prompt, permissions, userId, toolOutputs)).toEqual(layout);

    // Advance time by 2 more minutes (total 6 min, past TTL)
    vi.advanceTimersByTime(2 * 60 * 1000);
    expect(await cache.get(prompt, permissions, userId, toolOutputs)).toBeUndefined();
  });
});
