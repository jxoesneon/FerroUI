---
title: Component API Reference
outline: deep
---

# Component API Reference

This reference is **auto-generated** from the Zod schemas in `@ferroui/registry` on every push. Each component entry documents its typed props, allowed enum values, defaults, and a runnable `FerroUILayout` JSON example.

::: tip Nesting rules
- **Atoms** cannot have children.
- **Molecules** cannot contain Organisms.
- A `Dashboard` organism is typically the root of any layout.
:::

**Total components registered:** 23

| Tier | Count |
|------|-------|
| 🔵 Organism | 10 |
| 🟣 Molecule | 6 |
| 🟢 Atom | 7 |

## Organisms

### ActivityFeed

A live-updating activity feed.

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | No | — |  |
| `maxItems` | integer | Yes | `10` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "ActivityFeed",
  "props": {
    "title": "",
    "maxItems": 10,
    "aria": {}
  },
  "aria": {
    "label": "ActivityFeed example",
    "hidden": false
  }
}
```

---

### ChartPanel

A chart display panel (data visualization).

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | Yes | — | Chart title |
| `chartType` | `"line"` \| `"bar"` \| `"pie"` \| `"area"` \| `"scatter"` | Yes | — | Chart type |
| `data` | unknown | No | — | Chart data payload |
| `fallbackSummary` | string | Yes | — | Mandatory text summary for screen readers (sr-only) |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "ChartPanel",
  "props": {
    "title": "",
    "chartType": "line",
    "data": null,
    "fallbackSummary": "",
    "aria": {}
  },
  "aria": {
    "label": "ChartPanel example",
    "hidden": false
  }
}
```

---

### Dashboard

Root layout container. Must be the top-level component.

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | No | — |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "Dashboard",
  "props": {
    "title": "",
    "aria": {}
  },
  "aria": {
    "label": "Dashboard example",
    "hidden": false
  }
}
```

---

### DataTable

Tabular data display with column definitions.

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `columns` | object[] | Yes | — | Column definitions |
| `rows` | object[] | Yes | — | Row data |
| `caption` | string | No | — |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "DataTable",
  "props": {
    "columns": [],
    "rows": [],
    "caption": "",
    "aria": {}
  },
  "aria": {
    "label": "DataTable example",
    "hidden": false
  }
}
```

---

### FormGroup

A form container grouping FormField molecules.

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | No | — |  |
| `submitContent` | string | Yes | `"Submit"` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "FormGroup",
  "props": {
    "title": "",
    "submitContent": "Submit",
    "aria": {}
  },
  "aria": {
    "label": "FormGroup example",
    "hidden": false
  }
}
```

---

### KPIBoard

Grid container for KPI stat cards.

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | No | — |  |
| `columns` | integer | Yes | `4` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "KPIBoard",
  "props": {
    "title": "",
    "columns": 4,
    "aria": {}
  },
  "aria": {
    "label": "KPIBoard example",
    "hidden": false
  }
}
```

---

### Modal

A compliant modal dialog.

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `isVisible` | boolean | Yes | `false` |  |
| `title` | string | Yes | — | Modal title |
| `content` | string | No | — | Text content |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "Modal",
  "props": {
    "isVisible": false,
    "title": "",
    "content": "",
    "aria": {}
  },
  "aria": {
    "label": "Modal example",
    "hidden": false
  }
}
```

---

### ProfileHeader

User profile header with avatar and cover image.

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | — | User name |
| `title` | string | No | — |  |
| `avatarSrc` | string | No | — |  |
| `coverSrc` | string | No | — |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "ProfileHeader",
  "props": {
    "name": "",
    "title": "",
    "avatarSrc": "",
    "coverSrc": "",
    "aria": {}
  },
  "aria": {
    "label": "ProfileHeader example",
    "hidden": false
  }
}
```

---

### StatusBanner

