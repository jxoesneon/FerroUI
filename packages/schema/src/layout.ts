import { z } from 'zod';
import { 
  FerroUILayout,
  FerroUILayoutSchema,
  ValidationResult,
} from './types';
import { validateTiers } from './tiers';

/**
 * Layout Validator Function
 * Implements Section 7.2 of the specification
 */
export function validateLayout(layout: unknown): ValidationResult<FerroUILayout> {
  const result = FerroUILayoutSchema.safeParse(layout);

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
