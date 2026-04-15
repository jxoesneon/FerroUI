import { ComponentTier, FerroUIComponent } from '@ferroui/schema';
import { RegistryEntry, RegistrationOptions, ComponentIdentifier } from './types';

/**
 * The core Component Registry runtime for FerroUI UI.
 * Responsible for component registration, versioning, and hierarchy validation.
 */
export class ComponentRegistry {
  private static instance: ComponentRegistry;
  
  // Storage for all registered components: Map<name, Map<version, Entry>>
  private components: Map<string, Map<number, RegistryEntry>> = new Map();
  
  // Track latest versions for each component name
  private latestVersions: Map<string, number> = new Map();

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
  public registerComponent<_P = any>(options: RegistrationOptions<any>): void {
    const { name, version } = options;
    const id = `${name}@${version}`;
    
    if (!this.components.has(name)) {
      this.components.set(name, new Map());
    }
    
    const versions = this.components.get(name)!;
    
    if (versions.has(version)) {
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
  }

  /**
   * Retrieves a component by identifier (e.g., 'DataCard' or 'DataCard@2').
   * If no version is specified, returns the latest version.
   */
  public getComponentEntry(identifier: ComponentIdentifier): RegistryEntry | undefined {
    const { name, version } = this.parseIdentifier(identifier);
    
    const versions = this.components.get(name);
    if (!versions) return undefined;
    
    if (version !== undefined) {
      return versions.get(version);
    }
    
    // Default to latest version
    const latestVersion = this.latestVersions.get(name);
    return latestVersion !== undefined ? versions.get(latestVersion) : undefined;
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
  public validateHierarchy(component: FerroUIComponent): void {
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
        this.validateHierarchy(child);
      }
    }
  }

  /**
   * Parses a component identifier into its name and version components.
   */
  private parseIdentifier(identifier: ComponentIdentifier): { name: string; version?: number } {
    if (identifier.includes('@')) {
      const [name, versionStr] = identifier.split('@');
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
  }
}

/**
 * Convenience export of the singleton instance.
 */
export const registry = ComponentRegistry.getInstance();

/**
 * Functional registration helper.
 */
 
export const registerComponent = <P = any>(options: RegistrationOptions<any>) => {
  registry.registerComponent<P>(options);
};

/**
 * Functional retrieval helper.
 */
export const getComponentEntry = (identifier: ComponentIdentifier) => {
  return registry.getComponentEntry(identifier);
};
