import { trace, metrics, Tracer, Span, SpanOptions, Context, context } from '@opentelemetry/api';
import { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { FerroUIAttributes } from './types.js';
import CryptoJS from 'crypto-js';

const INSTRUMENTATION_NAME = '@ferroui/telemetry';
const INSTRUMENTATION_VERSION = '0.1.0';

/**
 * Returns the FerroUI tracer
 */
export function getTracer(): Tracer {
  return trace.getTracer(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION);
}

/**
 * Default FerroUI tracer
 */
export const tracer = getTracer();

/**
 * Initializes the telemetry SDK — traces + metrics — with OTLP or console exporters.
 * Call once at server startup before any instrumented code runs.
 */
export function initializeTelemetry(serviceName: string = 'ferroui-ui') {
  const spanProcessors: SpanProcessor[] = [];
  const resource = resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName });

  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (otlpEndpoint) {
    // ── Traces ──
    spanProcessors.push(
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` })
      )
    );

    // ── Metrics ──
    const meterProvider = new MeterProvider({
      resource,
      readers: [
        new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({ url: `${otlpEndpoint}/v1/metrics` }),
          exportIntervalMillis: parseInt(process.env.OTEL_METRIC_EXPORT_INTERVAL_MS ?? '30000', 10),
        }),
      ],
    });
    metrics.setGlobalMeterProvider(meterProvider);
    console.log(`[Telemetry] OTLP metrics exporter → ${otlpEndpoint}/v1/metrics`);
    console.log(`[Telemetry] OTLP traces exporter  → ${otlpEndpoint}/v1/traces`);
  } else {
    spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    console.log(`[Telemetry] Console exporter active (set OTEL_EXPORTER_OTLP_ENDPOINT for OTLP)`);
  }

  const provider = new BasicTracerProvider({
    resource,
    spanProcessors,
  });

  trace.setGlobalTracerProvider(provider);
  return provider;
}

/**
 * Creates a span with FerroUI standard attributes
 */
export function startSpan(
  name: string,
  options?: SpanOptions,
  ctx?: Context
): Span {
  return getTracer().startSpan(name, options, ctx);
}

/**
 * Executes a function within a span
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options?: SpanOptions,
  ctx?: Context
): Promise<T> {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, options ?? {}, ctx ?? context.active(), async (span) => {
    try {
      const result = await fn(span);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        span.recordException(error);
        span.setStatus({ code: 2, message: error.message }); // 2 = ERROR
      }
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Sets common attributes on a span
 */
export function setCommonAttributes(
  span: Span,
  attributes: {
    requestId?: string;
    userId?: string;
    promptHash?: string;
    schemaVersion?: string;
    securityInjectionDetected?: boolean;
    cacheStatus?: 'HIT' | 'MISS' | 'BYPASS';
  }
) {
  if (attributes.requestId) span.setAttribute(FerroUIAttributes.REQUEST_ID, attributes.requestId);
  
  // Security: Never send raw userId or prompt to telemetry
  if (attributes.userId) {
    span.setAttribute(FerroUIAttributes.USER_ID, `hash:${CryptoJS.SHA256(attributes.userId).toString().slice(0, 16)}`);
  }
  if (attributes.promptHash) {
    span.setAttribute(FerroUIAttributes.PROMPT_HASH, attributes.promptHash);
  }
  
  if (attributes.schemaVersion) span.setAttribute(FerroUIAttributes.SCHEMA_VERSION, attributes.schemaVersion);
  if (attributes.securityInjectionDetected !== undefined) {
    span.setAttribute(FerroUIAttributes.SECURITY_INJECTION_DETECTED, attributes.securityInjectionDetected);
  }
  if (attributes.cacheStatus) {
    span.setAttribute(FerroUIAttributes.CACHE_STATUS, attributes.cacheStatus);
  }
}
