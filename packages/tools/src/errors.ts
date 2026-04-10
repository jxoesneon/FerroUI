/**
 * Error codes for Tool execution failures
 * Based on Section 4.4 of the Tool Registration API Reference
 */
export type ToolErrorCode =
  | 'INVALID_PARAMS'    // Parameters failed validation
  | 'NOT_FOUND'         // Requested resource not found
  | 'UNAUTHORIZED'      // User lacks permission
  | 'TIMEOUT'           // Execution timed out
  | 'RATE_LIMITED'      // Rate limit exceeded
  | 'DEPENDENCY_ERROR'  // External service error
  | 'INTERNAL_ERROR';   // Unexpected error

/**
 * Custom Error class for tool execution
 * Extends the native Error class with specific code and optional data
 */
export class ToolError extends Error {
  public readonly code: ToolErrorCode;
  public readonly data?: unknown;

  constructor(code: ToolErrorCode, message: string, data?: unknown) {
    super(message);
    this.name = 'ToolError';
    this.code = code;
    this.data = data;
    
    // Ensure the prototype chain is correctly set up
    Object.setPrototypeOf(this, ToolError.prototype);
  }
}
