"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentEntry = exports.registerComponent = exports.registry = exports.ComponentRegistry = void 0;
const schema_1 = require("@alloy/schema");
/**
 * The core Component Registry runtime for Alloy UI.
 * Responsible for component registration, versioning, and hierarchy validation.
 */
class ComponentRegistry {
    static instance;
    // Storage for all registered components: Map<name, Map<version, Entry>>
    components = new Map();
    // Track latest versions for each component name
    latestVersions = new Map();
    constructor() { }
    /**
     * Returns the singleton instance of the registry.
     */
    static getInstance() {
        if (!ComponentRegistry.instance) {
            ComponentRegistry.instance = new ComponentRegistry();
        }
        return ComponentRegistry.instance;
    }
    /**
     * Registers a component with the registry.
     */
    registerComponent(options) {
        const { name, version } = options;
        const id = `${name}@${version}`;
        if (!this.components.has(name)) {
            this.components.set(name, new Map());
        }
        const versions = this.components.get(name);
        if (versions.has(version)) {
            throw new Error(`Component '${name}' with version ${version} is already registered.`);
        }
        const entry = {
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
    getComponentEntry(identifier) {
        const { name, version } = this.parseIdentifier(identifier);
        const versions = this.components.get(name);
        if (!versions)
            return undefined;
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
    getAllComponents() {
        const all = [];
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
    validateHierarchy(component) {
        const entry = this.getComponentEntry(component.type);
        if (!entry) {
            throw new Error(`Component type '${component.type}' is not registered.`);
        }
        const tier = entry.tier;
        // RULE: Atoms cannot have children
        if (tier === schema_1.ComponentTier.ATOM) {
            if (component.children && component.children.length > 0) {
                throw new Error(`Atom component '${component.type}' must not have children (Rule R008).`);
            }
        }
        // RULE: Molecules cannot contain Organisms
        if (tier === schema_1.ComponentTier.MOLECULE && component.children) {
            for (const child of component.children) {
                const childEntry = this.getComponentEntry(child.type);
                if (childEntry && childEntry.tier === schema_1.ComponentTier.ORGANISM) {
                    throw new Error(`Molecule component '${component.type}' must not contain Organism '${child.type}' (Rule R009).`);
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
    parseIdentifier(identifier) {
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
    clear() {
        this.components.clear();
        this.latestVersions.clear();
    }
}
exports.ComponentRegistry = ComponentRegistry;
/**
 * Convenience export of the singleton instance.
 */
exports.registry = ComponentRegistry.getInstance();
/**
 * Functional registration helper.
 */
const registerComponent = (options) => {
    exports.registry.registerComponent(options);
};
exports.registerComponent = registerComponent;
/**
 * Functional retrieval helper.
 */
const getComponentEntry = (identifier) => {
    return exports.registry.getComponentEntry(identifier);
};
exports.getComponentEntry = getComponentEntry;
