# Design Token & Theming Specification

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Design Systems Team

---

## 1. Overview

Design tokens are the visual design atoms of the FerroUI design system. They
are platform-agnostic variables that represent the visual properties of our
components — colors, typography, spacing, borders, shadows, and more.

This specification defines the token structure, naming conventions, and theming
capabilities for FerroUI.

---

## 2. Token Architecture

### 2.1 Token Hierarchy

```
tokens/
├── primitive/           # Raw values (hex, px, etc.)
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   └── shadows.json
│
├── semantic/            # Contextual meanings
│   ├── colors.json      # primary, danger, success
│   ├── spacing.json     # tight, comfortable, loose
│   └── elevation.json   # card, modal, tooltip
│
└── component/           # Component-specific
    ├── button.json
    ├── input.json
    └── card.json
```

### 2.2 Token Format

```json
{
  "token-name": {
    "$value": "#3b82f6",
    "$type": "color",
    "$description": "Primary brand color"
  }
}
```

---

## 3. Primitive Tokens

### 3.1 Colors

```json
{
  "color": {
    "blue": {
      "50": { "$value": "#eff6ff", "$type": "color" },
      "100": { "$value": "#dbeafe", "$type": "color" },
      "200": { "$value": "#bfdbfe", "$type": "color" },
      "300": { "$value": "#93c5fd", "$type": "color" },
      "400": { "$value": "#60a5fa", "$type": "color" },
      "500": { "$value": "#3b82f6", "$type": "color" },
      "600": { "$value": "#2563eb", "$type": "color" },
      "700": { "$value": "#1d4ed8", "$type": "color" },
      "800": { "$value": "#1e40af", "$type": "color" },
      "900": { "$value": "#1e3a8a", "$type": "color" }
    },
    "gray": {
      "50": { "$value": "#f9fafb", "$type": "color" },
      "100": { "$value": "#f3f4f6", "$type": "color" },
      "200": { "$value": "#e5e7eb", "$type": "color" },
      "300": { "$value": "#d1d5db", "$type": "color" },
      "400": { "$value": "#9ca3af", "$type": "color" },
      "500": { "$value": "#6b7280", "$type": "color" },
      "600": { "$value": "#4b5563", "$type": "color" },
      "700": { "$value": "#374151", "$type": "color" },
      "800": { "$value": "#1f2937", "$type": "color" },
      "900": { "$value": "#111827", "$type": "color" }
    },
    "red": {
      /* ... */
    },
    "green": {
      /* ... */
    },
    "yellow": {
      /* ... */
    }
  }
}
```

### 3.2 Typography

```json
{
  "font": {
    "family": {
      "sans": {
        "$value": ["Inter", "system-ui", "sans-serif"],
        "$type": "fontFamily"
      },
      "mono": {
        "$value": ["JetBrains Mono", "monospace"],
        "$type": "fontFamily"
      }
    },
    "size": {
      "xs": { "$value": "0.75rem", "$type": "fontSize" },
      "sm": { "$value": "0.875rem", "$type": "fontSize" },
      "base": { "$value": "1rem", "$type": "fontSize" },
      "lg": { "$value": "1.125rem", "$type": "fontSize" },
      "xl": { "$value": "1.25rem", "$type": "fontSize" },
      "2xl": { "$value": "1.5rem", "$type": "fontSize" },
      "3xl": { "$value": "1.875rem", "$type": "fontSize" },
      "4xl": { "$value": "2.25rem", "$type": "fontSize" }
    },
    "weight": {
      "normal": { "$value": "400", "$type": "fontWeight" },
      "medium": { "$value": "500", "$type": "fontWeight" },
      "semibold": { "$value": "600", "$type": "fontWeight" },
      "bold": { "$value": "700", "$type": "fontWeight" }
    },
    "lineHeight": {
      "tight": { "$value": "1.25", "$type": "lineHeight" },
      "normal": { "$value": "1.5", "$type": "lineHeight" },
      "relaxed": { "$value": "1.75", "$type": "lineHeight" }
    }
  }
}
```

### 3.3 Spacing

