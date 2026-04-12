import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  parseLocale,
  getLocaleDirection,
  interpolate,
} from './utils';

describe('i18n utilities', () => {
  describe('formatDate', () => {
    it('formats date for en-US', () => {
      const date = new Date('2024-03-15');
      const result = formatDate(date, 'en-US');
      expect(result).toContain('2024');
    });
    it('formats date for es-ES', () => {
      const date = new Date('2024-03-15');
      const result = formatDate(date, 'es-ES');
      expect(result).toBeDefined();
    });
    it('handles different format options', () => {
      const date = new Date('2024-03-15');
      const short = formatDate(date, 'en-US', { dateStyle: 'short' });
      const long = formatDate(date, 'en-US', { dateStyle: 'long' });
      expect(short).not.toBe(long);
    });
    it('returns string for invalid date gracefully', () => {
      const result = formatDate(new Date('invalid'), 'en-US');
      expect(typeof result).toBe('string');
    });
  });

  describe('formatNumber', () => {
    it('formats number for en-US', () => {
      const result = formatNumber(1234567.89, 'en-US');
      expect(result).toContain('1');
      expect(result).toContain('234');
    });
    it('formats number for de-DE', () => {
      const result = formatNumber(1234567.89, 'de-DE');
      expect(result).toBeDefined();
    });
    it('handles compact notation', () => {
      const result = formatNumber(1500000, 'en-US', { notation: 'compact' });
      expect(result).toContain('M');
    });
  });

  describe('formatCurrency', () => {
    it('formats USD for en-US', () => {
      const result = formatCurrency(99.99, 'en-US', 'USD');
      expect(result).toContain('$');
      expect(result).toContain('99');
    });
    it('formats EUR for de-DE', () => {
      const result = formatCurrency(99.99, 'de-DE', 'EUR');
      expect(result).toContain('€');
    });
    it('formats JPY without decimals', () => {
      const result = formatCurrency(1000, 'en-US', 'JPY');
      expect(result).not.toContain('.');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative time for past dates', () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(past, 'en-US');
      expect(result).toMatch(/ago|yesterday/);
    });
    it('formats relative time for future dates', () => {
      const future = new Date(Date.now() + 60 * 60 * 1000);
      const result = formatRelativeTime(future, 'en-US');
      expect(result).toContain('in');
    });
  });

  describe('parseLocale', () => {
    it('parses simple locale', () => {
      const result = parseLocale('en-US');
      expect(result.language).toBe('en');
      expect(result.region).toBe('US');
    });
    it('parses locale with script', () => {
      const result = parseLocale('zh-Hans-CN');
      expect(result.language).toBe('zh');
      expect(result.script).toBe('Hans');
    });
    it('handles simple language code', () => {
      const result = parseLocale('en');
      expect(result.language).toBe('en');
      expect(result.region).toBeUndefined();
    });
    it('returns empty object for invalid locale', () => {
      const result = parseLocale('');
      expect(result.language).toBe('');
    });
  });

  describe('getLocaleDirection', () => {
    it('returns ltr for English', () => {
      expect(getLocaleDirection('en-US')).toBe('ltr');
    });
    it('returns ltr for Spanish', () => {
      expect(getLocaleDirection('es-ES')).toBe('ltr');
    });
    it('returns rtl for Arabic', () => {
      expect(getLocaleDirection('ar-SA')).toBe('rtl');
    });
    it('returns rtl for Hebrew', () => {
      expect(getLocaleDirection('he-IL')).toBe('rtl');
    });
  });

  describe('interpolate', () => {
    it('replaces single variable', () => {
      const result = interpolate('Hello {{name}}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });
    it('replaces multiple variables', () => {
      const result = interpolate('{{greeting}} {{name}}!', {
        greeting: 'Hello',
        name: 'World',
      });
      expect(result).toBe('Hello World!');
    });
    it('removes missing variables', () => {
      const result = interpolate('Hello {{name}}! {{missing}}', { name: 'World' });
      expect(result).toBe('Hello World! ');
    });
    it('handles empty template', () => {
      const result = interpolate('', { name: 'World' });
      expect(result).toBe('');
    });
    it('handles no variables', () => {
      const result = interpolate('Hello World!', {});
      expect(result).toBe('Hello World!');
    });
  });
});
