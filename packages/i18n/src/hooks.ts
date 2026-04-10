import { useContext } from 'react';
import { I18nContext } from './I18nContext';
import { I18nContextValue, TranslationOptions } from './types';

/**
 * Basic i18n context hook
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Hook for component translation with namespace support
 */
export function useTranslation(namespace?: string) {
  const { t, ...rest } = useI18n();

  const namespacedT = (key: string, options?: TranslationOptions) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey, options);
  };

  return {
    t: namespacedT,
    ...rest,
  };
}

/**
 * Hook specifically for locale and direction information
 */
export function useLocale() {
  const { locale, direction, setLocale } = useI18n();
  return {
    locale,
    direction,
    setLocale,
  };
}
