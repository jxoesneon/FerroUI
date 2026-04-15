import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolDefinition, ToolManifest, ToolContext } from './types';
import { ToolError } from './errors';

/**
 * Central registry for all backend tools
 */
export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();

  private constructor() {}

  /**
   * Singleton accessor for the registry
   */
  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  /**
   * Registers a new tool in the system
   */
  public register<TParams extends z.ZodTypeAny, TResult extends z.ZodTypeAny>(
    tool: ToolDefinition<TParams, TResult>
  ): ToolDefinition<TParams, TResult> {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name "${tool.name}" is already registered.`);
    }
    this.tools.set(tool.name, tool);
    return tool;
  }

  /**
   * Gets a tool by its name
   */
  public get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Returns all registered tools
   */
  public getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Clears the registry (useful for testing)
   */
  public clear(): void {
    this.tools.clear();
  }
}

/**
 * Registers a tool globally
 * Defined in Section 2.1 of the specification
 */
export function registerTool<TParams extends z.ZodTypeAny, TResult extends z.ZodTypeAny>(
  tool: ToolDefinition<TParams, TResult>
): ToolDefinition<TParams, TResult> {
  return ToolRegistry.getInstance().register(tool);
}

/**
 * Resolves the active user's permission set and returns a filtered manifest
 * Defined in Section 5.2 of the specification
 */
export function getToolsForUser(userPermissions: string[]): ToolManifest[] {
  const allTools = ToolRegistry.getInstance().getAll();
  
  // Filter tools based on permissions
  const filteredTools = allTools.filter(tool => {
    if (!tool.requiredPermissions || tool.requiredPermissions.length === 0) {
      return true;
    }
    
    // User must have ALL required permissions
    return tool.requiredPermissions.every(perm => userPermissions.includes(perm));
  });

  // Convert to manifest format for LLM
  return filteredTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: zodToJsonSchema(tool.parameters, {
      // Remove $schema and definitions if not needed for the LLM
      $refStrategy: 'none'
    })
  }));
}

/**
 * Checks if a tool is marked as sensitive
 */
export function isToolSensitive(toolName: string): boolean {
  const tool = ToolRegistry.getInstance().get(toolName);
  return tool?.sensitive === true;
}

/**
 * Safely executes a tool after validation and permission checks
 * Defined in Section 5.2 of the specification
 */
export async function executeTool(
  toolName: string,
  args: unknown,
  context: ToolContext
): Promise<any> {
  const tool = ToolRegistry.getInstance().get(toolName);
  
  if (!tool) {
    throw new ToolError('NOT_FOUND', `Tool "${toolName}" not found in registry.`);
  }

  // 1. Check Permissions
  if (tool.requiredPermissions && tool.requiredPermissions.length > 0) {
    const hasPermission = tool.requiredPermissions.every(perm => 
      context.session.permissions.includes(perm)
    );
    
    if (!hasPermission) {
      throw new ToolError('UNAUTHORIZED', `User lacks required permissions for tool "${toolName}".`);
    }
  }

  // 2. Parameter Validation
  let validatedParams: any;
  try {
    validatedParams = tool.parameters.parse(args);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ToolError('INVALID_PARAMS', 'Parameters failed validation.', error.issues);
    }
    throw new ToolError('INVALID_PARAMS', 'Parameters failed validation.');
  }

  // 3. Execution with Timeout
  const timeoutMs = tool.timeout || 3000;
  
  try {
    const result = await Promise.race([
      tool.execute(validatedParams, context),
      new Promise((_, reject) => 
        setTimeout(() => reject(new ToolError('TIMEOUT', `Tool "${toolName}" execution timed out.`)), timeoutMs)
      )
    ]);

    // 4. Validate Return Value
    return tool.returns.parse(result);
    
  } catch (error) {
    if (error instanceof ToolError) {
      throw error;
    }
    
    // Log unexpected error
    context.logger.error(`Execution error in tool "${toolName}"`, {
      error: error instanceof Error ? error.message : String(error),
      toolName,
      requestId: context.request.id
    });
    
    throw new ToolError(
      'INTERNAL_ERROR', 
      error instanceof Error ? error.message : 'Unexpected internal error.'
    );
  }
}

export type InvalidationHandler = (toolName: string, params?: any) => Promise<void>;
export type PatternInvalidationHandler = (pattern: string) => Promise<void>;

let invalidationHandler: InvalidationHandler | null = null;
let patternInvalidationHandler: PatternInvalidationHandler | null = null;

/**
 * Registers cache invalidation handlers from the engine
 */
export function registerCacheHandler(handlers: {
  invalidate: InvalidationHandler;
  invalidatePattern: PatternInvalidationHandler;
}): void {
  invalidationHandler = handlers.invalidate;
  patternInvalidationHandler = handlers.invalidatePattern;
}

/**
 * Cache invalidation
 * Based on Section 6.2 of the specification
 */
export async function invalidateCache(toolName: string, params?: any): Promise<void> {
  if (invalidationHandler) {
    await invalidationHandler(toolName, params);
  } else {
    console.warn(`invalidateCache called for "${toolName}" but no cache layer is registered.`);
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (patternInvalidationHandler) {
    await patternInvalidationHandler(pattern);
  } else {
    console.warn(`invalidateCachePattern called for "${pattern}" but no cache layer is registered.`);
  }
}
