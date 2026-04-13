# Component API Reference

Welcome to the automated component registry documentation.

## Organisms

### Dashboard

The root container for all Alloy layouts.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Must be "Dashboard" |
| `props` | object | Yes | Component properties |
| `aria` | object | Yes | Accessibility properties |

### KPIBoard

A grid of key performance indicators.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Must be "KPIBoard" |
| `props` | object | Yes | Component properties |
| `aria` | object | Yes | Accessibility properties |

### DataTable

A powerful, interactive data table.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Must be "DataTable" |
| `props` | object | Yes | Component properties |
| `aria` | object | Yes | Accessibility properties |

### ChartPanel

Visualizes data using various chart types.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Must be "ChartPanel" |
| `props` | object | Yes | Component properties |
| `aria` | object | Yes | Accessibility properties |

## Molecules

### StatBadge

Displays a single metric with an optional trend.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Must be "StatBadge" |
| `props` | object | Yes | Component properties |
| `aria` | object | Yes | Accessibility properties |

### ActionButton

A button that triggers a system action.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Must be "ActionButton" |
| `props` | object | Yes | Component properties |
| `aria` | object | Yes | Accessibility properties |

## Atoms

### Text

Basic text primitive with variant support.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Must be "Text" |
| `props` | object | Yes | Component properties |
| `aria` | object | Yes | Accessibility properties |

### Icon

Renders a design system icon.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Must be "Icon" |
| `props` | object | Yes | Component properties |
| `aria` | object | Yes | Accessibility properties |

### Badge

A small visual indicator for status or counts.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Must be "Badge" |
| `props` | object | Yes | Component properties |
| `aria` | object | Yes | Accessibility properties |

