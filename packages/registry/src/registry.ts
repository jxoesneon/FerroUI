import { ComponentTier, FerroUIComponent } from '@ferroui/schema';
import { RegistryEntry, RegistrationOptions, ComponentIdentifier } from './types';

/**
 * The core Component Registry runtime for FerroUI.
 * Responsible for component registration, versioning, and hierarchy validation.
 */
export class ComponentRegistry {
  private static instance: ComponentRegistry;
  
  // Storage for all registered components: Map<name, Map<version, Entry>>
  private components: Map<string, Map<number, RegistryEntry>> = new Map();
  
  // Track latest versions for each component name
  private latestVersions: Map<string, number> = new Map();

  // Track 'stable' version aliases for each component name
  private stableVersions: Map<string, number> = new Map();

  private constructor() {}

  /**
   * Returns the singleton instance of the registry.
   */
  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /**
   * Registers a component with the registry.
   */
  public registerComponent<_P = any>(options: RegistrationOptions<any> & { force?: boolean; stable?: boolean }): void {
    const { name, version, force, stable } = options;
    const id = `${name}@${version}`;
    
    if (!this.components.has(name)) {
      this.components.set(name, new Map());
    }
    
    const versions = this.components.get(name)!;
    
    if (versions.has(version) && !force) {
      // Idempotent: silently skip if same name+version already registered.
      // App-level overrides should use a higher version number.
      return;
    }
    
    const entry: RegistryEntry = {
      ...options,
      id
    };
    
    versions.set(version, entry);
    
    // Update latest version tracking
    const currentLatest = this.latestVersions.get(name) || 0;
    if (version >= currentLatest) {
      this.latestVersions.set(name, version);
    }

    // Set stable version if requested or if it's the first version
    if (stable || !this.stableVersions.has(name)) {
      this.stableVersions.set(name, version);
    }
  }

  /**
   * Unregisters a component.
   */
  public unregisterComponent(identifier: ComponentIdentifier): void {
    const { name, version } = this.parseIdentifier(identifier);
    const versions = this.components.get(name);
    if (!versions) return;

    if (version !== undefined) {
      versions.delete(version);
      if (versions.size === 0) {
        this.components.delete(name);
        this.latestVersions.delete(name);
        this.stableVersions.delete(name);
      } else if (this.latestVersions.get(name) === version) {
        const maxVersion = Math.max(...Array.from(versions.keys()));
        this.latestVersions.set(name, maxVersion);
      }
    } else {
      this.components.delete(name);
      this.latestVersions.delete(name);
      this.stableVersions.delete(name);
    }
  }

  /**
   * Retrieves a component by identifier (e.g., 'DataCard' or 'DataCard@2').
   * If no version is specified, returns the STABLE version (Governance R012).
   */
  public getComponentEntry(identifier: ComponentIdentifier): RegistryEntry | undefined {
    const { name, version } = this.parseIdentifier(identifier);
    
    const versions = this.components.get(name);
    if (!versions) return undefined;
    
    if (version !== undefined) {
      return versions.get(version);
    }
    
    // Security: Default to STABLE version to prevent breaking 'latest' updates from auto-propagating
    const stableVersion = this.stableVersions.get(name);
    return stableVersion !== undefined ? versions.get(stableVersion) : undefined;
  }

  /**
   * Returns all registered components.
   */
  public getAllComponents(): RegistryEntry[] {
    const all: RegistryEntry[] = [];
    for (const versions of this.components.values()) {
      for (const entry of versions.values()) {
        all.push(entry);
      }
    }
    return all;
  }

  /**
   * Validates a component hierarchy according to Atomic Design rules.
   * Throws if validation fails.
   */
  public validateHierarchy(component: FerroUIComponent, visited = new Set<FerroUIComponent>()): void {
    if (visited.has(component)) {
      throw new Error(`Circular dependency detected in component hierarchy.`);
    }
    visited.add(component);

    const entry = this.getComponentEntry(component.type);
    if (!entry) {
      throw new Error(`Component type '${component.type}' is not registered.`);
    }

    const tier = entry.tier;

    // RULE: Atoms cannot have children
    if (tier === ComponentTier.ATOM) {
      if (component.children && component.children.length > 0) {
        throw new Error(`Atom component '${component.type}' must not have children (Rule R008).`);
      }
    }

    // RULE: Molecules cannot contain Organisms
    if (tier === ComponentTier.MOLECULE && component.children) {
      for (const child of component.children) {
        const childEntry = this.getComponentEntry(child.type);
        if (childEntry && childEntry.tier === ComponentTier.ORGANISM) {
          throw new Error(
            `Molecule component '${component.type}' must not contain Organism '${child.type}' (Rule R009).`
          );
        }
      }
    }

    // Recursively validate children
    if (component.children) {
      for (const child of component.children) {
        this.validateHierarchy(child, visited);
      }
    }
    
    visited.delete(component);
  }

  /**
   * Parses a component identifier into its name and version components.
   */
  private parseIdentifier(identifier: ComponentIdentifier): { name: string; version?: number } {
    const lastAt = identifier.lastIndexOf('@');
    if (lastAt > 0) {
      const name = identifier.substring(0, lastAt);
      const versionStr = identifier.substring(lastAt + 1);
      const version = parseInt(versionStr, 10);
      if (isNaN(version)) {
        throw new Error(`Invalid version in identifier: ${identifier}`);
      }
      return { name, version };
    }
    return { name: identifier };
  }
  
  /**
   * Clears all registered components (primarily for testing).
   */
  public clear(): void {
    this.components.clear();
    this.latestVersions.clear();
    this.stableVersions.clear();
  }
}

/**
 * Convenience export of the singleton instance.
 */
export const registry = ComponentRegistry.getInstance();

/**
 * Functional registration helper.
 */
export const registerComponent = <P = any>(options: RegistrationOptions<any> & { force?: boolean; stable?: boolean }) => {
  registry.registerComponent<P>(options);
};

/**
 * Functional unregistration helper.
 */
export const unregisterComponent = (identifier: ComponentIdentifier) => {
  registry.unregisterComponent(identifier);
};

/**
 * Functional retrieval helper.
 */
export const getComponentEntry = (identifier: ComponentIdentifier) => {
  return registry.getComponentEntry(identifier);
};
