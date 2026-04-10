"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlloyLayoutSchema = exports.AlloyComponentSchema = void 0;
exports.validateLayout = validateLayout;
const zod_1 = require("zod");
const types_1 = require("./types");
const tiers_1 = require("./tiers");
/**
 * Recursive Zod Schema for AlloyComponent
 * Defined in Section 2.2 of the specification
 */
exports.AlloyComponentSchema = zod_1.z.lazy(() => zod_1.z.object({
    type: zod_1.z.string().min(1, "Component type is required"),
    id: zod_1.z.string().optional(),
    props: zod_1.z.record(zod_1.z.unknown()).optional(),
    children: zod_1.z.array(zod_1.z.lazy(() => exports.AlloyComponentSchema)).optional(),
    action: types_1.ActionSchema.optional(),
    aria: types_1.AriaPropsSchema.optional(),
}));
/**
 * Root AlloyLayout Object
 * Defined in Section 2.1 of the specification
 */
exports.AlloyLayoutSchema = zod_1.z.object({
    schemaVersion: zod_1.z.string().regex(/^\d+\.\d+$/, "Version must be in 'x.y' format"),
    requestId: zod_1.z.string().uuid("Request ID must be a valid UUID"),
    locale: zod_1.z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Locale must be a valid BCP 47 tag"),
    layout: exports.AlloyComponentSchema,
    metadata: types_1.LayoutMetadataSchema.optional(),
}).refine((data) => data.layout.type === 'Dashboard', {
    message: "Root component must be 'Dashboard' (Rule R005)",
    path: ['layout', 'type'],
});
/**
 * Layout Validator Function
 * Implements Section 7.2 of the specification
 */
function validateLayout(layout) {
    const result = exports.AlloyLayoutSchema.safeParse(layout);
    if (!result.success) {
        return {
            valid: false,
            errors: result.error.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
                code: e.code,
            })),
        };
    }
    // Structural validation passed, now check architectural rules
    const tierErrors = (0, tiers_1.validateTiers)(result.data.layout);
    if (tierErrors.length > 0) {
        return {
            valid: false,
            errors: tierErrors.map((e) => ({
                path: e.path,
                message: e.message,
                code: 'custom',
                rule: e.rule,
            })),
        };
    }
    return { valid: true, data: result.data };
}
