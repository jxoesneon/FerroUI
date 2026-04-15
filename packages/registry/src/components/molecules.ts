import React, { forwardRef, memo } from 'react';
import { z } from 'zod';
import { ComponentTier } from '@ferroui/schema';
import { useTranslation } from '@ferroui/i18n';
import { registerComponent } from '../registry';

// ─── StatBadge ────────────────────────────────────────────────────────────────
export const StatBadgeSchema = z.object({
  title: z.string().describe('Metric label'),
  value: z.union([z.string(), z.number()]).describe('Metric value'),
  trend: z.enum(['up', 'down', 'flat']).optional(),
  trendColor: z.enum(['success', 'danger', 'muted']).optional(),
  aria: z.object({ label: z.string() }),
}).describe('Displays a single statistic with optional trend.');

export type StatBadgeProps = z.infer<typeof StatBadgeSchema>;

export const StatBadge = memo(forwardRef<HTMLDivElement, StatBadgeProps>(
  ({ title, value, trend, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('div', {
      ref,
      className: 'ferroui-stat-badge',
      'aria-label': aria?.label ? t(aria.label) : undefined,
    },
      React.createElement('span', { className: 'ferroui-stat-badge__label' }, t(title)),
      React.createElement('span', { className: 'ferroui-stat-badge__value' }, String(value)),
      trend ? React.createElement('span', { className: `ferroui-stat-badge__trend ferroui-stat-badge__trend--${trend}` }) : null,
    );
  }
));

StatBadge.displayName = 'StatBadge';

registerComponent({ name: 'StatBadge', version: 1, tier: ComponentTier.MOLECULE, component: StatBadge, schema: StatBadgeSchema });

// ─── UserAvatar ───────────────────────────────────────────────────────────────
export const UserAvatarSchema = z.object({
  name: z.string().describe('User display name'),
  src: z.string().optional().describe('Avatar image URL'),
  subtitle: z.string().optional().describe('Secondary text (e.g., role)'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  aria: z.object({ label: z.string() }),
}).describe('Avatar with name and optional subtitle.');

export type UserAvatarProps = z.infer<typeof UserAvatarSchema>;

export const UserAvatar = memo(forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ name, src, subtitle, size = 'md', aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('div', {
      ref,
      className: `ferroui-user-avatar ferroui-user-avatar--${size}`,
      'aria-label': aria?.label ? t(aria.label) : undefined,
    },
      React.createElement('img', { src: src ?? '', alt: name, className: 'ferroui-user-avatar__image' }),
      React.createElement('div', { className: 'ferroui-user-avatar__info' },
        React.createElement('span', { className: 'ferroui-user-avatar__name' }, name),
        subtitle ? React.createElement('span', { className: 'ferroui-user-avatar__subtitle' }, t(subtitle)) : null,
      ),
    );
  }
));

UserAvatar.displayName = 'UserAvatar';

registerComponent({ name: 'UserAvatar', version: 1, tier: ComponentTier.MOLECULE, component: UserAvatar, schema: UserAvatarSchema });

// ─── MetricRow ────────────────────────────────────────────────────────────────
export const MetricRowSchema = z.object({
  title: z.string().describe('Row label'),
  value: z.union([z.string(), z.number()]).describe('Row value'),
  unit: z.string().optional(),
  aria: z.object({ label: z.string() }),
}).describe('A single-row metric display.');

export type MetricRowProps = z.infer<typeof MetricRowSchema>;

