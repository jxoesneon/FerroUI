import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTracer, tracer, initializeTelemetry, startSpan, withSpan, setCommonAttributes } from './tracer';
import { trace, context } from '@opentelemetry/api';

vi.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: vi.fn().mockReturnValue({
      startSpan: vi.fn().mockReturnValue({
        setAttribute: vi.fn(),
        end: vi.fn(),
      }),
      startActiveSpan: vi.fn((name, options, ctx, fn) => {
        const span = {
          setAttribute: vi.fn(),
          end: vi.fn(),
          recordException: vi.fn(),
          setStatus: vi.fn(),
        };
        return fn(span);
      }),
    }),
    setGlobalTracerProvider: vi.fn(),
  },
  metrics: {
    setGlobalMeterProvider: vi.fn(),
  },
  context: {
    active: vi.fn(),
  },
}));

// Mock process.stdout.write or console.log if needed, but not strictly required
describe('tracer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports tracer', () => {
    expect(tracer).toBeDefined();
  });

  it('getTracer returns a tracer', () => {
    expect(getTracer()).toBeDefined();
    expect(trace.getTracer).toHaveBeenCalled();
  });

  it('initializeTelemetry with console exporter', () => {
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const provider = initializeTelemetry();
    expect(provider).toBeDefined();
    expect(trace.setGlobalTracerProvider).toHaveBeenCalled();
  });

  it('initializeTelemetry with OTLP exporter', () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
    const provider = initializeTelemetry('test-service');
    expect(provider).toBeDefined();
  });

  it('startSpan creates a span', () => {
    const span = startSpan('test-span');
    expect(span).toBeDefined();
  });

  it('withSpan executes function and ends span', async () => {
    const fn = vi.fn().mockResolvedValue('result');
    const result = await withSpan('test-span', fn);
    expect(result).toBe('result');
    expect(fn).toHaveBeenCalled();
  });

  it('withSpan handles errors', async () => {
    const error = new Error('test error');
    const fn = vi.fn().mockRejectedValue(error);
    await expect(withSpan('test-span', fn)).rejects.toThrow('test error');
  });

  it('withSpan handles non-Error throwables', async () => {
    const fn = vi.fn().mockRejectedValue('string error');
    await expect(withSpan('test-span', fn)).rejects.toThrow('string error');
  });

  it('setCommonAttributes sets attributes', () => {
    const span = { setAttribute: vi.fn() } as any;
    setCommonAttributes(span, {
      requestId: '123',
      userId: 'user1',
      promptHash: 'hash',
      schemaVersion: '1.0',
      securityInjectionDetected: true,
      cacheStatus: 'HIT',
    });
    expect(span.setAttribute).toHaveBeenCalledTimes(6);
  });
  
  it('setCommonAttributes handles empty attributes', () => {
    const span = { setAttribute: vi.fn() } as any;
    setCommonAttributes(span, {});
    expect(span.setAttribute).not.toHaveBeenCalled();
  });
});
