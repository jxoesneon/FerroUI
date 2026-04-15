export type { RegistrationOptions, RegistryEntry, ComponentIdentifier } from './types';
export { ComponentRegistry, registry, registerComponent, getComponentEntry } from './registry';
export { startRegistryInspector } from './inspector';
export { ThemeProvider, useTheme, defineTheme, registerTheme, tokens } from './theme';
export type { Theme, TokenValue, PrimitiveTokens, SemanticTokens, ComponentTokens } from './theme';

// Auto-register built-in components on import
import './components';
