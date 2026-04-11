import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCounter, mockHistogram, mockMeter } = vi.hoisted(() => {
  const mockCounter = { add: vi.fn() };
  const mockHistogram = { record: vi.fn() };
  const mockMeter = {
    createCounter: vi.fn(() => mockCounter),
    createHistogram: vi.fn(() => mockHistogram),
  };
  return { mockCounter, mockHistogram, mockMeter };
});

vi.mock('@opentelemetry/api', () => ({
  metrics: {
    getMeter: vi.fn(() => mockMeter),
  },
}));

import { getMeter, alloyMetrics, recordRequest, recordRequestCompletion } from './metrics';
import { metrics } from '@opentelemetry/api';

describe('Metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMeter should return a meter', () => {
    getMeter();
    expect(metrics.getMeter).toHaveBeenCalledWith('@alloy/telemetry', '0.1.0');
  });

  it('recordRequest should increment requestsTotal', () => {
    recordRequest({ foo: 'bar' });
    expect(mockCounter.add).toHaveBeenCalledWith(1, { foo: 'bar' });
  });

  it('recordRequestCompletion should record duration and success', () => {
    recordRequestCompletion(150, true, { foo: 'baz' });
    expect(mockHistogram.record).toHaveBeenCalledWith(150, { foo: 'baz' });
    expect(mockCounter.add).not.toHaveBeenCalled(); // error not incremented
  });

  it('recordRequestCompletion should record error if success is false', () => {
    recordRequestCompletion(200, false);
    expect(mockHistogram.record).toHaveBeenCalledWith(200, {});
    expect(mockCounter.add).toHaveBeenCalledWith(1, {});
  });
});