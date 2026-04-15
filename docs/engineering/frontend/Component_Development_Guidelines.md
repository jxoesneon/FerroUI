# Component Development Guidelines

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Frontend Engineering Team

---

## 1. Overview

This document provides comprehensive guidelines for developing components in the
FerroUI UI framework. Components are the building blocks of AI-generated layouts
and must adhere to strict standards for type safety, accessibility, and
performance.

---

## 2. Atomic Design Hierarchy

FerroUI UI follows the three-tier Atomic Design hierarchy. Every component must be
classified into one of these tiers.

### 2.1 Tier 1 — Atoms

Atoms are irreducible UI primitives. They hold the design token system baked in
at compile time.

**Characteristics:**

- Cannot contain other components as children
- Design tokens (colors, typography, spacing) are fixed
- AI can only supply content and select from named variants

**Examples:**

- `Text` — Typography component
- `Icon` — SVG icon wrapper
- `Badge` — Status indicator
- `Divider` — Visual separator
- `Skeleton` — Loading placeholder
- `Avatar` — User image
- `Tag` — Categorized label

**Example Atom:**

```typescript
// packages/registry/src/atoms/Text/index.tsx
import { forwardRef } from 'react';
import { z } from 'zod';
import { cn } from '@ferroui/shared';

// Schema definition
export const TextSchema = z.object({
  content: z.string(),
  variant: z.enum(['heading1', 'heading2', 'body', 'caption']).default('body'),
  color: z.enum(['default', 'muted', 'primary', 'danger']).default('default'),
  aria: z.object({
    label: z.string().optional(),
    hidden: z.boolean().default(false),
  }),
});

export type TextProps = z.infer<typeof TextSchema>;

// Component implementation
export const Text = forwardRef<HTMLSpanElement, TextProps>(
  ({ content, variant = 'body', color = 'default', aria }, ref) => {
    const variantClasses = {
      heading1: 'text-3xl font-bold',
      heading2: 'text-2xl font-semibold',
      body: 'text-base',
      caption: 'text-sm text-gray-500',
    };

    const colorClasses = {
      default: 'text-gray-900',
      muted: 'text-gray-500',
      primary: 'text-blue-600',
      danger: 'text-red-600',
    };

    return (
      <span
        ref={ref}
        className={cn(variantClasses[variant], colorClasses[color])}
        aria-label={aria.label}
        aria-hidden={aria.hidden}
      >
        {content}
      </span>
    );
  }
);

Text.displayName = 'Text';
```

### 2.2 Tier 2 — Molecules

Molecules compose two or more Atoms into reusable, named patterns.

**Characteristics:**

- Can contain Atoms and other Molecules
- Cannot contain Organisms
- AI orchestrates Molecules as black boxes

**Examples:**

- `StatBadge` — Metric with label
- `UserAvatar` — Avatar with name
- `MetricRow` — Row of metrics
- `ActionButton` — Button with icon
- `FormField` — Label + input + error
- `SearchBar` — Input + search button

**Example Molecule:**

```typescript
// packages/registry/src/molecules/StatBadge/index.tsx
import { forwardRef } from 'react';
import { z } from 'zod';
import { Text, TextSchema } from '../../atoms/Text';
import { Badge, BadgeSchema } from '../../atoms/Badge';

export const StatBadgeSchema = z.object({
  label: z.string(),
  value: z.string(),
  trend: z.enum(['up', 'down', 'neutral']).optional(),
  trendValue: z.string().optional(),
  aria: z.object({
    label: z.string(),
  }),
});

export type StatBadgeProps = z.infer<typeof StatBadgeSchema>;

export const StatBadge = forwardRef<HTMLDivElement, StatBadgeProps>(
  ({ label, value, trend, trendValue, aria }, ref) => {
    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-500',
    };

    return (
      <div ref={ref} className="flex flex-col gap-1" aria-label={aria.label}>
        <Text content={label} variant="caption" color="muted" />
        <div className="flex items-center gap-2">
          <Text content={value} variant="heading2" />
          {trend && trendValue && (
            <Badge
              content={`${trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} ${trendValue}`}
              variant={trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'default'}
            />
          )}
        </div>
      </div>
    );
  }
);

StatBadge.displayName = 'StatBadge';
```

### 2.3 Tier 3 — Organisms

Organisms are fully functional, data-rich UI sections. They are the primary
currency the AI spends when constructing layouts.

