import React, { forwardRef, memo, useEffect, useRef } from 'react';
import { z } from 'zod';
import { ComponentTier } from '@ferroui/schema';
import { useTranslation } from '@ferroui/i18n';
import { registerComponent } from '../registry';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const DashboardSchema = z.object({
  title: z.string().optional(),
  aria: z.object({ label: z.string(), role: z.string().default('main') }),
}).describe('Root layout container. Must be the top-level component.');

export type DashboardProps = z.infer<typeof DashboardSchema> & { children?: React.ReactNode };

export const Dashboard = memo(forwardRef<HTMLElement, DashboardProps>(
  ({ title, children, aria = { label: '', role: 'main' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('main', {
      ref,
      className: 'ferroui-dashboard',
      role: aria?.role || 'main',
      'aria-label': aria?.label ? t(aria.label) : undefined
    },
      title ? React.createElement('h1', { className: 'ferroui-dashboard__title' }, t(title)) : null,
      children,
    );
  }
));

Dashboard.displayName = 'Dashboard';

registerComponent({ name: 'Dashboard', version: 1, tier: ComponentTier.ORGANISM, component: Dashboard, schema: DashboardSchema });

// ─── KPIBoard ─────────────────────────────────────────────────────────────────
export const KPIBoardSchema = z.object({
  title: z.string().optional(),
  columns: z.number().int().min(1).max(6).default(4),
  aria: z.object({ label: z.string() }),
}).describe('Grid container for KPI stat cards.');

export type KPIBoardProps = z.infer<typeof KPIBoardSchema> & { children?: React.ReactNode };

export const KPIBoard = memo(forwardRef<HTMLElement, KPIBoardProps>(
  ({ title, columns = 4, children, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('section', {
      ref,
      className: 'ferroui-kpi-board',
      'aria-label': aria?.label ? t(aria.label) : undefined
    },
      title ? React.createElement('h2', { className: 'ferroui-kpi-board__title' }, t(title)) : null,
      React.createElement('div', { className: 'ferroui-kpi-board__grid', style: { gridTemplateColumns: `repeat(${columns}, 1fr)` } }, children),
    );
  }
));

KPIBoard.displayName = 'KPIBoard';

registerComponent({ name: 'KPIBoard', version: 1, tier: ComponentTier.ORGANISM, component: KPIBoard, schema: KPIBoardSchema });

// ─── DataTable ────────────────────────────────────────────────────────────────
export const DataTableSchema = z.object({
  columns: z.array(z.object({
    key: z.string(),
    header: z.string(),
    isSortable: z.boolean().default(false),
  })).describe('Column definitions'),
  rows: z.array(z.record(z.string(), z.unknown())).describe('Row data'),
  caption: z.string().optional(),
  aria: z.object({ label: z.string() }),
}).describe('Tabular data display with column definitions.');

export type DataTableProps = z.infer<typeof DataTableSchema>;

export const DataTable = memo(forwardRef<HTMLTableElement, DataTableProps>(
  ({ columns, rows, caption, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('table', {
      ref,
      className: 'ferroui-data-table',
      role: 'table',
      'aria-label': aria?.label ? t(aria.label) : undefined
    },
      caption ? React.createElement('caption', null, t(caption)) : null,
      React.createElement('thead', null,
        React.createElement('tr', null,
          columns.map(col => React.createElement('th', { key: col.key, scope: 'col' }, t(col.header))),
        ),
      ),
      React.createElement('tbody', null,
        rows.map((row, i) =>
          React.createElement('tr', { key: i },
            columns.map(col => React.createElement('td', { key: col.key }, String(row[col.key] ?? ''))),
          ),
        ),
      ),
    );
  }
));

DataTable.displayName = 'DataTable';

registerComponent({ name: 'DataTable', version: 1, tier: ComponentTier.ORGANISM, component: DataTable, schema: DataTableSchema });

// ─── ActivityFeed ─────────────────────────────────────────────────────────────
export const ActivityFeedSchema = z.object({
  title: z.string().optional(),
  maxItems: z.number().int().default(10),
  aria: z.object({ label: z.string(), live: z.enum(['off', 'polite', 'assertive']).default('polite') }),
}).describe('A live-updating activity feed.');

export type ActivityFeedProps = z.infer<typeof ActivityFeedSchema> & { children?: React.ReactNode };

export const ActivityFeed = memo(forwardRef<HTMLElement, ActivityFeedProps>(
  ({ title, children, aria = { label: '', live: 'polite' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('section', {
      ref,
      className: 'ferroui-activity-feed',
      'aria-label': aria?.label ? t(aria.label) : undefined,
      'aria-live': aria?.live || 'polite'
    },
      title ? React.createElement('h2', { className: 'ferroui-activity-feed__title' }, t(title)) : null,
      React.createElement('ul', { className: 'ferroui-activity-feed__list' }, children),
    );
  }
));

ActivityFeed.displayName = 'ActivityFeed';

registerComponent({ name: 'ActivityFeed', version: 1, tier: ComponentTier.ORGANISM, component: ActivityFeed, schema: ActivityFeedSchema });

// ─── ProfileHeader ────────────────────────────────────────────────────────────
export const ProfileHeaderSchema = z.object({
  name: z.string().describe('User name'),
  title: z.string().optional(),
  avatarSrc: z.string().optional(),
  coverSrc: z.string().optional(),
  aria: z.object({ label: z.string() }),
}).describe('User profile header with avatar and cover image.');

export type ProfileHeaderProps = z.infer<typeof ProfileHeaderSchema>;

export const ProfileHeader = memo(forwardRef<HTMLElement, ProfileHeaderProps>(
  ({ name, title, avatarSrc, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('header', {
      ref,
      className: 'ferroui-profile-header',
      'aria-label': aria?.label ? t(aria.label) : undefined
    },
      avatarSrc ? React.createElement('img', { src: avatarSrc, alt: name, className: 'ferroui-profile-header__avatar' }) : null,
      React.createElement('div', { className: 'ferroui-profile-header__info' },
        React.createElement('h1', null, name),
        title ? React.createElement('p', null, t(title)) : null,
      ),
    );
  }
));

ProfileHeader.displayName = 'ProfileHeader';

registerComponent({ name: 'ProfileHeader', version: 1, tier: ComponentTier.ORGANISM, component: ProfileHeader, schema: ProfileHeaderSchema });

// ─── TicketCard ───────────────────────────────────────────────────────────────
export const TicketCardSchema = z.object({
  id: z.string().describe('Ticket ID'),
  title: z.string().describe('Ticket title'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).describe('Ticket status'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignee: z.string().optional(),
  aria: z.object({ label: z.string() }),
}).describe('A support/issue ticket card.');

export type TicketCardProps = z.infer<typeof TicketCardSchema>;

export const TicketCard = memo(forwardRef<HTMLElement, TicketCardProps>(
  ({ id, title, status, priority, assignee, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('article', {
      ref,
      className: `ferroui-ticket-card ferroui-ticket-card--${status}`,
      'aria-label': aria?.label ? t(aria.label) : undefined
    },
      React.createElement('div', { className: 'ferroui-ticket-card__header' },
        React.createElement('span', { className: 'ferroui-ticket-card__id' }, id),
        React.createElement('span', { className: `ferroui-ticket-card__status ferroui-ticket-card__status--${status}` }, t(status)),
      ),
      React.createElement('h3', { className: 'ferroui-ticket-card__title' }, t(title)),
      React.createElement('div', { className: 'ferroui-ticket-card__meta' },
        priority ? React.createElement('span', { className: `ferroui-ticket-card__priority ferroui-ticket-card__priority--${priority}` }, t(priority)) : null,
        assignee ? React.createElement('span', { className: 'ferroui-ticket-card__assignee' }, assignee) : null,
      ),
    );
  }
));

TicketCard.displayName = 'TicketCard';

registerComponent({ name: 'TicketCard', version: 1, tier: ComponentTier.ORGANISM, component: TicketCard, schema: TicketCardSchema });

// ─── ChartPanel ───────────────────────────────────────────────────────────────
export const ChartPanelSchema = z.object({
  title: z.string().describe('Chart title'),
  chartType: z.enum(['line', 'bar', 'pie', 'area', 'scatter']).describe('Chart type'),
  data: z.any().optional().describe('Chart data payload'),
  fallbackSummary: z.string().describe('Mandatory text summary for screen readers (sr-only)'),
  aria: z.object({ label: z.string() }),
}).describe('A chart display panel (data visualization).');

export type ChartPanelProps = z.infer<typeof ChartPanelSchema>;

export const ChartPanel = memo(forwardRef<HTMLElement, ChartPanelProps>(
  ({ title, chartType, fallbackSummary, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('figure', {
      ref,
      className: 'ferroui-chart-panel',
      role: 'img',
      'aria-label': aria?.label ? t(aria.label) : undefined
    },
      React.createElement('figcaption', { className: 'ferroui-chart-panel__title' }, t(title)),
      React.createElement('div', { className: `ferroui-chart-panel__canvas ferroui-chart-panel__canvas--${chartType}`, 'data-chart-type': chartType }),
      // A11y fallback as per Spec §3.1
      React.createElement('div', { className: 'ferroui-chart-panel__fallback sr-only' }, t(fallbackSummary))
    );
  }
));

ChartPanel.displayName = 'ChartPanel';

registerComponent({ name: 'ChartPanel', version: 1, tier: ComponentTier.ORGANISM, component: ChartPanel, schema: ChartPanelSchema });

// ─── FormGroup ────────────────────────────────────────────────────────────────
export const FormGroupSchema = z.object({
  title: z.string().optional(),
  submitContent: z.string().default('Submit'),
  aria: z.object({ label: z.string() }),
}).describe('A form container grouping FormField molecules.');

export type FormGroupProps = z.infer<typeof FormGroupSchema> & { children?: React.ReactNode };

export const FormGroup = memo(forwardRef<HTMLFormElement, FormGroupProps>(
  ({ title, submitContent = 'Submit', children, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('form', {
      ref,
      className: 'ferroui-form-group',
      'aria-label': aria?.label ? t(aria.label) : undefined
    },
      title ? React.createElement('h2', { className: 'ferroui-form-group__title' }, t(title)) : null,
      children,
      React.createElement('button', { type: 'submit', className: 'ferroui-form-group__submit' }, t(submitContent)),
    );
  }
));

FormGroup.displayName = 'FormGroup';

registerComponent({ name: 'FormGroup', version: 1, tier: ComponentTier.ORGANISM, component: FormGroup, schema: FormGroupSchema });

// ─── StatusBanner ─────────────────────────────────────────────────────────────
export const StatusBannerSchema = z.object({
  message: z.string().describe('Banner message'),
  variant: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  isDismissible: z.boolean().default(false),
  aria: z.object({ role: z.string().default('alert'), live: z.enum(['off', 'polite', 'assertive']).default('assertive') }),
}).describe('A status/alert banner at the top of a section.');

export type StatusBannerProps = z.infer<typeof StatusBannerSchema>;

export const StatusBanner = memo(forwardRef<HTMLDivElement, StatusBannerProps>(
  ({ message, variant = 'info', aria = { role: 'alert', live: 'assertive' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('div', {
      ref,
      className: `ferroui-status-banner ferroui-status-banner--${variant}`,
      role: aria?.role || 'alert',
      'aria-live': aria?.live || 'assertive'
    },
      React.createElement('span', null, t(message)),
    );
  }
));

StatusBanner.displayName = 'StatusBanner';

registerComponent({ name: 'StatusBanner', version: 1, tier: ComponentTier.ORGANISM, component: StatusBanner, schema: StatusBannerSchema });

// ─── Modal ────────────────────────────────────────────────────────────────────
export const ModalSchema = z.object({
  isVisible: z.boolean().default(false),
  title: z.string().describe('Modal title'),
  content: z.string().optional().describe('Text content'),
  aria: z.object({ label: z.string() }),
}).describe('A compliant modal dialog.');

export type ModalProps = z.infer<typeof ModalSchema> & { onClose?: () => void, children?: React.ReactNode };

export const Modal = memo(forwardRef<HTMLDivElement, ModalProps>(
  ({ isVisible, title, content, onClose, children, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    const modalRef = useRef<HTMLDivElement>(null);
    const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;

    useEffect(() => {
      if (!isVisible) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose?.();
        }
        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      const originalFocus = document.activeElement as HTMLElement;
      window.addEventListener('keydown', handleKeyDown);
      
      // Focus modal on open
      setTimeout(() => modalRef.current?.focus(), 0);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        originalFocus?.focus();
      };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return React.createElement('div', {
      className: 'ferroui-modal-overlay',
      onClick: (e) => e.target === e.currentTarget && onClose?.(),
    },
      React.createElement('div', {
        ref: (el: HTMLDivElement | null) => {
          (modalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        },
        className: 'ferroui-modal',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': titleId,
        'aria-label': aria?.label ? t(aria.label) : undefined,
        tabIndex: -1,
      },
        React.createElement('div', { className: 'ferroui-modal__header' },
          React.createElement('h2', { id: titleId, className: 'ferroui-modal__title' }, t(title)),
          React.createElement('button', {
            className: 'ferroui-modal__close',
            onClick: onClose,
            'aria-label': t('Close modal'),
          }, '×'),
        ),
        React.createElement('div', { className: 'ferroui-modal__content' },
          content ? React.createElement('p', null, t(content)) : null,
          children,
        ),
      ),
    );
  }
));

Modal.displayName = 'Modal';

registerComponent({ name: 'Modal', version: 1, tier: ComponentTier.ORGANISM, component: Modal, schema: ModalSchema });
