import React, { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { I18nContext } from './I18nContext.js';
import { SupportedLocale, Direction, LocaleBundle, TranslationOptions, I18nContextValue } from './types.js';
import { getTextDirection, resolveLocale, formatDate, formatNumber, formatCurrency, interpolate, resolveKey } from './utils.js';

export interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: SupportedLocale;
  initialBundles?: LocaleBundle;
  onLocaleChange?: (locale: SupportedLocale) => void;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLocale,
  initialBundles = {},
  onLocaleChange,
}) => {
  // Resolve locale from various sources
  const resolvedLocale = useMemo(() => {
    if (initialLocale) return initialLocale;
    
    // In browser environment
    if (typeof window !== 'undefined') {
      const urlLocale = new URLSearchParams(window.location.search).get('locale');
      const browserLocales = window.navigator.languages;
      const storedLocale = localStorage.getItem('ferroui_locale');
      
      return resolveLocale(urlLocale, storedLocale, browserLocales);
    }
    
    return resolveLocale();
  }, [initialLocale]);

  const [locale, setLocaleState] = useState<SupportedLocale>(resolvedLocale);
  const [bundles, setBundles] = useState<LocaleBundle>(initialBundles);

  const direction = useMemo<Direction>(() => getTextDirection(locale), [locale]);

  // Update HTML attributes when locale/direction change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = locale;
      localStorage.setItem('ferroui_locale', locale);
    }
  }, [locale, direction]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    onLocaleChange?.(newLocale);
  }, [onLocaleChange]);

  const loadBundle = useCallback((newLocale: SupportedLocale, namespace: string, bundle: Record<string, string>) => {
    setBundles((prev) => ({
      ...prev,
      [newLocale]: {
        ...(prev[newLocale] || {}),
        [namespace]: bundle,
      },
    }));
  }, []);

  const t = useCallback((key: string, options?: TranslationOptions): string => {
    // Basic key resolution from bundles
    const value = resolveKey(bundles[locale], key) || key;
    return options ? interpolate(value, options) : value;
  }, [bundles, locale]);

  const contextValue: I18nContextValue = useMemo(() => ({
    locale,
    direction,
    t,
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => formatDate(date, locale, options),
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => formatNumber(num, locale, options),
    formatCurrency: (amount: number, currency: string, options?: Intl.NumberFormatOptions) => formatCurrency(amount, locale, currency, options),
    setLocale,
    loadBundle,
  }), [locale, direction, t, setLocale, loadBundle]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};
