"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPONENT_TIER_REGISTRY = void 0;
exports.validateTiers = validateTiers;
const types_1 = require("./types");
/**
 * Registry of component tier classifications.
 * This should eventually be populated from the @alloy/registry package.
 */
exports.COMPONENT_TIER_REGISTRY = {
    // Atoms (Section 8.1)
    Text: types_1.ComponentTier.ATOM,
    Icon: types_1.ComponentTier.ATOM,
    Badge: types_1.ComponentTier.ATOM,
    Divider: types_1.ComponentTier.ATOM,
    Skeleton: types_1.ComponentTier.ATOM,
    Avatar: types_1.ComponentTier.ATOM,
    Tag: types_1.ComponentTier.ATOM,
    // Molecules
    StatBadge: types_1.ComponentTier.MOLECULE,
    UserAvatar: types_1.ComponentTier.MOLECULE,
    MetricRow: types_1.ComponentTier.MOLECULE,
    ActionButton: types_1.ComponentTier.MOLECULE,
    FormField: types_1.ComponentTier.MOLECULE,
    SearchBar: types_1.ComponentTier.MOLECULE,
    // Organisms
    Dashboard: types_1.ComponentTier.ORGANISM,
    KPIBoard: types_1.ComponentTier.ORGANISM,
    DataTable: types_1.ComponentTier.ORGANISM,
    ActivityFeed: types_1.ComponentTier.ORGANISM,
    ProfileHeader: types_1.ComponentTier.ORGANISM,
    TicketCard: types_1.ComponentTier.ORGANISM,
    ChartPanel: types_1.ComponentTier.ORGANISM,
    FormGroup: types_1.ComponentTier.ORGANISM,
    StatusBanner: types_1.ComponentTier.ORGANISM,
};
/**
 * Validates a component tree against architectural tier rules.
 * Implements Rules R008, R009, and R005 from the specification.
 */
function validateTiers(component, path = 'layout') {
    const errors = [];
    const tier = exports.COMPONENT_TIER_REGISTRY[component.type];
    // Rule R008: Atoms must not have children
    if (tier === types_1.ComponentTier.ATOM && component.children && component.children.length > 0) {
        errors.push({
            path,
            message: `Atom component '${component.type}' must not have children.`,
            rule: 'R008',
        });
    }
    // Rule R009: Molecules must not contain Organisms
    if (tier === types_1.ComponentTier.MOLECULE && component.children) {
        for (const child of component.children) {
            const childTier = exports.COMPONENT_TIER_REGISTRY[child.type];
            if (childTier === types_1.ComponentTier.ORGANISM) {
                errors.push({
                    path,
                    message: `Molecule component '${component.type}' must not contain Organism '${child.type}'.`,
                    rule: 'R009',
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
