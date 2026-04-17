import { ComponentTier, FerroUIComponent } from './types';

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
 * Static fallback registry of component tier classifications.
 * Used when the runtime @ferroui/registry is not available.
 * Prefer calling syncTiersFromRegistry() at startup to populate from runtime.
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
 * Synchronizes tier classifications from the runtime @ferroui/registry package.
 * Call this at startup after all components have been registered.
 */
export function syncTiersFromRegistry(entries: Array<{ name: string; tier: ComponentTier }>): void {
  for (const entry of entries) {
    COMPONENT_TIER_REGISTRY[entry.name] = entry.tier;
  }
}

/**
 * Resolves the tier for a component type, checking the registry first.
 */
export function resolveComponentTier(type: string): ComponentTier | undefined {
  return COMPONENT_TIER_REGISTRY[type];
}

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
  component: FerroUIComponent,
  path = 'layout',
  visited = new Set<FerroUIComponent>()
): TierValidationError[] {
  if (visited.has(component)) {
    return [{ path, message: `Circular dependency detected in component hierarchy.`, rule: 'CYCLE' }];
  }
  visited.add(component);
  
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

  // Rule R011: Dashboard must only appear at the root
  if (component.type === 'Dashboard' && path !== 'layout') {
    errors.push({
      path,
      message: "Component 'Dashboard' must only appear at the root of the layout.",
      rule: 'R011',
    });
  }

  // Recurse into children
  if (component.children) {
    component.children.forEach((child: FerroUIComponent, index: number) => {
      errors.push(...validateTiers(child, `${path}.children[${index}]`, visited));
    });
  }

  visited.delete(component);
  return errors;
}
