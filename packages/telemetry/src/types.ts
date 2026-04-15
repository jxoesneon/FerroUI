/**
 * Attribute keys for FerroUI UI telemetry as defined in docs/ops/Observability_Telemetry_Dictionary.md
 */
export enum FerroUIAttributes {
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
  SECURITY_INJECTION_DETECTED = 'security.injection_detected',
  CACHE_STATUS = 'cache.status',
}

/**
 * Metric names for FerroUI UI
 */
export enum FerroUIMetrics {
  // System Metrics
  REQUESTS_TOTAL = 'ferroui.requests.total',
  REQUESTS_DURATION = 'ferroui.requests.duration',
  REQUESTS_ERRORS = 'ferroui.requests.errors',
  CACHE_HITS = 'ferroui.cache.hits',
  CACHE_MISSES = 'ferroui.cache.misses',
  CACHE_HIT_RATE = 'ferroui.cache.hit_rate',

  // LLM Metrics
  LLM_CALLS = 'ferroui.llm.calls',
  LLM_DURATION = 'ferroui.llm.duration',
  LLM_TOKENS_INPUT = 'ferroui.llm.tokens.input',
  LLM_TOKENS_OUTPUT = 'ferroui.llm.tokens.output',
  LLM_COST = 'ferroui.llm.cost',

  // Tool Metrics
  TOOLS_CALLS = 'ferroui.tools.calls',
  TOOLS_DURATION = 'ferroui.tools.duration',
  TOOLS_ERRORS = 'ferroui.tools.errors',
  TOOLS_TIMEOUT = 'ferroui.tools.timeout',

  // Validation Metrics
  VALIDATION_TOTAL = 'ferroui.validation.total',
  VALIDATION_FAILED = 'ferroui.validation.failed',
  VALIDATION_REPAIRS = 'ferroui.validation.repairs',
  VALIDATION_HALLUCINATIONS = 'ferroui.validation.hallucinations',
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
