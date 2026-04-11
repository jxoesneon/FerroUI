import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTracer, tracer, initializeTelemetry, startSpan, withSpan, setCommonAttributes } from './tracer';
import { trace, context } from '@opentelemetry/api';
import { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

vi.mock('@opentelemetry/api', () => {
  const mockSpan = {
    end: vi.fn(),
    recordException: vi.fn(),
    setStatus: vi.fn(),
    setAttribute: vi.fn(),
  };
  const mockTracer = {
    startSpan: vi.fn(() => mockSpan),
    startActiveSpan: vi.fn((name, options, ctx, fn) => fn(mockSpan)),
  };
  return {
    trace: {
      getTracer: vi.fn(() => mockTracer),
    },
    context: {
      active: vi.fn(() => ({})),
    },
  };
});

vi.mock('@opentelemetry/sdk-trace-base', () => {
  const MockBasicTracerProvider = vi.fn().mockImplementation(function() {
    return {
      addSpanProcessor: vi.fn(),
      register: vi.fn(),
    };
  });
  return {
    BasicTracerProvider: MockBasicTracerProvider,
    ConsoleSpanExporter: vi.fn(),
    SimpleSpanProcessor: vi.fn(),
  };
});

describe('Tracer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTracer should return tracer', () => {
    getTracer();
    expect(trace.getTracer).toHaveBeenCalledWith('@alloy/telemetry', '0.1.0');
  });

  it('initializeTelemetry should configure and register provider', () => {
    const provider = initializeTelemetry('test-service');
    expect(BasicTracerProvider).toHaveBeenCalled();
    expect(provider.addSpanProcessor).toHaveBeenCalled();
    expect(provider.register).toHaveBeenCalled();
  });
  
  it('initializeTelemetry should handle default param', () => {
    const provider = initializeTelemetry();
    expect(BasicTracerProvider).toHaveBeenCalled();
  });

  it('startSpan should create a span', () => {
    startSpan('test-span');
    const t = trace.getTracer('test', '1.0');
    expect(t.startSpan).toHaveBeenCalledWith('test-span', undefined, undefined);
  });

  it('withSpan should execute and end span on success', async () => {
    const result = await withSpan('test', async (span) => 'success');
    expect(result).toBe('success');
    const mockSpan = (trace.getTracer('test', '1.0') as any).startSpan();
    expect(mockSpan.end).toHaveBeenCalled();
  });

  it('withSpan should record exception and set error status on failure', async () => {
    await expect(withSpan('test', async () => {
      throw new Error('test error');
    })).rejects.toThrow('test error');

    const mockSpan = (trace.getTracer('test', '1.0') as any).startSpan();
    expect(mockSpan.recordException).toHaveBeenCalledWith(expect.any(Error));
    expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 2, message: 'test error' });
    expect(mockSpan.end).toHaveBeenCalled();
  });

  it('withSpan should handle non-Error throws', async () => {
    await expect(withSpan('test', async () => {
      throw 'string error';
    })).rejects.toBe('string error');

    const mockSpan = (trace.getTracer('test', '1.0') as any).startSpan();
    expect(mockSpan.recordException).not.toHaveBeenCalled();
    expect(mockSpan.end).toHaveBeenCalled();
  });

  it('setCommonAttributes should set span attributes', () => {
    const mockSpan = (trace.getTracer('test', '1.0') as any).startSpan();
    setCommonAttributes(mockSpan, {
      requestId: 'req-1',
      userId: 'user-1',
      promptHash: 'hash-1',
      schemaVersion: '1.0',
    });
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('request.id', 'req-1');
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('user.id', 'user-1');
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('prompt.hash', 'hash-1');
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('schema.version', '1.0');
  });
});