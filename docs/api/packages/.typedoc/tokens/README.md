**@ferroui/tokens**

***

# @ferroui/tokens

Design tokens for the FerroUI system.

```mermaid
graph TD
    P[Primitive Tokens] --> S[Semantic Tokens]
    S --> C[Component Tokens]
    subgraph FerroUI Design Tokens
        P
        S
        C
    end
```

## Installation

```bash
pnpm add @ferroui/tokens
```

## Usage

Import tokens for use in CSS or JS.

### CSS

```css
@import "@ferroui/tokens/dist/variables.css";

.my-component {
  background-color: var(--fui-semantic-bg-primary);
  padding: var(--fui-primitive-spacing-4);
}
```

### JavaScript/TypeScript

```typescript
import { tokens } from '@ferroui/tokens';

const style = {
  backgroundColor: tokens.semantic.bg.primary,
  padding: tokens.primitive.spacing[4],
};
```

## API Reference

- `primitive`: Core color and spacing definitions.
- `semantic`: Role-based tokens (e.g., `primary-bg`).
- `component`: Component-specific tokens.

## Configuration

N/A

## Examples

```css
@import "@ferroui/tokens/dist/variables.css";
```
