"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracer = getTracer;
exports.startSpan = startSpan;
exports.withSpan = withSpan;
exports.setCommonAttributes = setCommonAttributes;
const api_1 = require("@opentelemetry/api");
const types_1 = require("./types");
const INSTRUMENTATION_NAME = '@alloy/telemetry';
const INSTRUMENTATION_VERSION = '0.1.0';
/**
 * Returns the Alloy UI tracer
 */
function getTracer() {
    return api_1.trace.getTracer(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION);
}
/**
 * Creates a span with Alloy UI standard attributes
 */
function startSpan(name, options, ctx) {
    return getTracer().startSpan(name, options, ctx);
}
/**
 * Executes a function within a span
 */
async function withSpan(name, fn, options, ctx) {
    const tracer = getTracer();
    return tracer.startActiveSpan(name, options ?? {}, ctx ?? api_1.context.active(), async (span) => {
        try {
            const result = await fn(span);
            return result;
        }
        catch (error) {
            if (error instanceof Error) {
                span.recordException(error);
                span.setStatus({ code: 2, message: error.message }); // 2 = ERROR
            }
            throw error;
        }
        finally {
            span.end();
        }
    });
}
/**
 * Sets common attributes on a span
 */
function setCommonAttributes(span, attributes) {
    if (attributes.requestId)
        span.setAttribute(types_1.AlloyAttributes.REQUEST_ID, attributes.requestId);
    if (attributes.userId)
        span.setAttribute(types_1.AlloyAttributes.USER_ID, attributes.userId);
    if (attributes.promptHash)
        span.setAttribute(types_1.AlloyAttributes.PROMPT_HASH, attributes.promptHash);
    if (attributes.schemaVersion)
        span.setAttribute(types_1.AlloyAttributes.SCHEMA_VERSION, attributes.schemaVersion);
}
