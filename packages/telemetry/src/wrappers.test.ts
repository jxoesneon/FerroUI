import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withLlmCall, withToolCall, withPipelinePhase, recordValidation } from './wrappers';
import { alloyMetrics } from './metrics';

vi.mock('./tracer', () => {
  const mockSpan = {
    setAttribute: vi.fn(),
  };
  return {
    withSpan: vi.fn((name, fn) => fn(mockSpan)),
  };
});

vi.mock('./metrics', () => ({
  alloyMetrics: {
    llmCalls: { add: vi.fn() },
    llmDuration: { record: vi.fn() },
    llmTokensInput: { add: vi.fn() },
    llmTokensOutput: { add: vi.fn() },
    llmCost: { add: vi.fn() },
    toolsCalls: { add: vi.fn() },
    toolsDuration: { record: vi.fn() },
    toolsErrors: { add: vi.fn() },
    toolsTimeout: { add: vi.fn() },
    validationTotal: { add: vi.fn() },
    validationFailed: { add: vi.fn() },
    validationHallucinations: { add: vi.fn() },
    validationRepairs: { add: vi.fn() },
  },
}));

describe('Wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('withLlmCall should record metrics and set attributes', async () => {
    const info = { providerId: 'openai', model: 'gpt-4', tokenInput: 10, tokenOutput: 20, cost: 0.05 };
    const result = await withLlmCall(info, async () => 'success');
    expect(result).toBe('success');
    
    expect(alloyMetrics.llmCalls.add).toHaveBeenCalledWith(1, expect.any(Object));
    expect(alloyMetrics.llmDuration.record).toHaveBeenCalledWith(expect.any(Number), expect.any(Object));
    expect(alloyMetrics.llmTokensInput.add).toHaveBeenCalledWith(10, expect.any(Object));
    expect(alloyMetrics.llmTokensOutput.add).toHaveBeenCalledWith(20, expect.any(Object));
    expect(alloyMetrics.llmCost.add).toHaveBeenCalledWith(0.05, expect.any(Object));
  });

  it('withLlmCall should handle cases without optional token/cost properties', async () => {
    const info = { providerId: 'openai', model: 'gpt-4' };
    const result = await withLlmCall(info, async () => 'success');
    expect(result).toBe('success');
    
    expect(alloyMetrics.llmCalls.add).toHaveBeenCalledWith(1, expect.any(Object));
    expect(alloyMetrics.llmDuration.record).toHaveBeenCalledWith(expect.any(Number), expect.any(Object));
    expect(alloyMetrics.llmTokensInput.add).not.toHaveBeenCalled();
    expect(alloyMetrics.llmTokensOutput.add).not.toHaveBeenCalled();
    expect(alloyMetrics.llmCost.add).not.toHaveBeenCalled();
  });

  it('withToolCall should record success metrics', async () => {
    const result = await withToolCall('my-tool', async () => 'success');
    expect(result).toBe('success');
    expect(alloyMetrics.toolsCalls.add).toHaveBeenCalledWith(1, { 'tool.name': 'my-tool' });
    expect(alloyMetrics.toolsDuration.record).toHaveBeenCalledWith(expect.any(Number), { 'tool.name': 'my-tool' });
    expect(alloyMetrics.toolsErrors.add).not.toHaveBeenCalled();
  });

  it('withToolCall should record error metrics on failure', async () => {
    await expect(withToolCall('my-tool', async () => {
      throw new Error('fail');
    })).rejects.toThrow('fail');
    expect(alloyMetrics.toolsErrors.add).toHaveBeenCalledWith(1, { 'tool.name': 'my-tool' });
    expect(alloyMetrics.toolsCalls.add).toHaveBeenCalledWith(1, { 'tool.name': 'my-tool' });
  });

  it('withPipelinePhase should set attributes', async () => {
    const result = await withPipelinePhase('validation' as any, async () => 'success', 'req-1');
    expect(result).toBe('success');
  });

  it('withPipelinePhase should handle empty requestId', async () => {
    const result = await withPipelinePhase('validation' as any, async () => 'success');
    expect(result).toBe('success');
  });

  it('recordValidation should record correct metrics', () => {
    recordValidation(true);
    expect(alloyMetrics.validationTotal.add).toHaveBeenCalledWith(1);
    expect(alloyMetrics.validationFailed.add).not.toHaveBeenCalled();

    recordValidation(false, 2, 1);
    expect(alloyMetrics.validationTotal.add).toHaveBeenCalledWith(1); // From prev call + this call
    expect(alloyMetrics.validationFailed.add).toHaveBeenCalledWith(1);
    expect(alloyMetrics.validationHallucinations.add).toHaveBeenCalledWith(2);
    expect(alloyMetrics.validationRepairs.add).toHaveBeenCalledWith(1);
  });
});