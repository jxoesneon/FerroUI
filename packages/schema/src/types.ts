import { z } from 'zod';

/**
 * Component Tiers Definition
 * Based on Section 8.1 of the System Architecture Document
 */
export enum ComponentTier {
  ATOM = 'ATOM',
  MOLECULE = 'MOLECULE',
  ORGANISM = 'ORGANISM',
}

/**
 * ARIA Accessibility Properties
 * Defined in Section 2.4 of the specification
 */
export const AriaPropsSchema = z.object({
  label: z.string().optional(),
  labelledBy: z.string().optional(),
  describedBy: z.string().optional(),
  hidden: z.boolean().optional(),
  live: z.enum(['off', 'polite', 'assertive']).optional(),
  role: z.string().optional(),
});

export type AriaProps = z.infer<typeof AriaPropsSchema>;

/**
 * Component Action Handlers
 * Defined in Section 2.3 of the specification
 */
export const NavigateActionSchema = z.object({
  type: z.literal('NAVIGATE'),
  payload: z.object({
    path: z.string().min(1, "Navigation path must not be empty"),
    params: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const ToastActionSchema = z.object({
  type: z.literal('SHOW_TOAST'),
  payload: z.object({
    message: z.string().min(1, "Toast message must not be empty"),
    variant: z.enum(['info', 'success', 'warning', 'error']),
    duration: z.number().positive().optional(),
  }),
});

export const RefreshActionSchema = z.object({
  type: z.literal('REFRESH'),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const ToolCallActionSchema = z.object({
  type: z.literal('TOOL_CALL'),
  payload: z.object({
    tool: z.string().min(1, "Tool name must not be empty"),
    args: z.record(z.string(), z.unknown()),
  }),
});

export const ActionSchema = z.discriminatedUnion('type', [
  NavigateActionSchema,
  ToastActionSchema,
  RefreshActionSchema,
  ToolCallActionSchema,
]);

export type Action = z.infer<typeof ActionSchema>;

/**
 * Base Component Definition
 * Defined in Section 2.2 of the specification
 */
export type AlloyComponent = {
  type: string;
  id?: string;
  props?: Record<string, unknown>;
  children?: AlloyComponent[];
  action?: Action;
  aria?: AriaProps;
};

/**
 * Layout Metadata
 * Defined in Section 2.5 of the specification
 */
export const LayoutMetadataSchema = z.object({
  generatedAt: z.string().datetime({ message: "Invalid ISO 8601 timestamp" }),
  model: z.string().optional(),
  provider: z.string().optional(),
  latencyMs: z.number().min(0).optional(),
  repairAttempts: z.number().min(0).optional(),
  cacheHit: z.boolean().optional(),
});

export type LayoutMetadata = z.infer<typeof LayoutMetadataSchema>;

/**
 * Validation Result Interface
 */
export interface ValidationIssue {
  path: string;
  message: string;
  code: string;
  rule?: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors?: ValidationIssue[];
}
