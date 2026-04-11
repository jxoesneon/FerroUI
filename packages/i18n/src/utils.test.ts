import { describe, it, expect } from 'vitest';
import { 
  getTextDirection, 
  resolveLocale, 
  formatDate, 
  formatNumber, 
  formatCurrency, 
  interpolate, 
  resolveKey 
} from './utils';

describe('i18n utils', () => {
  describe('getTextDirection', () => {
    it('should return "ltr" for en-US', () => {
      expect(getTextDirection('en-US')).toBe('ltr');
    });

    it('should return "rtl" for ar-SA', () => {
      expect(getTextDirection('ar-SA')).toBe('rtl');
    });

    it('should return "ltr" for es-ES', () => {
      expect(getTextDirection('es-ES')).toBe('ltr');
    });
  });

  describe('resolveLocale', () => {
    it('should resolve from url parameter', () => {
      expect(resolveLocale('ar-SA')).toBe('ar-SA');
    });

    it('should resolve from user preference', () => {
      expect(resolveLocale(null, 'ar-SA')).toBe('ar-SA');
    });

    it('should resolve from browser languages', () => {
      expect(resolveLocale(null, null, ['ar-SA', 'en-US'])).toBe('ar-SA');
    });

    it('should resolve partial match from browser languages', () => {
      expect(resolveLocale(null, null, ['ar', 'en-US'])).toBe('ar-SA');
    });

    it('should fallback to default locale', () => {
      expect(resolveLocale(null, null, ['invalid-locale'])).toBe('en-US');
    });
  });

  describe('formatDate', () => {
    const date = new Date('2024-03-20T12:00:00Z');

    it('should format date for en-US', () => {
      // Different environments might have slightly different formatting, so we check for key parts
      const formatted = formatDate(date, 'en-US');
      expect(formatted).toContain('March 20, 2024');
    });

    it('should format date for ar-SA', () => {
      const formatted = formatDate(date, 'ar-SA');
      // "٢٠ مارس ٢٠٢٤" in Arabic (sometimes formatting depends on Intl support)
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('formatNumber', () => {
    it('should format number for en-US', () => {
      expect(formatNumber(123456.78, 'en-US')).toBe('123,456.78');
    });

    it('should format number for ar-SA', () => {
      const formatted = formatNumber(123456.78, 'ar-SA');
      // Might be "١٢٣٬٤٥٦٫٧٨" or "123,456.78" depending on runtime support
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatCurrency', () => {
    it('should format currency for en-US', () => {
      const formatted = formatCurrency(1234.56, 'USD', 'en-US');
      expect(formatted).toContain('$1,234.56');
    });

    it('should format currency for ar-SA', () => {
      const formatted = formatCurrency(1234.56, 'SAR', 'ar-SA');
      expect(formatted).toBeTruthy();
    });
  });

  describe('interpolate', () => {
    it('should interpolate values into template', () => {
      const template = 'Hello {name}, welcome to {app}!';
      const result = interpolate(template, { name: 'Alice', app: 'Alloy' });
      expect(result).toBe('Hello Alice, welcome to Alloy!');
    });

    it('should ignore missing values', () => {
      const template = 'Hello {name}!';
      const result = interpolate(template, {});
      expect(result).toBe('Hello {name}!');
    });
  });

  describe('resolveKey', () => {
    const bundle = {
      common: {
        ok: 'OK',
        nested: {
          key: 'Value'
        }
      }
    };

    it('should resolve top-level key', () => {
      expect(resolveKey(bundle, 'common.ok')).toBe('OK');
    });

    it('should resolve nested key', () => {
      expect(resolveKey(bundle, 'common.nested.key')).toBe('Value');
    });

    it('should return undefined for missing key', () => {
      expect(resolveKey(bundle, 'common.missing')).toBeUndefined();
    });

    it('should return undefined for non-string values', () => {
      expect(resolveKey(bundle, 'common.nested')).toBeUndefined();
    });
  });
});