**Characteristics:**

- Can contain Atoms, Molecules, and other Organisms
- Primary building blocks for AI-generated layouts
- May include actions and interactive behavior

**Examples:**

- `DataTable` — Sortable, filterable table
- `KPIBoard` — Grid of KPI cards
- `ActivityFeed` — Timeline of events
- `ProfileHeader` — User profile section
- `TicketCard` — Support ticket display
- `ChartPanel` — Data visualization
- `FormGroup` — Related form fields

**Example Organism:**

```typescript
// packages/registry/src/organisms/KPIBoard/index.tsx
import { forwardRef } from 'react';
import { z } from 'zod';
import { StatBadge, StatBadgeSchema } from '../../molecules/StatBadge';
import { Text } from '../../atoms/Text';
import { ActionSchema } from '../../types';

export const KPIBoardSchema = z.object({
  title: z.string(),
  kpis: z.array(StatBadgeSchema).min(1).max(6),
  layout: z.enum(['grid', 'row']).default('grid'),
  action: ActionSchema.optional(),
  aria: z.object({
    label: z.string(),
  }),
});

export type KPIBoardProps = z.infer<typeof KPIBoardSchema>;

export const KPIBoard = forwardRef<HTMLDivElement, KPIBoardProps>(
  ({ title, kpis, layout = 'grid', action, aria }, ref) => {
    const layoutClasses = {
      grid: 'grid grid-cols-2 md:grid-cols-3 gap-4',
      row: 'flex flex-wrap gap-4',
    };

    return (
      <div
        ref={ref}
        className="rounded-lg border border-gray-200 p-4"
        aria-label={aria.label}
      >
        <div className="mb-4 flex items-center justify-between">
          <Text content={title} variant="heading2" />
          {action && (
            <button
              onClick={() => handleAction(action)}
              className="text-blue-600 hover:text-blue-700"
              aria-label={`${title} action`}
            >
              View All →
            </button>
          )}
        </div>
        <div className={layoutClasses[layout]}>
          {kpis.map((kpi, index) => (
            <StatBadge
              key={index}
              {...kpi}
              aria={{ label: `${kpi.label} statistic` }}
            />
          ))}
        </div>
      </div>
    );
  }
);

KPIBoard.displayName = 'KPIBoard';
```

---

## 3. Component Registration

### 3.1 Registration API

Components are registered in the Component Registry using the
`registerComponent` function:

```typescript
// packages/registry/src/index.ts
import { registerComponent } from '@ferroui/core';
import { Text, TextSchema } from './atoms/Text';
import { StatBadge, StatBadgeSchema } from './molecules/StatBadge';
import { KPIBoard, KPIBoardSchema } from './organisms/KPIBoard';

// Register Atom
registerComponent({
  name: 'Text',
  version: 1,
  tier: 'atom',
  component: Text,
  schema: TextSchema,
  defaultProps: {
    variant: 'body',
    color: 'default',
  },
});

// Register Molecule
registerComponent({
  name: 'StatBadge',
  version: 1,
  tier: 'molecule',
  component: StatBadge,
  schema: StatBadgeSchema,
});

// Register Organism
registerComponent({
  name: 'KPIBoard',
  version: 1,
  tier: 'organism',
  component: KPIBoard,
  schema: KPIBoardSchema,
});
```

### 3.2 Registration Options

| Option         | Type                                 | Required | Description                |
| -------------- | ------------------------------------ | -------- | -------------------------- |
| `name`         | `string`                             | Yes      | Unique component name      |
| `version`      | `number`                             | Yes      | Component version          |
| `tier`         | `'atom' \| 'molecule' \| 'organism'` | Yes      | Atomic tier                |
| `component`    | `React.ComponentType`                | Yes      | React component            |
| `schema`       | `ZodSchema`                          | Yes      | Zod validation schema      |
| `defaultProps` | `object`                             | No       | Default prop values        |
| `deprecated`   | `boolean`                            | No       | Deprecation flag           |
| `replacement`  | `string`                             | No       | Replacement component name |

---

## 4. Schema Guidelines

### 4.1 Schema Structure

Every component schema must include:

