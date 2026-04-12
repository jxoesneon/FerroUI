# I18n & RTL Implementation Guide

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Internationalization Team

---

## 1. Overview

Alloy UI layouts must be locale-aware. Because the AI generates layouts at
runtime, internationalization cannot rely on static string extraction workflows.
This guide covers the implementation of internationalization (i18n) and
right-to-left (RTL) language support in Alloy UI.

---

## 2. Supported Locales

### 2.1 Tier 1 (Fully Supported)

| Locale | Language              | Script   | Direction |
| ------ | --------------------- | -------- | --------- |
| en-US  | English (US)          | Latin    | LTR       |
| en-GB  | English (UK)          | Latin    | LTR       |
| es-ES  | Spanish               | Latin    | LTR       |
| fr-FR  | French                | Latin    | LTR       |
| de-DE  | German                | Latin    | LTR       |
| ja-JP  | Japanese              | Japanese | LTR       |
| ko-KR  | Korean                | Korean   | LTR       |
| zh-CN  | Chinese (Simplified)  | Han      | LTR       |
| zh-TW  | Chinese (Traditional) | Han      | LTR       |

### 2.2 Tier 2 (RTL Support)

| Locale | Language        | Script | Direction |
| ------ | --------------- | ------ | --------- |
| ar-SA  | Arabic          | Arabic | RTL       |
| he-IL  | Hebrew          | Hebrew | RTL       |
| fa-IR  | Persian (Farsi) | Arabic | RTL       |
| ur-PK  | Urdu            | Arabic | RTL       |

---

## 3. Architecture

### 3.1 Locale Context

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCALE RESOLUTION                         │
├─────────────────────────────────────────────────────────────┤
│  1. URL parameter (?locale=ar-SA)                           │
│  2. User preference (stored in session)                     │
│  3. Browser Accept-Language header                          │
│  4. Default locale (en-US)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LOCALE CONTEXT                            │
│  • BCP 47 language tag (e.g., "ar-SA")                      │
│  • Text direction ("ltr" | "rtl")                           │
│  • Date/number/currency formatting preferences              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
User Request
    │
    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Resolve    │───▶│    Phase 1   │───▶│    Phase 2   │
│    Locale    │    │  (AI uses    │    │  (AI uses    │
│              │    │   locale for │    │   locale for │
│              │    │   tool calls)│    │   formatting)│
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
                                               ▼
                                      ┌──────────────┐
                                      │  AlloyLayout  │
                                      │   { locale,   │
                                      │     layout }   │
                                      └──────┬───────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │   Renderer   │
                                      │  (applies    │
                                      │   RTL, i18n) │
                                      └──────────────┘
