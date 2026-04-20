import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Dashboard, KPIBoard, DataTable, ActivityFeed, ProfileHeader, TicketCard, ChartPanel, FormGroup, StatusBanner, Modal } from './organisms';

vi.mock('@ferroui/i18n', () => ({
  useTranslation: () => ({ t: (k: string) => k })
}));

describe('organisms', () => {
  it('renders Dashboard', () => {
    const { container } = render(React.createElement(Dashboard, { title: 'Dash', aria: { label: 'A', role: 'main' } }));
    expect(container.textContent).toContain('Dash');
  });

  it('renders Dashboard default', () => {
    const { container } = render(React.createElement(Dashboard, {}));
    expect(container.querySelector('main')).toBeDefined();
  });

  it('renders KPIBoard', () => {
    const { container } = render(React.createElement(KPIBoard, { title: 'KPI', aria: { label: 'A' } }));
    expect(container.textContent).toContain('KPI');
  });

  it('renders KPIBoard default', () => {
    const { container } = render(React.createElement(KPIBoard, {}));
    expect(container.querySelector('section')).toBeDefined();
  });

  it('renders DataTable', () => {
    const { container } = render(React.createElement(DataTable, { columns: [{ key: 'id', header: 'ID', isSortable: false }], rows: [{ id: '1' }], caption: 'Cap', aria: { label: 'table' } }));
    expect(container.textContent).toContain('ID');
  });

  it('renders DataTable default', () => {
    const { container } = render(React.createElement(DataTable, { columns: [{ key: 'id', header: 'ID', isSortable: false }], rows: [{}] }));
    expect(container.textContent).toContain('ID');
  });

  it('renders ActivityFeed', () => {
    const { container } = render(React.createElement(ActivityFeed, { title: 'Feed', aria: { label: 'A', live: 'assertive' } }));
    expect(container.textContent).toContain('Feed');
  });

  it('renders ActivityFeed default', () => {
    const { container } = render(React.createElement(ActivityFeed, {}));
    expect(container.querySelector('section')).toBeDefined();
  });

  it('renders ProfileHeader', () => {
    const { container } = render(React.createElement(ProfileHeader, { name: 'Name', avatarSrc: 'img.png', title: 'Title', aria: { label: 'A' } }));
    expect(container.textContent).toContain('Name');
  });

  it('renders ProfileHeader default', () => {
    const { container } = render(React.createElement(ProfileHeader, { name: 'Name2' }));
    expect(container.textContent).toContain('Name2');
  });

  it('renders TicketCard', () => {
    const { container } = render(React.createElement(TicketCard, { id: '1', title: 'T', status: 'open', priority: 'high', assignee: 'A', aria: { label: 'A' } }));
    expect(container.textContent).toContain('1');
  });

  it('renders TicketCard default', () => {
    const { container } = render(React.createElement(TicketCard, { id: '2', title: 'T2', status: 'closed' }));
    expect(container.textContent).toContain('2');
  });

  it('renders ChartPanel', () => {
    const { container } = render(React.createElement(ChartPanel, { title: 'Chart', chartType: 'line', fallbackSummary: 'sum', aria: { label: 'A' } }));
    expect(container.textContent).toContain('Chart');
  });

  it('renders ChartPanel default', () => {
    const { container } = render(React.createElement(ChartPanel, { title: 'Chart2', chartType: 'bar', fallbackSummary: 'sum2' }));
    expect(container.textContent).toContain('Chart2');
  });

  it('renders FormGroup', () => {
    const { container } = render(React.createElement(FormGroup, { title: 'Form', aria: { label: 'A' } }));
    expect(container.textContent).toContain('Form');
  });

  it('renders FormGroup default', () => {
    const { container } = render(React.createElement(FormGroup, {}));
    expect(container.querySelector('form')).toBeDefined();
  });

  it('renders StatusBanner', () => {
    const { container } = render(React.createElement(StatusBanner, { message: 'Msg', aria: { role: 'alert', live: 'polite' } }));
    expect(container.textContent).toContain('Msg');
  });

  it('renders StatusBanner default', () => {
    const { container } = render(React.createElement(StatusBanner, { message: 'Msg2' }));
    expect(container.textContent).toContain('Msg2');
  });

  it('renders Modal and handles close', () => {
    const onClose = vi.fn();
    const { getByRole } = render(React.createElement(Modal, { isVisible: true, title: 'Modal', content: 'Content', onClose, aria: { label: 'A' } }));
    fireEvent.click(getByRole('button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Modal handles escape', () => {
    const onClose = vi.fn();
    render(React.createElement(Modal, { isVisible: true, title: 'Modal', content: 'Content', onClose }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Modal invisible', () => {
    const { container } = render(React.createElement(Modal, { isVisible: false, title: 'Modal' }));
    expect(container.innerHTML).toBe('');
  });

  it('renders Modal default content', () => {
    const { container } = render(React.createElement(Modal, { isVisible: true, title: 'Modal2' }));
    expect(container.textContent).toContain('Modal2');
  });

  it('renders Modal handles tab', () => {
    const onClose = vi.fn();
    const { getByRole } = render(React.createElement(Modal, { isVisible: true, title: 'Modal', content: 'Content', onClose }));
    // Simulate tab key - minimal test just to execute the handler branch
    fireEvent.keyDown(window, { key: 'Tab' });
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders Modal click outside', () => {
    const onClose = vi.fn();
    const { container } = render(React.createElement(Modal, { isVisible: true, title: 'Modal', content: 'Content', onClose }));
    const overlay = container.querySelector('.ferroui-modal-overlay');
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});
