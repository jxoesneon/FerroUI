// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { AlloyErrorBoundary } from './ErrorBoundary';

expect.extend(matchers);

const ProblemChild = () => {
  throw new Error('Test Error');
};

describe('AlloyErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(<AlloyErrorBoundary><div data-testid="child">Safe Child</div></AlloyErrorBoundary>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('catches error and renders fallback UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <AlloyErrorBoundary name="TestComp">
        <ProblemChild />
      </AlloyErrorBoundary>
    );
    expect(screen.getByText('Component Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to render component: TestComp')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('renders custom fallback if provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <AlloyErrorBoundary fallback={<div data-testid="custom-fallback">Custom Fallback</div>}>
        <ProblemChild />
      </AlloyErrorBoundary>
    );
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
