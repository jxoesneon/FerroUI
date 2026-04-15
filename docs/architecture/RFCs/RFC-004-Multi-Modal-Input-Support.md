# RFC-004: Multi-Modal Input Support

**Status:** Draft  
**Date:** 2025-04-01  
**Author:** AI Engineering Team  
**Stakeholders:** Architecture Team, Frontend Team  

---

## Summary

This RFC proposes extending the FerroUI UI request model to support **multi-modal inputs** — voice, images, and documents — in addition to natural language text. This addresses the open question in the whitepaper regarding multi-modal handling.

## Motivation

Users increasingly expect to interact with AI systems using:
- Voice commands (hands-free scenarios)
- Screenshots ("What's wrong with this UI?")
- Documents ("Summarize this PDF")
- Images ("Find products like this")

## Proposal

### 1. Extended Request Format

```typescript
interface FerroUIRequest {
  id: string;
  text?: string;
  context?: ConversationContext;
  attachments?: Attachment[];
}

type Attachment = 
  | { type: 'image'; mimeType: string; data: string; description?: string }
  | { type: 'audio'; mimeType: string; data: string; transcript?: string }
  | { type: 'document'; mimeType: string; data: string; filename: string }
  | { type: 'video'; mimeType: string; data: string; thumbnail?: string };
```

### 2. Processing Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   REQUEST   │───▶│  EXTRACT    │───▶│   PROCESS   │───▶│   CONTEXT   │
│  (multi-    │    │  (text from │    │  (analyze   │    │  (augment   │
│   modal)    │    │   audio,    │    │   images,   │    │   LLM ctx)  │
└─────────────┘    │   docs)     │    │   docs)     │    └──────┬──────┘
                   └─────────────┘    └─────────────┘           │
                                                                 ▼
                                                    ┌─────────────────────┐
                                                    │  STANDARD PIPELINE  │
                                                    │  (Phase 1 & 2)      │
                                                    └─────────────────────┘
```

### 3. Provider Capabilities

```typescript
interface LlmProvider {
  // ... existing interface
  readonly capabilities: {
    supportsImages: boolean;
    supportsAudio: boolean;
    supportsVideo: boolean;
    maxImageSize: number;
    supportedImageFormats: string[];
  };
}
```

### 4. Pre-Processing Services

| Attachment | Pre-Processing | Output |
|------------|----------------|--------|
| Audio | Speech-to-text (Whisper) | Transcript text |
| Image | Vision model (GPT-4V) | Description text |
| Document | OCR + extraction | Structured text |
| Video | Frame extraction + analysis | Key frames + description |

### 5. Example: Screenshot Analysis

```typescript
const request: FerroUIRequest = {
  id: 'req-123',
  text: 'What errors do you see in this form?',
  attachments: [{
    type: 'image',
    mimeType: 'image/png',
    data: base64EncodedImage,
    description: 'User registration form screenshot'
  }]
};

// Pipeline:
// 1. Vision model analyzes image, identifies errors
// 2. Errors added to context as tool results
// 3. Phase 2 generates layout showing errors and fixes
```

## Design Considerations

### Privacy

- Images/audio may contain PII
- Pre-processing should redact sensitive information
- User consent required for storage

### Cost

- Multi-modal models are significantly more expensive
- Pre-processing adds latency
- Should be opt-in per request

### Fallback

If provider doesn't support multi-modal:
1. Use pre-processing services to extract text
2. Proceed with text-only pipeline
3. Log capability mismatch for monitoring

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Native multi-modal in all providers | Not all providers support it |
| Separate multi-modal pipeline | Duplicates orchestration logic |
| Client-side pre-processing | Security risk; increases bundle size |

## Implementation Plan

| Phase | Deliverable | Timeline |
|-------|-------------|----------|
| 1 | Attachment schema and validation | Q3 2026 |
| 2 | Pre-processing services | Q3 2026 |
| 3 | Provider capability detection | Q4 2026 |
| 4 | Frontend attachment upload | Q4 2026 |

## Open Questions

1. Should we support real-time streaming audio (voice chat)?
2. How do we handle large documents (100+ pages)?
3. What's the retention policy for attachments?

## Feedback

Please comment on:
- Attachment type coverage
- Privacy and security concerns
- Cost management strategies

---

**Discussion Period:** 2025-04-01 to 2025-05-01  
**Target Decision:** 2025-06-15
