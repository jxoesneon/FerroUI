import { ReactNode } from 'react';

export interface TokenValue {
  $value: string | string[];
  $type: string;
  $description?: string;
}

export interface TokenGroup {
  [key: string]: TokenValue | TokenGroup;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PrimitiveTokens extends TokenGroup {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SemanticTokens extends TokenGroup {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
