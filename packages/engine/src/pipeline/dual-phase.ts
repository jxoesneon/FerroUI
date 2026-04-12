import { LlmProvider } from '../providers/base';
import { RequestContext, EngineChunk, LlmRequest } from '../types';
import { getToolsForUser, executeTool, registerCacheHandler } from '@alloy/tools';
import { validateLayout } from '@alloy/schema';
import { repairLayout } from '../validation/repair';
import { semanticCache } from '../cache/semantic-cache';
import { tracer, PipelinePhase, setCommonAttributes } from '@alloy/telemetry';
import { auditLogger, AuditEventType } from '../audit/audit-logger';
import CryptoJS from 'crypto-js';

// Link semantic cache to tool registry for invalidation
registerCacheHandler({
  invalidate: (toolName, params) => semanticCache.invalidate(toolName, params),
  invalidatePattern: (pattern) => semanticCache.invalidatePattern(pattern),
});

/**
 * Redacts common PII (email, SSN, Credit Card) from tool outputs
 */
function redactPII(text: string): string {
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
    .replace(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, '[REDACTED_CARD]');
}

/**
 * Escapes XML special characters to prevent prompt injection breakouts
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function* runDualPhasePipeline(
  provider: LlmProvider,
  prompt: string,
  context: RequestContext,
  config: { maxRepairAttempts: number; cacheEnabled: boolean }
): AsyncGenerator<EngineChunk, void, undefined> {
  
  // 1. CONTEXT RESOLUTION (Already passed in context)
  const pipelineStart = Date.now();
  yield { type: 'phase', phase: 1, content: 'Starting Phase 1: Data Gathering' };

  auditLogger.log({
    type: AuditEventType.REQUEST_START,
    requestId: context.requestId,
    userId: context.userId,
    promptHash: CryptoJS.SHA256(prompt.trim().toLowerCase()).toString(),
    permissions: context.permissions,
    locale: context.locale,
  });

  const availableTools = getToolsForUser(context.permissions);
  const toolManifest = JSON.stringify(availableTools, null, 2);

  // 2. PHASE 1: DATA GATHERING
  const phase1Span = tracer.startSpan(PipelinePhase.DATA_GATHERING);
  setCommonAttributes(phase1Span, { 
    requestId: context.requestId, 
    userId: context.userId 
  });

  const phase1SystemPrompt = `
# Alloy UI - Phase 1: Data Gathering

You are a data retrieval agent. Your goal is to identify and call the necessary tools 
to fulfill the user's request.

## AVAILABLE TOOLS
${toolManifest}

## INSTRUCTIONS
- Identify tools that provide data for the request.
- Output ONLY tool calls in JSON format: {"toolCalls": [{"name": "...", "args": {...}}]}
- Do not provide a final answer.
- Do not explain your reasoning.
- If no tools are needed, return an empty array of tool calls.
`;

  const phase1Request: LlmRequest = {
    systemPrompt: phase1SystemPrompt,
    userPrompt: prompt,
    temperature: 0,
  };

  const phase1Response = await provider.completePrompt(phase1Request);
  
  let toolCalls: any[] = [];
  try {
    const parsed = JSON.parse(phase1Response.content);
    toolCalls = parsed.toolCalls || [];
  } catch {
    // If phase 1 fails to return valid JSON, we'll try to proceed without tool data
  }

  const toolOutputs: Record<string, any> = {};
  const cacheToolOutputs: Record<string, any> = {};

  for (const call of toolCalls) {
    yield { type: 'tool_call', toolCall: { name: call.name, args: call.args } };
    try {
      const result = await executeTool(call.name, call.args, {
        session: { 
          id: context.requestId, 
          userId: context.userId, 
          permissions: context.permissions, 
          locale: context.locale 
        },
        request: { 
          id: context.requestId, 
          prompt: prompt, 
          timestamp: new Date() 
        },
        logger: console as any,
        telemetry: {
          recordEvent: () => {},
          recordMetric: () => {}
        }
      });
      toolOutputs[call.name] = result;
      cacheToolOutputs[call.name] = { result, args: call.args };
      yield { type: 'tool_output', toolOutput: { name: call.name, result } };
      auditLogger.log({
        type: AuditEventType.TOOL_CALL,
        requestId: context.requestId,
        userId: context.userId,
        toolName: call.name,
        args: call.args as Record<string, unknown>,
        success: true,
        durationMs: 0,
      });
    } catch (err) {
      const error = { error: err instanceof Error ? err.message : String(err) };
      toolOutputs[call.name] = error;
      cacheToolOutputs[call.name] = { error, args: call.args };
      yield { type: 'tool_output', toolOutput: { name: call.name, result: toolOutputs[call.name] } };
      auditLogger.log({
        type: AuditEventType.TOOL_CALL,
        requestId: context.requestId,
        userId: context.userId,
        toolName: call.name,
        args: call.args as Record<string, unknown>,
        success: false,
        durationMs: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  phase1Span.end();

  // 3. CACHE CHECK
  if (config.cacheEnabled) {
    const cachedLayout = await semanticCache.get(prompt, context.permissions, context.userId, cacheToolOutputs);
    if (cachedLayout) {
      yield { type: 'layout_chunk', layout: cachedLayout };
      yield { type: 'complete', content: 'Layout served from semantic cache' };
      return;
    }
  }

  // 4. PHASE 2: UI GENERATION
  yield { type: 'phase', phase: 2, content: 'Starting Phase 2: UI Generation' };
  
  const phase2Span = tracer.startSpan(PipelinePhase.UI_GENERATION);
  setCommonAttributes(phase2Span, { 
    requestId: context.requestId, 
    userId: context.userId 
  });

  const processedOutputs = redactPII(JSON.stringify(toolOutputs, null, 2));
  const escapedOutputs = escapeXml(processedOutputs);

  const phase2SystemPrompt = `
# Alloy UI - Phase 2: UI Generation

You are a UI layout engine. Use the following data to generate a valid AlloyLayout.

## DATA CONTEXT
<data_context>
${escapedOutputs}
</data_context>

## AVAILABLE COMPONENTS
(Assuming standard set from SOP)

## INSTRUCTIONS
- Output ONLY valid JSON according to AlloyLayout schema.
- Root component must be "Dashboard".
- Use the data provided above.
- Do not invent data.
- Ensure all components have "aria" props.
`;

  const phase2Request: LlmRequest = {
    systemPrompt: phase2SystemPrompt,
    userPrompt: prompt,
    temperature: 0.2,
  };

  const streamingLayout = provider.processPrompt(phase2Request);
  let fullContent = '';
  
  for await (const chunk of streamingLayout) {
    fullContent += chunk;
    yield { type: 'layout_chunk', content: chunk }; 
  }

  // 5. VALIDATION & SELF-HEALING
  let layoutJson: any;
  try {
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    layoutJson = JSON.parse(jsonMatch ? jsonMatch[0] : fullContent);
  } catch {
    layoutJson = null;
  }

  if (!layoutJson) {
     layoutJson = await repairLayout(provider, prompt, fullContent, [{
       path: 'root',
       message: 'Initial response was not valid JSON',
       code: 'invalid_json'
     }], context, 1, config.maxRepairAttempts);
  }

  const validationResult = validateLayout(layoutJson);
  let finalLayout = layoutJson;

  if (!validationResult.valid) {
    finalLayout = await repairLayout(
      provider,
      prompt,
      layoutJson,
      validationResult.errors!,
      context,
      1,
      config.maxRepairAttempts
    );
  }

  // Final success!
  if (config.cacheEnabled) {
    await semanticCache.set(prompt, context.permissions, context.userId, cacheToolOutputs, finalLayout);
  }

  phase2Span.end();

  auditLogger.log({
    type: AuditEventType.REQUEST_COMPLETE,
    requestId: context.requestId,
    userId: context.userId,
    success: true,
    durationMs: Date.now() - pipelineStart,
  });

  yield { type: 'layout_chunk', layout: finalLayout };
  yield { type: 'complete' };
}
