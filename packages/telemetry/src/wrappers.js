"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withLlmCall = withLlmCall;
exports.withToolCall = withToolCall;
exports.withPipelinePhase = withPipelinePhase;
exports.recordValidation = recordValidation;
const tracer_1 = require("./tracer");
const metrics_1 = require("./metrics");
const types_1 = require("./types");
/**
 * Wraps an LLM call with instrumentation
 */
async function withLlmCall(info, fn) {
    const startTime = Date.now();
    return (0, tracer_1.withSpan)('llm_call', async (span) => {
        span.setAttribute(types_1.AlloyAttributes.PROVIDER_ID, info.providerId);
        span.setAttribute(types_1.AlloyAttributes.PROVIDER_MODEL, info.model);
        try {
            const result = await fn(span);
            // If result contains token info, we should record it. 
            // This might need to be passed back from the fn.
            return result;
        }
        finally {
            const durationMs = Date.now() - startTime;
            const attributes = {
                [types_1.AlloyAttributes.PROVIDER_ID]: info.providerId,
                [types_1.AlloyAttributes.PROVIDER_MODEL]: info.model,
            };
            metrics_1.alloyMetrics.llmCalls.add(1, attributes);
            metrics_1.alloyMetrics.llmDuration.record(durationMs, attributes);
            if (info.tokenInput) {
                span.setAttribute(types_1.AlloyAttributes.TOKEN_INPUT, info.tokenInput);
                metrics_1.alloyMetrics.llmTokensInput.add(info.tokenInput, attributes);
            }
            if (info.tokenOutput) {
                span.setAttribute(types_1.AlloyAttributes.TOKEN_OUTPUT, info.tokenOutput);
                metrics_1.alloyMetrics.llmTokensOutput.add(info.tokenOutput, attributes);
            }
            if (info.cost) {
                metrics_1.alloyMetrics.llmCost.add(info.cost, attributes);
            }
        }
    });
}
/**
 * Wraps a tool execution with instrumentation
 */
async function withToolCall(toolName, fn) {
    const startTime = Date.now();
    return (0, tracer_1.withSpan)(`tool_call (${toolName})`, async (span) => {
        span.setAttribute(types_1.AlloyAttributes.TOOL_NAME, toolName);
        try {
            const result = await fn(span);
            span.setAttribute(types_1.AlloyAttributes.TOOL_SUCCESS, true);
            return result;
        }
        catch (error) {
            span.setAttribute(types_1.AlloyAttributes.TOOL_SUCCESS, false);
            metrics_1.alloyMetrics.toolsErrors.add(1, { [types_1.AlloyAttributes.TOOL_NAME]: toolName });
            throw error;
        }
        finally {
            const durationMs = Date.now() - startTime;
            const attributes = { [types_1.AlloyAttributes.TOOL_NAME]: toolName };
            span.setAttribute(types_1.AlloyAttributes.TOOL_DURATION_MS, durationMs);
            metrics_1.alloyMetrics.toolsCalls.add(1, attributes);
            metrics_1.alloyMetrics.toolsDuration.record(durationMs, attributes);
        }
    });
}
/**
 * Wraps a pipeline phase with instrumentation
 */
async function withPipelinePhase(phase, fn, requestId) {
    const startTime = Date.now();
    return (0, tracer_1.withSpan)(phase, async (span) => {
        if (requestId) {
            span.setAttribute(types_1.AlloyAttributes.REQUEST_ID, requestId);
        }
        try {
            return await fn(span);
        }
        finally {
            const durationMs = Date.now() - startTime;
            span.setAttribute(types_1.AlloyAttributes.PHASE_LATENCY_MS, durationMs);
        }
    });
}
/**
 * Records validation results
 */
function recordValidation(success, hallucinations = 0, repairAttempts = 0) {
    metrics_1.alloyMetrics.validationTotal.add(1);
    if (!success) {
        metrics_1.alloyMetrics.validationFailed.add(1);
    }
    if (hallucinations > 0) {
        metrics_1.alloyMetrics.validationHallucinations.add(hallucinations);
    }
    if (repairAttempts > 0) {
        metrics_1.alloyMetrics.validationRepairs.add(repairAttempts);
    }
}
