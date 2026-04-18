// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { FerroUIErrorBoundary } from './ErrorBoundary';

expect.extend(matchers);

const ProblemChild = () => {
  throw new Error('Test Error');
};

describe('FerroUIErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(<FerroUIErrorBoundary><div data-testid="child">Safe Child</div></FerroUIErrorBoundary>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('catches error and renders fallback UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <FerroUIErrorBoundary name="TestComp">
        <ProblemChild />
      </FerroUIErrorBoundary>
    );
    expect(screen.getByText('Component Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to render component: TestComp')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('renders custom fallback if provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <FerroUIErrorBoundary fallback={<div data-testid="custom-fallback">Custom Fallback</div>}>
        <ProblemChild />
      </FerroUIErrorBoundary>
    );
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
