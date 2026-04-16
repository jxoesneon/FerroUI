# @ferroui/i18n

Internationalization and localization utilities for FerroUI.

## Installation

```bash
pnpm add @ferroui/i18n
```

## Usage

```tsx
import { I18nProvider } from '@ferroui/i18n';
<I18nProvider locale="en-US">...</I18nProvider>
```

## API Reference

- `useTranslation`: Hook for component translation.
- `I18nProvider`: Context provider for i18n state.
- `formatDate`, `formatNumber`: Intl-based formatting helpers.

## Configuration

Managed via `I18nProvider` props.

## Examples

```tsx
const { t } = useTranslation('common');
return <span>{t('welcome')}</span>;
```
