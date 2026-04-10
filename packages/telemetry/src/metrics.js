"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alloyMetrics = void 0;
exports.getMeter = getMeter;
exports.recordRequest = recordRequest;
exports.recordRequestCompletion = recordRequestCompletion;
const api_1 = require("@opentelemetry/api");
const types_1 = require("./types");
const INSTRUMENTATION_NAME = '@alloy/telemetry';
const INSTRUMENTATION_VERSION = '0.1.0';
/**
 * Returns the Alloy UI meter
 */
function getMeter() {
    return api_1.metrics.getMeter(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION);
}
/**
 * Common metrics registry
 */
class MetricsRegistry {
    static instance;
    meter;
    // System Metrics
    requestsTotal;
    requestsDuration;
    requestsErrors;
    cacheHits;
    cacheMisses;
    // LLM Metrics
    llmCalls;
    llmDuration;
    llmTokensInput;
    llmTokensOutput;
    llmCost;
    // Tool Metrics
    toolsCalls;
    toolsDuration;
    toolsErrors;
    toolsTimeout;
    // Validation Metrics
    validationTotal;
    validationFailed;
    validationRepairs;
    validationHallucinations;
    constructor() {
        this.meter = getMeter();
        this.requestsTotal = this.meter.createCounter(types_1.AlloyMetrics.REQUESTS_TOTAL, { description: 'Total requests' });
        this.requestsDuration = this.meter.createHistogram(types_1.AlloyMetrics.REQUESTS_DURATION, { unit: 'ms', description: 'Request duration' });
        this.requestsErrors = this.meter.createCounter(types_1.AlloyMetrics.REQUESTS_ERRORS, { description: 'Error count' });
        this.cacheHits = this.meter.createCounter(types_1.AlloyMetrics.CACHE_HITS, { description: 'Cache hits' });
        this.cacheMisses = this.meter.createCounter(types_1.AlloyMetrics.CACHE_MISSES, { description: 'Cache misses' });
        this.llmCalls = this.meter.createCounter(types_1.AlloyMetrics.LLM_CALLS, { description: 'LLM API calls' });
        this.llmDuration = this.meter.createHistogram(types_1.AlloyMetrics.LLM_DURATION, { unit: 'ms', description: 'LLM response time' });
        this.llmTokensInput = this.meter.createCounter(types_1.AlloyMetrics.LLM_TOKENS_INPUT, { description: 'Input tokens' });
        this.llmTokensOutput = this.meter.createCounter(types_1.AlloyMetrics.LLM_TOKENS_OUTPUT, { description: 'Output tokens' });
        this.llmCost = this.meter.createCounter(types_1.AlloyMetrics.LLM_COST, { description: 'Estimated cost', unit: 'USD' });
        this.toolsCalls = this.meter.createCounter(types_1.AlloyMetrics.TOOLS_CALLS, { description: 'Tool executions' });
        this.toolsDuration = this.meter.createHistogram(types_1.AlloyMetrics.TOOLS_DURATION, { unit: 'ms', description: 'Tool execution time' });
        this.toolsErrors = this.meter.createCounter(types_1.AlloyMetrics.TOOLS_ERRORS, { description: 'Tool errors' });
        this.toolsTimeout = this.meter.createCounter(types_1.AlloyMetrics.TOOLS_TIMEOUT, { description: 'Tool timeouts' });
        this.validationTotal = this.meter.createCounter(types_1.AlloyMetrics.VALIDATION_TOTAL, { description: 'Total validations' });
        this.validationFailed = this.meter.createCounter(types_1.AlloyMetrics.VALIDATION_FAILED, { description: 'Failed validations' });
        this.validationRepairs = this.meter.createCounter(types_1.AlloyMetrics.VALIDATION_REPAIRS, { description: 'Repair attempts' });
        this.validationHallucinations = this.meter.createCounter(types_1.AlloyMetrics.VALIDATION_HALLUCINATIONS, { description: 'Component hallucinations' });
    }
    static getInstance() {
        if (!MetricsRegistry.instance) {
            MetricsRegistry.instance = new MetricsRegistry();
        }
        return MetricsRegistry.instance;
    }
}
/**
 * Access the metrics registry
 */
exports.alloyMetrics = MetricsRegistry.getInstance();
/**
 * Helper to record request start
 */
function recordRequest(attributes = {}) {
    exports.alloyMetrics.requestsTotal.add(1, attributes);
}
/**
 * Helper to record request duration and success/failure
 */
function recordRequestCompletion(durationMs, success, attributes = {}) {
    exports.alloyMetrics.requestsDuration.record(durationMs, attributes);
    if (!success) {
        exports.alloyMetrics.requestsErrors.add(1, attributes);
    }
}
