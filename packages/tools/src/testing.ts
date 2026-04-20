import { z } from 'zod';
import { ToolDefinition, ToolContext } from './types.js';

/**
 * Creates a mock ToolContext for testing
 */
export function createMockContext(overrides: Partial<ToolContext> = {}): ToolContext {
  return {
    session: {
      id: 'test-session',
      userId: 'test-user',
      permissions: [],
      locale: 'en-US',
      ...overrides.session,
    },
    request: {
      id: 'test-request',
      prompt: 'test prompt',
      timestamp: new Date(),
      ...overrides.request,
    },
    logger: {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      ...overrides.logger,
    },
    telemetry: {
      recordEvent: () => {},
      recordMetric: () => {},
      ...overrides.telemetry,
    },
    engine: overrides.engine,
  };
}

/**
 * Executes a tool directly for testing purposes.
 * Bypasses the registry and performs validation.
 * Defined in Section 8.2 and 8.3 of the specification.
 */
export async function executeTool<TParams extends z.ZodTypeAny, TResult extends z.ZodTypeAny>(
  tool: ToolDefinition<TParams, TResult>,
  params: unknown,
  context?: Partial<ToolContext>
): Promise<z.infer<TResult>> {
  // 1. Validate parameters
  const validatedParams = tool.parameters.parse(params);

  // 2. Prepare context
  const toolContext = createMockContext(context);

  // 3. Execute tool
  const result = await tool.execute(validatedParams, toolContext);

  // 4. Validate return value
  return tool.returns.parse(result);
}
