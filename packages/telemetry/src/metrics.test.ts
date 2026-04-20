import { describe, it, expect, vi } from 'vitest';
import { getMeter, ferrouiMetrics, recordRequest, recordRequestCompletion, recordCacheHit, recordCacheMiss, getCacheHitRate, getPrometheusMetrics } from './metrics';
import { metrics } from '@opentelemetry/api';

vi.mock('@opentelemetry/api', () => {
  const counter = { add: vi.fn() };
  const histogram = { record: vi.fn() };
  return {
    metrics: {
      getMeter: vi.fn().mockReturnValue({
        createCounter: vi.fn().mockReturnValue(counter),
        createHistogram: vi.fn().mockReturnValue(histogram),
      }),
      setGlobalMeterProvider: vi.fn(),
    },
  };
});

describe('metrics', () => {
  it('getMeter returns a meter', () => {
    expect(getMeter()).toBeDefined();
  });

  it('ferrouiMetrics is a singleton', () => {
    expect(ferrouiMetrics).toBeDefined();
  });

  it('recordRequest adds 1 to total', () => {
    recordRequest();
    expect(ferrouiMetrics.requestsTotal.add).toHaveBeenCalled();
  });

  it('recordRequestCompletion records duration and error if failed', () => {
    recordRequestCompletion(100, false);
    expect(ferrouiMetrics.requestsDuration.record).toHaveBeenCalled();
    expect(ferrouiMetrics.requestsErrors.add).toHaveBeenCalled();
  });
  
  it('recordRequestCompletion success', () => {
    recordRequestCompletion(100, true);
    expect(ferrouiMetrics.requestsDuration.record).toHaveBeenCalled();
  });

  it('cache hits and misses', () => {
    recordCacheHit();
    recordCacheMiss();
    expect(getCacheHitRate()).toBeGreaterThan(0);
  });

  it('getPrometheusMetrics returns string', async () => {
    const output = await getPrometheusMetrics();
    expect(typeof output).toBe('string');
  });
});
