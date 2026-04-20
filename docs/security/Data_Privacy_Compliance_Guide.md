# Data Privacy Compliance Guide

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Security & Legal Teams  

---

## 1. Overview

This guide outlines FerroUI's approach to data privacy compliance, including GDPR, CCPA, and other privacy regulations. It provides implementation guidance for developers and administrators.

---

## 2. Regulatory Framework

### 2.1 Covered Regulations

| Regulation | Jurisdiction | Key Requirements |
|------------|--------------|------------------|
| GDPR | EU/EEA | Consent, right to erasure, data portability |
| CCPA/CPRA | California | Right to know, delete, opt-out |
| HIPAA | US Healthcare | PHI protection, audit logs |
| SOC 2 | US | Security, availability, confidentiality |

### 2.2 Data Classification

| Classification | Description | Examples |
|----------------|-------------|----------|
| Public | No restrictions | Documentation, public APIs |
| Internal | Company use only | Metrics, internal reports |
| Confidential | Sensitive business data | API keys, system configs |
| Restricted | Personal/health data | User PII, PHI |

---

## 3. Data Processing

### 3.1 Data Flow Diagram

```
User Input
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PII       │───▶│   Redaction │───▶│    LLM      │
│  Detection  │    │  Middleware │    │   Provider  │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Render    │◀───│   Layout    │◀───│   Output    │
│    UI       │    │  Validation │    │  Generation │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 3.2 PII Detection and Redaction

```typescript
// PII detection patterns
const piiPatterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/,
  phone: /\b\d{3}-\d{3}-\d{4}\b/,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/,
};

// Redaction middleware
export function redactPII(data: unknown): unknown {
  const redacted = JSON.stringify(data);
  
  return redacted
    .replace(piiPatterns.email, '[REDACTED_EMAIL]')
    .replace(piiPatterns.ssn, '[REDACTED_SSN]')
    .replace(piiPatterns.phone, '[REDACTED_PHONE]')
    .replace(piiPatterns.creditCard, '[REDACTED_CC]');
}
```

---

## 4. GDPR Compliance

### 4.1 Lawful Basis for Processing

| Basis | Use Case | Implementation |
|-------|----------|----------------|
| Consent | Marketing, analytics | Opt-in checkbox |
| Contract | Service provision | Terms of service |
| Legal Obligation | Regulatory compliance | Audit logs |
| Legitimate Interest | Security, fraud prevention | Documented assessment |

### 4.2 Data Subject Rights

#### Right to Access (Article 15)

```typescript
// Export user data
app.get('/api/user/data-export', authenticate, async (req, res) => {
  const userData = await exportUserData(req.user.id);
  
  res.json({
    personalData: userData.profile,
    prompts: userData.prompts,
    layouts: userData.layouts,
    toolCalls: userData.toolCalls,
    generatedAt: new Date().toISOString(),
  });
});
```

#### Right to Erasure (Article 17)

```typescript
// Delete user data
app.delete('/api/user', authenticate, async (req, res) => {
  const userId = req.user.id;
  
  // Delete from database
  await db.users.delete(userId);
  
  // Invalidate cache entries
  await cache.invalidatePattern(`*${userId}*`);
  
  // Delete session
  await sessionStore.destroy(req.session.id);
  
  // Log deletion
  auditLog.record({
    action: 'USER_DELETED',
    userId,
    timestamp: new Date(),
  });
  
  res.status(204).send();
});
```

#### Right to Data Portability (Article 20)

```typescript
// Export in machine-readable format
app.get('/api/user/export/json', authenticate, async (req, res) => {
  const data = await exportUserData(req.user.id);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="my-data.json"');
  res.json(data);
});
```

### 4.3 Data Processing Agreement (DPA)

Required for third-party processors:

| Processor | Purpose | DPA Status |
|-----------|---------|------------|
| OpenAI | LLM inference | Signed |
| Anthropic | LLM inference | Signed |
| Google Cloud | Infrastructure | Signed |
| AWS | Infrastructure | Signed |

---

## 5. CCPA/CPRA Compliance

### 5.1 Consumer Rights

| Right | Implementation |
|-------|----------------|
| Right to Know | Data inventory and disclosure |
| Right to Delete | Deletion API and process |
| Right to Opt-Out | "Do Not Sell" toggle |
| Right to Non-Discrimination | Equal service for all |

### 5.2 Privacy Notice Requirements

Required disclosures:
- Categories of personal information collected
- Purposes for collection
- Categories of third parties shared with
- Consumer rights and how to exercise them

---

## 6. HIPAA Compliance (Healthcare)

### 6.1 Protected Health Information (PHI)

PHI must never be:
- Sent to cloud LLM providers
- Stored in unencrypted form
- Accessible without audit logging

### 6.2 Implementation

```typescript
// Route PHI requests to local LLM
function selectProvider(request: FerroUIRequest): LlmProvider {
  if (request.containsPHI) {
    return localOllamaProvider; // No data egress
  }
  return openAIProvider;
}

// Mark tools that handle PHI
registerTool({
  name: 'getPatientRecord',
  description: 'Returns patient medical record.',
  parameters: z.object({ patientId: z.string() }),
  returns: PatientRecordSchema,
  containsPHI: true, // Mark as PHI
  ttl: 0, // Never cache
  execute: async ({ patientId }) => {
    return await db.patients.findById(patientId);
  },
});
```

---

## 7. Data Retention

### 7.1 Retention Policies

| Data Type | Retention Period | Rationale |
|-----------|------------------|-----------|
| User prompts | 90 days | Debugging, improvement |
| Generated layouts | 30 days | Caching, analytics |
| Tool call logs | 1 year | Audit, compliance |
| Error logs | 90 days | Debugging |
| Session data | 24 hours | Security |

### 7.2 Automated Deletion

```typescript
// Daily cleanup job
async function cleanupExpiredData() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  
  // Delete old prompts
  await db.prompts.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  
  // Delete old layouts
  await db.layouts.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
  });
}
```

---

## 8. Cross-Border Data Transfers

### 8.1 Transfer Mechanisms

| From | To | Mechanism |
|------|-----|-----------|
| EU | US | Standard Contractual Clauses (SCCs) |
| UK | US | UK Addendum to SCCs |
| Switzerland | US | Swiss-US Privacy Framework |

### 8.2 Data Localization

For customers requiring data residency:

| Region | Deployment |
|--------|------------|
| EU | Frankfurt (AWS eu-central-1) |
| UK | London (AWS eu-west-2) |
| US | Virginia (AWS us-east-1) |
| APAC | Singapore (AWS ap-southeast-1) |

---

## 9. Audit and Monitoring

### 9.1 Audit Log Schema

```typescript
interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  resource: string;
  result: 'success' | 'failure';
  details: Record<string, unknown>;
}
```

### 9.2 Required Audit Events

| Event | Description |
|-------|-------------|
| USER_LOGIN | User authentication |
| USER_LOGOUT | User session ended |
| PROMPT_SUBMITTED | User submitted prompt |
| LAYOUT_GENERATED | AI generated layout |
| TOOL_CALLED | Tool was executed |
| DATA_EXPORTED | User exported their data |
| DATA_DELETED | User data deleted |
| PERMISSION_CHANGED | User permissions modified |

---

## 10. Related Documents

- [Security Threat Model](./Security_Threat_Model.md)
- [Data Sub-Processor Agreements](./Data_Sub_processor_Agreements.md)
- [Acceptable Use Policy](./Acceptable_Use_Policy.md)

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Security Team | Initial release |
