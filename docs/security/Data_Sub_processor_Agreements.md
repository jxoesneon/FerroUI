# Data Sub-Processor Agreements

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Legal & Security Teams  
**Classification:** Confidential  

---

## 1. Overview

This document lists all data sub-processors used by FerroUI and the agreements in place with each.

---

## 2. Sub-Processor Inventory

### 2.1 Infrastructure

| Provider | Service | Data Processed | Location | DPA Status |
|----------|---------|----------------|----------|------------|
| Amazon Web Services | Compute, Storage | All data | US, EU | ✅ Signed |
| Google Cloud Platform | AI/ML Services | Prompts, contexts | US, EU | ✅ Signed |
| Cloudflare | CDN, Edge Compute | Cached data | Global | ✅ Signed |

### 2.2 LLM Providers

| Provider | Service | Data Processed | Location | DPA Status |
|----------|---------|----------------|----------|------------|
| OpenAI | GPT-4 API | Prompts, contexts | US | ✅ Signed |
| Anthropic | Claude API | Prompts, contexts | US | ✅ Signed |
| Google | Gemini API | Prompts, contexts | US | ✅ Signed |

### 2.3 Monitoring & Analytics

| Provider | Service | Data Processed | Location | DPA Status |
|----------|---------|----------------|----------|------------|
| Datadog | APM, Logging | Logs, metrics | US | ✅ Signed |
| Sentry | Error Tracking | Error data | US | ✅ Signed |

---

## 3. Data Processing Agreements

### 3.1 AWS DPA

**Effective Date:** January 1, 2026  
**Agreement Type:** AWS Data Processing Addendum  
**Governing Law:** Delaware, USA  
**Key Terms:**
- Data encryption at rest and in transit
- Annual SOC 2 Type II audits
- 30-day breach notification
- Data deletion within 90 days of termination

### 3.2 OpenAI DPA

**Effective Date:** February 1, 2026  
**Agreement Type:** OpenAI Business Associate Agreement  
**Governing Law:** California, USA  
**Key Terms:**
- Zero retention for API calls (optional)
- No training on customer data
- Annual security assessments
- 24-hour breach notification

### 3.3 Anthropic DPA

**Effective Date:** February 15, 2026  
**Agreement Type:** Anthropic Data Processing Agreement  
**Governing Law:** California, USA  
**Key Terms:**
- 30-day data retention
- No model training on customer data
- SOC 2 Type II certified
- 24-hour breach notification

---

## 4. Sub-Processor Notification

### 4.1 Change Notification Process

1. **Identification** — New sub-processor identified
2. **Assessment** — Security and privacy review
3. **DPA Negotiation** — Execute data processing agreement
4. **Customer Notification** — 30-day advance notice
5. **Implementation** — Add to production environment

### 4.2 Recent Changes

| Date | Action | Sub-Processor | Details |
|------|--------|---------------|---------|
| 2025-03-01 | Added | Google Gemini | New LLM provider |
| 2025-02-15 | Updated | Anthropic | DPA renewal |
| 2025-01-01 | Added | Cloudflare Workers | Edge deployment |

---

## 5. Geographic Data Residency

### 5.1 Data Center Locations

| Region | Primary | Backup |
|--------|---------|--------|
| US | AWS us-east-1 | AWS us-west-2 |
| EU | AWS eu-central-1 | AWS eu-west-1 |
| UK | AWS eu-west-2 | AWS eu-west-1 |
| APAC | AWS ap-southeast-1 | AWS ap-northeast-1 |

### 5.2 Data Transfer Mechanisms

| From | To | Mechanism |
|------|-----|-----------|
| EU | US | Standard Contractual Clauses |
| UK | US | UK Addendum to SCCs |
| Switzerland | US | Swiss-US Privacy Framework |

---

## 6. Contact Information

### 6.1 Data Protection Officer

**Name:** Jane Smith  
**Email:** dpo@ferroui.dev  
**Phone:** +1 (555) 123-4567

### 6.2 Sub-Processor Contacts

| Provider | Privacy Contact |
|----------|-----------------|
| AWS | privacy@amazon.com |
| OpenAI | privacy@openai.com |
| Anthropic | privacy@anthropic.com |
| Google | privacy@google.com |

---

## 7. Related Documents

- [Data Privacy Compliance Guide](./Data_Privacy_Compliance_Guide.md)
- [Security Threat Model](./Security_Threat_Model.md)

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Legal Team | Initial release |