```json
{
  "space": {
    "0": { "$value": "0", "$type": "dimension" },
    "1": { "$value": "0.25rem", "$type": "dimension" },
    "2": { "$value": "0.5rem", "$type": "dimension" },
    "3": { "$value": "0.75rem", "$type": "dimension" },
    "4": { "$value": "1rem", "$type": "dimension" },
    "5": { "$value": "1.25rem", "$type": "dimension" },
    "6": { "$value": "1.5rem", "$type": "dimension" },
    "8": { "$value": "2rem", "$type": "dimension" },
    "10": { "$value": "2.5rem", "$type": "dimension" },
    "12": { "$value": "3rem", "$type": "dimension" },
    "16": { "$value": "4rem", "$type": "dimension" },
    "20": { "$value": "5rem", "$type": "dimension" },
    "24": { "$value": "6rem", "$type": "dimension" }
  }
}
```

### 3.4 Border Radius

```json
{
  "radius": {
    "none": { "$value": "0", "$type": "dimension" },
    "sm": { "$value": "0.125rem", "$type": "dimension" },
    "base": { "$value": "0.25rem", "$type": "dimension" },
    "md": { "$value": "0.375rem", "$type": "dimension" },
    "lg": { "$value": "0.5rem", "$type": "dimension" },
    "xl": { "$value": "0.75rem", "$type": "dimension" },
    "2xl": { "$value": "1rem", "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" }
  }
}
```

### 3.5 Shadows

```json
{
  "shadow": {
    "sm": {
      "$value": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "$type": "shadow"
    },
    "base": {
      "$value": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "$type": "shadow"
    },
    "md": {
      "$value": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "$type": "shadow"
    },
    "lg": {
      "$value": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "$type": "shadow"
    },
    "xl": {
      "$value": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "$type": "shadow"
    }
  }
}
```

---

## 4. Semantic Tokens

### 4.1 Colors

```json
{
  "color": {
    "primary": {
      "DEFAULT": { "$value": "{color.blue.500}", "$type": "color" },
      "hover": { "$value": "{color.blue.600}", "$type": "color" },
      "active": { "$value": "{color.blue.700}", "$type": "color" },
      "light": { "$value": "{color.blue.100}", "$type": "color" },
      "dark": { "$value": "{color.blue.900}", "$type": "color" }
    },
    "danger": {
      "DEFAULT": { "$value": "{color.red.500}", "$type": "color" },
      "hover": { "$value": "{color.red.600}", "$type": "color" },
      "light": { "$value": "{color.red.100}", "$type": "color" }
    },
    "success": {
      "DEFAULT": { "$value": "{color.green.500}", "$type": "color" },
      "light": { "$value": "{color.green.100}", "$type": "color" }
    },
    "warning": {
      "DEFAULT": { "$value": "{color.yellow.500}", "$type": "color" },
      "light": { "$value": "{color.yellow.100}", "$type": "color" }
    },
    "text": {
      "primary": { "$value": "{color.gray.900}", "$type": "color" },
      "secondary": { "$value": "{color.gray.600}", "$type": "color" },
      "muted": { "$value": "{color.gray.500}", "$type": "color" },
      "inverse": { "$value": "{color.gray.50}", "$type": "color" }
    },
    "background": {
      "DEFAULT": { "$value": "#ffffff", "$type": "color" },
      "subtle": { "$value": "{color.gray.50}", "$type": "color" },
      "muted": { "$value": "{color.gray.100}", "$type": "color" }
    },
    "border": {
      "DEFAULT": { "$value": "{color.gray.200}", "$type": "color" },
      "strong": { "$value": "{color.gray.300}", "$type": "color" }
    }
  }
}
```

### 4.2 Elevation

```json
{
  "elevation": {
    "card": { "$value": "{shadow.base}", "$type": "shadow" },
    "dropdown": { "$value": "{shadow.md}", "$type": "shadow" },
    "modal": { "$value": "{shadow.lg}", "$type": "shadow" },
    "tooltip": { "$value": "{shadow.sm}", "$type": "shadow" },
    "sticky": { "$value": "{shadow.base}", "$type": "shadow" }
  }
}
```

---

## 5. Component Tokens

### 5.1 Button Tokens

```json
{
  "button": {
    "padding": {
      "sm": { "$value": "{space.2} {space.3}", "$type": "dimension" },
      "md": { "$value": "{space.2} {space.4}", "$type": "dimension" },
      "lg": { "$value": "{space.3} {space.6}", "$type": "dimension" }
    },
    "fontSize": {
      "sm": { "$value": "{font.size.sm}", "$type": "fontSize" },
      "md": { "$value": "{font.size.base}", "$type": "fontSize" },
      "lg": { "$value": "{font.size.lg}", "$type": "fontSize" }
    },
    "radius": { "$value": "{radius.md}", "$type": "dimension" },
    "primary": {
      "background": { "$value": "{color.primary.DEFAULT}", "$type": "color" },
      "color": { "$value": "#ffffff", "$type": "color" },
      "hoverBackground": { "$value": "{color.primary.hover}", "$type": "color" }
    }
  }
}
```