A status/alert banner at the top of a section.

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `message` | string | Yes | — | Banner message |
| `variant` | `"info"` \| `"success"` \| `"warning"` \| `"error"` | Yes | `"info"` |  |
| `isDismissible` | boolean | Yes | `false` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "StatusBanner",
  "props": {
    "message": "",
    "variant": "info",
    "isDismissible": false,
    "aria": {}
  },
  "aria": {
    "label": "StatusBanner example",
    "hidden": false
  }
}
```

---

### TicketCard

A support/issue ticket card.

**Tier:** 🔵 Organism · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `id` | string | Yes | — | Ticket ID |
| `title` | string | Yes | — | Ticket title |
| `status` | `"open"` \| `"in_progress"` \| `"resolved"` \| `"closed"` | Yes | — | Ticket status |
| `priority` | `"low"` \| `"medium"` \| `"high"` \| `"critical"` | No | — |  |
| `assignee` | string | No | — |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "TicketCard",
  "props": {
    "id": "",
    "title": "",
    "status": "open",
    "priority": "low",
    "assignee": "",
    "aria": {}
  },
  "aria": {
    "label": "TicketCard example",
    "hidden": false
  }
}
```

---

## Molecules

### ActionButton

An interactive button with variants.

**Tier:** 🟣 Molecule · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `content` | string | Yes | — | Button text |
| `variant` | `"primary"` \| `"secondary"` \| `"ghost"` \| `"danger"` | Yes | `"primary"` |  |
| `isDisabled` | boolean | Yes | `false` |  |
| `isLoading` | boolean | Yes | `false` |  |
| `icon` | string | No | — |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "ActionButton",
  "props": {
    "content": "",
    "variant": "primary",
    "isDisabled": false,
    "isLoading": false,
    "icon": "",
    "aria": {}
  },
  "aria": {
    "label": "ActionButton example",
    "hidden": false
  }
}
```

---

### FormField

A single form input with label and error display.

**Tier:** 🟣 Molecule · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | — | Field name |
| `title` | string | Yes | — | Field label |
| `type` | `"text"` \| `"email"` \| `"password"` \| `"number"` \| `"textarea"` \| `"select"` | Yes | `"text"` |  |
| `placeholder` | string | No | — |  |
| `isRequired` | boolean | Yes | `false` |  |
| `autoComplete` | string | No | — |  |
| `error` | string | No | — |  |
| `options` | object[] | No | — |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "FormField",
  "props": {
    "name": "",
    "title": "",
    "type": "text",
    "placeholder": "",
    "isRequired": false,
    "autoComplete": "",
    "error": "",
    "options": [],
    "aria": {}
  },
  "aria": {
    "label": "FormField example",
    "hidden": false
  }
}
```

---

### MetricRow

A single-row metric display.

**Tier:** 🟣 Molecule · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | Yes | — | Row label |
| `value` | string \| number | Yes | — | Row value |
| `unit` | string | No | — |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "MetricRow",
  "props": {
    "title": "",
    "value": null,
    "unit": "",
    "aria": {}
  },
  "aria": {
    "label": "MetricRow example",
    "hidden": false
  }
}
```

---

### SearchBar

A search input bar.

**Tier:** 🟣 Molecule · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `placeholder` | string | Yes | `"Search..."` |  |
| `value` | string | No | — |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "SearchBar",
  "props": {
    "placeholder": "Search...",
    "value": "",
    "aria": {}
  },
  "aria": {
    "label": "SearchBar example",
    "hidden": false
  }
}
```

---

### StatBadge

Displays a single statistic with optional trend.

**Tier:** 🟣 Molecule · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | Yes | — | Metric label |
| `value` | string \| number | Yes | — | Metric value |
| `trend` | `"up"` \| `"down"` \| `"flat"` | No | — |  |
| `trendColor` | `"success"` \| `"danger"` \| `"muted"` | No | — |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "StatBadge",
  "props": {
    "title": "",
    "value": null,
    "trend": "up",
    "trendColor": "success",
    "aria": {}
  },
  "aria": {
    "label": "StatBadge example",
    "hidden": false
  }
}
```

---

### UserAvatar

Avatar with name and optional subtitle.

**Tier:** 🟣 Molecule · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | — | User display name |
| `src` | string | No | — | Avatar image URL |
| `subtitle` | string | No | — | Secondary text (e.g., role) |
| `size` | `"sm"` \| `"md"` \| `"lg"` | Yes | `"md"` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "UserAvatar",
  "props": {
    "name": "",
    "src": "",
    "subtitle": "",
    "size": "md",
    "aria": {}
  },
  "aria": {
    "label": "UserAvatar example",
    "hidden": false
  }
}
```