```

---

## 4. String Externalization

### 4.1 Locale Bundle Structure

```
packages/i18n/locales/
├── en-US/
│   ├── common.json
│   ├── components.json
│   └── validation.json
├── ar-SA/
│   ├── common.json
│   ├── components.json
│   └── validation.json
└── ...
```

### 4.2 String Format

```json
// locales/en-US/components.json
{
  "button": {
    "submit": "Submit",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "form": {
    "required": "This field is required",
    "emailInvalid": "Please enter a valid email address"
  },
  "dataTable": {
    "noResults": "No results found",
    "pageOf": "Page {current} of {total}"
  }
}
```

### 4.3 Component Usage

```typescript
// Component template strings use keys
import { useTranslation } from '@alloy/i18n';

function SubmitButton() {
  const { t } = useTranslation('components');

  return <button>{t('button.submit')}</button>;
  // Renders: "Submit" (en-US) or "إرسال" (ar-SA)
}

// With interpolation
function Pagination({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation('components');

  return <span>{t('dataTable.pageOf', { current, total })}</span>;
  // Renders: "Page 1 of 10"
}
```

### 4.4 AI-Generated Content

The AI populates data-driven props with real values from tool results. Template
strings are resolved by the renderer from the locale bundle.

```typescript
// AI generates layout with data
{
  "type": "KPIBoard",
  "props": {
    "title": "Sales Overview", // AI uses locale-aware formatting
    "kpis": [
      { "label": "Revenue", "value": "$125,000.00" } // Formatted by AI
    ]
  }
}

// Component template uses i18n key
{
  "type": "Button",
  "props": {
    "labelKey": "button.viewAll" // Resolved by renderer
  }
}
```

---

## 5. RTL Implementation

### 5.1 Direction Detection

```typescript
// Detect direction from locale
const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

function getTextDirection(locale: string): 'ltr' | 'rtl' {
  const lang = locale.split('-')[0];
  return RTL_LOCALES.includes(lang) ? 'rtl' : 'ltr';
}

// Apply to document
const dir = getTextDirection(locale);
document.documentElement.dir = dir;
document.documentElement.lang = locale;
```

### 5.2 CSS Logical Properties

Use logical properties instead of physical properties:

| Physical            | Logical                |
| ------------------- | ---------------------- |
| `margin-left`       | `margin-inline-start`  |
| `margin-right`      | `margin-inline-end`    |
| `padding-left`      | `padding-inline-start` |
| `padding-right`     | `padding-inline-end`   |
| `border-left`       | `border-inline-start`  |
| `border-right`      | `border-inline-end`    |
| `text-align: left`  | `text-align: start`    |
| `text-align: right` | `text-align: end`      |

```css
/* ✅ Good - Logical properties */
.card {
  margin-inline-start: 1rem;
  margin-inline-end: 1rem;
  padding-inline: 1rem;
  border-inline-start: 2px solid blue;
  text-align: start;
}

/* ❌ Bad - Physical properties */
.card {
  margin-left: 1rem;
  margin-right: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-left: 2px solid blue;
  text-align: left;
}
```

### 5.3 Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  // Enable logical properties
  corePlugins: {
    textAlign: false, // Disable physical text-align
  },
  plugins: [require('tailwindcss-logical')],
};
```

### 5.4 Component Implementation

```typescript
// packages/registry/src/components/Card.tsx
import { cn } from '@alloy/shared';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        // Logical padding
        'pis-4 pie-4 pbs-4 pbe-4', // padding-inline-start, etc.
        // Logical border
        'border-bs border-be border-s-2 border-e-0',
        className
      )}
    >
      {children}
    </div>
  );
}
```

### 5.5 Icon Mirroring

Some icons need to be mirrored in RTL:

| Icon          | LTR | RTL            |
| ------------- | --- | -------------- |
| Arrow left    | ←   | → (mirrored)   |
| Arrow right   | →   | ← (mirrored)   |
| Chevron left  | ‹   | › (mirrored)   |
| Chevron right | ›   | ‹ (mirrored)   |
| Home          | 🏠  | 🏠 (no change) |
| Search        | 🔍  | 🔍 (no change) |

```typescript
// Icon component with RTL support
import { useLocale } from '@alloy/i18n';

interface IconProps {
  name: string;
  mirrorInRtl?: boolean;
}

export function Icon({ name, mirrorInRtl = false }: IconProps) {
  const { direction } = useLocale();
  const shouldMirror = mirrorInRtl && direction === 'rtl';

  return (
    <svg
      className={cn(shouldMirror && 'scale-x-[-1]')}
      aria-hidden="true"
    >
      {/* Icon path */}
    </svg>
  );
}

// Usage
<Icon name="arrow-left" mirrorInRtl /> // Mirrors in RTL
<Icon name="home" /> // Never mirrors
```

---

## 6. Date, Number & Currency Formatting

### 6.1 Date Formatting

```typescript
import { useLocale } from '@alloy/i18n';

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Examples:
// en-US: "April 10, 2025"
// de-DE: "10. April 2025"
// ar-SA: "١٠ أبريل ٢٠٢٥"
```

### 6.2 Number Formatting

```typescript
function formatNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(num);
}

// Examples:
// en-US: "1,234,567.89"
// de-DE: "1.234.567,89"
// ar-SA: "١٬٢٣٤٬٥٦٧٫٨٩"
```

### 6.3 Currency Formatting

```typescript
function formatCurrency(
  amount: number,
  currency: string,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// Examples:
// en-US, USD: "$1,234.56"
// de-DE, EUR: "1.234,56 €"
// ar-SA, SAR: "١٬٢٣٤٫٥٦ ر.س"
```

### 6.4 AI Formatting Instructions

The Phase 2 system prompt includes locale context:

```
Locale: ar-SA
- Use Arabic numerals (٠١٢٣٤٥٦٧٨٩) or Eastern Arabic numerals (0123456789) based on user preference
- Format dates as DD/MM/YYYY
- Currency: Saudi Riyal (SAR)
- Text direction: RTL
```

---

## 7. Translation Management

### 7.1 Translation Workflow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   EXTRACT   │───▶│   TRANSLATE │───▶│    REVIEW   │───▶│   DEPLOY    │
│  (find new  │    │  (human or  │    │  (native    │    │  (auto-     │
│   strings)  │    │   machine)  │    │   speaker)  │    │   deploy)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 7.2 Translation Tools

| Tool           | Purpose                         |
| -------------- | ------------------------------- |
| i18next-parser | Extract strings from code       |
| Crowdin        | Translation management platform |
| DeepL API      | Machine translation             |
| GitHub Actions | Automated translation PRs       |

### 7.3 Translation Keys

Use descriptive, hierarchical keys:

```json
{
  "feature.component.element": "Text"
}

// Examples:
"button.submit": "Submit"
"form.email.placeholder": "Enter your email"
"error.network.title": "Connection Error"
```

---

## 8. Testing

### 8.1 Visual Regression

Test all components in both LTR and RTL:

```typescript
// Storybook configuration
export const LTR = {
  parameters: {
    locale: 'en-US',
  },
};

export const RTL = {
  parameters: {
    locale: 'ar-SA',
  },
};
```

### 8.2 Automated Tests

```typescript
// RTL rendering test
import { render } from '@testing-library/react';
import { LocaleProvider } from '@alloy/i18n';
import { Card } from './Card';

describe('Card RTL', () => {
  it('renders correctly in RTL', () => {
    const { container } = render(
      <LocaleProvider locale="ar-SA">
        <Card>Content</Card>
      </LocaleProvider>
    );

    expect(container.firstChild).toHaveAttribute('dir', 'rtl');
  });
});
```

---

## 9. Related Documents

- [Component Development Guidelines](./Component_Development_Guidelines.md)
- [Design Token & Theming Specification](./Design_Token_Theming_Specification.md)
- [A11y Compliance Checklist](./A11y_Compliance_Checklist.md)

---

## 10. Resources

- [W3C Internationalization](https://www.w3.org/International/)
- [RTL Styling 101](https://rtlstyling.com/)
- [Intl API Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

---

## 11. Document History

| Version | Date       | Author    | Changes         |
| ------- | ---------- | --------- | --------------- |
| 1.0     | 2025-04-10 | i18n Team | Initial release |
