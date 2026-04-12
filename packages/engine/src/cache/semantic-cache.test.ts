import { describe, it, expect, beforeEach } from 'vitest';
import { SemanticCache } from './semantic-cache';
import { AlloyLayout } from '@alloy/schema';

function makeLayout(requestId: string): AlloyLayout {
  return {
    schemaVersion: '1.0',
    requestId,
    locale: 'en',
    layout: { id: 'root', type: 'container', props: {}, children: [] } as unknown as AlloyLayout['layout'],
    metadata: { generatedAt: new Date().toISOString() },
  };
}

describe('SemanticCache — dataClassification routing', () => {
  let cache: SemanticCache;

  beforeEach(() => {
    (SemanticCache as unknown as { instance: SemanticCache | undefined }).instance = undefined;
    cache = SemanticCache.getInstance();
    cache.clear();
  });

  it('caches PUBLIC outputs with 300s TTL', async () => {
    const layout = makeLayout('pub-layout');
    const toolOutputs = { weather: { result: 'sunny', classification: 'PUBLIC' } };
    await cache.set('hello', [], 'u1', toolOutputs, layout);
    const hit = await cache.get('hello', [], 'u1', toolOutputs);
    expect(hit?.requestId).toBe('pub-layout');
  });

  it('caches INTERNAL outputs with 60s TTL', async () => {
    const layout = makeLayout('int-layout');
    const toolOutputs = { getUserData: { result: 'data', classification: 'INTERNAL' } };
    await cache.set('hello', [], 'u1', toolOutputs, layout);
    const hit = await cache.get('hello', [], 'u1', toolOutputs);
    expect(hit?.requestId).toBe('int-layout');
  });

  it('never caches RESTRICTED outputs', async () => {
    const layout = makeLayout('res-layout');
    const toolOutputs = { sensitiveData: { result: 'secret', classification: 'RESTRICTED' } };
    await cache.set('hello', [], 'u1', toolOutputs, layout);
    const miss = await cache.get('hello', [], 'u1', toolOutputs);
    expect(miss).toBeUndefined();
  });

  it('PUBLIC cache is shared across users (same key)', async () => {
    const layout = makeLayout('shared-layout');
    const toolOutputs = { news: { result: 'headline', classification: 'PUBLIC' } };
    await cache.set('latest news', [], 'user-a', toolOutputs, layout);
    const hit = await cache.get('latest news', [], 'user-b', toolOutputs);
    expect(hit?.requestId).toBe('shared-layout');
  });

  it('INTERNAL cache is user-scoped (different key per user)', async () => {
    const layout = makeLayout('internal-layout');
    const toolOutputs = { profile: { result: 'private', classification: 'INTERNAL' } };
    await cache.set('my profile', [], 'user-a', toolOutputs, layout);
    const miss = await cache.get('my profile', [], 'user-b', toolOutputs);
    expect(miss).toBeUndefined();
  });

  it('escalates to RESTRICTED if any tool is RESTRICTED', async () => {
    const layout = makeLayout('mixed-layout');
    const toolOutputs = {
      news: { result: 'headline', classification: 'PUBLIC' },
      ssn: { result: '***-**-1234', classification: 'RESTRICTED' },
    };
    await cache.set('mixed', [], 'u1', toolOutputs, layout);
    const miss = await cache.get('mixed', [], 'u1', toolOutputs);
    expect(miss).toBeUndefined();
  });
});
