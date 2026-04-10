import { Direction, SupportedLocale, TranslationOptions } from './types';
import { RTL_LOCALES, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './constants';

/**
 * Detect direction from locale
 */
export function getTextDirection(locale: string): Direction {
  const lang = locale.split('-')[0];
  return RTL_LOCALES.includes(lang) ? 'rtl' : 'ltr';
}

/**
 * Resolve locale from various sources
 */
export function resolveLocale(
  urlParam?: string | null,
  userPreference?: string | null,
  browserLanguages?: readonly string[]
): SupportedLocale {
  // 1. URL parameter
  if (urlParam && SUPPORTED_LOCALES.includes(urlParam as SupportedLocale)) {
    return urlParam as SupportedLocale;
  }

  // 2. User preference
  if (userPreference && SUPPORTED_LOCALES.includes(userPreference as SupportedLocale)) {
    return userPreference as SupportedLocale;
  }

  // 3. Browser languages
  if (browserLanguages) {
    for (const lang of browserLanguages) {
      if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
        return lang as SupportedLocale;
      }
      // Try to match base language if full BCP 47 tag doesn't match
      const baseLang = lang.split('-')[0];
      const match = SUPPORTED_LOCALES.find((sl) => sl.startsWith(baseLang));
      if (match) {
        return match;
      }
    }
  }

  // 4. Default locale
  return DEFAULT_LOCALE;
}

/**
 * Format date using Intl API
 */
export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format number using Intl API
 */
export function formatNumber(
  num: number,
  locale: string,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Format currency using Intl API
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(locale, {
    ...options,
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Basic translation function with interpolation
 */
export function interpolate(template: string, options: TranslationOptions): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return options[key] !== undefined ? String(options[key]) : match;
  });
}

/**
 * Deeply resolve a value from an object using a dot-notated key
 */
export function resolveKey(obj: any, key: string): string | undefined {
  const parts = key.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}
