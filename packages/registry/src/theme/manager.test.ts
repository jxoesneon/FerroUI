import { describe, it, expect, beforeEach } from 'vitest';
import { themeManager, ThemeManager, defineTheme, registerTheme, tokens } from './manager';

describe('ThemeManager', () => {
  beforeEach(() => {
    // Reset singleton if needed, but registering overwrites
  });

  it('creates new instance if none exists', () => {
    const oldInstance = (ThemeManager as any).instance;
    (ThemeManager as any).instance = undefined;
    expect(ThemeManager.getInstance()).toBeDefined();
    (ThemeManager as any).instance = oldInstance;
  });

  it('register and get theme', () => {
    const theme = { name: 'test-theme', tokens: { color: { primary: { $value: 'red' } } } };
    registerTheme(theme);
    expect(themeManager.getTheme('test-theme')).toBe(theme);
  });

  it('defineTheme returns theme', () => {
    const theme = { name: 'test-theme-2', tokens: {} };
    expect(defineTheme(theme)).toBe(theme);
  });

  it('setCurrentTheme and getCurrentTheme', () => {
    themeManager.setCurrentTheme('dark');
    expect(themeManager.getCurrentTheme()).toBe('dark');
  });

  it('tokens.get resolves path', () => {
    const theme = { name: 'light', tokens: { color: { primary: { DEFAULT: { $value: 'blue' } } } } };
    registerTheme(theme);
    themeManager.setCurrentTheme('light');
    expect(tokens.get('color.primary.DEFAULT')).toBe('blue');
  });

  it('tokens.get uses options.theme', () => {
    const theme = { name: 'custom', tokens: { space: '10px' } };
    registerTheme(theme);
    expect(tokens.get('space', { theme: 'custom' })).toBe('10px');
  });

  it('tokens.get returns undefined if fallback light theme is missing', () => {
    (themeManager as any).themes.clear();
    expect(tokens.get('color.primary.DEFAULT', { theme: 'non-existent' })).toBeUndefined();
  });

  it('tokens.get falls back to light theme if theme not found', () => {
    const theme = { name: 'light', tokens: { color: { primary: { DEFAULT: { $value: 'blue' } } } } };
    registerTheme(theme);
    themeManager.setCurrentTheme('non-existent');
    expect(tokens.get('color.primary.DEFAULT')).toBe('blue');
  });

  it('tokens.get returns undefined for invalid path', () => {
    themeManager.setCurrentTheme('light');
    expect(tokens.get('color.invalid.DEFAULT')).toBeUndefined();
  });

  it('tokens.get handles null objects gracefully', () => {
    const theme = { name: 'light', tokens: { color: null } };
    registerTheme(theme);
    themeManager.setCurrentTheme('light');
    expect(tokens.get('color.primary.DEFAULT')).toBeUndefined();
  });
  
  it('tokens.get resolves raw value if no $value', () => {
    const theme = { name: 'light', tokens: { spacing: { small: '4px' } } };
    registerTheme(theme);
    expect(tokens.get('spacing.small')).toBe('4px');
  });
});