---

## Atoms

### Avatar

Displays a user avatar image or initials.

**Tier:** 🟢 Atom · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `src` | string | No | — | Image URL |
| `alt` | string | Yes | `"User avatar"` |  |
| `initials` | string | No | — | Fallback initials |
| `size` | `"sm"` \| `"md"` \| `"lg"` | Yes | `"md"` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "Avatar",
  "props": {
    "src": "",
    "alt": "User avatar",
    "initials": "",
    "size": "md",
    "aria": {}
  },
  "aria": {
    "label": "Avatar example",
    "hidden": false
  }
}
```

---

### Badge

Renders a small status badge.

**Tier:** 🟢 Atom · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `content` | string | Yes | — | Badge text |
| `variant` | `"default"` \| `"primary"` \| `"success"` \| `"warning"` \| `"danger"` | Yes | `"default"` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "Badge",
  "props": {
    "content": "",
    "variant": "default",
    "aria": {}
  },
  "aria": {
    "label": "Badge example",
    "hidden": false
  }
}
```

---

### Divider

A visual separator line.

**Tier:** 🟢 Atom · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `orientation` | `"horizontal"` \| `"vertical"` | Yes | `"horizontal"` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "Divider",
  "props": {
    "orientation": "horizontal",
    "aria": {}
  },
  "aria": {
    "label": "Divider example",
    "hidden": false
  }
}
```

---

### Icon

Displays an icon by name.

**Tier:** 🟢 Atom · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | — | Icon identifier |
| `size` | `"sm"` \| `"md"` \| `"lg"` | Yes | `"md"` |  |
| `color` | string | No | — |  |
| `isMirrorInRtl` | boolean | Yes | `false` | Whether to mirror the icon in RTL layouts |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "Icon",
  "props": {
    "name": "",
    "size": "md",
    "color": "",
    "isMirrorInRtl": false,
    "aria": {}
  },
  "aria": {
    "label": "Icon example",
    "hidden": false
  }
}
```

---

### Skeleton

A placeholder skeleton loader.

**Tier:** 🟢 Atom · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `width` | string | Yes | `"100%"` |  |
| `height` | string | Yes | `"1rem"` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "Skeleton",
  "props": {
    "width": "100%",
    "height": "1rem",
    "aria": {}
  },
  "aria": {
    "label": "Skeleton example",
    "hidden": false
  }
}
```

---

### Tag

A tag/chip label element.

**Tier:** 🟢 Atom · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `content` | string | Yes | — | Tag text |
| `color` | string | No | — |  |
| `isRemovable` | boolean | Yes | `false` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "Tag",
  "props": {
    "content": "",
    "color": "",
    "isRemovable": false,
    "aria": {}
  },
  "aria": {
    "label": "Tag example",
    "hidden": false
  }
}
```

---

### Text

Renders text content with variant and color.

**Tier:** 🟢 Atom · **Version:** `1`

#### Props

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `content` | string | Yes | — | Text content to display |
| `variant` | `"heading1"` \| `"heading2"` \| `"heading3"` \| `"body"` \| `"caption"` | Yes | `"body"` |  |
| `color` | `"default"` \| `"muted"` \| `"primary"` \| `"danger"` \| `"success"` | Yes | `"default"` |  |
| `aria` | object | Yes | — |  |


#### Example

```json
{
  "id": "example-1",
  "type": "Text",
  "props": {
    "content": "",
    "variant": "body",
    "color": "default",
    "aria": {}
  },
  "aria": {
    "label": "Text example",
    "hidden": false
  }
}
```

---
