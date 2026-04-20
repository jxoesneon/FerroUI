import { z } from 'zod';
import { ComponentTier } from '@ferroui/schema';
import { ComponentType } from 'react';

/**
 * Options for registering a component in the registry.
 */
export interface RegistrationOptions<P extends z.ZodTypeAny = any> {
  /**
   * Unique name for the component (e.g., 'DataCard').
   */
  name: string;

  /**
   * Version of the component.
   */
  version: number;

  /**
   * Atomic Design tier classification.
   */
  tier: ComponentTier;

  /**
   * The actual React component implementation.
   */
  component: ComponentType<z.infer<P>>;

  /**
   * Zod schema for validating the component's props.
   */
  schema: P;

  /**
   * Optional default props.
   */
  defaultProps?: Partial<z.infer<P>>;

  /**
   * Marks the component as deprecated.
   */
  deprecated?: boolean;

  /**
   * If deprecated, suggests a replacement component name.
   */
  replacement?: string;
}

/**
 * Internal representation of a registered component.
 */
export interface RegistryEntry<P extends z.ZodTypeAny = any> extends RegistrationOptions<P> {
  /**
   * Canonical ID string (e.g., 'DataCard@2').
   */
  id: string;
}

/**
 * Component identifier that can be a simple name or a name with a version.
 * e.g., 'DataCard' or 'DataCard@2'
 */
export type ComponentIdentifier = string;
