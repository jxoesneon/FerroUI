import { ReactNode } from 'react';

export interface TokenValue {
  $value: string | string[];
  $type: string;
  $description?: string;
}

export interface TokenGroup {
  [key: string]: TokenValue | TokenGroup;
}

export interface PrimitiveTokens extends TokenGroup {}
export interface SemanticTokens extends TokenGroup {}
export interface ComponentTokens extends TokenGroup {}

export interface Theme {
  name: string;
  tokens: {
    primitive?: PrimitiveTokens;
    semantic?: SemanticTokens;
    component?: ComponentTokens;
  };
}

export interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

export interface ThemeProviderProps {
  theme?: string;
  children: ReactNode;
}

export interface TokenOptions {
  theme?: string;
}
