# Quickstart & Developer Onboarding

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Estimated Time:** 10 minutes  

---

## 1. Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0 or later
- **npm** 8.0 or later (or pnpm/yarn)
- **Git** for version control
- An **OpenAI API key** (or other LLM provider)

### Check Your Environment

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
git --version
```

---

## 2. Installation

### 2.1 Create a New Project

```bash
# Using npm
npm create ferroui-app@latest my-ferroui-app

# Using pnpm (recommended)
pnpm create ferroui-app@latest my-ferroui-app

# Using yarn
yarn create ferroui-app my-ferroui-app
```

### 2.2 Follow the Prompts

```
? Select a template: (Use arrow keys)
❯ Default (React + TypeScript + Node.js)
  Minimal (Core only)
  Full (With examples and documentation)

? Package manager: (Use arrow keys)
❯ pnpm
  npm
  yarn

Creating project...
✔ Installed dependencies
✔ Initialized git repository
✔ Created example components
✔ Generated README.md
```

### 2.3 Navigate to Your Project

```bash
cd my-ferroui-app
```

---

## 3. Configuration

### 3.1 Set Up Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```env
# OpenAI (recommended for beginners)
OPENAI_API_KEY=sk-your-key-here

# Or Anthropic
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# Or Google
# GOOGLE_API_KEY=your-key-here
```

### 3.2 Verify Configuration

```bash
ferroui doctor
```

Expected output:

```
Checking FerroUI UI installation...

✔ Node.js version (20.11.0)
✔ pnpm version (8.15.0)
✔ Git repository initialized
✔ TypeScript configuration valid
✔ ESLint configuration valid
✔ Environment variables configured
✔ OpenAI API key valid

Ready to start!
```

---

## 4. Start Development Server

### 4.1 Run the Dev Command

```bash
ferroui dev
```

Expected output:

```
✔ Started orchestration engine (port: 3001)
✔ Started registry inspector (port: 3002)
✔ Started layout playground (port: 3000)
✔ Connected to OpenAI provider
✔ OpenTelemetry exporter (Jaeger: http://localhost:16686)

Ready! Open http://localhost:3000 to start building.

Watching for changes...
```

### 4.2 Open the Playground

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

You'll see the **Layout Playground** with:
- A prompt input box
- Example prompts to try
- Real-time layout preview

---

## 5. Generate Your First Layout

### 5.1 Enter a Prompt

In the playground, type:

```
Show me a dashboard with sales KPIs
```

### 5.2 Watch the Magic

1. **Skeleton Loading** appears immediately
2. **Phase 1** runs (data gathering)
3. **Phase 2** runs (UI generation)
4. **Layout appears** with:
   - Revenue KPI
   - Orders KPI
   - Conversion rate KPI

### 5.3 Explore the Output

Click **"View JSON"** to see the generated FerroUILayout:

```json
{
  "schemaVersion": "1.0",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "locale": "en-US",
  "layout": {
    "type": "Dashboard",
    "props": { "title": "Sales Overview" },
    "children": [
      {
        "type": "KPIBoard",
        "props": {
          "title": "Key Metrics",
          "kpis": [
            { "label": "Revenue", "value": "$125,000", "trend": "up", "trendValue": "12%" },
            { "label": "Orders", "value": "1,234", "trend": "up", "trendValue": "8%" },
            { "label": "Conversion", "value": "3.2%", "trend": "neutral" }
          ]
        }
      }
    ]
  }
}
```

---

## 6. Create Your First Component

### 6.1 Generate Component Boilerplate

```bash
ferroui generate component MyMetric
```

Select options:

```
? Component tier: (Use arrow keys)
❯ Atom (irreducible primitive)
  Molecule (composition)
  Organism (functional block)
? Include Storybook stories? (Y/n) Y
? Include accessibility tests? (Y/n) Y
```

### 6.2 Generated Files

```
src/components/MyMetric/
├── index.tsx           # Component implementation
├── schema.ts           # Zod schema
├── types.ts            # TypeScript types
├── MyMetric.stories.tsx
├── MyMetric.test.tsx
└── README.md
```

### 6.3 Implement Your Component

Edit `src/components/MyMetric/index.tsx`:

```tsx
import { forwardRef } from 'react';
import { MyMetricSchema } from './schema';
import type { z } from 'zod';

type MyMetricProps = z.infer<typeof MyMetricSchema>;

export const MyMetric = forwardRef<HTMLDivElement, MyMetricProps>(
  ({ label, value, trend }, ref) => {
    return (
      <div ref={ref} className="p-4 border rounded-lg">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    );
  }
);

MyMetric.displayName = 'MyMetric';
```

### 6.4 Register Your Component

Edit `src/components/index.ts`:

```typescript
import { registerComponent } from '@ferroui/core';
import { MyMetric } from './MyMetric';
import { MyMetricSchema } from './MyMetric/schema';

registerComponent({
  name: 'MyMetric',
  version: 1,
  tier: 'molecule',
  component: MyMetric,
  schema: MyMetricSchema,
});
```

### 6.5 Test Your Component

Refresh the playground and try:

```
Show me a dashboard with my custom metrics
```

Your `MyMetric` component should now appear in the generated layout!

---

## 7. Create Your First Tool

### 7.1 Generate Tool Boilerplate

```bash
ferroui generate tool getWeather
```

Select options:

```
? Tool category: (Use arrow keys)
❯ Data fetch
  Computation
  External API
? Include mock implementation? (Y/n) Y
```

### 7.2 Implement Your Tool

Edit `src/tools/getWeather/index.ts`:

```typescript
import { registerTool } from '@ferroui/tools';
import { z } from 'zod';

const WeatherSchema = z.object({
  location: z.string(),
  temperature: z.number(),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'snowy']),
});