export const MetricRow = memo(forwardRef<HTMLDivElement, MetricRowProps>(
  ({ title, value, unit, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('div', {
      ref,
      className: 'ferroui-metric-row',
      'aria-label': aria?.label ? t(aria.label) : undefined,
    },
      React.createElement('span', { className: 'ferroui-metric-row__label' }, t(title)),
      React.createElement('span', { className: 'ferroui-metric-row__value' }, `${value}${unit ? ` ${t(unit)}` : ''}`),
    );
  }
));

MetricRow.displayName = 'MetricRow';

registerComponent({ name: 'MetricRow', version: 1, tier: ComponentTier.MOLECULE, component: MetricRow, schema: MetricRowSchema });

// ─── ActionButton ─────────────────────────────────────────────────────────────
export const ActionButtonSchema = z.object({
  content: z.string().describe('Button text'),
  variant: z.enum(['primary', 'secondary', 'ghost', 'danger']).default('primary'),
  isDisabled: z.boolean().default(false),
  isLoading: z.boolean().default(false),
  icon: z.string().optional(),
  aria: z.object({ label: z.string() }),
}).describe('An interactive button with variants.');

export type ActionButtonProps = z.infer<typeof ActionButtonSchema> & { onClick?: () => void };

export const ActionButton = memo(forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ content, variant = 'primary', isDisabled = false, aria = { label: '' }, onClick }, ref) => {
    const { t } = useTranslation('components');

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (isDisabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.();
      }
    };

    return React.createElement('button', {
      ref,
      className: `ferroui-action-button ferroui-action-button--${variant}`,
      disabled: isDisabled,
      type: 'button',
      onClick,
      onKeyDown: handleKeyDown,
      'aria-label': aria?.label ? t(aria.label) : undefined,
    }, t(content));
  }
));

ActionButton.displayName = 'ActionButton';

registerComponent({ name: 'ActionButton', version: 1, tier: ComponentTier.MOLECULE, component: ActionButton, schema: ActionButtonSchema });

// ─── FormField ────────────────────────────────────────────────────────────────
export const FormFieldSchema = z.object({
  name: z.string().describe('Field name'),
  title: z.string().describe('Field label'),
  type: z.enum(['text', 'email', 'password', 'number', 'textarea', 'select']).default('text'),
  placeholder: z.string().optional(),
  isRequired: z.boolean().default(false),
  autoComplete: z.string().optional(),
  error: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  aria: z.object({ label: z.string(), describedBy: z.string().optional() }),
}).describe('A single form input with label and error display.');

export type FormFieldProps = z.infer<typeof FormFieldSchema>;

export const FormField = memo(forwardRef<HTMLDivElement, FormFieldProps>(
  ({ name, title, type = 'text', placeholder, isRequired = false, autoComplete, error, aria = { label: '' } }, ref) => {
    const { t } = useTranslation('components');
    const errorId = `${name}-error`;
    const describedBy = [error ? errorId : undefined, aria?.describedBy].filter(Boolean).join(' ');

    return React.createElement('div', {
      ref,
      className: `ferroui-form-field ${error ? 'ferroui-form-field--error' : ''}`,
      'aria-label': aria?.label ? t(aria.label) : undefined,
    },
      React.createElement('label', { htmlFor: name, className: 'ferroui-form-field__label' }, t(title), isRequired ? ' *' : ''),
      React.createElement('input', {
        id: name,
        name,
        type,
        placeholder: placeholder ? t(placeholder) : undefined,
        required: isRequired,
        autoComplete,
        className: 'ferroui-form-field__input',
        'aria-invalid': !!error,
        'aria-describedby': describedBy || undefined,
      }),
      error ? React.createElement('div', { className: 'ferroui-form-field__error-container' },
        React.createElement('span', { className: 'ferroui-form-field__error-icon', 'aria-hidden': 'true' }, '⚠'),
        React.createElement('p', { id: errorId, className: 'ferroui-form-field__error', role: 'alert' }, t(error))
      ) : null,
    );
  }
));

FormField.displayName = 'FormField';

registerComponent({ name: 'FormField', version: 1, tier: ComponentTier.MOLECULE, component: FormField, schema: FormFieldSchema });

// ─── SearchBar ────────────────────────────────────────────────────────────────
export const SearchBarSchema = z.object({
  placeholder: z.string().default('Search...'),
  value: z.string().optional(),
  aria: z.object({ label: z.string().default('Search') }),
}).describe('A search input bar.');

export type SearchBarProps = z.infer<typeof SearchBarSchema>;

export const SearchBar = memo(forwardRef<HTMLDivElement, SearchBarProps>(
  ({ placeholder = 'Search...', aria = { label: 'Search' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('div', {
      ref,
      className: 'ferroui-search-bar',
      role: 'search',
    },
      React.createElement('input', {
        type: 'search',
        placeholder: t(placeholder),
        className: 'ferroui-search-bar__input',
        'aria-label': aria?.label ? t(aria.label) : undefined,
      }),
    );
  }
));

SearchBar.displayName = 'SearchBar';

registerComponent({ name: 'SearchBar', version: 1, tier: ComponentTier.MOLECULE, component: SearchBar, schema: SearchBarSchema });
