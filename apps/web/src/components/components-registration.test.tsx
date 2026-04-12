// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { Dashboard, Section, Card, Button, Text } from './components-registration';

expect.extend(matchers);

describe('Components Registration', () => {
  it('renders Dashboard correctly', () => {
    render(<Dashboard><div>Child Content</div></Dashboard>);
    expect(screen.getByText('Alloy UI Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders Section correctly', () => {
    render(<Section title="My Section"><div>Section Content</div></Section>);
    expect(screen.getByText('My Section')).toBeInTheDocument();
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });

  it('renders Card correctly', () => {
    render(<Card title="My Card" content="Card Content"><div>Card Actions</div></Card>);
    expect(screen.getByText('My Card')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Actions')).toBeInTheDocument();
  });

  it('renders Button correctly', () => {
    const onClick = vi.fn();
    render(<Button label="Click Me" onClick={onClick} />);
    const btn = screen.getByText('Click Me');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders Text correctly with sizes', () => {
    const { rerender } = render(<Text value="Small text" size="sm" />);
    expect(screen.getByText('Small text')).toHaveClass('text-sm');

    rerender(<Text value="Medium text" size="md" />);
    expect(screen.getByText('Medium text')).toHaveClass('text-base');

    rerender(<Text value="Large text" size="lg" />);
    expect(screen.getByText('Large text')).toHaveClass('text-lg font-semibold');
  });
});
