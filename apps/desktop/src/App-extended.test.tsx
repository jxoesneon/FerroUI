import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import type { FerroUILayout } from '@ferroui/schema';
import App from './App.js';

vi.mock('../../web/src/hooks/useFerroUILayout', () => ({
  useFerroUILayout: vi.fn(),
}));
vi.mock('../../web/src/components/FerroUIRenderer', () => ({
  FerroUIRenderer: ({ component }: { component: unknown }) => (
    <div data-testid="renderer">{JSON.stringify(component)}</div>
  ),
}));
vi.mock('../../web/src/services/ActionRouter', () => ({
  actionRouter: { setContext: vi.fn() },
}));
vi.mock('../../web/src/components/components-registration', () => ({}));
vi.mock('../../web/src/App.css', () => ({}));

import { useFerroUILayout } from '../../web/src/hooks/useFerroUILayout.js';

const mockHook = vi.mocked(useFerroUILayout);

type HookResult = { layout: Partial<FerroUILayout> | null; loading: boolean; error: Error | null; refresh: () => void };

function makeHook(overrides: Partial<HookResult> = {}): HookResult {
  return { layout: null, loading: false, error: null, refresh: vi.fn(), ...overrides };
}

function makeLayout(): Partial<FerroUILayout> {
  return {
    schemaVersion: '1.1.0',
    requestId: 'req-1',
    locale: 'en',
    layout: { type: 'Dashboard', id: 'root', props: {}, aria: { role: 'main' }, children: [] },
  };
}

beforeEach(() => vi.clearAllMocks());

describe('Desktop App — render states', () => {
  it('renders error state with retry button', () => {
    mockHook.mockReturnValue(makeHook({ error: new Error('Engine unreachable') }));
    render(<App />);
    expect(screen.getByText(/Engine Connection Error/i)).toBeDefined();
    expect(screen.getByText(/Engine unreachable/i)).toBeDefined();
  });

  it('calls refresh when retry button clicked', () => {
    const refresh = vi.fn();
    mockHook.mockReturnValue(makeHook({ error: new Error('Connection refused'), refresh }));
    render(<App />);
    fireEvent.click(screen.getByText(/Retry Connection/i));
    expect(refresh).toHaveBeenCalled();
  });

  it('renders loading indicator when loading', () => {
    mockHook.mockReturnValue(makeHook({ loading: true }));
    render(<App />);
    expect(screen.getByText(/Streaming Layout/i)).toBeDefined();
  });

  it('renders FerroUIRenderer when layout present', () => {
    mockHook.mockReturnValue(makeHook({ layout: makeLayout() }));
    render(<App />);
    expect(screen.getByTestId('renderer')).toBeDefined();
  });

  it('renders nothing when layout is null and not loading', () => {
    mockHook.mockReturnValue(makeHook());
    const { container } = render(<App />);
    expect(container.querySelector('[data-testid="renderer"]')).toBeNull();
  });
});
