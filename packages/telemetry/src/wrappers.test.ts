import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withLlmCall, withToolCall, withPipelinePhase, recordValidation } from './wrappers';
import { PipelinePhase } from './types';
import { ferrouiMetrics } from './metrics';

vi.mock('./tracer', () => ({
  withSpan: vi.fn(async (name, fn) => {
    const span = { setAttribute: vi.fn() };
    return fn(span);
  }),
}));

vi.mock('./metrics', () => ({
  ferrouiMetrics: {
    llmCalls: { add: vi.fn() },
    llmDuration: { record: vi.fn() },
    llmTokensInput: { add: vi.fn() },
    llmTokensOutput: { add: vi.fn() },
    llmCost: { add: vi.fn() },
    toolsCalls: { add: vi.fn() },
    toolsDuration: { record: vi.fn() },
    toolsErrors: { add: vi.fn() },
    validationTotal: { add: vi.fn() },
    validationFailed: { add: vi.fn() },
    validationHallucinations: { add: vi.fn() },
    validationRepairs: { add: vi.fn() },
  },
}));

describe('wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('withLlmCall records metrics and sets attributes', async () => {
    const fn = vi.fn().mockResolvedValue('res');
    await withLlmCall({ providerId: 'p', model: 'm', tokenInput: 10, tokenOutput: 5, cost: 0.1 }, fn);
    expect(fn).toHaveBeenCalled();
    expect(ferrouiMetrics.llmCalls.add).toHaveBeenCalled();
    expect(ferrouiMetrics.llmTokensInput.add).toHaveBeenCalled();
    expect(ferrouiMetrics.llmTokensOutput.add).toHaveBeenCalled();
    expect(ferrouiMetrics.llmCost.add).toHaveBeenCalled();
  });
  
  it('withLlmCall handles missing optional info', async () => {
    const fn = vi.fn().mockResolvedValue('res');
    await withLlmCall({ providerId: 'p', model: 'm' }, fn);
    expect(fn).toHaveBeenCalled();
    expect(ferrouiMetrics.llmCalls.add).toHaveBeenCalled();
  });

  it('withToolCall success', async () => {
    const fn = vi.fn().mockResolvedValue('res');
    await withToolCall('test-tool', fn);
    expect(fn).toHaveBeenCalled();
    expect(ferrouiMetrics.toolsCalls.add).toHaveBeenCalled();
  });

  it('withToolCall error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('err'));
    await expect(withToolCall('test-tool', fn)).rejects.toThrow('err');
    expect(ferrouiMetrics.toolsErrors.add).toHaveBeenCalled();
  });

  it('withPipelinePhase', async () => {
    const fn = vi.fn().mockResolvedValue('res');
    await withPipelinePhase(PipelinePhase.UI_GENERATION, fn, 'req-1');
    expect(fn).toHaveBeenCalled();
  });
  
  it('withPipelinePhase no request id', async () => {
    const fn = vi.fn().mockResolvedValue('res');
    await withPipelinePhase(PipelinePhase.UI_GENERATION, fn);
    expect(fn).toHaveBeenCalled();
  });

  it('recordValidation records metrics', () => {
    recordValidation(false, 1, 2);
    expect(ferrouiMetrics.validationTotal.add).toHaveBeenCalled();
    expect(ferrouiMetrics.validationFailed.add).toHaveBeenCalled();
    expect(ferrouiMetrics.validationHallucinations.add).toHaveBeenCalled();
    expect(ferrouiMetrics.validationRepairs.add).toHaveBeenCalled();
  });
  
  it('recordValidation success without issues', () => {
    recordValidation(true);
    expect(ferrouiMetrics.validationTotal.add).toHaveBeenCalled();
  });
});
