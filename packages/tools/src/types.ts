import { z } from 'zod';

/**
 * Interface for Tool Session context
 * Defined in Section 4.2 of the specification
 */
export interface ToolSession {
  id: string;           // Session ID
  userId: string;       // ID of the authenticated user
  permissions: string[]; // List of user's permission identifiers
  locale: string;       // User's preferred locale (e.g., 'en-US')
}

/**
 * Interface for the Request context
 */
export interface ToolRequestInfo {
  id: string;           // Unique request/trace ID
  prompt: string;       // The original user NL prompt
  timestamp: Date;      // Timestamp when request started
}

/**
 * Generic Logger interface for tools
 */
export interface ToolLogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

/**
 * Generic Telemetry interface for tools
 * Matches patterns from @ferroui/telemetry
 */
export interface ToolTelemetry {
  recordEvent(name: string, attributes?: Record<string, string | number | boolean>): void;
  recordMetric(name: string, value: number, attributes?: Record<string, string | number | boolean>): void;
}

/**
 * Full Tool Execution context passed to the execute function
 */
export interface ToolContext {
  session: ToolSession;
  request: ToolRequestInfo;
  logger: ToolLogger;
  telemetry: ToolTelemetry;
  engine?: any; // Engine handle for system tools
}

/**
 * Configuration options for tool registration
 */
export interface ToolDefinition<TParams extends z.ZodTypeAny = any, TResult extends z.ZodTypeAny = any> {
  name: string;               // Unique name (kebab-case recommended)
  description: string;        // For the LLM context
  parameters: TParams;        // Zod schema for input parameters
  returns: TResult;           // Zod schema for return value
  ttl?: number;               // Cache TTL in seconds (0 = disabled)
  sensitive?: boolean;         // If true, bypasses semantic cache (PII protection)
  requiredPermissions?: string[]; // Permissions needed for execution
  dataClassification?: 'shared' | 'user-specific'; // Caching scope
  timeout?: number;           // Max execution time in ms
  tags?: string[];            // Categorization tags
  public?: boolean;           // Whether to include this tool in generated public documentation (default: true)
  execute: (params: z.infer<TParams>, context: ToolContext) => Promise<z.infer<TResult>>;
}

/**
 * Manifest representation of a tool for the LLM
 */
export interface ToolManifest {
  name: string;
  description: string;
  parameters: any; // JSON schema version of parameters
}
