import { Theme, TokenOptions } from './types.js';

/**
 * Manages runtime themes and design token access.
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private themes: Map<string, Theme> = new Map();
  private currentThemeName: string = 'light';

  private constructor() {}

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Registers a theme definition in the manager.
   */
  public registerTheme(theme: Theme): void {
    this.themes.set(theme.name, theme);
  }

  /**
   * Retrieves a registered theme by name.
   */
  public getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  /**
   * Sets the globally active theme name for token access.
   */
  public setCurrentTheme(name: string): void {
    this.currentThemeName = name;
  }

  /**
   * Gets the globally active theme name.
   */
  public getCurrentTheme(): string {
    return this.currentThemeName;
  }

  /**
   * Resolves a token value by path.
   * Path should be like 'color.primary.DEFAULT'.
   */
  public getToken(path: string, options: TokenOptions = {}): any {
    const themeName = options.theme || this.currentThemeName;
    const theme = this.getTheme(themeName);
    
    if (!theme) {
      console.warn(`Theme '${themeName}' not found. Falling back to 'light'.`);
      const fallbackTheme = this.getTheme('light');
      if (!fallbackTheme) return undefined;
      return this.resolvePath(fallbackTheme.tokens, path);
    }

    return this.resolvePath(theme.tokens, path);
  }

  private resolvePath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    // If it's a token leaf (has $value), return the value.
    if (current && typeof current === 'object' && '$value' in current) {
      return current.$value;
    }

    return current;
  }
}

export const themeManager = ThemeManager.getInstance();

/**
 * Defines a theme with type checking.
 */
export const defineTheme = (theme: Theme): Theme => theme;

/**
 * Registers a theme for runtime use.
 */
export const registerTheme = (theme: Theme): void => {
  themeManager.registerTheme(theme);
};

/**
 * Runtime token access API.
 */
export const tokens = {
  /**
   * Retrieves a token value.
   * @param path Dot-separated path to the token (e.g., 'color.primary.DEFAULT')
   * @param options Optional overrides (e.g., { theme: 'dark' })
   */
  get: (path: string, options?: TokenOptions) => themeManager.getToken(path, options),
};
