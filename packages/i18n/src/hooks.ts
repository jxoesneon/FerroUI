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

/**
 * Icons that should NOT be mirrored in RTL layouts.
 * These are inherently directional or symmetric.
 */
const MIRROR_EXEMPT_ICONS = new Set([
  'check', 'checkmark', 'close', 'x', 'plus', 'minus',
  'search', 'settings', 'gear', 'cog',
  'clock', 'time', 'calendar',
  'star', 'heart', 'flag',
  'play', 'pause', 'stop', 'volume',
  'upload', 'download',
  'lock', 'unlock',
  'eye', 'eye-off',
  'refresh', 'sync',
]);

/**
 * Determines if an icon should be mirrored for RTL layouts.
 * Per i18n Guide §4.4
 *
 * @param iconName - The icon identifier
 * @param direction - The current text direction ('ltr' | 'rtl')
 * @returns true if the icon should be CSS-mirrored (transform: scaleX(-1))
 */
export function shouldMirrorIcon(iconName: string, direction: 'ltr' | 'rtl'): boolean {
  if (direction === 'ltr') return false;
  const normalized = iconName.toLowerCase().replace(/[_\s]/g, '-');
  return !MIRROR_EXEMPT_ICONS.has(normalized);
}

/**
 * Hook for icon mirroring based on current locale direction
 */
export function useIconMirroring() {
  const { direction } = useLocale();
  return {
    shouldMirror: (iconName: string) => shouldMirrorIcon(iconName, direction),
    mirrorStyle: (iconName: string) =>
      shouldMirrorIcon(iconName, direction) ? { transform: 'scaleX(-1)' } : undefined,
    direction,
  };
}
