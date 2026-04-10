import { z } from 'zod';
import { 
  AlloyComponent, 
  ActionSchema, 
  AriaPropsSchema, 
  LayoutMetadataSchema,
  ValidationResult,
  ValidationIssue
} from './types';
import { validateTiers } from './tiers';

/**
 * Recursive Zod Schema for AlloyComponent
 * Defined in Section 2.2 of the specification
 */
export const AlloyComponentSchema: z.ZodType<AlloyComponent> = z.lazy(() =>
  z.object({
    type: z.string().min(1, "Component type is required"),
    id: z.string().optional(),
    props: z.record(z.string(), z.unknown()).optional(),
    children: z.array(z.lazy(() => AlloyComponentSchema)).optional(),
    action: ActionSchema.optional(),
    aria: AriaPropsSchema.optional(),
  })
);

/**
 * Root AlloyLayout Object
 * Defined in Section 2.1 of the specification
 */
export const AlloyLayoutSchema = z.object({
  schemaVersion: z.string().regex(/^\d+\.\d+$/, "Version must be in 'x.y' format"),
  requestId: z.string().uuid("Request ID must be a valid UUID"),
  locale: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Locale must be a valid BCP 47 tag"),
  layout: AlloyComponentSchema,
  metadata: LayoutMetadataSchema.optional(),
}).refine(
  (data) => data.layout.type === 'Dashboard',
  {
    message: "Root component must be 'Dashboard' (Rule R005)",
    path: ['layout', 'type'],
  }
);

export type AlloyLayout = z.infer<typeof AlloyLayoutSchema>;

/**
 * Layout Validator Function
 * Implements Section 7.2 of the specification
 */
export function validateLayout(layout: unknown): ValidationResult<AlloyLayout> {
  const result = AlloyLayoutSchema.safeParse(layout);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((issue: z.ZodIssue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    };
  }

  // Structural validation passed, now check architectural rules
  const tierErrors = validateTiers(result.data.layout);

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
