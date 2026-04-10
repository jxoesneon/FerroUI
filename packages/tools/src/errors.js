"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolError = void 0;
/**
 * Custom Error class for tool execution
 * Extends the native Error class with specific code and optional data
 */
class ToolError extends Error {
    code;
    data;
    constructor(code, message, data) {
        super(message);
        this.name = 'ToolError';
        this.code = code;
        this.data = data;
        // Ensure the prototype chain is correctly set up
        Object.setPrototypeOf(this, ToolError.prototype);
    }
}
exports.ToolError = ToolError;
