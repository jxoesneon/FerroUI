"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = void 0;
exports.registerTool = registerTool;
exports.getToolsForUser = getToolsForUser;
exports.executeTool = executeTool;
exports.invalidateCache = invalidateCache;
exports.invalidateCachePattern = invalidateCachePattern;
const zod_1 = require("zod");
const zod_to_json_schema_1 = require("zod-to-json-schema");
const errors_1 = require("./errors");
/**
 * Central registry for all backend tools
 */
class ToolRegistry {
    static instance;
    tools = new Map();
    constructor() { }
    /**
     * Singleton accessor for the registry
     */
    static getInstance() {
        if (!ToolRegistry.instance) {
            ToolRegistry.instance = new ToolRegistry();
        }
        return ToolRegistry.instance;
    }
    /**
     * Registers a new tool in the system
     */
    register(tool) {
        if (this.tools.has(tool.name)) {
            throw new Error(`Tool with name "${tool.name}" is already registered.`);
        }
        this.tools.set(tool.name, tool);
    }
    /**
     * Gets a tool by its name
     */
    get(name) {
        return this.tools.get(name);
    }
    /**
     * Returns all registered tools
     */
    getAll() {
        return Array.from(this.tools.values());
    }
    /**
     * Clears the registry (useful for testing)
     */
    clear() {
        this.tools.clear();
    }
}
exports.ToolRegistry = ToolRegistry;
/**
 * Registers a tool globally
 * Defined in Section 2.1 of the specification
 */
function registerTool(tool) {
    ToolRegistry.getInstance().register(tool);
}
/**
 * Resolves the active user's permission set and returns a filtered manifest
 * Defined in Section 5.2 of the specification
 */
function getToolsForUser(userPermissions) {
    const allTools = ToolRegistry.getInstance().getAll();
    // Filter tools based on permissions
    const filteredTools = allTools.filter(tool => {
        if (!tool.requiredPermissions || tool.requiredPermissions.length === 0) {
            return true;
        }
        // User must have AT LEAST ONE of the required permissions
        return tool.requiredPermissions.some(perm => userPermissions.includes(perm));
    });
    // Convert to manifest format for LLM
    return filteredTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: (0, zod_to_json_schema_1.zodToJsonSchema)(tool.parameters, {
            // Remove $schema and definitions if not needed for the LLM
            $refStrategy: 'none'
        })
    }));
}
/**
 * Safely executes a tool after validation and permission checks
 * Defined in Section 5.2 of the specification
 */
async function executeTool(toolName, args, context) {
    const tool = ToolRegistry.getInstance().get(toolName);
    if (!tool) {
        throw new errors_1.ToolError('NOT_FOUND', `Tool "${toolName}" not found in registry.`);
    }
    // 1. Check Permissions
    if (tool.requiredPermissions && tool.requiredPermissions.length > 0) {
        const hasPermission = tool.requiredPermissions.some(perm => context.session.permissions.includes(perm));
        if (!hasPermission) {
            throw new errors_1.ToolError('UNAUTHORIZED', `User lacks required permissions for tool "${toolName}".`);
        }
    }
    // 2. Parameter Validation
    let validatedParams;
    try {
        validatedParams = tool.parameters.parse(args);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new errors_1.ToolError('INVALID_PARAMS', 'Parameters failed validation.', error.errors);
        }
        throw new errors_1.ToolError('INVALID_PARAMS', 'Parameters failed validation.');
    }
    // 3. Execution with Timeout
    const timeoutMs = tool.timeout || 3000;
    try {
        const result = await Promise.race([
            tool.execute(validatedParams, context),
            new Promise((_, reject) => setTimeout(() => reject(new errors_1.ToolError('TIMEOUT', `Tool "${toolName}" execution timed out.`)), timeoutMs))
        ]);
        // 4. Validate Return Value
        return tool.returns.parse(result);
    }
    catch (error) {
        if (error instanceof errors_1.ToolError) {
            throw error;
        }
        // Log unexpected error
        context.logger.error(`Execution error in tool "${toolName}"`, {
            error: error instanceof Error ? error.message : String(error),
            toolName,
            requestId: context.request.id
        });
        throw new errors_1.ToolError('INTERNAL_ERROR', error instanceof Error ? error.message : 'Unexpected internal error.');
    }
}
/**
 * Cache invalidation placeholder
 * Based on Section 6.2 of the specification
 */
async function invalidateCache(toolName, params) {
    // This will be implemented by the engine's cache layer.
    // We provide the signature here for completion.
    console.warn(`invalidateCache called for "${toolName}" but no cache layer is registered.`);
}
async function invalidateCachePattern(pattern) {
    // This will be implemented by the engine's cache layer.
    console.warn(`invalidateCachePattern called for "${pattern}" but no cache layer is registered.`);
}
