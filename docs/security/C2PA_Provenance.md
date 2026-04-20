# C2PA Content Provenance (D.5)

FerroUI implements C2PA (Coalition for Content Provenance and Authenticity) standards to cryptographically sign generated UI content, enabling downstream verification of AI-generated content authenticity.

## Overview

C2PA provides a tamper-evident manifest that travels with content, answering:
- **Who** created this content (FerroUI instance)
- **When** it was created (timestamp)
- **How** it was created (AI model, prompts, chain of custody)
- **What** processing was applied (LLM calls, tool invocations)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Component Output                      │
│  (JSON layout definition)                                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  C2PA Manifest Builder                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Assertion: c2pa.created                               │  │
│  │  - Software: FerroUI v1.0.0                           │  │
│  │  - Device: ferroui-engine-instance-xyz               │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Assertion: c2pa.ai_training                           │  │
│  │  - Model: claude-3-sonnet-20240229                   │  │
│  │  - Provider: Anthropic                                │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Assertion: ferroui.audit_chain                        │  │
│  │  - HMAC: sha256:a1b2c3...                              │  │
│  │  - Audit Log Ref: audit-2026-04-17-001                 │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Signed Manifest Store                      │
│  - Embedded in response headers: X-C2PA-Manifest            │
│  - Separate endpoint: /api/v1/provenance/{content-id}       │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Signing

```typescript
// packages/engine/src/provenance/c2pa.ts

import { createC2PA } from '@contentauth/sdk';

export async function signContent(
  content: object,
  context: RequestContext,
  auditHash: string
): Promise<string> {
  const c2pa = await createC2PA({
    certificate: process.env.C2PA_CERT_PATH,
    privateKey: process.env.C2PA_PRIVATE_KEY_PATH,
  });

  const manifest = await c2pa.createManifest({
    claim_generator: `FerroUI/${process.env.FERROUI_VERSION}`,
    assertions: [
      {
        label: 'c2pa.created',
        data: {
          software: `FerroUI ${process.env.FERROUI_VERSION}`,
          device: process.env.POD_NAME || 'ferroui-engine',
        },
      },
      {
        label: 'c2pa.ai_training',
        data: {
          model: context.modelUsed,
          provider: context.provider,
          prompt_hash: hashPrompt(context.prompt),
        },
      },
      {
        label: 'ferroui.audit',
        data: {
          audit_hash: auditHash,
          timestamp: new Date().toISOString(),
        },
      },
    ],
  });

  return c2pa.sign(JSON.stringify(content), manifest);
}
```

### Verification

Clients can verify provenance:

```bash
curl https://ferroui.api/v1/provenance/layout-abc-123 | c2pa verify
```

## Security Considerations

1. **Certificate Management**: C2PA certificates are stored in HSM (AWS KMS/Google Cloud HSM)
2. **Key Rotation**: Keys rotated every 90 days per organizational policy
3. **Audit Trail**: All signing operations logged with HMAC chain integrity
4. **Revocation**: CRL (Certificate Revocation List) checked daily

## Future Enhancements

- Integration with Verify.org for consumer verification
- Blockchain anchoring for additional immutability
- Cross-org provenance chains (supply chain tracking)
