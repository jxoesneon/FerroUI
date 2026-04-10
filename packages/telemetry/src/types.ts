/**
 * Attribute keys for Alloy UI telemetry as defined in docs/ops/Observability_Telemetry_Dictionary.md
 */
export enum AlloyAttributes {
  REQUEST_ID = 'request.id',
  USER_ID = 'user.id',
  PROMPT_HASH = 'prompt.hash',
  SCHEMA_VERSION = 'schema.version',
  PROVIDER_ID = 'provider.id',
  PROVIDER_MODEL = 'provider.model',
  PHASE_LATENCY_MS = 'phase.latency_ms',
  REPAIR_ATTEMPTS = 'repair.attempts',
  CACHE_HIT = 'cache.hit',
  TOOL_NAME = 'tool.name',
  TOOL_DURATION_MS = 'tool.duration_ms',
  TOOL_SUCCESS = 'tool.success',
  COMPONENT_COUNT = 'component.count',
  TOKEN_INPUT = 'token.input',
  TOKEN_OUTPUT = 'token.output',
}

/**
 * Metric names for Alloy UI
 */
export enum AlloyMetrics {
  // System Metrics
  REQUESTS_TOTAL = 'alloy.requests.total',
  REQUESTS_DURATION = 'alloy.requests.duration',
  REQUESTS_ERRORS = 'alloy.requests.errors',
  CACHE_HITS = 'alloy.cache.hits',
  CACHE_MISSES = 'alloy.cache.misses',
  CACHE_HIT_RATE = 'alloy.cache.hit_rate',

  // LLM Metrics
  LLM_CALLS = 'alloy.llm.calls',
  LLM_DURATION = 'alloy.llm.duration',
  LLM_TOKENS_INPUT = 'alloy.llm.tokens.input',
  LLM_TOKENS_OUTPUT = 'alloy.llm.tokens.output',
  LLM_COST = 'alloy.llm.cost',

  // Tool Metrics
  TOOLS_CALLS = 'alloy.tools.calls',
  TOOLS_DURATION = 'alloy.tools.duration',
  TOOLS_ERRORS = 'alloy.tools.errors',
  TOOLS_TIMEOUT = 'alloy.tools.timeout',

  // Validation Metrics
  VALIDATION_TOTAL = 'alloy.validation.total',
  VALIDATION_FAILED = 'alloy.validation.failed',
  VALIDATION_REPAIRS = 'alloy.validation.repairs',
  VALIDATION_HALLUCINATIONS = 'alloy.validation.hallucinations',
}

/**
 * Pipeline phase names
 */
export enum PipelinePhase {
  CONTEXT_RESOLUTION = 'context_resolution',
  DATA_GATHERING = 'phase1_data_gathering',
  UI_GENERATION = 'phase2_ui_generation',
  VALIDATION = 'validation',
  SELF_HEALING = 'self_healing',
  STREAM_DELIVERY = 'stream_delivery',
}

/**
 * LLM Call info for instrumentation
 */
export interface LlmCallInfo {
  providerId: string;
  model: string;
  tokenInput?: number;
  tokenOutput?: number;
  cost?: number;
}

/**
 * Tool execution info for instrumentation
 */
export interface ToolCallInfo {
  name: string;
  success: boolean;
  durationMs: number;
}
