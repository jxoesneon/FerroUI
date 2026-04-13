import React from 'react';
import { z } from 'zod';
import { ComponentTier } from '@alloy/schema';
import { registerComponent } from '../registry';

// ─── StatBadge ────────────────────────────────────────────────────────────────
export const StatBadgeSchema = z.object({
  label: z.string().describe('Metric label'),
  value: z.union([z.string(), z.number()]).describe('Metric value'),
  trend: z.enum(['up', 'down', 'flat']).optional(),
  trendColor: z.enum(['success', 'danger', 'muted']).optional(),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('Displays a single statistic with optional trend.');

export const StatBadge: React.FC<z.infer<typeof StatBadgeSchema>> = ({ label, value, trend }) => {
  return React.createElement('div', { className: 'alloy-stat-badge' },
    React.createElement('span', { className: 'alloy-stat-badge__label' }, label),
    React.createElement('span', { className: 'alloy-stat-badge__value' }, String(value)),
    trend ? React.createElement('span', { className: `alloy-stat-badge__trend alloy-stat-badge__trend--${trend}` }) : null,
  );
};

registerComponent({ name: 'StatBadge', version: 1, tier: ComponentTier.MOLECULE, component: StatBadge, schema: StatBadgeSchema });

// ─── UserAvatar ───────────────────────────────────────────────────────────────
export const UserAvatarSchema = z.object({
  name: z.string().describe('User display name'),
  src: z.string().optional().describe('Avatar image URL'),
  subtitle: z.string().optional().describe('Secondary text (e.g., role)'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('Avatar with name and optional subtitle.');

export const UserAvatar: React.FC<z.infer<typeof UserAvatarSchema>> = ({ name, src, subtitle, size = 'md' }) => {
  return React.createElement('div', { className: `alloy-user-avatar alloy-user-avatar--${size}` },
    React.createElement('img', { src: src ?? '', alt: name, className: 'alloy-user-avatar__image' }),
    React.createElement('div', { className: 'alloy-user-avatar__info' },
      React.createElement('span', { className: 'alloy-user-avatar__name' }, name),
      subtitle ? React.createElement('span', { className: 'alloy-user-avatar__subtitle' }, subtitle) : null,
    ),
  );
};

registerComponent({ name: 'UserAvatar', version: 1, tier: ComponentTier.MOLECULE, component: UserAvatar, schema: UserAvatarSchema });

// ─── MetricRow ────────────────────────────────────────────────────────────────
export const MetricRowSchema = z.object({
  label: z.string().describe('Row label'),
  value: z.union([z.string(), z.number()]).describe('Row value'),
  unit: z.string().optional(),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('A single-row metric display.');

export const MetricRow: React.FC<z.infer<typeof MetricRowSchema>> = ({ label, value, unit }) => {
  return React.createElement('div', { className: 'alloy-metric-row' },
    React.createElement('span', { className: 'alloy-metric-row__label' }, label),
    React.createElement('span', { className: 'alloy-metric-row__value' }, `${value}${unit ? ` ${unit}` : ''}`),
  );
};

registerComponent({ name: 'MetricRow', version: 1, tier: ComponentTier.MOLECULE, component: MetricRow, schema: MetricRowSchema });

// ─── ActionButton ─────────────────────────────────────────────────────────────
export const ActionButtonSchema = z.object({
  label: z.string().describe('Button text'),
  variant: z.enum(['primary', 'secondary', 'ghost', 'danger']).default('primary'),
  disabled: z.boolean().default(false),
  loading: z.boolean().default(false),
  icon: z.string().optional(),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('An interactive button with variants.');

export const ActionButton: React.FC<z.infer<typeof ActionButtonSchema>> = ({ label, variant = 'primary', disabled = false }) => {
  return React.createElement('button', {
    className: `alloy-action-button alloy-action-button--${variant}`,
    disabled,
    type: 'button',
  }, label);
};

registerComponent({ name: 'ActionButton', version: 1, tier: ComponentTier.MOLECULE, component: ActionButton, schema: ActionButtonSchema });

// ─── FormField ────────────────────────────────────────────────────────────────
export const FormFieldSchema = z.object({
  name: z.string().describe('Field name'),
  label: z.string().describe('Field label'),
  type: z.enum(['text', 'email', 'password', 'number', 'textarea', 'select']).default('text'),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  error: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  aria: z.object({ label: z.string().optional(), describedBy: z.string().optional() }).optional(),
}).describe('A single form input with label and error display.');

export const FormField: React.FC<z.infer<typeof FormFieldSchema>> = ({ name, label, type = 'text', placeholder, required = false, error }) => {
  return React.createElement('div', { className: `alloy-form-field ${error ? 'alloy-form-field--error' : ''}` },
    React.createElement('label', { htmlFor: name, className: 'alloy-form-field__label' }, label, required ? ' *' : ''),
    React.createElement('input', { id: name, name, type, placeholder, required, className: 'alloy-form-field__input', 'aria-invalid': !!error }),
    error ? React.createElement('p', { className: 'alloy-form-field__error', role: 'alert' }, error) : null,
  );
};

registerComponent({ name: 'FormField', version: 1, tier: ComponentTier.MOLECULE, component: FormField, schema: FormFieldSchema });

// ─── SearchBar ────────────────────────────────────────────────────────────────
export const SearchBarSchema = z.object({
  placeholder: z.string().default('Search...'),
  value: z.string().optional(),
  aria: z.object({ label: z.string().default('Search') }).optional(),
}).describe('A search input bar.');

export const SearchBar: React.FC<z.infer<typeof SearchBarSchema>> = ({ placeholder = 'Search...' }) => {
  return React.createElement('div', { className: 'alloy-search-bar', role: 'search' },
    React.createElement('input', { type: 'search', placeholder, className: 'alloy-search-bar__input', 'aria-label': 'Search' }),
  );
};

registerComponent({ name: 'SearchBar', version: 1, tier: ComponentTier.MOLECULE, component: SearchBar, schema: SearchBarSchema });
