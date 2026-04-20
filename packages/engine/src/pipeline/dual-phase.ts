import { LlmProvider } from '../providers/base.js';
import { RequestContext, EngineChunk, EngineConfig, LlmRequest, LlmResponse } from '../types.js';
import { getToolsForUser, executeTool, registerCacheHandler, isToolSensitive, ToolLogger } from '@ferroui/tools';
import { validateLayout, FerroUILayout } from '@ferroui/schema';
import { registry } from '@ferroui/registry';
import { repairLayout } from '../validation/repair.js';
import { semanticCache } from '../cache/semantic-cache.js';
import { tracer, PipelinePhase, setCommonAttributes, withLlmCall, withToolCall, recordCacheHit, recordCacheMiss } from '@ferroui/telemetry';
import { auditLogger, AuditEventType } from '../audit/audit-logger.js';
import { checkPromptFirewall } from '../security/prompt-firewall.js';
import { dailyBudgetStore, getTenantBudget } from '../middleware/tenant-quota.js';
import { PromptLoader } from '../prompts/loader.js';
import { Signer } from '../security/signer.js';
import { getTextDirection } from '@ferroui/i18n';
import CryptoJS from 'crypto-js';

const MAX_TOOL_CALLS_PER_REQUEST = 8;
const PHASE2_ESTIMATED_OUTPUT_TOKENS = 1500;

/**
 * Interface for tool calls returned by the Phase 1 LLM
 */
interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

/**
 * Adapter for console to match ToolLogger interface
 */
const toolLogger: ToolLogger = {
  debug: (msg, ctx) => console.debug(msg, ctx ?? ''),
  info: (msg, ctx) => console.info(msg, ctx ?? ''),
  warn: (msg, ctx) => console.warn(msg, ctx ?? ''),
  error: (msg, ctx) => console.error(msg, ctx ?? ''),
};

// Link semantic cache to tool registry for invalidation
registerCacheHandler({
  invalidate: (toolName, params) => semanticCache.invalidate(toolName, params),
  invalidatePattern: (pattern) => semanticCache.invalidatePattern(pattern),
});

/**
 * Redacts common PII (email, SSN, Credit Card, IBAN, IP, Phone) from tool outputs
 */
