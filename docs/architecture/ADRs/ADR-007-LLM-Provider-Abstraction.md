# ADR-007: LLM Provider Abstraction

**Status:** Accepted  
**Date:** 2025-03-01  
**Deciders:** Architecture Team, AI Engineering Team  
**Consulted:** Platform Team, Security Team  

---

## Context

Organizations have varying requirements for LLM providers:
- Some require cloud providers (OpenAI, Anthropic) for quality
- Some require local models (Ollama, llama.cpp) for privacy
- Some need edge deployment (Cloudflare Workers AI)
- Requirements may change based on data sensitivity

We need an abstraction that allows hot-swapping providers without code changes.

## Decision

Implement a **minimal provider interface** (`LlmProvider`) that all LLM integrations must satisfy:

```typescript
interface LlmProvider {
  readonly id: string;
  processPrompt(req: LlmRequest): AsyncGenerator<string>;
  estimateTokens(text: string): number;
  readonly contextWindowTokens: number;
}
```

### Key Requirements

1. **AsyncGenerator return type** — All providers must stream
2. **Token estimation** — For cost tracking and context window management
3. **Hot-swappable** — Change provider at runtime without restart

## Consequences

### Positive
- True LLM agnosticism
- Easy A/B testing between providers
- Gradual migration path
- Compliance flexibility (switch to local for sensitive data)

### Negative
- Lowest common denominator interface
- Provider-specific features may be inaccessible
- Testing matrix expansion

### Mitigations
- Optional provider-specific extensions via capabilities object
- Feature detection rather than provider detection
- Comprehensive provider test suite

## Built-in Providers

| Provider | Target | Use Case |
|----------|--------|----------|
| CloudProvider | OpenAI, Anthropic, Gemini | High quality reasoning |
| OllamaProvider | Any GGUF via Ollama | Zero data egress |
| LlamaCppProvider | llama.cpp via FFI | Lowest latency, offline |
| EdgeProvider | Workers AI | Edge deployment |

## Hot-Swapping Implementation

```typescript
class LlmProviderManager {
  private currentProvider: LlmProvider;
  private providerMap: Map<string, LlmProvider>;
  
  async setProvider(id: string): Promise<void> {
    const newProvider = this.providerMap.get(id);
    if (!newProvider) throw new Error(`Unknown provider: ${id}`);
    
    // Atomic transition
    const oldProvider = this.currentProvider;
    this.currentProvider = newProvider;
    
    // Log the change
    telemetry.recordProviderSwitch(oldProvider.id, newProvider.id);
  }
  
  async *processPrompt(req: LlmRequest): AsyncGenerator<string> {
    yield* this.currentProvider.processPrompt(req);
  }
}
```

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Direct SDK integration | Vendor lock-in |
| LangChain abstraction | Too heavy; unnecessary complexity |
| Vercel AI SDK | Not flexible enough for our pipeline |

## Related Decisions

- ADR-001: Dual-Phase Pipeline Architecture
- [LLM Provider Benchmarking Reports](../../ai/LLM_Provider_Benchmarking_Reports.md)

---

## References

- [System Architecture Document](../System_Architecture_Document.md)
- [System Prompt SOP](../../ai/System_Prompt_SOP.md)
