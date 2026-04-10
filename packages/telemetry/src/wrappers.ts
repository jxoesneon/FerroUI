import { Span, Attributes } from '@opentelemetry/api';
import { withSpan } from './tracer';
import { alloyMetrics } from './metrics';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AlloyAttributes, LlmCallInfo, ToolCallInfo, PipelinePhase } from './types';

/**
 * Wraps an LLM call with instrumentation
 */
export async function withLlmCall<T>(
  info: LlmCallInfo,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  return withSpan('llm_call', async (span) => {
    span.setAttribute(AlloyAttributes.PROVIDER_ID, info.providerId);
    span.setAttribute(AlloyAttributes.PROVIDER_MODEL, info.model);

    try {
      const result = await fn(span);
      
      // If result contains token info, we should record it. 
      // This might need to be passed back from the fn.
      return result;
    } finally {
      const durationMs = Date.now() - startTime;
      const attributes: Attributes = {
        [AlloyAttributes.PROVIDER_ID]: info.providerId,
        [AlloyAttributes.PROVIDER_MODEL]: info.model,
      };

      alloyMetrics.llmCalls.add(1, attributes);
      alloyMetrics.llmDuration.record(durationMs, attributes);
      
      if (info.tokenInput) {
        span.setAttribute(AlloyAttributes.TOKEN_INPUT, info.tokenInput);
        alloyMetrics.llmTokensInput.add(info.tokenInput, attributes);
      }
      if (info.tokenOutput) {
        span.setAttribute(AlloyAttributes.TOKEN_OUTPUT, info.tokenOutput);
        alloyMetrics.llmTokensOutput.add(info.tokenOutput, attributes);
      }
      if (info.cost) {
        alloyMetrics.llmCost.add(info.cost, attributes);
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
    span.setAttribute(AlloyAttributes.TOOL_NAME, toolName);

    try {
      const result = await fn(span);
      span.setAttribute(AlloyAttributes.TOOL_SUCCESS, true);
      return result;
    } catch (error) {
      span.setAttribute(AlloyAttributes.TOOL_SUCCESS, false);
      alloyMetrics.toolsErrors.add(1, { [AlloyAttributes.TOOL_NAME]: toolName });
      throw error;
    } finally {
      const durationMs = Date.now() - startTime;
      const attributes: Attributes = { [AlloyAttributes.TOOL_NAME]: toolName };
      
      span.setAttribute(AlloyAttributes.TOOL_DURATION_MS, durationMs);
      alloyMetrics.toolsCalls.add(1, attributes);
      alloyMetrics.toolsDuration.record(durationMs, attributes);
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
      span.setAttribute(AlloyAttributes.REQUEST_ID, requestId);
    }

    try {
      return await fn(span);
    } finally {
      const durationMs = Date.now() - startTime;
      span.setAttribute(AlloyAttributes.PHASE_LATENCY_MS, durationMs);
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
  alloyMetrics.validationTotal.add(1);
  if (!success) {
    alloyMetrics.validationFailed.add(1);
  }
  if (hallucinations > 0) {
    alloyMetrics.validationHallucinations.add(hallucinations);
  }
  if (repairAttempts > 0) {
    alloyMetrics.validationRepairs.add(repairAttempts);
  }
}
