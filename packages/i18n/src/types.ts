export type Direction = 'ltr' | 'rtl';

export type SupportedLocale =
  | 'en-US'
  | 'en-GB'
  | 'es-ES'
  | 'fr-FR'
  | 'de-DE'
  | 'ja-JP'
  | 'ko-KR'
  | 'zh-CN'
  | 'zh-TW'
  | 'ar-SA'
  | 'he-IL'
  | 'fa-IR'
  | 'ur-PK';

export interface TranslationOptions {
  [key: string]: string | number | boolean;
}

export interface I18nContextValue {
  locale: SupportedLocale;
  direction: Direction;
  t: (key: string, options?: TranslationOptions) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency: string, options?: Intl.NumberFormatOptions) => string;
  setLocale: (locale: SupportedLocale) => void;
  loadBundle: (locale: SupportedLocale, namespace: string, bundle: Record<string, string>) => void;
}

export interface LocaleBundle {
  [namespace: string]: {
    [key: string]: string | any;
  };
}
