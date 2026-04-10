"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutMetadataSchema = exports.ActionSchema = exports.ToolCallActionSchema = exports.RefreshActionSchema = exports.ToastActionSchema = exports.NavigateActionSchema = exports.AriaPropsSchema = exports.ComponentTier = void 0;
const zod_1 = require("zod");
/**
 * Component Tiers Definition
 * Based on Section 8.1 of the System Architecture Document
 */
var ComponentTier;
(function (ComponentTier) {
    ComponentTier["ATOM"] = "ATOM";
    ComponentTier["MOLECULE"] = "MOLECULE";
    ComponentTier["ORGANISM"] = "ORGANISM";
})(ComponentTier || (exports.ComponentTier = ComponentTier = {}));
/**
 * ARIA Accessibility Properties
 * Defined in Section 2.4 of the specification
 */
exports.AriaPropsSchema = zod_1.z.object({
    label: zod_1.z.string().optional(),
    labelledBy: zod_1.z.string().optional(),
    describedBy: zod_1.z.string().optional(),
    hidden: zod_1.z.boolean().optional(),
    live: zod_1.z.enum(['off', 'polite', 'assertive']).optional(),
    role: zod_1.z.string().optional(),
});
/**
 * Component Action Handlers
 * Defined in Section 2.3 of the specification
 */
exports.NavigateActionSchema = zod_1.z.object({
    type: zod_1.z.literal('NAVIGATE'),
    payload: zod_1.z.object({
        path: zod_1.z.string().min(1, "Navigation path must not be empty"),
        params: zod_1.z.record(zod_1.z.unknown()).optional(),
    }),
});
exports.ToastActionSchema = zod_1.z.object({
    type: zod_1.z.literal('SHOW_TOAST'),
    payload: zod_1.z.object({
        message: zod_1.z.string().min(1, "Toast message must not be empty"),
        variant: zod_1.z.enum(['info', 'success', 'warning', 'error']),
        duration: zod_1.z.number().positive().optional(),
    }),
});
exports.RefreshActionSchema = zod_1.z.object({
    type: zod_1.z.literal('REFRESH'),
    payload: zod_1.z.record(zod_1.z.never()).optional(),
});
exports.ToolCallActionSchema = zod_1.z.object({
    type: zod_1.z.literal('TOOL_CALL'),
    payload: zod_1.z.object({
        tool: zod_1.z.string().min(1, "Tool name must not be empty"),
        args: zod_1.z.record(zod_1.z.unknown()),
    }),
});
exports.ActionSchema = zod_1.z.discriminatedUnion('type', [
    exports.NavigateActionSchema,
    exports.ToastActionSchema,
    exports.RefreshActionSchema,
    exports.ToolCallActionSchema,
]);
/**
 * Layout Metadata
 * Defined in Section 2.5 of the specification
 */
exports.LayoutMetadataSchema = zod_1.z.object({
    generatedAt: zod_1.z.string().datetime({ message: "Invalid ISO 8601 timestamp" }),
    model: zod_1.z.string().optional(),
    provider: zod_1.z.string().optional(),
    latencyMs: zod_1.z.number().min(0).optional(),
    repairAttempts: zod_1.z.number().min(0).optional(),
    cacheHit: zod_1.z.boolean().optional(),
});
