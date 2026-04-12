import { ComponentTier, AlloyComponent } from './types';

/**
 * Inline components — can appear inside block components but cannot contain block children.
 * Based on Section 8.2 of the specification (Rule R010).
 */
export const INLINE_COMPONENTS = new Set(['Text', 'Badge', 'Tag', 'Icon']);

/**
 * Block-level components — provide layout structure.
 * Based on Section 8.2 of the specification (Rule R010).
 */
export const BLOCK_COMPONENTS = new Set(['Divider', 'Skeleton', 'Dashboard', 'KPIBoard',
  'DataTable', 'ActivityFeed', 'ProfileHeader', 'TicketCard', 'ChartPanel',
  'FormGroup', 'StatusBanner', 'StatBadge', 'UserAvatar', 'MetricRow',
  'ActionButton', 'FormField', 'SearchBar', 'Avatar']);

/**
 * Registry of component tier classifications.
 * This should eventually be populated from the @alloy/registry package.
 */
export const COMPONENT_TIER_REGISTRY: Record<string, ComponentTier> = {
  // Atoms (Section 8.1)
  Text: ComponentTier.ATOM,
  Icon: ComponentTier.ATOM,
  Badge: ComponentTier.ATOM,
  Divider: ComponentTier.ATOM,
  Skeleton: ComponentTier.ATOM,
  Avatar: ComponentTier.ATOM,
  Tag: ComponentTier.ATOM,

  // Molecules
  StatBadge: ComponentTier.MOLECULE,
  UserAvatar: ComponentTier.MOLECULE,
  MetricRow: ComponentTier.MOLECULE,
  ActionButton: ComponentTier.MOLECULE,
  FormField: ComponentTier.MOLECULE,
  SearchBar: ComponentTier.MOLECULE,

  // Organisms
  Dashboard: ComponentTier.ORGANISM,
  KPIBoard: ComponentTier.ORGANISM,
  DataTable: ComponentTier.ORGANISM,
  ActivityFeed: ComponentTier.ORGANISM,
  ProfileHeader: ComponentTier.ORGANISM,
  TicketCard: ComponentTier.ORGANISM,
  ChartPanel: ComponentTier.ORGANISM,
  FormGroup: ComponentTier.ORGANISM,
  StatusBanner: ComponentTier.ORGANISM,
};

/**
 * Validation error for tier rules.
 */
export interface TierValidationError {
  path: string;
  message: string;
  rule: string;
}

/**
 * Validates a component tree against architectural tier rules.
 * Implements Rules R008, R009, and R005 from the specification.
 */
export function validateTiers(
  component: AlloyComponent,
  path = 'layout'
): TierValidationError[] {
  const errors: TierValidationError[] = [];
  const tier = COMPONENT_TIER_REGISTRY[component.type];

  // Rule R008: Atoms must not have children
  if (tier === ComponentTier.ATOM && component.children && component.children.length > 0) {
    errors.push({
      path,
      message: `Atom component '${component.type}' must not have children.`,
      rule: 'R008',
    });
  }

  // Rule R009: Molecules must not contain Organisms
  if (tier === ComponentTier.MOLECULE && component.children) {
    for (const child of component.children) {
      const childTier = COMPONENT_TIER_REGISTRY[child.type];
      if (childTier === ComponentTier.ORGANISM) {
        errors.push({
          path,
          message: `Molecule component '${component.type}' must not contain Organism '${child.type}'.`,
          rule: 'R009',
        });
      }
    }
  }

  // Rule R010: Inline components must not contain Block-level children
  if (INLINE_COMPONENTS.has(component.type) && component.children) {
    for (const child of component.children) {
      if (BLOCK_COMPONENTS.has(child.type)) {
        errors.push({
          path,
          message: `Inline component '${component.type}' must not contain Block component '${child.type}'.`,
          rule: 'R010',
        });
      }
    }
  }

  // Recurse into children
  if (component.children) {
    component.children.forEach((child, index) => {
      errors.push(...validateTiers(child, `${path}.children[${index}]`));
    });
  }

  return errors;
}
