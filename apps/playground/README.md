# FerroUI Playground (G.4)

An interactive web-based playground for experimenting with FerroUI layouts.

## Features

- **Live Prompt Editor**: Type prompts and see generated layouts in real-time
- **Component Palette**: Browse and preview all available components
- **Layout Editor**: Drag-and-drop interface builder
- **Code Export**: Export layouts as React/TypeScript code
- **Version History**: Save and compare layout iterations

## Usage

```bash
# Start the playground
pnpm -F @ferroui/playground dev

# Open http://localhost:3001
```

## Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│  FerroUI Playground                                    [Login] [Docs] │
├──────────────────────────┬────────────────────────────────────────┤
│                          │                                        │
│  PROMPT                  │  PREVIEW                               │
│  ┌────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │ Create a dashboard │  │  │  ┌──────────────────────────────┐ │  │
│  │ with 3 metric      │  │  │  │ Metric 1      │ Metric 2    │ │  │
│  │ cards...           │  │  │  └──────────────────────────────┘ │  │
│  └────────────────────┘  │  │  │  ┌──────────────────────────┐   │  │
│                          │  │  │  │                          │   │  │
│  Settings                │  │  │  │    [ Chart Area ]        │   │  │
│  ├─ Provider: Anthropic  │  │  │  │                          │   │  │
│  ├─ Model: Claude 3      │  │  │  └──────────────────────────┘   │  │
│  ├─ Temperature: 0.7     │  │  │                                 │  │
│  └─ Max Tokens: 2000     │  │  └──────────────────────────────────┘  │
│                          │                                        │
│  [Generate Layout]       │  [Export] [Save] [Share]               │
│                          │                                        │
├──────────────────────────┴────────────────────────────────────────┤
│  Generated Code (TypeScript)                                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ export const layout = {                                     │ │
│  │   components: [...]                                           │ │
│  │ };                                                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## API

The playground uses the FerroUI Engine API with additional playground-specific endpoints:

```typescript
// Save layout
POST /playground/v1/save
{ name: "My Dashboard", layout: {...} }

// Load saved layouts
GET /playground/v1/layouts

// Share layout (creates public link)
POST /playground/v1/share
{ layoutId: "..." }
```

## Authentication

Playground requires authentication for saving/sharing:
- GitHub OAuth
- Google OAuth
- API Key (for enterprise users)

## Deployment

The playground is deployed at:
- Production: https://playground.ferroui.dev
- Staging: https://playground-staging.ferroui.dev

## Tech Stack

- React + TypeScript
- Monaco Editor (code editing)
- React DnD (drag-and-drop)
- FerroUI React SDK (preview rendering)