function redactPII(text: string): string {
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
    .replace(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, '[REDACTED_CARD]')
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, '[REDACTED_IBAN]')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[REDACTED_IP]')
    .replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');
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
  initialProvider: LlmProvider,
  inputPrompt: string,
  context: RequestContext,
  config: EngineConfig
): AsyncGenerator<EngineChunk, void, undefined> {
  
  // Wrapper to allow atomic provider swapping during execution
  const providerRef = { current: initialProvider };

  // Security: Redact PII from initial user prompt before any processing
  const prompt = redactPII(inputPrompt);

  // 1. CONTEXT RESOLUTION (Already passed in context)
  const pipelineStart = Date.now();
  yield { type: 'phase', phase: 1, content: 'Starting Phase 1: Data Gathering' };

  // Security: Run prompt firewall (built-in + optional Lakera/NeMo) and block immediately
  const firewallResult = await checkPromptFirewall(prompt);
  const isSuspicious = firewallResult.blocked;
  if (isSuspicious) {
    console.warn(`[Security] Prompt blocked by ${firewallResult.provider} firewall in request ${context.requestId}: ${firewallResult.reason}`);
    dailyBudgetStore.recordSafetyEvent(context.tenantId ?? 'default');
    yield { type: 'error', error: { code: 'PROMPT_INJECTION', message: 'Potential prompt injection detected. Request blocked.', retryable: false } };
    return;
  }

  auditLogger.log({
    type: AuditEventType.REQUEST_START,
    requestId: context.requestId,
    userId: context.userId,
    promptHash: CryptoJS.SHA256(prompt.trim().toLowerCase()).toString(),
    permissions: context.permissions,
    locale: context.locale,
    tenantId: context.tenantId ?? 'default',
    isSuspicious,
  });

  const availableTools = getToolsForUser(context.permissions);
  const toolManifest = JSON.stringify(availableTools, null, 2);

  // 2. PHASE 1: DATA GATHERING
  const phase1Span = tracer.startSpan(PipelinePhase.DATA_GATHERING);
  setCommonAttributes(phase1Span, { 
    requestId: context.requestId, 
    userId: context.userId,
    securityInjectionDetected: isSuspicious
  });

  const loader = new PromptLoader();
  const phase1SystemPrompt = await loader.loadPrompt('Phase1', {
    toolManifest,
    locale: context.locale,
    direction: getTextDirection(context.locale),
    requestId: context.requestId,
  });

  const phase1Request: LlmRequest = {
    systemPrompt: phase1SystemPrompt,
    userPrompt: prompt,
    temperature: 0,
    jsonMode: true,
    enablePromptCache: true,
  };

  const phase1Response = await withLlmCall(
    { providerId: providerRef.current.id, model: providerRef.current.id },
    async () => providerRef.current.completePrompt(phase1Request),
  );

  // Task 2: Track Phase 1 cost
  const tenantId = context.tenantId ?? 'default';
  const phase1Cost = providerRef.current.estimateCost(phase1Response.tokens);
  dailyBudgetStore.incrementCents(tenantId, phase1Cost);
  
  let toolCalls: ToolCall[] = [];
  try {
    const parsed = JSON.parse(phase1Response.content);
    toolCalls = parsed.toolCalls || [];
  } catch {
    // If phase 1 fails to return valid JSON, we'll try to proceed without tool data
  }

  const toolOutputs: Record<string, any> = {};
  const cacheToolOutputs: Record<string, any> = {};
  let hasSensitiveData = false;

  // Enforce tool call budget — Security spec §2.1
  const budgetedToolCalls = toolCalls.slice(0, MAX_TOOL_CALLS_PER_REQUEST);
  if (toolCalls.length > MAX_TOOL_CALLS_PER_REQUEST) {
    yield { type: 'error', error: { code: 'TOOL_BUDGET_EXCEEDED', message: `LLM requested ${toolCalls.length} tool calls; budget is ${MAX_TOOL_CALLS_PER_REQUEST}. Truncating.`, retryable: false } };
  }

  for (const call of budgetedToolCalls) {
    if (isToolSensitive(call.name)) {
      hasSensitiveData = true;
    }
    yield { type: 'tool_call', toolCall: { name: call.name, args: call.args } };
    const toolStart = Date.now();
    try {
      const result = await withToolCall(call.name, async () => {
        return executeTool(call.name, call.args, {
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
          logger: toolLogger,
          telemetry: {
            recordEvent: () => {},
            recordMetric: () => {}
          },
          // Pass handle to swap provider if ferroui.setProvider is called
          engine: {
            setProvider: (newProvider: LlmProvider) => {
              providerRef.current = newProvider;
            }
          }
        });
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
        durationMs: Date.now() - toolStart,
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
        durationMs: Date.now() - toolStart,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 3. CACHE CHECK
  // Security: Bypass cache if sensitive data is involved or prompt is suspicious
  const shouldBypassCache = hasSensitiveData || isSuspicious;
  
  if (config.cacheEnabled && !shouldBypassCache) {
    const cachedLayout = await semanticCache.get(prompt, context.permissions, context.userId, cacheToolOutputs);
    if (cachedLayout) {
      recordCacheHit();
      setCommonAttributes(phase1Span, { 
        requestId: context.requestId, 
        userId: context.userId,
        securityInjectionDetected: isSuspicious,
        cacheStatus: 'HIT'
      });
      phase1Span.end();
      yield { type: 'layout_chunk', layout: cachedLayout };
      yield { type: 'complete', content: 'Layout served from semantic cache' };
      return;
    }
    recordCacheMiss();
  } else if (config.cacheEnabled && shouldBypassCache) {
    if (process.env.FERROUI_DEBUG === 'true') {
      console.log(`[Cache] Bypassing cache for request ${context.requestId} (Sensitive: ${hasSensitiveData}, Suspicious: ${isSuspicious})`);
    }
  }

  phase1Span.end();

  // 4. PHASE 2: UI GENERATION
  yield { type: 'phase', phase: 2, content: 'Starting Phase 2: UI Generation' };
  
  const phase2Span = tracer.startSpan(PipelinePhase.UI_GENERATION);
  setCommonAttributes(phase2Span, { 
    requestId: context.requestId, 
    userId: context.userId,
    securityInjectionDetected: isSuspicious,
    cacheStatus: shouldBypassCache ? 'BYPASS' : 'MISS'
  });

  const processedOutputs = redactPII(JSON.stringify(toolOutputs, null, 2));
  const escapedOutputs = escapeXml(processedOutputs);

  // Build component registry manifest for the LLM
  const registeredComponents = registry.getAllComponents().map(c => ({
    name: c.name,
    version: c.version,
    tier: c.tier,
    schema: c.schema.description || 'No description',
    deprecated: c.deprecated ?? false,
  }));
  const componentManifest = JSON.stringify(registeredComponents, null, 2);

  const phase2SystemPrompt = await loader.loadPrompt('Phase2', {
    toolOutputs: escapedOutputs,
    toolManifest,
    componentManifest,
    locale: context.locale,
    direction: getTextDirection(context.locale),
    requestId: context.requestId,
  });

  // Task 2: Estimate Phase 2 cost and check budget before starting
  const phase2InputEstimate = providerRef.current.estimateTokens(phase2SystemPrompt + prompt);
  const phase2CostEstimate = providerRef.current.estimateCost({
    input: phase2InputEstimate,
    output: PHASE2_ESTIMATED_OUTPUT_TOKENS,
  });

  const budget = getTenantBudget(tenantId);
  const currentUsage = dailyBudgetStore.getUsage(tenantId);

  auditLogger.log({
    type: AuditEventType.COST_ESTIMATED,
    requestId: context.requestId,
    userId: context.userId,
    tenantId,
    phase: 2,
    costCents: phase2CostEstimate,
    cumulativeCostCents: currentUsage.cents,
    limitCents: budget.dailyCostLimitCents,
  });

  if (!dailyBudgetStore.checkBudget(tenantId, phase2CostEstimate)) {
    yield {
      type: 'error',
      error: {
        code: 'BUDGET_EXCEEDED',
        message: 'Insufficient daily budget to proceed with UI generation phase.',
        retryable: false,
      },
    };
    return;
  }

  const phase2Request: LlmRequest = {
    systemPrompt: phase2SystemPrompt,
    userPrompt: prompt,
    temperature: 0.2,
    jsonMode: true,
    enablePromptCache: true,
  };

  const streamingLayout = providerRef.current.processPrompt(phase2Request);
  let fullContent = '';
  let phase2Response: LlmResponse | undefined;
  
  // Use a manual iteration to capture the return value from the AsyncGenerator (token usage)
  const generator = streamingLayout;
  while (true) {
    const result = await generator.next();
    if (result.done) {
      phase2Response = result.value as LlmResponse;
      break;
    }
    const chunk = result.value as string;
    fullContent += chunk;
    yield { type: 'layout_chunk', content: chunk }; 
  }

  // Task 2: Track final actual cost for Phase 2
  if (phase2Response) {
    const phase2ActualCost = providerRef.current.estimateCost(phase2Response.tokens);
    dailyBudgetStore.incrementCents(tenantId, phase2ActualCost);
  }

  // 5. VALIDATION & SELF-HEALING
  let layoutJson: FerroUILayout | null;
  try {
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    layoutJson = JSON.parse(jsonMatch ? jsonMatch[0] : fullContent);
  } catch {
    layoutJson = null;
  }

  if (!layoutJson) {
     layoutJson = await repairLayout(providerRef.current, prompt, fullContent, [{
       path: 'root',
       message: 'Initial response was not valid JSON',
       code: 'invalid_json'
     }], context, 1, config.maxRepairAttempts) as FerroUILayout;
  }

  const validationResult = validateLayout(layoutJson);
  let finalLayout = layoutJson;

  if (!validationResult.valid) {
    finalLayout = await repairLayout(
      providerRef.current,
      prompt,
      layoutJson,
      validationResult.errors!,
      context,
      1,
      config.maxRepairAttempts
    ) as FerroUILayout;
  }

  // 6. CONTENT PROVENANCE (C2PA)
  const { privateKey, publicKey } = Signer.generateKeyPair();
  // Sign the layout WITHOUT the signature/publicKey metadata to avoid circularity
  const signature = Signer.sign(JSON.stringify(finalLayout), privateKey);
  
  finalLayout.metadata = {
    generatedAt: finalLayout.metadata?.generatedAt ?? new Date().toISOString(),
    ...finalLayout.metadata,
    signature,
    publicKey,
  };

  auditLogger.log({
    type: AuditEventType.PROVENANCE_SIGNED,
    requestId: context.requestId,
    userId: context.userId,
    signature,
    publicKey,
  });

  // Final success!
  // Security: Do not cache results containing sensitive data or from suspicious prompts
  if (config.cacheEnabled && !shouldBypassCache) {
    await semanticCache.set(prompt, context.permissions, context.userId, cacheToolOutputs, finalLayout, 'INTERNAL');
  }

  phase2Span.end();

  auditLogger.log({
    type: AuditEventType.REQUEST_COMPLETE,
    requestId: context.requestId,
    userId: context.userId,
    success: true,
    durationMs: Date.now() - pipelineStart,
    hasSensitiveData,
    isSuspicious,
  });

  yield { type: 'layout_chunk', layout: finalLayout };
  yield { type: 'complete' };
}
