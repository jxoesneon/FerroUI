import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Text, Icon, Badge, Divider, Skeleton, Avatar, Tag, IconSchema } from './atoms';

vi.mock('@ferroui/i18n', () => ({
  useTranslation: () => ({ t: (k: string) => k, direction: 'ltr' })
}));

describe('atoms', () => {
  it('IconSchema rejects when aria.hidden is false without a label', () => {
    const result = IconSchema.safeParse({ name: 'test', aria: { hidden: false } });
    expect(result.success).toBe(false);
  });

  it('renders Text', () => {
    const { container } = render(React.createElement(Text, { content: 'test text', aria: { hidden: true, label: 'L' } }));
    expect(container.textContent).toBe('test text');
  });

  it('renders Text default args', () => {
    const { container } = render(React.createElement(Text, { content: 'test text2' }));
    expect(container.textContent).toBe('test text2');
  });

  it('renders Icon', () => {
    const { container } = render(React.createElement(Icon, { name: 'test-icon', aria: { hidden: false, label: 'I' } }));
    expect(container.querySelector('span')).toBeDefined();
  });

  it('renders Icon default args', () => {
    const { container } = render(React.createElement(Icon, { name: 'test-icon' }));
    expect(container.querySelector('span')).toBeDefined();
  });

  it('renders Badge', () => {
    const { container } = render(React.createElement(Badge, { content: 'badge', aria: { hidden: true, label: 'B' } }));
    expect(container.textContent).toBe('badge');
  });

  it('renders Badge default args', () => {
    const { container } = render(React.createElement(Badge, { content: 'badge2' }));
    expect(container.textContent).toBe('badge2');
  });

  it('renders Divider', () => {
    const { container } = render(React.createElement(Divider, { aria: { hidden: false, label: 'D' } }));
    expect(container.querySelector('hr')).toBeDefined();
  });

  it('renders Divider default args', () => {
    const { container } = render(React.createElement(Divider, {}));
    expect(container.querySelector('hr')).toBeDefined();
  });

  it('renders Skeleton', () => {
    const { container } = render(React.createElement(Skeleton, { aria: { label: 'S' } }));
    expect(container.querySelector('div')).toBeDefined();
  });

  it('renders Skeleton default args', () => {
    const { container } = render(React.createElement(Skeleton, {}));
    expect(container.querySelector('div')).toBeDefined();
  });

  it('renders Avatar with src', () => {
    const { container } = render(React.createElement(Avatar, { src: 'img.png', aria: { label: 'A' } }));
    expect(container.querySelector('img')).toBeDefined();
  });
  
  it('renders Avatar with initials', () => {
    const { container } = render(React.createElement(Avatar, { initials: 'AB' }));
    expect(container.textContent).toBe('AB');
  });

  it('renders Avatar default args', () => {
    const { container } = render(React.createElement(Avatar, {}));
    expect(container.textContent).toBe('?');
  });

  it('renders Tag', () => {
    const { container } = render(React.createElement(Tag, { content: 'tag', aria: { label: 'T' } }));
    expect(container.textContent).toBe('tag');
  });

  it('renders Tag removable', () => {
    const { container } = render(React.createElement(Tag, { content: 'tag2', isRemovable: true }));
    expect(container.textContent).toBe('tag2');
  });
});
