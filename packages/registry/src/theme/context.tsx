import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeContextValue, ThemeProviderProps } from './types';
import { themeManager } from './manager';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Root context provider for FerroUI theming.
 * Wraps the application to provide theme state and token access.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  theme: initialTheme = 'light', 
  children 
}) => {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  // Sync theme manager on state change
  useEffect(() => {
    themeManager.setCurrentTheme(currentTheme);
  }, [currentTheme]);

  // Sync state if initialTheme prop changes
  useEffect(() => {
    setCurrentTheme(initialTheme);
  }, [initialTheme]);

  const value: ThemeContextValue = {
    theme: currentTheme,
    setTheme: setCurrentTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={currentTheme} style={{ display: 'contents' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access and manipulate the current theme.
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
