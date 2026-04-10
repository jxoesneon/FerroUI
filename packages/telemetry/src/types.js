"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelinePhase = exports.AlloyMetrics = exports.AlloyAttributes = void 0;
/**
 * Attribute keys for Alloy UI telemetry as defined in docs/ops/Observability_Telemetry_Dictionary.md
 */
var AlloyAttributes;
(function (AlloyAttributes) {
    AlloyAttributes["REQUEST_ID"] = "request.id";
    AlloyAttributes["USER_ID"] = "user.id";
    AlloyAttributes["PROMPT_HASH"] = "prompt.hash";
    AlloyAttributes["SCHEMA_VERSION"] = "schema.version";
    AlloyAttributes["PROVIDER_ID"] = "provider.id";
    AlloyAttributes["PROVIDER_MODEL"] = "provider.model";
    AlloyAttributes["PHASE_LATENCY_MS"] = "phase.latency_ms";
    AlloyAttributes["REPAIR_ATTEMPTS"] = "repair.attempts";
    AlloyAttributes["CACHE_HIT"] = "cache.hit";
    AlloyAttributes["TOOL_NAME"] = "tool.name";
    AlloyAttributes["TOOL_DURATION_MS"] = "tool.duration_ms";
    AlloyAttributes["TOOL_SUCCESS"] = "tool.success";
    AlloyAttributes["COMPONENT_COUNT"] = "component.count";
    AlloyAttributes["TOKEN_INPUT"] = "token.input";
    AlloyAttributes["TOKEN_OUTPUT"] = "token.output";
})(AlloyAttributes || (exports.AlloyAttributes = AlloyAttributes = {}));
/**
 * Metric names for Alloy UI
 */
var AlloyMetrics;
(function (AlloyMetrics) {
    // System Metrics
    AlloyMetrics["REQUESTS_TOTAL"] = "alloy.requests.total";
    AlloyMetrics["REQUESTS_DURATION"] = "alloy.requests.duration";
    AlloyMetrics["REQUESTS_ERRORS"] = "alloy.requests.errors";
    AlloyMetrics["CACHE_HITS"] = "alloy.cache.hits";
    AlloyMetrics["CACHE_MISSES"] = "alloy.cache.misses";
    AlloyMetrics["CACHE_HIT_RATE"] = "alloy.cache.hit_rate";
    // LLM Metrics
    AlloyMetrics["LLM_CALLS"] = "alloy.llm.calls";
    AlloyMetrics["LLM_DURATION"] = "alloy.llm.duration";
    AlloyMetrics["LLM_TOKENS_INPUT"] = "alloy.llm.tokens.input";
    AlloyMetrics["LLM_TOKENS_OUTPUT"] = "alloy.llm.tokens.output";
    AlloyMetrics["LLM_COST"] = "alloy.llm.cost";
    // Tool Metrics
    AlloyMetrics["TOOLS_CALLS"] = "alloy.tools.calls";
    AlloyMetrics["TOOLS_DURATION"] = "alloy.tools.duration";
    AlloyMetrics["TOOLS_ERRORS"] = "alloy.tools.errors";
    AlloyMetrics["TOOLS_TIMEOUT"] = "alloy.tools.timeout";
    // Validation Metrics
    AlloyMetrics["VALIDATION_TOTAL"] = "alloy.validation.total";
    AlloyMetrics["VALIDATION_FAILED"] = "alloy.validation.failed";
    AlloyMetrics["VALIDATION_REPAIRS"] = "alloy.validation.repairs";
    AlloyMetrics["VALIDATION_HALLUCINATIONS"] = "alloy.validation.hallucinations";
})(AlloyMetrics || (exports.AlloyMetrics = AlloyMetrics = {}));
/**
 * Pipeline phase names
 */
var PipelinePhase;
(function (PipelinePhase) {
    PipelinePhase["CONTEXT_RESOLUTION"] = "context_resolution";
    PipelinePhase["DATA_GATHERING"] = "phase1_data_gathering";
    PipelinePhase["UI_GENERATION"] = "phase2_ui_generation";
    PipelinePhase["VALIDATION"] = "validation";
    PipelinePhase["SELF_HEALING"] = "self_healing";
    PipelinePhase["STREAM_DELIVERY"] = "stream_delivery";
})(PipelinePhase || (exports.PipelinePhase = PipelinePhase = {}));
