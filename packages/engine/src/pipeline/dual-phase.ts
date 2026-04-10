import { LlmProvider } from '../providers/base';
import { RequestContext, EngineChunk, LlmRequest } from '../types';
import { getToolsForUser, executeTool } from '@alloy/tools';
import { validateLayout } from '@alloy/schema';
import { repairLayout } from '../validation/repair';
import { semanticCache } from '../cache/semantic-cache';

export async function* runDualPhasePipeline(
  provider: LlmProvider,
  prompt: string,
  context: RequestContext,
  config: { maxRepairAttempts: number; cacheEnabled: boolean }
): AsyncGenerator<EngineChunk, void, undefined> {
  
  // 1. CONTEXT RESOLUTION (Already passed in context)
  yield { type: 'phase', phase: 1, content: 'Starting Phase 1: Data Gathering' };

  const availableTools = getToolsForUser(context.permissions);
  const toolManifest = JSON.stringify(availableTools, null, 2);

  // 2. PHASE 1: DATA GATHERING
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
  } catch (err) {
    // If phase 1 fails to return valid JSON, we'll try to proceed without tool data
    // or we could retry. For now, we proceed with empty tools.
  }

  const toolOutputs: Record<string, any> = {};
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
        logger: console as any, // Placeholder
        telemetry: {
          recordEvent: () => {},
          recordMetric: () => {}
        }
      });
      toolOutputs[call.name] = result;
      yield { type: 'tool_output', toolOutput: { name: call.name, result } };
    } catch (err) {
      toolOutputs[call.name] = { error: err instanceof Error ? err.message : String(err) };
      yield { type: 'tool_output', toolOutput: { name: call.name, result: toolOutputs[call.name] } };
    }
  }

  // 3. CACHE CHECK
  if (config.cacheEnabled) {
    const cachedLayout = await semanticCache.get(prompt, context.permissions, toolOutputs);
    if (cachedLayout) {
      yield { type: 'layout_chunk', layout: cachedLayout };
      yield { type: 'complete', content: 'Layout served from semantic cache' };
      return;
    }
  }

  // 4. PHASE 2: UI GENERATION
  yield { type: 'phase', phase: 2, content: 'Starting Phase 2: UI Generation' };

  const phase2SystemPrompt = `
# Alloy UI - Phase 2: UI Generation

You are a UI layout engine. Use the following data to generate a valid AlloyLayout.

## DATA CONTEXT
${JSON.stringify(toolOutputs, null, 2)}

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
    // We could attempt to send partial layout chunks here, 
    // but for reliability we'll validate the full layout first.
    yield { type: 'layout_chunk', content: chunk }; 
  }

  // 5. VALIDATION & SELF-HEALING
  let layoutJson: any;
  try {
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    layoutJson = JSON.parse(jsonMatch ? jsonMatch[0] : fullContent);
  } catch (err) {
    layoutJson = null;
  }

  if (!layoutJson) {
     // Trigger initial repair if not even valid JSON
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
    await semanticCache.set(prompt, context.permissions, toolOutputs, finalLayout);
  }

  yield { type: 'layout_chunk', layout: finalLayout };
  yield { type: 'complete' };
}
