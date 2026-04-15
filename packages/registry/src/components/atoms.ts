import React, { forwardRef, memo } from 'react';
import { z } from 'zod';
import { ComponentTier } from '@ferroui/schema';
import { useTranslation } from '@ferroui/i18n';
import { registerComponent } from '../registry';

// ─── Text ─────────────────────────────────────────────────────────────────────
export const TextSchema = z.object({
  content: z.string().describe('Text content to display'),
  variant: z.enum(['heading1', 'heading2', 'heading3', 'body', 'caption']).default('body'),
  color: z.enum(['default', 'muted', 'primary', 'danger', 'success']).default('default'),
  aria: z.object({
    label: z.string().optional(),
    hidden: z.boolean().default(false),
  }),
}).describe('Renders text content with variant and color.');

const HEADING_MAP: Record<string, keyof React.JSX.IntrinsicElements> = {
  heading1: 'h1', heading2: 'h2', heading3: 'h3',
};

export type TextProps = z.infer<typeof TextSchema>;

export const Text = memo(forwardRef<HTMLElement, TextProps>(
  ({ content, variant = 'body', color = 'default', aria = { hidden: false } }, ref) => {
    const { t } = useTranslation('components');
    const Tag = HEADING_MAP[variant] ?? 'p';
    return React.createElement(Tag, {
      ref,
      className: `ferroui-text ferroui-text--${variant} ferroui-text--${color}`,
      'aria-label': aria?.label ? t(aria.label) : undefined,
      'aria-hidden': aria?.hidden,
    }, t(content));
  }
));

Text.displayName = 'Text';

registerComponent({ name: 'Text', version: 1, tier: ComponentTier.ATOM, component: Text, schema: TextSchema });

// ─── Icon ─────────────────────────────────────────────────────────────────────
export const IconSchema = z.object({
  name: z.string().describe('Icon identifier'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  color: z.string().optional(),
  isMirrorInRtl: z.boolean().default(false).describe('Whether to mirror the icon in RTL layouts'),
  aria: z.object({
    label: z.string().optional().describe('Accessibility label'),
    hidden: z.boolean().default(true).describe('Whether to hide from screen readers'),
  }),
}).refine(data => data.aria.hidden || !!data.aria.label, {
  message: "Icons must have an aria.label if not hidden from screen readers.",
  path: ["aria", "label"],
}).describe('Displays an icon by name.');

export type IconProps = z.infer<typeof IconSchema>;

export const Icon = memo(forwardRef<HTMLSpanElement, IconProps>(
  ({ name, size = 'md', isMirrorInRtl = false, aria = { hidden: true } }, ref) => {
    const { t, direction } = useTranslation('components');
    const shouldMirror = isMirrorInRtl && direction === 'rtl';

    return React.createElement('span', {
      ref,
      className: `ferroui-icon ferroui-icon--${size}${shouldMirror ? ' ferroui-icon--mirrored' : ''}`,
      'data-icon': name,
      role: 'img',
      style: shouldMirror ? { transform: 'scaleX(-1)' } : undefined,
      'aria-label': aria?.label ? t(aria.label) : undefined,
      'aria-hidden': aria?.hidden ? 'true' : undefined,
    });
  }
));

Icon.displayName = 'Icon';

registerComponent({ name: 'Icon', version: 1, tier: ComponentTier.ATOM, component: Icon, schema: IconSchema });

// ─── Badge ────────────────────────────────────────────────────────────────────
export const BadgeSchema = z.object({
  content: z.string().describe('Badge text'),
  variant: z.enum(['default', 'primary', 'success', 'warning', 'danger']).default('default'),
  aria: z.object({
    label: z.string().optional(),
    hidden: z.boolean().default(false),
  }),
}).describe('Renders a small status badge.');

export type BadgeProps = z.infer<typeof BadgeSchema>;

export const Badge = memo(forwardRef<HTMLSpanElement, BadgeProps>(
  ({ content, variant = 'default', aria = { hidden: false } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('span', {
      ref,
      className: `ferroui-badge ferroui-badge--${variant}`,
      'aria-label': aria?.label ? t(aria.label) : undefined,
      'aria-hidden': aria?.hidden,
    }, t(content));
  }
));

Badge.displayName = 'Badge';

registerComponent({ name: 'Badge', version: 1, tier: ComponentTier.ATOM, component: Badge, schema: BadgeSchema });

// ─── Divider ──────────────────────────────────────────────────────────────────
export const DividerSchema = z.object({
  orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
  aria: z.object({
    label: z.string().optional(),
    hidden: z.boolean().default(true)
  }),
}).describe('A visual separator line.');

export type DividerProps = z.infer<typeof DividerSchema>;

export const Divider = memo(forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = 'horizontal', aria = { hidden: true } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('hr', {
      ref,
      className: `ferroui-divider ferroui-divider--${orientation}`,
      role: 'separator',
      'aria-label': aria?.label ? t(aria.label) : undefined,
      'aria-hidden': aria?.hidden,
    });
  }
));

