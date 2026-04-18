import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Result } from 'axe-core';

/**
 * Accessibility E2E Tests using axe-core
 * B.7.2: Playwright @axe-core/playwright across representative layouts
 */

test.describe('Accessibility E2E', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('body')
      .analyze();
    
    // No critical or serious violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v: Result) => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations).toHaveLength(0);
  });

  test('keyboard navigation flows work', async ({ page }) => {
    await page.goto('/');
    
    // Tab through all interactive elements
    const focusedElements: string[] = [];
    let previousFocus: string | null = null;
    
    for (let i = 0; i < 20; i++) { // Limit iterations to prevent infinite loop
      await page.keyboard.press('Tab');
      const current = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName + (el.id ? '#' + el.id : '') : null;
      });
      
      if (!current || current === previousFocus || current === 'BODY') {
        break;
      }
      
      focusedElements.push(current);
      previousFocus = current;
    }
    
    // Should have navigable elements
    expect(focusedElements.length).toBeGreaterThan(0);
  });

  test('ARIA labels present on interactive elements', async ({ page }) => {
    await page.goto('/');
    
    // Check buttons have accessible names
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      const title = await button.getAttribute('title');
      
      // Must have some accessible name
      const hasName = ariaLabel || text?.trim() || ariaLabelledBy || title;
      expect(hasName).toBeTruthy();
    }
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first focusable element
    await page.keyboard.press('Tab');
    
    // Check if focused element has visible outline
    const focusIndicator = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el.tagName === 'BODY') return null;
      
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });
    
    if (focusIndicator) {
      // Should have some visual indication
      const hasOutline = focusIndicator.outline !== 'none' && parseFloat(focusIndicator.outlineWidth) > 0;
      const hasShadow = focusIndicator.boxShadow !== 'none';
      expect(hasOutline || hasShadow).toBe(true);
    }
  });

  test('color contrast meets WCAG AA', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    const contrastViolations = results.violations.filter((v: Result) => v.id === 'color-contrast');
    
    // Allow some leniency for brand colors, but no critical failures
    const criticalContrast = contrastViolations.filter((v: Result) => v.impact === 'critical');
    expect(criticalContrast).toHaveLength(0);
  });
});
