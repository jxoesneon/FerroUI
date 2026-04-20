import { Span, Attributes } from '@opentelemetry/api';
import { withSpan } from './tracer.js';
import { ferrouiMetrics } from './metrics.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FerroUIAttributes, LlmCallInfo, ToolCallInfo, PipelinePhase } from './types.js';

/**
 * Wraps an LLM call with instrumentation
 */
export async function withLlmCall<T>(
  info: LlmCallInfo,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  return withSpan('llm_call', async (span) => {
    span.setAttribute(FerroUIAttributes.PROVIDER_ID, info.providerId);
    span.setAttribute(FerroUIAttributes.PROVIDER_MODEL, info.model);

    try {
      const result = await fn(span);
      
      // If result contains token info, we should record it. 
      // This might need to be passed back from the fn.
      return result;
    } finally {
      const durationMs = Date.now() - startTime;
      const attributes: Attributes = {
        [FerroUIAttributes.PROVIDER_ID]: info.providerId,
        [FerroUIAttributes.PROVIDER_MODEL]: info.model,
      };

      ferrouiMetrics.llmCalls.add(1, attributes);
      ferrouiMetrics.llmDuration.record(durationMs, attributes);
      
      if (info.tokenInput) {
        span.setAttribute(FerroUIAttributes.TOKEN_INPUT, info.tokenInput);
        ferrouiMetrics.llmTokensInput.add(info.tokenInput, attributes);
      }
      if (info.tokenOutput) {
        span.setAttribute(FerroUIAttributes.TOKEN_OUTPUT, info.tokenOutput);
        ferrouiMetrics.llmTokensOutput.add(info.tokenOutput, attributes);
      }
      if (info.cost) {
        ferrouiMetrics.llmCost.add(info.cost, attributes);
      }
    }
  });
}

/**
 * Wraps a tool execution with instrumentation
 */
export async function withToolCall<T>(
  toolName: string,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  return withSpan(`tool_call (${toolName})`, async (span) => {
    span.setAttribute(FerroUIAttributes.TOOL_NAME, toolName);

    try {
      const result = await fn(span);
      span.setAttribute(FerroUIAttributes.TOOL_SUCCESS, true);
      return result;
    } catch (error) {
      span.setAttribute(FerroUIAttributes.TOOL_SUCCESS, false);
      ferrouiMetrics.toolsErrors.add(1, { [FerroUIAttributes.TOOL_NAME]: toolName });
      throw error;
    } finally {
      const durationMs = Date.now() - startTime;
      const attributes: Attributes = { [FerroUIAttributes.TOOL_NAME]: toolName };
      
      span.setAttribute(FerroUIAttributes.TOOL_DURATION_MS, durationMs);
      ferrouiMetrics.toolsCalls.add(1, attributes);
      ferrouiMetrics.toolsDuration.record(durationMs, attributes);
    }
  });
}

/**
 * Wraps a pipeline phase with instrumentation
 */
export async function withPipelinePhase<T>(
  phase: PipelinePhase,
  fn: (span: Span) => Promise<T>,
  requestId?: string
): Promise<T> {
  const startTime = Date.now();
  return withSpan(phase, async (span) => {
    if (requestId) {
      span.setAttribute(FerroUIAttributes.REQUEST_ID, requestId);
    }

    try {
      return await fn(span);
    } finally {
      const durationMs = Date.now() - startTime;
      span.setAttribute(FerroUIAttributes.PHASE_LATENCY_MS, durationMs);
    }
  });
}

/**
 * Records validation results
 */
export function recordValidation(
  success: boolean,
  hallucinations: number = 0,
  repairAttempts: number = 0
) {
  ferrouiMetrics.validationTotal.add(1);
  if (!success) {
    ferrouiMetrics.validationFailed.add(1);
  }
  if (hallucinations > 0) {
    ferrouiMetrics.validationHallucinations.add(hallucinations);
  }
  if (repairAttempts > 0) {
    ferrouiMetrics.validationRepairs.add(repairAttempts);
  }
}
