import { metrics, Meter, Counter, Histogram, Attributes } from '@opentelemetry/api';
import { AlloyMetrics } from './types';

const INSTRUMENTATION_NAME = '@alloy/telemetry';
const INSTRUMENTATION_VERSION = '0.1.0';

/**
 * Returns the Alloy UI meter
 */
export function getMeter(): Meter {
  return metrics.getMeter(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION);
}

/**
 * Common metrics registry
 */
class MetricsRegistry {
  private static instance: MetricsRegistry;
  private meter: Meter;

  // System Metrics
  public readonly requestsTotal: Counter;
  public readonly requestsDuration: Histogram;
  public readonly requestsErrors: Counter;
  public readonly cacheHits: Counter;
  public readonly cacheMisses: Counter;

  // LLM Metrics
  public readonly llmCalls: Counter;
  public readonly llmDuration: Histogram;
  public readonly llmTokensInput: Counter;
  public readonly llmTokensOutput: Counter;
  public readonly llmCost: Counter;

  // Tool Metrics
  public readonly toolsCalls: Counter;
  public readonly toolsDuration: Histogram;
  public readonly toolsErrors: Counter;
  public readonly toolsTimeout: Counter;

  // Validation Metrics
  public readonly validationTotal: Counter;
  public readonly validationFailed: Counter;
  public readonly validationRepairs: Counter;
  public readonly validationHallucinations: Counter;

  private constructor() {
    this.meter = getMeter();

    this.requestsTotal = this.meter.createCounter(AlloyMetrics.REQUESTS_TOTAL, { description: 'Total requests' });
    this.requestsDuration = this.meter.createHistogram(AlloyMetrics.REQUESTS_DURATION, { unit: 'ms', description: 'Request duration' });
    this.requestsErrors = this.meter.createCounter(AlloyMetrics.REQUESTS_ERRORS, { description: 'Error count' });
    this.cacheHits = this.meter.createCounter(AlloyMetrics.CACHE_HITS, { description: 'Cache hits' });
    this.cacheMisses = this.meter.createCounter(AlloyMetrics.CACHE_MISSES, { description: 'Cache misses' });

    this.llmCalls = this.meter.createCounter(AlloyMetrics.LLM_CALLS, { description: 'LLM API calls' });
    this.llmDuration = this.meter.createHistogram(AlloyMetrics.LLM_DURATION, { unit: 'ms', description: 'LLM response time' });
    this.llmTokensInput = this.meter.createCounter(AlloyMetrics.LLM_TOKENS_INPUT, { description: 'Input tokens' });
    this.llmTokensOutput = this.meter.createCounter(AlloyMetrics.LLM_TOKENS_OUTPUT, { description: 'Output tokens' });
    this.llmCost = this.meter.createCounter(AlloyMetrics.LLM_COST, { description: 'Estimated cost', unit: 'USD' });

    this.toolsCalls = this.meter.createCounter(AlloyMetrics.TOOLS_CALLS, { description: 'Tool executions' });
    this.toolsDuration = this.meter.createHistogram(AlloyMetrics.TOOLS_DURATION, { unit: 'ms', description: 'Tool execution time' });
    this.toolsErrors = this.meter.createCounter(AlloyMetrics.TOOLS_ERRORS, { description: 'Tool errors' });
    this.toolsTimeout = this.meter.createCounter(AlloyMetrics.TOOLS_TIMEOUT, { description: 'Tool timeouts' });

    this.validationTotal = this.meter.createCounter(AlloyMetrics.VALIDATION_TOTAL, { description: 'Total validations' });
    this.validationFailed = this.meter.createCounter(AlloyMetrics.VALIDATION_FAILED, { description: 'Failed validations' });
    this.validationRepairs = this.meter.createCounter(AlloyMetrics.VALIDATION_REPAIRS, { description: 'Repair attempts' });
    this.validationHallucinations = this.meter.createCounter(AlloyMetrics.VALIDATION_HALLUCINATIONS, { description: 'Component hallucinations' });
  }

  public static getInstance(): MetricsRegistry {
    if (!MetricsRegistry.instance) {
      MetricsRegistry.instance = new MetricsRegistry();
    }
    return MetricsRegistry.instance;
  }
}

/**
 * Access the metrics registry
 */
export const alloyMetrics = MetricsRegistry.getInstance();

/**
 * Helper to record request start
 */
export function recordRequest(attributes: Attributes = {}) {
  alloyMetrics.requestsTotal.add(1, attributes);
}

/**
 * Helper to record request duration and success/failure
 */
export function recordRequestCompletion(durationMs: number, success: boolean, attributes: Attributes = {}) {
  alloyMetrics.requestsDuration.record(durationMs, attributes);
  if (!success) {
    alloyMetrics.requestsErrors.add(1, attributes);
  }
}

/**
 * In-memory counters for cache hit rate computation — Observability spec §4.4
 */
let cacheHits = 0;
let cacheMisses = 0;

export function recordCacheHit() { cacheHits++; alloyMetrics.cacheHits.add(1); }
export function recordCacheMiss() { cacheMisses++; alloyMetrics.cacheMisses.add(1); }

export function getCacheHitRate(): number {
  const total = cacheHits + cacheMisses;
  return total === 0 ? 0 : cacheHits / total;
}

/**
 * Returns metrics in Prometheus text exposition format.
 * Used by the /metrics endpoint.
 */
export function getPrometheusMetrics(): string {
  const lines: string[] = [];
  lines.push(`# HELP alloy_cache_hit_rate Ratio of cache hits to total lookups`);
  lines.push(`# TYPE alloy_cache_hit_rate gauge`);
  lines.push(`alloy_cache_hit_rate ${getCacheHitRate().toFixed(4)}`);
  lines.push(`# HELP alloy_cache_hits_total Total cache hits`);
  lines.push(`# TYPE alloy_cache_hits_total counter`);
  lines.push(`alloy_cache_hits_total ${cacheHits}`);
  lines.push(`# HELP alloy_cache_misses_total Total cache misses`);
  lines.push(`# TYPE alloy_cache_misses_total counter`);
  lines.push(`alloy_cache_misses_total ${cacheMisses}`);
  return lines.join('\n') + '\n';
}
