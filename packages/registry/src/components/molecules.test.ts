import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { StatBadge, UserAvatar, MetricRow, ActionButton, FormField, SearchBar } from './molecules';

vi.mock('@ferroui/i18n', () => ({
  useTranslation: () => ({ t: (k: string) => k })
}));

describe('molecules', () => {
  it('renders StatBadge', () => {
    const { container } = render(React.createElement(StatBadge, { title: 'T', value: 10, trend: 'up', aria: { label: 'A' } }));
    expect(container.textContent).toContain('T');
  });

  it('renders StatBadge default', () => {
    const { container } = render(React.createElement(StatBadge, { title: 'T2', value: 20 }));
    expect(container.textContent).toContain('T2');
  });

  it('renders UserAvatar', () => {
    const { container } = render(React.createElement(UserAvatar, { name: 'Name', subtitle: 'Sub', aria: { label: 'A' } }));
    expect(container.textContent).toContain('Name');
  });

  it('renders UserAvatar default', () => {
    const { container } = render(React.createElement(UserAvatar, { name: 'Name2' }));
    expect(container.textContent).toContain('Name2');
  });

  it('renders MetricRow', () => {
    const { container } = render(React.createElement(MetricRow, { title: 'Row', value: 5, unit: 'kg', aria: { label: 'A' } }));
    expect(container.textContent).toContain('Row');
  });

  it('renders MetricRow default', () => {
    const { container } = render(React.createElement(MetricRow, { title: 'Row2', value: 10 }));
    expect(container.textContent).toContain('Row2');
  });

  it('renders ActionButton and handles click', () => {
    const onClick = vi.fn();
    const { getByRole } = render(React.createElement(ActionButton, { content: 'Btn', onClick, aria: { label: 'A' } }));
    fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders ActionButton keydown', () => {
    const onClick = vi.fn();
    const { getByRole } = render(React.createElement(ActionButton, { content: 'Btn', onClick }));
    fireEvent.keyDown(getByRole('button'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });

  it('renders ActionButton disabled', () => {
    const onClick = vi.fn();
    const { getByRole } = render(React.createElement(ActionButton, { content: 'Btn', onClick, isDisabled: true }));
    fireEvent.keyDown(getByRole('button'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders FormField with error', () => {
    const { container } = render(React.createElement(FormField, { name: 'f', title: 'F', error: 'err', aria: { label: 'A', describedBy: 'desc' } }));
    expect(container.textContent).toContain('err');
  });

  it('renders FormField default', () => {
    const { container } = render(React.createElement(FormField, { name: 'f2', title: 'F2', isRequired: true, placeholder: 'ph' }));
    expect(container.textContent).toContain('F2');
  });

  it('renders SearchBar', () => {
    const { getByRole } = render(React.createElement(SearchBar, { aria: { label: 'A' }, placeholder: 'P' }));
    expect(getByRole('searchbox')).toBeDefined();
  });

  it('renders SearchBar default', () => {
    const { getByRole } = render(React.createElement(SearchBar, {}));
    expect(getByRole('searchbox')).toBeDefined();
  });
});
