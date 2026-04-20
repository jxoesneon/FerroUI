import { describe, it, expect } from 'vitest';
import {
  getTextDirection,
  getLocaleDirection,
  parseLocale,
  formatRelativeTime,
  resolveLocale,
  formatDate,
  formatNumber,
  formatCurrency,
  interpolate,
  resolveKey,
} from './utils.js';

describe('getTextDirection / getLocaleDirection', () => {
  it('returns rtl for Arabic', () => expect(getTextDirection('ar')).toBe('rtl'));
  it('returns rtl for ar-SA', () => expect(getTextDirection('ar-SA')).toBe('rtl'));
  it('returns rtl for Hebrew', () => expect(getTextDirection('he')).toBe('rtl'));
  it('returns ltr for English', () => expect(getTextDirection('en')).toBe('ltr'));
  it('returns ltr for en-US', () => expect(getTextDirection('en-US')).toBe('ltr'));
  it('getLocaleDirection aliases getTextDirection', () => {
    expect(getLocaleDirection('ar')).toBe('rtl');
    expect(getLocaleDirection('fr')).toBe('ltr');
  });
});

describe('parseLocale', () => {
  it('parses language only', () => expect(parseLocale('en')).toEqual({ language: 'en' }));
  it('parses language and region', () => expect(parseLocale('en-US')).toEqual({ language: 'en', region: 'US' }));
  it('parses language and script (4-char)', () => expect(parseLocale('zh-Hans')).toEqual({ language: 'zh', script: 'Hans' }));
  it('parses language, script, region', () => expect(parseLocale('zh-Hans-CN')).toEqual({ language: 'zh', script: 'Hans', region: 'CN' }));
  it('handles empty string', () => expect(parseLocale('')).toEqual({ language: '' }));
});

describe('formatRelativeTime', () => {
  it('formats seconds ago', () => {
    const d = new Date(Date.now() - 5000);
    const r = formatRelativeTime(d, 'en');
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });

  it('formats minutes ago', () => {
    const d = new Date(Date.now() - 90_000);
    const r = formatRelativeTime(d, 'en');
    expect(r).toContain('minute');
  });

  it('formats hours ago', () => {
    const d = new Date(Date.now() - 2 * 3600 * 1000);
    const r = formatRelativeTime(d, 'en');
    expect(r).toContain('hour');
  });

  it('formats days ago', () => {
    const d = new Date(Date.now() - 3 * 86400 * 1000);
    const r = formatRelativeTime(d, 'en');
    expect(r).toContain('day');
  });

  it('formats future time', () => {
    const d = new Date(Date.now() + 90 * 1000);
    const r = formatRelativeTime(d, 'en');
    expect(r.length).toBeGreaterThan(0);
  });
});

describe('resolveLocale', () => {
  it('prefers URL param', () => expect(resolveLocale('en-US', 'fr-FR', ['de-DE'])).toBe('en-US'));
  it('falls back to user preference', () => expect(resolveLocale(null, 'fr-FR', ['de-DE'])).toBe('fr-FR'));
  it('falls back to browser language (exact match)', () => expect(resolveLocale(null, null, ['en-US'])).toBe('en-US'));
  it('matches base language from browser via prefix', () => {
    const result = resolveLocale(null, null, ['en-GB']);
    expect(result).toMatch(/^en/);
  });
  it('falls back to default when nothing matches', () => {
    const result = resolveLocale(null, null, ['xx-YY']);
    expect(result).toBe('en-US');
  });
  it('ignores unsupported URL param and uses preference', () => {
    expect(resolveLocale('xx-ZZ', 'de-DE')).toBe('de-DE');
  });
});

describe('formatDate', () => {
  it('formats a valid date', () => {
    const d = new Date('2024-06-15');
    const r = formatDate(d, 'en-US');
    expect(r).toContain('2024');
  });

  it('returns Invalid Date for NaN date', () => {
    expect(formatDate(new Date('bad'), 'en-US')).toBe('Invalid Date');
  });
});

describe('formatNumber', () => {
  it('formats number with locale', () => {
    const r = formatNumber(1234567, 'en-US');
    expect(r).toContain('1,234,567');
  });
});

describe('formatCurrency', () => {
  it('formats USD currency', () => {
    const r = formatCurrency(9.99, 'en-US', 'USD');
    expect(r).toContain('9.99');
    expect(r).toContain('$');
  });
});

describe('interpolate', () => {
  it('replaces template variables', () => {
    expect(interpolate('Hello {{name}}!', { name: 'World' })).toBe('Hello World!');
  });

  it('replaces missing keys with empty string', () => {
    expect(interpolate('Hi {{missing}}', {})).toBe('Hi ');
  });

  it('leaves non-template text unchanged', () => {
    expect(interpolate('No vars here', {})).toBe('No vars here');
  });
});

describe('resolveKey', () => {
  it('resolves a top-level key', () => {
    expect(resolveKey({ foo: 'bar' }, 'foo')).toBe('bar');
  });

  it('resolves a nested key', () => {
    expect(resolveKey({ a: { b: { c: 'deep' } } }, 'a.b.c')).toBe('deep');
  });

  it('returns undefined for missing key', () => {
    expect(resolveKey({ a: 1 }, 'a.b')).toBeUndefined();
  });

  it('returns undefined when value is not a string', () => {
    expect(resolveKey({ n: 42 }, 'n')).toBeUndefined();
  });

  it('returns undefined when intermediate is null', () => {
    expect(resolveKey({ a: null }, 'a.b')).toBeUndefined();
  });
});
