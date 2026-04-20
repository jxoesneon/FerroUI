import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useI18n, useTranslation, useLocale, shouldMirrorIcon, useIconMirroring } from './hooks';

vi.mock('react', () => ({
  useContext: vi.fn(),
  createContext: vi.fn(),
}));

import { useContext } from 'react';

describe('hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useI18n', () => {
    it('throws if context is undefined', () => {
      vi.mocked(useContext).mockReturnValue(undefined);
      expect(() => useI18n()).toThrow('useI18n must be used within an I18nProvider');
    });

    it('returns context', () => {
      const mockCtx = { t: vi.fn(), locale: 'en', direction: 'ltr', setLocale: vi.fn() };
      vi.mocked(useContext).mockReturnValue(mockCtx);
      expect(useI18n()).toBe(mockCtx);
    });
  });

  describe('useTranslation', () => {
    it('returns namespaced t function', () => {
      const mockT = vi.fn().mockReturnValue('translated');
      vi.mocked(useContext).mockReturnValue({ t: mockT, locale: 'en' });
      
      const { t, locale } = useTranslation('common');
      expect(locale).toBe('en');
      expect(t('key')).toBe('translated');
      expect(mockT).toHaveBeenCalledWith('common.key', undefined);
    });
    
    it('returns regular t function when no namespace', () => {
      const mockT = vi.fn().mockReturnValue('translated');
      vi.mocked(useContext).mockReturnValue({ t: mockT });
      
      const { t } = useTranslation();
      expect(t('key')).toBe('translated');
      expect(mockT).toHaveBeenCalledWith('key', undefined);
    });
  });

  describe('useLocale', () => {
    it('returns locale info', () => {
      const setLocale = vi.fn();
      vi.mocked(useContext).mockReturnValue({ locale: 'ar', direction: 'rtl', setLocale });
      const res = useLocale();
      expect(res.locale).toBe('ar');
      expect(res.direction).toBe('rtl');
      expect(res.setLocale).toBe(setLocale);
    });
  });

  describe('shouldMirrorIcon', () => {
    it('does not mirror in ltr', () => {
      expect(shouldMirrorIcon('arrow-right', 'ltr')).toBe(false);
    });

    it('mirrors directional icons in rtl', () => {
      expect(shouldMirrorIcon('arrow-right', 'rtl')).toBe(true);
    });

    it('does not mirror exempt icons in rtl', () => {
      expect(shouldMirrorIcon('check', 'rtl')).toBe(false);
      expect(shouldMirrorIcon('SEARCH', 'rtl')).toBe(false);
      expect(shouldMirrorIcon('volume', 'rtl')).toBe(false);
    });
  });

  describe('useIconMirroring', () => {
    it('returns mirroring utilities', () => {
      vi.mocked(useContext).mockReturnValue({ direction: 'rtl' });
      const { shouldMirror, mirrorStyle, direction } = useIconMirroring();
      expect(direction).toBe('rtl');
      expect(shouldMirror('arrow')).toBe(true);
      expect(shouldMirror('check')).toBe(false);
      expect(mirrorStyle('arrow')).toEqual({ transform: 'scaleX(-1)' });
      expect(mirrorStyle('check')).toBeUndefined();
    });
  });
});
