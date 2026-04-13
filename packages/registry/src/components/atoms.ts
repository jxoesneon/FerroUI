import React from 'react';
import { z } from 'zod';
import { ComponentTier } from '@alloy/schema';
import { registerComponent } from '../registry';

// ─── Text ─────────────────────────────────────────────────────────────────────
export const TextSchema = z.object({
  content: z.string().describe('Text content to display'),
  variant: z.enum(['heading1', 'heading2', 'heading3', 'body', 'caption']).default('body'),
  color: z.enum(['default', 'muted', 'primary', 'danger', 'success']).default('default'),
  aria: z.object({
    label: z.string().optional(),
    hidden: z.boolean().default(false),
  }).optional(),
}).describe('Renders text content with variant and color.');

export const Text: React.FC<z.infer<typeof TextSchema>> = ({ content, variant = 'body', color = 'default' }) => {
  const Tag = variant.startsWith('heading') ? (`h${variant.replace('heading', '')}` as keyof JSX.IntrinsicElements) : 'p';
  return React.createElement(Tag, { className: `alloy-text alloy-text--${variant} alloy-text--${color}` }, content);
};

registerComponent({ name: 'Text', version: 1, tier: ComponentTier.ATOM, component: Text, schema: TextSchema });

// ─── Icon ─────────────────────────────────────────────────────────────────────
export const IconSchema = z.object({
  name: z.string().describe('Icon identifier'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  color: z.string().optional(),
  aria: z.object({
    label: z.string().optional(),
    hidden: z.boolean().default(true),
  }).optional(),
}).describe('Displays an icon by name.');

export const Icon: React.FC<z.infer<typeof IconSchema>> = ({ name, size = 'md' }) => {
  return React.createElement('span', {
    className: `alloy-icon alloy-icon--${size}`,
    'data-icon': name,
    role: 'img',
  });
};

registerComponent({ name: 'Icon', version: 1, tier: ComponentTier.ATOM, component: Icon, schema: IconSchema });

// ─── Badge ────────────────────────────────────────────────────────────────────
export const BadgeSchema = z.object({
  label: z.string().describe('Badge text'),
  variant: z.enum(['default', 'primary', 'success', 'warning', 'danger']).default('default'),
  aria: z.object({
    label: z.string().optional(),
    hidden: z.boolean().default(false),
  }).optional(),
}).describe('Renders a small status badge.');

export const Badge: React.FC<z.infer<typeof BadgeSchema>> = ({ label, variant = 'default' }) => {
  return React.createElement('span', { className: `alloy-badge alloy-badge--${variant}` }, label);
};

registerComponent({ name: 'Badge', version: 1, tier: ComponentTier.ATOM, component: Badge, schema: BadgeSchema });

// ─── Divider ──────────────────────────────────────────────────────────────────
export const DividerSchema = z.object({
  orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
  aria: z.object({ hidden: z.boolean().default(true) }).optional(),
}).describe('A visual separator line.');

export const Divider: React.FC<z.infer<typeof DividerSchema>> = ({ orientation = 'horizontal' }) => {
  return React.createElement('hr', { className: `alloy-divider alloy-divider--${orientation}`, role: 'separator' });
};

registerComponent({ name: 'Divider', version: 1, tier: ComponentTier.ATOM, component: Divider, schema: DividerSchema });

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const SkeletonSchema = z.object({
  width: z.string().default('100%'),
  height: z.string().default('1rem'),
  aria: z.object({ label: z.string().default('Loading...') }).optional(),
}).describe('A placeholder skeleton loader.');

export const Skeleton: React.FC<z.infer<typeof SkeletonSchema>> = ({ width = '100%', height = '1rem' }) => {
  return React.createElement('div', {
    className: 'alloy-skeleton',
    style: { width, height },
    'aria-busy': true,
    'aria-label': 'Loading...',
  });
};

registerComponent({ name: 'Skeleton', version: 1, tier: ComponentTier.ATOM, component: Skeleton, schema: SkeletonSchema });

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const AvatarSchema = z.object({
  src: z.string().optional().describe('Image URL'),
  alt: z.string().default('User avatar'),
  initials: z.string().optional().describe('Fallback initials'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('Displays a user avatar image or initials.');

export const Avatar: React.FC<z.infer<typeof AvatarSchema>> = ({ src, alt = 'User avatar', initials, size = 'md' }) => {
  if (src) {
    return React.createElement('img', { src, alt, className: `alloy-avatar alloy-avatar--${size}` });
  }
  return React.createElement('span', { className: `alloy-avatar alloy-avatar--${size} alloy-avatar--initials` }, initials ?? '?');
};

registerComponent({ name: 'Avatar', version: 1, tier: ComponentTier.ATOM, component: Avatar, schema: AvatarSchema });

// ─── Tag ──────────────────────────────────────────────────────────────────────
export const TagSchema = z.object({
  label: z.string().describe('Tag text'),
  color: z.string().optional(),
  removable: z.boolean().default(false),
  aria: z.object({ label: z.string().optional() }).optional(),
}).describe('A tag/chip label element.');

export const Tag: React.FC<z.infer<typeof TagSchema>> = ({ label }) => {
  return React.createElement('span', { className: 'alloy-tag' }, label);
};

registerComponent({ name: 'Tag', version: 1, tier: ComponentTier.ATOM, component: Tag, schema: TagSchema });
