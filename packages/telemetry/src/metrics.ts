import { metrics, Meter, Counter, Histogram as OTelHistogram, Attributes } from '@opentelemetry/api';
import { FerroUIMetrics } from './types.js';
import { Registry, Counter as PromCounter, Histogram as PromHistogram, Gauge as PromGauge } from 'prom-client';

const INSTRUMENTATION_NAME = '@ferroui/telemetry';
const INSTRUMENTATION_VERSION = '0.1.0';

/**
 * Prometheus registry for prom-client
 */
const promRegistry = new Registry();

/**
 * prom-client metrics (shadowing OTel for /metrics endpoint)
 */
const promRequestsDuration = new PromHistogram({
  name: 'ferroui_requests_duration',
  help: 'Total request duration in milliseconds',
  registers: [promRegistry],
  buckets: [100, 250, 500, 1000, 2500, 5000, 10000],
});

const promCacheHits = new PromCounter({
  name: 'ferroui_cache_hits',
  help: 'Total number of cache hits',
  registers: [promRegistry],
});

const promCacheMisses = new PromCounter({
  name: 'ferroui_cache_misses',
  help: 'Total number of cache misses',
  registers: [promRegistry],
});

const promCacheHitRate = new PromGauge({
  name: 'ferroui_cache_hit_rate',
  help: 'Ratio of cache hits to total lookups',
  registers: [promRegistry],
});

/**
 * Returns the FerroUI meter
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
  public readonly requestsDuration: OTelHistogram;
  public readonly requestsErrors: Counter;
  public readonly cacheHits: Counter;
  public readonly cacheMisses: Counter;

  // LLM Metrics
  public readonly llmCalls: Counter;
  public readonly llmDuration: OTelHistogram;
  public readonly llmTokensInput: Counter;
  public readonly llmTokensOutput: Counter;
  public readonly llmCost: Counter;

  // Tool Metrics
  public readonly toolsCalls: Counter;
  public readonly toolsDuration: OTelHistogram;
  public readonly toolsErrors: Counter;
  public readonly toolsTimeout: Counter;

  // Validation Metrics
  public readonly validationTotal: Counter;
  public readonly validationFailed: Counter;
  public readonly validationRepairs: Counter;
  public readonly validationHallucinations: Counter;

  private constructor() {
    this.meter = getMeter();

    this.requestsTotal = this.meter.createCounter(FerroUIMetrics.REQUESTS_TOTAL, { description: 'Total requests' });
    this.requestsDuration = this.meter.createHistogram(FerroUIMetrics.REQUESTS_DURATION, { unit: 'ms', description: 'Request duration' });
    this.requestsErrors = this.meter.createCounter(FerroUIMetrics.REQUESTS_ERRORS, { description: 'Error count' });
    this.cacheHits = this.meter.createCounter(FerroUIMetrics.CACHE_HITS, { description: 'Cache hits' });
    this.cacheMisses = this.meter.createCounter(FerroUIMetrics.CACHE_MISSES, { description: 'Cache misses' });

    this.llmCalls = this.meter.createCounter(FerroUIMetrics.LLM_CALLS, { description: 'LLM API calls' });
    this.llmDuration = this.meter.createHistogram(FerroUIMetrics.LLM_DURATION, { unit: 'ms', description: 'LLM response time' });
    this.llmTokensInput = this.meter.createCounter(FerroUIMetrics.LLM_TOKENS_INPUT, { description: 'Input tokens' });
    this.llmTokensOutput = this.meter.createCounter(FerroUIMetrics.LLM_TOKENS_OUTPUT, { description: 'Output tokens' });
    this.llmCost = this.meter.createCounter(FerroUIMetrics.LLM_COST, { description: 'Estimated cost', unit: 'USD' });

    this.toolsCalls = this.meter.createCounter(FerroUIMetrics.TOOLS_CALLS, { description: 'Tool executions' });
    this.toolsDuration = this.meter.createHistogram(FerroUIMetrics.TOOLS_DURATION, { unit: 'ms', description: 'Tool execution time' });
    this.toolsErrors = this.meter.createCounter(FerroUIMetrics.TOOLS_ERRORS, { description: 'Tool errors' });
    this.toolsTimeout = this.meter.createCounter(FerroUIMetrics.TOOLS_TIMEOUT, { description: 'Tool timeouts' });

    this.validationTotal = this.meter.createCounter(FerroUIMetrics.VALIDATION_TOTAL, { description: 'Total validations' });
    this.validationFailed = this.meter.createCounter(FerroUIMetrics.VALIDATION_FAILED, { description: 'Failed validations' });
    this.validationRepairs = this.meter.createCounter(FerroUIMetrics.VALIDATION_REPAIRS, { description: 'Repair attempts' });
    this.validationHallucinations = this.meter.createCounter(FerroUIMetrics.VALIDATION_HALLUCINATIONS, { description: 'Component hallucinations' });
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
export const ferrouiMetrics = MetricsRegistry.getInstance();

/**
 * Helper to record request start
 */
export function recordRequest(attributes: Attributes = {}) {
  ferrouiMetrics.requestsTotal.add(1, attributes);
}

/**
 * Helper to record request duration and success/failure
 */
export function recordRequestCompletion(durationMs: number, success: boolean, attributes: Attributes = {}) {
  ferrouiMetrics.requestsDuration.record(durationMs, attributes);
  promRequestsDuration.observe(durationMs);
  if (!success) {
    ferrouiMetrics.requestsErrors.add(1, attributes);
  }
}

/**
 * In-memory counters for cache hit rate computation — Observability spec §4.4
 */
let cacheHits = 0;
let cacheMisses = 0;

function updateCacheHitRate() {
  const total = cacheHits + cacheMisses;
  const rate = total === 0 ? 0 : cacheHits / total;
  promCacheHitRate.set(rate);
}

export function recordCacheHit() { 
  cacheHits++; 
  ferrouiMetrics.cacheHits.add(1); 
  promCacheHits.inc();
  updateCacheHitRate();
}

export function recordCacheMiss() { 
  cacheMisses++; 
  ferrouiMetrics.cacheMisses.add(1); 
  promCacheMisses.inc();
  updateCacheHitRate();
}

export function getCacheHitRate(): number {
  const total = cacheHits + cacheMisses;
  return total === 0 ? 0 : cacheHits / total;
}

/**
 * Returns metrics in Prometheus text exposition format.
 * Used by the /metrics endpoint.
 */
export async function getPrometheusMetrics(): Promise<string> {
  return promRegistry.metrics();
}
