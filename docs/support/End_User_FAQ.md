# End User FAQ

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Customer Success Team  

---

## 1. General Questions

### Q: What is FerroUI?

**A:** FerroUI is an AI-powered, server-driven UI framework. Instead of writing static screens, you register components and data tools in TypeScript, and the AI assembles, validates, and streams layouts on demand based on natural language prompts.

---

### Q: What can I build with FerroUI?

**A:** FerroUI is ideal for:
- Internal dashboards
- Admin panels
- Data visualization tools
- Form-heavy applications
- Any UI that needs to adapt to user requests

---

### Q: Do I need to know AI/ML to use FerroUI?

**A:** No! FerroUI handles all the AI complexity. You write TypeScript components and tools like you normally would. The framework manages prompt engineering, model selection, and response parsing.

---

## 2. Getting Started

### Q: How do I install FerroUI?

**A:**
```bash
npm create ferroui-app@latest my-app
cd my-app
ferroui dev
```

See [Quickstart Guide](../dev-experience/Quickstart_Developer_Onboarding.md) for details.

---

### Q: What are the system requirements?

**A:**
- Node.js 18.0+
- npm 8.0+ (or pnpm/yarn)
- An LLM provider API key (OpenAI, Anthropic, or Google)

---

### Q: Can I use FerroUI for free?

**A:** FerroUI is open source and free to use. However, you'll need:
- An LLM provider account (OpenAI, Anthropic, etc.)
- Infrastructure for deployment (optional)

---

## 3. Components

### Q: What is the Atomic Design hierarchy?

**A:** FerroUI uses three tiers:
- **Atoms** — Irreducible UI primitives (Text, Icon, Badge)
- **Molecules** — Compositions of atoms (StatBadge, FormField)
- **Organisms** — Functional blocks (DataTable, KPIBoard)

See [Component Development Guidelines](../engineering/frontend/Component_Development_Guidelines.md).

---

### Q: How do I create a custom component?

**A:**
```bash
ferroui generate component MyComponent
```

This creates all the boilerplate files with TypeScript types, Zod schema, and tests.

---

### Q: Can I use my existing React components?

**A:** Yes! Wrap your existing components with a Zod schema and register them:

```typescript
import { registerComponent } from '@ferroui/registry';
import { MyExistingComponent } from './MyExistingComponent';
import { MyComponentSchema } from './schema';

registerComponent({
  name: 'MyExistingComponent',
  component: MyExistingComponent,
  schema: MyComponentSchema,
});
```

---

## 4. Tools

### Q: What is a tool?

**A:** Tools are functions that fetch or process data. They're the only way the AI accesses real data. Examples:
- Database queries
- API calls
- Computations

---

### Q: How do I create a tool?

**A:**
```bash
ferroui generate tool getUserData
```

Then implement the `execute` function:

```typescript
registerTool({
  name: 'getUserData',
  parameters: z.object({ userId: z.string() }),
  returns: UserSchema,
  execute: async ({ userId }) => {
    return await db.users.findById(userId);
  },
});
```

---

### Q: Can tools call external APIs?

**A:** Yes! Tools can call any API:

```typescript
registerTool({
  name: 'getWeather',
  parameters: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    const response = await fetch(`https://api.weather.com/${city}`);
    return response.json();
  },
});
```

---

## 5. LLM Providers

### Q: Which LLM providers are supported?

**A:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3)
- Google (Gemini Pro)
- Ollama (local models)
- llama.cpp (local models)

---

### Q: Can I switch providers?

**A:** Yes! Change with a single configuration:

```bash
# Environment variable
export FERROUI_DEFAULT_PROVIDER=anthropic

# Or in ferroui.config.js
module.exports = {
  providers: {
    default: 'anthropic',
  },
};
```

---

### Q: Can I use a local LLM for privacy?

**A:** Yes! Use Ollama or llama.cpp:

```bash
# Install Ollama
brew install ollama
ollama pull llama2

# Configure FerroUI
export FERROUI_DEFAULT_PROVIDER=ollama
export OLLAMA_BASE_URL=http://localhost:11434
```

---

## 6. Deployment

### Q: Where can I deploy FerroUI?

**A:** Three deployment options:
1. **Web SaaS** — Docker/Kubernetes on AWS, GCP, Azure
2. **Desktop** — Tauri for macOS, Windows, Linux
3. **Edge** — Cloudflare Workers

See deployment guides in [ops](../ops/deployment-guides/).

---

### Q: Is there a hosted version?

**A:** Enterprise customers can request a managed deployment. Contact sales@ferroui.dev.

---

## 7. Security

### Q: Is my data sent to LLM providers?

**A:** By default, yes. However:
- PII is automatically redacted
- You can use local LLMs for sensitive data
- HIPAA-compliant deployments use local models only

---

### Q: How is prompt injection prevented?

**A:** Multiple layers:
1. Structural sandboxing
2. Tool output escaping
3. Schema enforcement
4. Rate limiting

See [Security Threat Model](../security/Security_Threat_Model.md).

---

## 8. Performance

### Q: How fast is layout generation?

**A:** Typical latencies:
- p50: < 2 seconds
- p95: < 5 seconds
- With caching: < 500ms for cached layouts

---

### Q: How can I improve performance?

**A:**
1. Enable semantic caching
2. Use a faster LLM provider
3. Enable optimistic streaming
4. Optimize tool implementations

---

## 9. Support

### Q: Where can I get help?

**A:**
- Documentation: https://docs.ferroui.dev
- Discord: https://discord.gg/ferrouiui
- GitHub Discussions: https://github.com/ferrouiui/ferroui/discussions
- Email: support@ferroui.dev

---

### Q: How do I report a bug?

**A:**
1. Check [Known Issues](./Known_Issues_Troubleshooting.md)
2. Search existing issues on GitHub
3. Create a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

---

## 10. Related Documents

- [Support Escalation Paths](./Support_Escalation_Paths.md)
- [KB Article Templates](./KB_Article_Templates.md)
- [Known Issues & Troubleshooting](./Known_Issues_Troubleshooting.md)

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Customer Success | Initial release |

