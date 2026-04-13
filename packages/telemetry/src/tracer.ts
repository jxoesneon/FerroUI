import { trace, Tracer, Span, SpanOptions, Context, context } from '@opentelemetry/api';
import { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { AlloyAttributes } from './types';

const INSTRUMENTATION_NAME = '@alloy/telemetry';
const INSTRUMENTATION_VERSION = '0.1.0';

/**
 * Returns the Alloy UI tracer
 */
export function getTracer(): Tracer {
  return trace.getTracer(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION);
}

/**
 * Default Alloy UI tracer
 */
export const tracer = getTracer();

/**
 * Initializes the telemetry SDK with a console exporter
 */
export function initializeTelemetry(serviceName: string = 'alloy-ui') {
  const spanProcessors: SpanProcessor[] = [];
  
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (otlpEndpoint) {
    spanProcessors.push(
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` })
      )
    );
    console.log(`[Telemetry] OTLP exporter → ${otlpEndpoint}/v1/traces`);
  } else {
    spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    console.log(`[Telemetry] Console exporter active (set OTEL_EXPORTER_OTLP_ENDPOINT for OTLP)`);
  }

  const provider = new BasicTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    spanProcessors,
  });

  trace.setGlobalTracerProvider(provider);
  return provider;
}

/**
 * Creates a span with Alloy UI standard attributes
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
  }
) {
  if (attributes.requestId) span.setAttribute(AlloyAttributes.REQUEST_ID, attributes.requestId);
  if (attributes.userId) span.setAttribute(AlloyAttributes.USER_ID, attributes.userId);
  if (attributes.promptHash) span.setAttribute(AlloyAttributes.PROMPT_HASH, attributes.promptHash);
  if (attributes.schemaVersion) span.setAttribute(AlloyAttributes.SCHEMA_VERSION, attributes.schemaVersion);
}
