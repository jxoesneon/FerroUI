import { describe, it, expect, beforeEach } from 'vitest';
import { SemanticCache } from './semantic-cache.js';
import { FerroUILayout } from '@ferroui/schema';

function makeLayout(requestId: string): FerroUILayout {
  return {
    schemaVersion: '1.0',
    requestId,
    locale: 'en',
    layout: { id: 'root', type: 'container', props: {}, children: [] } as unknown as FerroUILayout['layout'],
    metadata: { generatedAt: new Date().toISOString() },
  };
}

describe('SemanticCache — dataClassification routing', () => {
  let cache: SemanticCache;

  beforeEach(async () => {
    (SemanticCache as unknown as { instance: SemanticCache | undefined }).instance = undefined;
    cache = SemanticCache.getInstance();
    await cache.clear();
  });

  it('caches PUBLIC outputs with 300s TTL', async () => {
    const layout = makeLayout('pub-layout');
    const toolOutputs = { weather: { result: 'sunny', classification: 'PUBLIC' } };
    await cache.set('hello', [], 'u1', toolOutputs, layout, 'PUBLIC');
    const hit = await cache.get('hello', [], 'u1', toolOutputs);
    expect(hit?.requestId).toBe('pub-layout');
  });

  it('caches INTERNAL outputs with 60s TTL', async () => {
    const layout = makeLayout('int-layout');
    const toolOutputs = { getUserData: { result: 'data', classification: 'INTERNAL' } };
    await cache.set('hello', [], 'u1', toolOutputs, layout, 'INTERNAL');
    const hit = await cache.get('hello', [], 'u1', toolOutputs);
    expect(hit?.requestId).toBe('int-layout');
  });

  it('never caches RESTRICTED outputs', async () => {
    const layout = makeLayout('res-layout');
    const toolOutputs = { sensitiveData: { result: 'secret', classification: 'RESTRICTED' } };
    await cache.set('hello', [], 'u1', toolOutputs, layout, 'RESTRICTED');
    const miss = await cache.get('hello', [], 'u1', toolOutputs);
    expect(miss).toBeUndefined();
  });

  it('PUBLIC cache is shared across users (same key)', async () => {
    const layout = makeLayout('shared-layout');
    const toolOutputs = { news: { result: 'headline', classification: 'PUBLIC' } };
    await cache.set('latest news', [], 'user-a', toolOutputs, layout, 'PUBLIC');
    const hit = await cache.get('latest news', [], 'user-b', toolOutputs);
    expect(hit?.requestId).toBe('shared-layout');
  });

  it('INTERNAL cache is user-scoped (different key per user)', async () => {
    const layout = makeLayout('internal-layout');
    const toolOutputs = { profile: { result: 'private', classification: 'INTERNAL' } };
    await cache.set('my profile', [], 'user-a', toolOutputs, layout, 'INTERNAL');
    const miss = await cache.get('my profile', [], 'user-b', toolOutputs);
    expect(miss).toBeUndefined();
  });

  it('escalates to RESTRICTED if any tool is RESTRICTED', async () => {
    const layout = makeLayout('mixed-layout');
    const toolOutputs = {
      news: { result: 'headline', classification: 'PUBLIC' },
      ssn: { result: '***-**-1234', classification: 'RESTRICTED' },
    };
    await cache.set('mixed', [], 'u1', toolOutputs, layout, 'RESTRICTED');
    const miss = await cache.get('mixed', [], 'u1', toolOutputs);
    expect(miss).toBeUndefined();
  });

  it('evicts entry if HMAC verification fails', async () => {
    const layout = makeLayout('hmac-layout');
    await cache.set('hmac test', [], 'u1', {}, layout, 'PUBLIC');
    
    // Tamper with the underlying backend directly
    const backend = (cache as any).backend;
    const keys = await backend.keys();
    const data = JSON.parse(await backend.get(keys[0]));
    data.hmac = 'tampered';
    await backend.set(keys[0], JSON.stringify(data), 300000);

    const hit = await cache.get('hmac test', [], 'u1', {});
    expect(hit).toBeUndefined();
    // The key should be removed
    expect(await backend.keys()).toHaveLength(0);
  });

  it('invalidate by toolName and params', async () => {
    const layout = makeLayout('inv-layout');
    const toolOutputs = { weather: { args: { city: 'London' }, result: 'sunny', classification: 'PUBLIC' } };
    await cache.set('london weather', [], 'u1', toolOutputs, layout, 'PUBLIC');
    
    await cache.invalidate('weather', { city: 'Paris' }); // Should not invalidate
    expect(await cache.get('london weather', [], 'u1', toolOutputs)).toBeDefined();
    
    await cache.invalidate('weather', { city: 'London' }); // Should invalidate
    expect(await cache.get('london weather', [], 'u1', toolOutputs)).toBeUndefined();
  });

  it('invalidate by toolName without params', async () => {
    const layout = makeLayout('inv-layout2');
    const toolOutputs = { weather: { args: { city: 'London' }, result: 'sunny', classification: 'PUBLIC' } };
    await cache.set('london weather', [], 'u1', toolOutputs, layout, 'PUBLIC');
    
    await cache.invalidate('weather'); // Should invalidate regardless of params
    expect(await cache.get('london weather', [], 'u1', toolOutputs)).toBeUndefined();
  });

  it('invalidatePattern removes matching tools', async () => {
    const layout = makeLayout('inv-pattern-layout');
    const toolOutputs = { 'db.query.users': { result: 'data', classification: 'PUBLIC' } };
    await cache.set('users', [], 'u1', toolOutputs, layout, 'PUBLIC');
    
    await cache.invalidatePattern('db.mutation.*'); // Should not invalidate
    expect(await cache.get('users', [], 'u1', toolOutputs)).toBeDefined();

    await cache.invalidatePattern('db.query.*'); // Should invalidate
    expect(await cache.get('users', [], 'u1', toolOutputs)).toBeUndefined();
  });
});
