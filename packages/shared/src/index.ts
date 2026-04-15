/**
 * Shared utilities for FerroUI UI monorepo.
 */

/**
 * Validates if a string is a valid UUID v4.
 */
export function isUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Deep clones an object.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Returns a unique request ID.
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}