---

## 6. Theming

### 6.1 Theme Structure

```typescript
interface Theme {
  name: string;
  tokens: {
    primitive: PrimitiveTokens;
    semantic: SemanticTokens;
    component: ComponentTokens;
  };
}
```

### 6.2 Built-in Themes

| Theme           | Description         | Use Case               |
| --------------- | ------------------- | ---------------------- |
| `light`         | Default light theme | Most applications      |
| `dark`          | Dark mode           | Low-light environments |
| `high-contrast` | Enhanced contrast   | Accessibility needs    |
| `enterprise`    | Subdued colors      | Corporate applications |

### 6.3 Theme Switching

```typescript
// Theme provider
import { ThemeProvider } from '@ferroui/registry';

function App() {
  return (
    <ThemeProvider theme="light">
      <FerroUIRenderer />
    </ThemeProvider>
  );
}

// Dynamic theme switching
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

### 6.4 Custom Themes

```typescript
// custom-theme.ts
import { defineTheme } from '@ferroui/registry';

export const acmeTheme = defineTheme({
  name: 'acme',
  tokens: {
    semantic: {
      color: {
        primary: {
          DEFAULT: '#ff6b00', // Acme brand orange
          hover: '#e66000',
        },
      },
    },
  },
});

// Registration
import { registerTheme } from '@ferroui/registry';
registerTheme(acmeTheme);
```

---

## 7. Token Delivery

### 7.1 Build-Time Generation

Tokens are transformed at build time:

```bash
# Generate CSS variables
ferroui tokens build --format css --output tokens.css

# Generate Tailwind config
ferroui tokens build --format tailwind --output tailwind.config.js

# Generate TypeScript
ferroui tokens build --format typescript --output tokens.ts
```

### 7.2 CSS Output

```css
/* tokens.css */
:root {
  --color-blue-50: #eff6ff;
  --color-blue-100: #dbeafe;
  /* ... */
  --color-primary-default: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-600);
  /* ... */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  /* ... */
}

[data-theme='dark'] {
  --color-primary-default: var(--color-blue-400);
  --color-text-primary: var(--color-gray-100);
  --color-background-default: var(--color-gray-900);
}
```

### 7.3 Runtime Access

```typescript
import { tokens } from '@ferroui/registry';

// Access token value
const primaryColor = tokens.get('color.primary.DEFAULT');
// → '#3b82f6'

// Access with theme
const darkPrimary = tokens.get('color.primary.DEFAULT', { theme: 'dark' });
// → '#60a5fa'
```

---

## 8. RTL Support

### 8.1 Logical Properties

All spacing and positioning uses logical properties:

```css
/* Instead of */
margin-left: 1rem;

/* Use */
margin-inline-start: 1rem;
```

### 8.2 Token Transformation

```typescript
// For RTL locales, tokens are automatically transformed
const rtlTokens = transformTokensForRTL(tokens);

// margin-inline-start: 1rem → margin-inline-end: 1rem (when dir="rtl")
```

---

## 9. Best Practices

### 9.1 Do's and Don'ts

| ✅ Do                               | ❌ Don't                      |
| ----------------------------------- | ----------------------------- |
| Use semantic tokens in components   | Use primitive tokens directly |
| Provide fallbacks for custom themes | Hardcode color values         |
| Test themes in all states           | Assume light theme only       |
| Document theme requirements         | Create one-off color values   |

### 9.2 Token Naming

| Type      | Pattern                    | Example                          |
| --------- | -------------------------- | -------------------------------- |
| Primitive | `category.scale`           | `color.blue.500`                 |
| Semantic  | `context.modifier`         | `color.primary.hover`            |
| Component | `component.property.state` | `button.primary.hoverBackground` |

---

## 10. Related Documents

- [Component Development Guidelines](./Component_Development_Guidelines.md)
- [A11y Compliance Checklist](./A11y_Compliance_Checklist.md)
- [I18n & RTL Implementation Guide](./I18n_RTL_Implementation_Guide.md)

---

## 11. Document History

| Version | Date       | Author              | Changes         |
| ------- | ---------- | ------------------- | --------------- |
| 1.0     | 2025-04-10 | Design Systems Team | Initial release |