registerTool({
  name: 'getWeather',
  description: 'Returns current weather for a location.',
  parameters: z.object({
    city: z.string().describe('City name'),
  }),
  returns: WeatherSchema,
  ttl: 300, // Cache for 5 minutes
  execute: async ({ city }) => {
    // Call weather API
    const response = await fetch(`https://api.weather.com/v1/current?city=${city}`);
    const data = await response.json();
    
    return {
      location: data.location,
      temperature: data.temp,
      condition: data.condition,
    };
  },
});
```

### 7.3 Test Your Tool

In the playground:

```
What's the weather in San Francisco?
```

---

## 8. Next Steps

### 8.1 Learn More

- [Component Development Guidelines](../engineering/frontend/Component_Development_Guidelines.md)
- [Tool Registration API Reference](../engineering/backend/Tool_Registration_API_Reference.md)
- [Design Token & Theming Specification](../engineering/frontend/Design_Token_Theming_Specification.md)

### 8.2 Explore Examples

Check out the `examples/` directory in your project:

```bash
ls examples/
# dashboard/        # Full dashboard example
# form/             # Form handling example
# authentication/   # Auth flow example
```

### 8.3 Join the Community

- **Discord:** [https://discord.gg/ferrouiui](https://discord.gg/ferrouiui)
- **GitHub Discussions:** [https://github.com/ferrouiui/ferroui/discussions](https://github.com/ferrouiui/ferroui/discussions)
- **Twitter:** [@ferrouiui](https://twitter.com/ferrouiui)

---

## 9. Troubleshooting

### 9.1 Common Issues

| Issue | Solution |
|-------|----------|
| `PORT 3000 already in use` | Kill process on port 3000 or change port: `ferroui dev --port 3001` |
| `OPENAI_API_KEY invalid` | Check your API key at [platform.openai.com](https://platform.openai.com) |
| `Component not found` | Ensure component is registered in `src/components/index.ts` |
| `Tool timeout` | Increase timeout in tool config or optimize tool implementation |

### 9.2 Get Help

```bash
# Check system health
ferroui doctor

# View logs
ferroui logs --follow

# Get help for any command
ferroui dev --help
```

---

## 10. Congratulations!

You've successfully:
- ✅ Installed FerroUI UI
- ✅ Generated your first AI-powered layout
- ✅ Created a custom component
- ✅ Built a custom tool

**Time to first layout:** Under 10 minutes! 🎉

---

*Ready to build something amazing? Check out the [CLI Usage Guide](./CLI_Usage_Guide.md) for more advanced features.*