Divider.displayName = 'Divider';

registerComponent({ name: 'Divider', version: 1, tier: ComponentTier.ATOM, component: Divider, schema: DividerSchema });

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const SkeletonSchema = z.object({
  width: z.string().default('100%'),
  height: z.string().default('1rem'),
  aria: z.object({ label: z.string().default('Loading...') }),
}).describe('A placeholder skeleton loader.');

export type SkeletonProps = z.infer<typeof SkeletonSchema>;

export const Skeleton = memo(forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width = '100%', height = '1rem', aria = { label: 'Loading...' } }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('div', {
      ref,
      className: 'ferroui-skeleton',
      style: { width, height },
      'aria-busy': true,
      'aria-label': aria?.label ? t(aria.label) : undefined,
    });
  }
));

Skeleton.displayName = 'Skeleton';

registerComponent({ name: 'Skeleton', version: 1, tier: ComponentTier.ATOM, component: Skeleton, schema: SkeletonSchema });

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const AvatarSchema = z.object({
  src: z.string().optional().describe('Image URL'),
  alt: z.string().default('User avatar'),
  initials: z.string().optional().describe('Fallback initials'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  aria: z.object({ label: z.string().optional() }),
}).describe('Displays a user avatar image or initials.');

export type AvatarProps = z.infer<typeof AvatarSchema>;

export const Avatar = memo(forwardRef<HTMLElement, AvatarProps>(
  ({ src, alt = 'User avatar', initials, size = 'md', aria = {} }, ref) => {
    const { t } = useTranslation('components');
    if (src) {
      return React.createElement('img', {
        ref: ref as React.Ref<HTMLImageElement>,
        src,
        alt: t(alt),
        className: `ferroui-avatar ferroui-avatar--${size}`,
        'aria-label': aria?.label ? t(aria.label) : undefined,
      });
    }
    return React.createElement('span', {
      ref: ref as React.Ref<HTMLSpanElement>,
      className: `ferroui-avatar ferroui-avatar--${size} ferroui-avatar--initials`,
      'aria-label': aria?.label ? t(aria.label) : undefined,
    }, initials ?? '?');
  }
));

Avatar.displayName = 'Avatar';

registerComponent({ name: 'Avatar', version: 1, tier: ComponentTier.ATOM, component: Avatar, schema: AvatarSchema });

// ─── Tag ──────────────────────────────────────────────────────────────────────
export const TagSchema = z.object({
  content: z.string().describe('Tag text'),
  color: z.string().optional(),
  isRemovable: z.boolean().default(false),
  aria: z.object({ label: z.string().optional() }),
}).describe('A tag/chip label element.');

export type TagProps = z.infer<typeof TagSchema>;

export const Tag = memo(forwardRef<HTMLSpanElement, TagProps>(
  ({ content, isRemovable = false, aria = {} }, ref) => {
    const { t } = useTranslation('components');
    return React.createElement('span', {
      ref,
      className: `ferroui-tag${isRemovable ? ' ferroui-tag--removable' : ''}`,
      'aria-label': aria?.label ? t(aria.label) : undefined,
    }, t(content));
  }
));

Tag.displayName = 'Tag';

registerComponent({ name: 'Tag', version: 1, tier: ComponentTier.ATOM, component: Tag, schema: TagSchema });
