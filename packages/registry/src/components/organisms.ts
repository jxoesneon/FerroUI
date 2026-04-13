import React from 'react';
import { z } from 'zod';
import { ComponentTier } from '@alloy/schema';
import { registerComponent } from '../registry';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const DashboardSchema = z.object({
  title: z.string().optional(),
  aria: z.object({ label: z.string().default('Dashboard'), role: z.string().default('main') }).optional(),
}).describe('Root layout container. Must be the top-level component.');

export const Dashboard: React.FC<z.infer<typeof DashboardSchema> & { children?: React.ReactNode }> = ({ title, children }) => {
  return React.createElement('main', { className: 'alloy-dashboard', role: 'main', 'aria-label': title ?? 'Dashboard' },
    title ? React.createElement('h1', { className: 'alloy-dashboard__title' }, title) : null,
    children,
  );
};

registerComponent({ name: 'Dashboard', version: 1, tier: ComponentTier.ORGANISM, component: Dashboard, schema: DashboardSchema });

// ─── KPIBoard ─────────────────────────────────────────────────────────────────
export const KPIBoardSchema = z.object({
  title: z.string().optional(),
  columns: z.number().int().min(1).max(6).default(4),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('Grid container for KPI stat cards.');

export const KPIBoard: React.FC<z.infer<typeof KPIBoardSchema> & { children?: React.ReactNode }> = ({ title, columns = 4, children }) => {
  return React.createElement('section', { className: 'alloy-kpi-board', 'aria-label': title ?? 'Key Performance Indicators' },
    title ? React.createElement('h2', { className: 'alloy-kpi-board__title' }, title) : null,
    React.createElement('div', { className: 'alloy-kpi-board__grid', style: { gridTemplateColumns: `repeat(${columns}, 1fr)` } }, children),
  );
};

registerComponent({ name: 'KPIBoard', version: 1, tier: ComponentTier.ORGANISM, component: KPIBoard, schema: KPIBoardSchema });

// ─── DataTable ────────────────────────────────────────────────────────────────
export const DataTableSchema = z.object({
  columns: z.array(z.object({
    key: z.string(),
    header: z.string(),
    sortable: z.boolean().default(false),
  })).describe('Column definitions'),
  rows: z.array(z.record(z.string(), z.unknown())).describe('Row data'),
  caption: z.string().optional(),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('Tabular data display with column definitions.');

export const DataTable: React.FC<z.infer<typeof DataTableSchema>> = ({ columns, rows, caption }) => {
  return React.createElement('table', { className: 'alloy-data-table', role: 'table' },
    caption ? React.createElement('caption', null, caption) : null,
    React.createElement('thead', null,
      React.createElement('tr', null,
        columns.map(col => React.createElement('th', { key: col.key, scope: 'col' }, col.header)),
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
};

registerComponent({ name: 'DataTable', version: 1, tier: ComponentTier.ORGANISM, component: DataTable, schema: DataTableSchema });

// ─── ActivityFeed ─────────────────────────────────────────────────────────────
export const ActivityFeedSchema = z.object({
  title: z.string().optional(),
  maxItems: z.number().int().default(10),
  aria: z.object({ label: z.string().optional(), live: z.enum(['off', 'polite', 'assertive']).default('polite') }).optional(),
}).describe('A live-updating activity feed.');

export const ActivityFeed: React.FC<z.infer<typeof ActivityFeedSchema> & { children?: React.ReactNode }> = ({ title, children }) => {
  return React.createElement('section', { className: 'alloy-activity-feed', 'aria-label': title ?? 'Activity Feed', 'aria-live': 'polite' },
    title ? React.createElement('h2', { className: 'alloy-activity-feed__title' }, title) : null,
    React.createElement('ul', { className: 'alloy-activity-feed__list' }, children),
  );
};

registerComponent({ name: 'ActivityFeed', version: 1, tier: ComponentTier.ORGANISM, component: ActivityFeed, schema: ActivityFeedSchema });

// ─── ProfileHeader ────────────────────────────────────────────────────────────
export const ProfileHeaderSchema = z.object({
  name: z.string().describe('User name'),
  title: z.string().optional(),
  avatarSrc: z.string().optional(),
  coverSrc: z.string().optional(),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('User profile header with avatar and cover image.');

export const ProfileHeader: React.FC<z.infer<typeof ProfileHeaderSchema>> = ({ name, title, avatarSrc }) => {
  return React.createElement('header', { className: 'alloy-profile-header', 'aria-label': `${name} profile` },
    avatarSrc ? React.createElement('img', { src: avatarSrc, alt: name, className: 'alloy-profile-header__avatar' }) : null,
    React.createElement('div', { className: 'alloy-profile-header__info' },
      React.createElement('h1', null, name),
      title ? React.createElement('p', null, title) : null,
    ),
  );
};

registerComponent({ name: 'ProfileHeader', version: 1, tier: ComponentTier.ORGANISM, component: ProfileHeader, schema: ProfileHeaderSchema });

// ─── TicketCard ───────────────────────────────────────────────────────────────
export const TicketCardSchema = z.object({
  id: z.string().describe('Ticket ID'),
  title: z.string().describe('Ticket title'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).describe('Ticket status'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignee: z.string().optional(),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('A support/issue ticket card.');

export const TicketCard: React.FC<z.infer<typeof TicketCardSchema>> = ({ id, title, status, priority, assignee }) => {
  return React.createElement('article', { className: `alloy-ticket-card alloy-ticket-card--${status}`, 'aria-label': `Ticket ${id}: ${title}` },
    React.createElement('div', { className: 'alloy-ticket-card__header' },
      React.createElement('span', { className: 'alloy-ticket-card__id' }, id),
      React.createElement('span', { className: `alloy-ticket-card__status alloy-ticket-card__status--${status}` }, status),
    ),
    React.createElement('h3', { className: 'alloy-ticket-card__title' }, title),
    React.createElement('div', { className: 'alloy-ticket-card__meta' },
      priority ? React.createElement('span', { className: `alloy-ticket-card__priority alloy-ticket-card__priority--${priority}` }, priority) : null,
      assignee ? React.createElement('span', { className: 'alloy-ticket-card__assignee' }, assignee) : null,
    ),
  );
};

registerComponent({ name: 'TicketCard', version: 1, tier: ComponentTier.ORGANISM, component: TicketCard, schema: TicketCardSchema });

// ─── ChartPanel ───────────────────────────────────────────────────────────────
export const ChartPanelSchema = z.object({
  title: z.string().describe('Chart title'),
  chartType: z.enum(['line', 'bar', 'pie', 'area', 'scatter']).describe('Chart type'),
  data: z.unknown().optional().describe('Chart data payload'),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('A chart display panel (data visualization).');

export const ChartPanel: React.FC<z.infer<typeof ChartPanelSchema>> = ({ title, chartType }) => {
  return React.createElement('figure', { className: 'alloy-chart-panel', role: 'img', 'aria-label': `${title} ${chartType} chart` },
    React.createElement('figcaption', { className: 'alloy-chart-panel__title' }, title),
    React.createElement('div', { className: `alloy-chart-panel__canvas alloy-chart-panel__canvas--${chartType}`, 'data-chart-type': chartType }),
  );
};

registerComponent({ name: 'ChartPanel', version: 1, tier: ComponentTier.ORGANISM, component: ChartPanel, schema: ChartPanelSchema });

// ─── FormGroup ────────────────────────────────────────────────────────────────
export const FormGroupSchema = z.object({
  title: z.string().optional(),
  submitLabel: z.string().default('Submit'),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('A form container grouping FormField molecules.');

export const FormGroup: React.FC<z.infer<typeof FormGroupSchema> & { children?: React.ReactNode }> = ({ title, submitLabel = 'Submit', children }) => {
  return React.createElement('form', { className: 'alloy-form-group', 'aria-label': title ?? 'Form' },
    title ? React.createElement('h2', { className: 'alloy-form-group__title' }, title) : null,
    children,
    React.createElement('button', { type: 'submit', className: 'alloy-form-group__submit' }, submitLabel),
  );
};

registerComponent({ name: 'FormGroup', version: 1, tier: ComponentTier.ORGANISM, component: FormGroup, schema: FormGroupSchema });

// ─── StatusBanner ─────────────────────────────────────────────────────────────
export const StatusBannerSchema = z.object({
  message: z.string().describe('Banner message'),
  variant: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  dismissible: z.boolean().default(false),
  aria: z.object({ role: z.string().default('alert'), live: z.enum(['off', 'polite', 'assertive']).default('assertive') }).optional(),
}).describe('A status/alert banner at the top of a section.');

export const StatusBanner: React.FC<z.infer<typeof StatusBannerSchema>> = ({ message, variant = 'info' }) => {
  return React.createElement('div', { className: `alloy-status-banner alloy-status-banner--${variant}`, role: 'alert', 'aria-live': 'assertive' },
    React.createElement('span', null, message),
  );
};

registerComponent({ name: 'StatusBanner', version: 1, tier: ComponentTier.ORGANISM, component: StatusBanner, schema: StatusBannerSchema });
