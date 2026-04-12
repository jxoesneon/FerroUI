// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { AlloyRenderer } from './AlloyRenderer';
import { registry } from '@alloy/registry';
import { actionRouter } from '../services/ActionRouter';

expect.extend(matchers);

// Mock actionRouter
vi.mock('../services/ActionRouter', () => ({
  actionRouter: {
    dispatch: vi.fn(),
  },
}));

describe('AlloyRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a missing component fallback', () => {
    render(<AlloyRenderer component={{ type: 'Unknown', id: '1', props: {} } as any} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText(/Missing Component/)).toBeInTheDocument();
  });

  it('renders a registered component and handles actions', async () => {
    // Register a mock component
    registry.registerComponent({
      name: 'MockButton',
      version: 1,
      tier: 'ATOM' as any,
      component: ({ label, children }: any) => <button>{label}{children}</button>,
      schema: {} as any,
    });

    const action = { type: 'REFRESH', payload: {} } as any;

    render(
      <AlloyRenderer
        component={{
          type: 'MockButton',
          id: 'btn-1',
          props: { label: 'My Button ' },
          action,
          aria: { role: 'button', label: 'Aria Label' },
        } as any}
      />
    );

    const btn = screen.getByText('My Button');
    expect(btn).toBeInTheDocument();

    const wrapper = btn.closest('div');
    expect(wrapper).toHaveAttribute('role', 'button');
    expect(wrapper).toHaveAttribute('aria-label', 'Aria Label');

    await act(async () => {
      fireEvent.click(wrapper!);
    });
    
    expect(actionRouter.dispatch).toHaveBeenCalledWith(action);
  });

  it('renders children recursively', () => {
    registry.registerComponent({
      name: 'MockContainer',
      version: 1,
      tier: 'ORGANISM' as any,
      component: ({ children }: any) => <div data-testid="container">{children}</div>,
      schema: {} as any,
    });

    registry.registerComponent({
      name: 'MockChild',
      version: 1,
      tier: 'ATOM' as any,
      component: () => <span data-testid="child">Child Node</span>,
      schema: {} as any,
    });

    render(
      <AlloyRenderer
        component={{
          type: 'MockContainer',
          id: 'container-1',
          props: {},
          children: [
            { type: 'MockChild', id: 'child-1', props: {} }
          ]
        } as any}
      />
    );

    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
