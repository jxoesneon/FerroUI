import { Direction, SupportedLocale, TranslationOptions } from './types.js';
import { RTL_LOCALES, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './constants.js';

/**
 * Detect direction from locale
 */
export function getTextDirection(locale: string): Direction {
  const lang = locale.split('-')[0];
  return RTL_LOCALES.includes(lang) ? 'rtl' : 'ltr';
}

/**
 * Alias for getTextDirection — returns 'ltr' | 'rtl' for a given BCP 47 locale tag.
 */
export function getLocaleDirection(locale: string): Direction {
  return getTextDirection(locale);
}

/**
 * Parse a BCP 47 locale string into its constituent parts.
 */
export interface ParsedLocale {
  language: string;
  script?: string;
  region?: string;
}

export function parseLocale(locale: string): ParsedLocale {
  if (!locale) return { language: '' };
  const parts = locale.split('-');
  const language = parts[0] ?? '';
  let script: string | undefined;
  let region: string | undefined;
  if (parts.length === 3) {
    script = parts[1];
    region = parts[2];
  } else if (parts.length === 2) {
    if (parts[1].length === 4) {
      script = parts[1];
    } else {
      region = parts[1];
    }
  }
  return { language, ...(script ? { script } : {}), ...(region ? { region } : {}) };
}

/**
 * Format a date relative to now using Intl.RelativeTimeFormat.
 */
export function formatRelativeTime(date: Date, locale: string): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day');
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute');
  return rtf.format(diffSec, 'second');
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
  if (isNaN(date.getTime())) return 'Invalid Date';
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
  locale: string,
  currency: string,
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
  return template.replace(/\{\{(\w+)\}\}/g, (_match: string, key: string) => {
    return options[key] !== undefined ? String(options[key]) : '';
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
