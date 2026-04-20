export type { RegistrationOptions, RegistryEntry, ComponentIdentifier } from './types.js';
export { ComponentRegistry, registry, registerComponent, getComponentEntry } from './registry.js';
export { ThemeProvider, useTheme, defineTheme, registerTheme, tokens } from './theme/index.js';
export type { Theme, TokenValue, PrimitiveTokens, SemanticTokens, ComponentTokens } from './theme/index.js';

// Auto-register built-in components on import
import './components/index.js';
