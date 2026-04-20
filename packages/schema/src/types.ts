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

export const StateUpdateActionSchema = z.object({
  type: z.literal('STATE_UPDATE'),
  payload: z.object({
    id: z.string().min(1, "Target component ID must not be empty"),
    state: z.record(z.string(), z.unknown()),
  }),
});

export const ActionSchema = z.discriminatedUnion('type', [
  NavigateActionSchema,
  ToastActionSchema,
  RefreshActionSchema,
  ToolCallActionSchema,
  StateUpdateActionSchema,
]);

export type Action = z.infer<typeof ActionSchema>;

/**
 * Layout Actions State Machines (RFC-001)
 */
export const TransitionSchema = z.object({
  target: z.string(),
  condition: z.string().optional(),
  action: ActionSchema.optional(),
});

export const StateDefinitionSchema: z.ZodType<any> = z.lazy(() => z.object({
  on: z.record(z.string(), TransitionSchema).optional(),
  entry: ActionSchema.optional(),
  exit: ActionSchema.optional(),
  render: FerroUIComponentSchema.optional().describe('State-specific component override'),
}));

export const StateMachineDefinitionSchema = z.object({
  initial: z.string(),
  states: z.record(z.string(), StateDefinitionSchema),
  context: z.record(z.string(), z.unknown()).optional(),
});

export type StateMachineDefinition = z.infer<typeof StateMachineDefinitionSchema>;

/**
 * Base Component Definition
 * Defined in Section 2.2 of the specification
 */
export type FerroUIComponent = {
  type: string;
  id?: string;
  props?: Record<string, unknown>;
  children?: FerroUIComponent[];
  action?: Action;
  aria: AriaProps;
  stateMachine?: StateMachineDefinition;
};

/**
 * Recursive Zod Schema for FerroUIComponent
 */
export const FerroUIComponentSchema: z.ZodType<FerroUIComponent> = z.lazy(() =>
  z.object({
    type: z.string().min(1, "Component type is required"),
    id: z.string().optional(),
    props: z.record(z.string(), z.unknown()).optional(),
    children: z.array(z.lazy(() => FerroUIComponentSchema)).optional(),
    action: ActionSchema.optional(),
    aria: AriaPropsSchema,
    stateMachine: StateMachineDefinitionSchema.optional(),
  })
);

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
  signature: z.string().optional(),
  publicKey: z.string().optional(),
});

export type LayoutMetadata = z.infer<typeof LayoutMetadataSchema>;

/**
 * Root FerroUILayout Object
 * Defined in Section 2.1 of the specification
 */
export const FerroUILayoutSchema = z.object({
  schemaVersion: z.string().regex(/^\d+\.\d+(\.\d+)?$/, "Version must be in 'x.y' or 'x.y.z' format").default('1.1.0'),
  requestId: z.string().uuid("Request ID must be a valid UUID"),
  locale: z.string().regex(/^[a-z]{2}(-[A-Z][a-z]{3})?(-[A-Z]{2})?$/, "Locale must be a valid BCP 47 tag"),
  layout: FerroUIComponentSchema,
  metadata: LayoutMetadataSchema.optional(),
}).refine(
  (data) => data.layout.type === 'Dashboard',
  {
    message: "Root component must be 'Dashboard' (Rule R005)",
    path: ['layout', 'type'],
  }
);

export type FerroUILayout = z.infer<typeof FerroUILayoutSchema>;

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