```typescript
const ComponentSchema = z.object({
  // Component-specific props
  title: z.string(),
  data: z.array(DataItemSchema),

  // Optional configuration
  variant: z.enum(['default', 'compact']).default('default'),

  // Action (for interactive components)
  action: ActionSchema.optional(),

  // Required ARIA configuration
  aria: z.object({
    label: z.string().optional(),
    labelledBy: z.string().optional(),
    describedBy: z.string().optional(),
    hidden: z.boolean().default(false),
    live: z.enum(['off', 'polite', 'assertive']).optional(),
  }),
});
```

### 4.2 Prop Naming Conventions

| Type        | Convention           | Example                        |
| ----------- | -------------------- | ------------------------------ |
| Content     | `content` or `title` | `title: "Dashboard"`           |
| Data arrays | Plural noun          | `items`, `rows`, `columns`     |
| Booleans    | `is` or `has` prefix | `isLoading`, `hasError`        |
| Callbacks   | `on` prefix          | `onClick`, `onChange`          |
| Variants    | `variant`            | `variant: "primary"`           |
| Actions     | `action`             | `action: { type: "NAVIGATE" }` |

### 4.3 Default Values

Always provide sensible defaults:

```typescript
const ButtonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  disabled: z.boolean().default(false),
  loading: z.boolean().default(false),
});
```

---

## 5. Accessibility Requirements

### 5.1 Mandatory ARIA Props

Every component must include ARIA configuration:

```typescript
aria: z.object({
  // At least one of label, labelledBy must be provided for interactive components
  label: z.string().optional(),
  labelledBy: z.string().optional(),
  describedBy: z.string().optional(),
  hidden: z.boolean().default(false),
  live: z.enum(['off', 'polite', 'assertive']).optional(),
});
```

### 5.2 Interactive Component Requirements

Interactive components (buttons, links, form fields) must:

1. Have visible focus indicators
2. Support keyboard navigation
3. Include proper ARIA roles
4. Handle Enter and Space keys

```typescript
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ label, onClick, aria }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    };

    return (
      <button
        ref={ref}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label={aria.label}
        type="button"
      >
        {label}
      </button>
    );
  }
);
```

### 5.3 Screen Reader Testing

Test all components with:

- NVDA (Windows)
- VoiceOver (macOS)
- JAWS (Enterprise)

---

## 6. Performance Guidelines

### 6.1 Memoization

Use `React.memo` for pure components:

```typescript
export const DataTable = memo(function DataTable(props: DataTableProps) {
  // Component implementation
});
```

### 6.2 Lazy Loading

Large components should support lazy loading:

```typescript
const ChartPanel = lazy(() => import('./organisms/ChartPanel'));

// In parent component
<Suspense fallback={<Skeleton height={300} />}>
  <ChartPanel {...props} />
</Suspense>
```

### 6.3 Bundle Size

Monitor bundle size impact:

| Tier     | Max Bundle Size |
| -------- | --------------- |
| Atom     | 5 KB            |
| Molecule | 15 KB           |
| Organism | 50 KB           |

---

## 7. Testing Requirements

### 7.1 Unit Tests

```typescript
// Text.test.tsx
import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  it('renders content', () => {
    render(<Text content="Hello" variant="body" aria={{}} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<Text content="Heading" variant="heading1" aria={{}} />);
    expect(screen.getByText('Heading')).toHaveClass('text-3xl');
  });

  it('has correct ARIA attributes', () => {
    render(<Text content="Labelled" variant="body" aria={{ label: 'Description' }} />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });
});
```

### 7.2 Accessibility Tests

```typescript
// Text.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Text } from './Text';

describe('Text accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Text content="Test" variant="body" aria={{}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 7.3 Visual Regression Tests

```typescript
// Text.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  component: Text,
  title: 'Atoms/Text',
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Heading1: Story = {
  args: {
    content: 'Heading 1',
    variant: 'heading1',
    aria: {},
  },
};

export const Body: Story = {
  args: {
    content: 'Body text',
    variant: 'body',
    aria: {},
  },
};
```

---

## 8. Related Documents

- [Design Token & Theming Specification](./Design_Token_Theming_Specification.md)
- [A11y Compliance Checklist](./A11y_Compliance_Checklist.md)
- [I18n & RTL Implementation Guide](./I18n_RTL_Implementation_Guide.md)
- [System Architecture Document](../../architecture/System_Architecture_Document.md)

---

## 9. Document History

| Version | Date       | Author        | Changes         |
| ------- | ---------- | ------------- | --------------- |
| 1.0     | 2025-04-10 | Frontend Team | Initial release |
