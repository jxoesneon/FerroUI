/**
 * FerroUI Accessibility Tests — WCAG 2.2 AA
 *
 * Covers schema-level aria enforcement and component-level a11y requirements.
 * These tests do NOT require a DOM renderer — they validate schema construction rules.
 */
import { describe, it, expect } from 'vitest';
import { validateLayout } from '@ferroui/schema';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeLayout(rootComponent: object) {
  return {
    schemaVersion: '1.1.0',
    requestId: '00000000-0000-4000-a000-000000000001',
    locale: 'en',
    layout: rootComponent,
  };
}

function makeDashboard(children: object[] = [], aria?: object): object {
  return {
    type: 'Dashboard',
    id: 'root',
    props: { heading: 'Test' },
    aria: aria ?? { role: 'main', label: 'Test Dashboard' },
    children,
  };
}

function makeAtom(id: string, aria?: object): object {
  return {
    type: 'atom',
    id,
    props: { label: 'Test' },
    aria: aria ?? { role: 'button', label: 'Test action' },
  };
}

// ── 1. Schema-level: aria presence ───────────────────────────────────────────

describe('WCAG 2.2 AA — aria schema rules', () => {
  it('validates a layout where root organism has aria.role and aria.label', () => {
    const layout = makeLayout(makeDashboard());
    const result = validateLayout(layout);
    expect(result.valid).toBe(true);
  });

  it('validates a layout where atom has aria.role = "button" and aria.label', () => {
    const atom = makeAtom('btn-1', { role: 'button', label: 'Submit' });
    const layout = makeLayout(makeDashboard([atom]));
    const result = validateLayout(layout);
    expect(result.valid).toBe(true);
  });

  it('validates aria.live = "polite" on a status region', () => {
    const statusAtom: object = {
      type: 'atom',
      id: 'status',
      props: { message: 'Loading…' },
      aria: { role: 'status', live: 'polite', label: 'Status' },
    };
    const layout = makeLayout(makeDashboard([statusAtom]));
    const result = validateLayout(layout);
    expect(result.valid).toBe(true);
  });

  it('validates aria.live = "assertive" on an alert', () => {
    const alertAtom: object = {
      type: 'atom',
      id: 'alert',
      props: { message: 'Error occurred' },
      aria: { role: 'alert', live: 'assertive', label: 'Alert' },
    };
    const layout = makeLayout(makeDashboard([alertAtom]));
    const result = validateLayout(layout);
    expect(result.valid).toBe(true);
  });

  it('rejects aria.live with an invalid value', () => {
    const atom: object = {
      type: 'atom',
      id: 'bad',
      props: {},
      aria: { role: 'status', live: 'immediate' },
    };
    const layout = makeLayout(makeDashboard([atom]));
    const result = validateLayout(layout);
    expect(result.valid).toBe(false);
  });
});

// ── 2. Interactive elements must have accessible labels ───────────────────────

describe('WCAG 2.2 AA — interactive element labelling (SC 4.1.2)', () => {
  it('allows a button atom with aria.label', () => {
    const atom = makeAtom('btn', { role: 'button', label: 'Close dialog' });
    const layout = makeLayout(makeDashboard([atom]));
    expect(validateLayout(layout).valid).toBe(true);
  });

  it('allows a button atom with aria.labelledBy', () => {
    const atom: object = {
      type: 'atom',
      id: 'btn',
      props: {},
      aria: { role: 'button', labelledBy: 'heading-1' },
    };
    const layout = makeLayout(makeDashboard([atom]));
    expect(validateLayout(layout).valid).toBe(true);
  });

  it('allows a button atom with aria.describedBy', () => {
    const atom: object = {
      type: 'atom',
      id: 'btn',
      props: {},
      aria: { role: 'button', label: 'Save', describedBy: 'save-hint' },
    };
    const layout = makeLayout(makeDashboard([atom]));
    expect(validateLayout(layout).valid).toBe(true);
  });
});

// ── 3. aria.hidden must be boolean ───────────────────────────────────────────

describe('WCAG 2.2 AA — aria-hidden typing (SC 1.3.1)', () => {
  it('allows aria.hidden = true on decorative elements', () => {
    const icon: object = {
      type: 'atom',
      id: 'icon',
      props: { src: 'icon.svg' },
      aria: { hidden: true },
    };
    const layout = makeLayout(makeDashboard([icon]));
    expect(validateLayout(layout).valid).toBe(true);
  });

  it('allows aria.hidden = false explicitly', () => {
    const icon: object = {
      type: 'atom',
      id: 'icon',
      props: {},
      aria: { hidden: false, label: 'Edit icon' },
    };
    const layout = makeLayout(makeDashboard([icon]));
    expect(validateLayout(layout).valid).toBe(true);
  });

  it('rejects aria.hidden as a string', () => {
    const icon: object = {
      type: 'atom',
      id: 'icon',
      props: {},
      aria: { hidden: 'yes' },
    };
    const layout = makeLayout(makeDashboard([icon]));
    expect(validateLayout(layout).valid).toBe(false);
  });
});

// ── 4. Landmark roles (SC 1.3.6) ─────────────────────────────────────────────

describe('WCAG 2.2 AA — landmark regions (SC 1.3.6)', () => {
  it('validates role = "main" on root organism', () => {
    const layout = makeLayout(makeDashboard([], { role: 'main', label: 'Main content' }));
    expect(validateLayout(layout).valid).toBe(true);
  });

  it('validates role = "navigation" on a nav molecule', () => {
    const nav: object = {
      type: 'molecule',
      id: 'nav',
      layout: 'inline',
      props: {},
      aria: { role: 'navigation', label: 'Primary navigation' },
      children: [],
    };
    const layout = makeLayout(makeDashboard([nav]));
    expect(validateLayout(layout).valid).toBe(true);
  });

  it('validates role = "region" on a content section', () => {
    const section: object = {
      type: 'molecule',
      id: 'section',
      layout: 'stack',
      props: {},
      aria: { role: 'region', label: 'Revenue section', labelledBy: 'heading-revenue' },
      children: [],
    };
    const layout = makeLayout(makeDashboard([section]));
    expect(validateLayout(layout).valid).toBe(true);
  });
});

// ── 5. Full layout end-to-end a11y ────────────────────────────────────────────

describe('WCAG 2.2 AA — full layout validation', () => {
  it('validates a complete accessible dashboard layout', () => {
    const layout = makeLayout({
      type: 'Dashboard',
      id: 'dashboard',
      aria: { role: 'main', label: 'Sales Dashboard' },
      props: { heading: 'Sales Dashboard' },
      children: [
        {
          type: 'KPIBoard',
          id: 'kpi-section',
          aria: { role: 'region', label: 'Key Performance Indicators' },
          props: {},
          children: [
            {
              type: 'StatBadge',
              id: 'kpi-revenue',
              aria: { role: 'img', label: 'Revenue: $50,000' },
              props: { label: 'Revenue', value: '$50,000' },
            },
          ],
        },
        {
          type: 'FormGroup',
          id: 'action-section',
          aria: { role: 'group', label: 'Actions' },
          props: {},
          children: [
            {
              type: 'ActionButton',
              id: 'export-btn',
              aria: { role: 'button', label: 'Export CSV', describedBy: 'export-hint' },
              props: { label: 'Export' },
            },
          ],
        },
      ],
    });

    const result = validateLayout(layout);
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });
});
