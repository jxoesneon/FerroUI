# Prompt Versioning & Rollback Ledger

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** AI Engineering Team  

---

## 1. Overview

This document tracks all system prompt versions, their changes, and any rollbacks performed. It serves as the authoritative record for prompt governance.

---

## 2. Version History

### 2.1 Version Timeline

```
v1.0.0 ──────────────────────────────────────────────────────────►
  │
  │ 2025-01-15: Initial release
  │
v1.0.1 ──────────────────────────────────────────────────────────►
  │
  │ 2025-01-22: Fixed component naming clarity
  │
v1.0.2 ──────────────────────────────────────────────────────────►
  │
  │ 2025-02-01: Enhanced nesting rules
  │
v1.1.0 ──────────────────────────────────────────────────────────►
  │
  │ 2025-02-15: Added RTL support instructions
  │
v1.1.1 ──────────────────────────────────────────────────────────►
  │
  │ 2025-03-01: Improved repair prompt
  │
v1.2.0 ──────────────────────────────────────────────────────────►
  │
  │ 2025-04-01: Added multi-modal input guidance
  │
v1.2.1 (current) ────────────────────────────────────────────────►
  │
  │ 2025-04-10: Security hardening updates
```

---

## 3. Detailed Version Log

### v1.0.0 — Initial Release

**Release Date:** 2025-01-15  
**Status:** Deprecated  
**Author:** AI Engineering Team

#### Changes
- Initial system prompt structure
- Phase 1 and Phase 2 separation
- Basic component manifest
- Nesting rules

#### Known Issues
- Component naming ambiguity (Case Study 1)
- Insufficient nesting rule emphasis

---

### v1.0.1 — Component Naming Fix

**Release Date:** 2025-01-22  
**Status:** Deprecated  
**Author:** Sarah Chen  
**PR:** #234

#### Changes
- Added explicit "NOT" examples for component names
- Enhanced component manifest with common mistakes
- Added fuzzy matching hints for repair loop

#### Files Changed
- `alloy/prompts/v1.0/phase2-ui-generation.md`
- `alloy/prompts/v1.0/repair.md`

#### Evaluation Results
| Metric | v1.0.0 | v1.0.1 | Delta |
|--------|--------|--------|-------|
| Hallucination Rate | 3.5% | 1.2% | -66% |
| Schema Validity | 96% | 97.5% | +1.5% |

---

### v1.0.2 — Nesting Rules Enhancement

**Release Date:** 2025-02-01  
**Status:** Deprecated  
**Author:** Mike Rodriguez  
**PR:** #256

#### Changes
- Added visual examples of correct/incorrect nesting
- Emphasized "Dashboard must be root" rule
- Added pre-validation guidance

#### Files Changed
- `alloy/prompts/v1.0/phase2-ui-generation.md`

#### Evaluation Results
| Metric | v1.0.1 | v1.0.2 | Delta |
|--------|--------|--------|-------|
| Nesting Errors | 0.8% | 0.1% | -87% |
| Repair Attempts | 4% | 2% | -50% |

---

### v1.1.0 — RTL Support

**Release Date:** 2025-02-15  
**Status:** Deprecated  
**Author:** Fatima Al-Rashid  
**PR:** #278

#### Changes
- Added locale and direction context section
- Included RTL formatting instructions
- Added Arabic/Hebrew locale examples

#### Files Changed
- `alloy/prompts/v1.1/phase2-ui-generation.md`
- `alloy/prompts/v1.1/README.md`

#### Breaking Changes
None — backward compatible

#### Evaluation Results
| Metric | v1.0.2 | v1.1.0 | Delta |
|--------|--------|--------|-------|
| RTL Layout Quality | N/A | 94% | New |
| Overall Score | 97% | 97.2% | +0.2% |

---

### v1.1.1 — Repair Prompt Improvement

**Release Date:** 2025-03-01  
**Status:** Deprecated  
**Author:** James Park  
**PR:** #301

#### Changes
- Restructured repair prompt for clarity
- Added specific error examples
- Lowered repair temperature guidance

#### Files Changed
- `alloy/prompts/v1.1/repair.md`

#### Evaluation Results
| Metric | v1.1.0 | v1.1.1 | Delta |
|--------|--------|--------|-------|
| Repair Success Rate | 85% | 94% | +9% |
| Avg Repair Attempts | 2.1 | 1.4 | -33% |

---

### v1.2.0 — Multi-Modal Foundation

**Release Date:** 2025-04-01  
**Status:** Active (staging)  
**Author:** Lisa Wong  
**PR:** #345

#### Changes
- Added attachment handling instructions
- Included image analysis guidance
- Added voice input context

#### Files Changed
- `alloy/prompts/v1.2/phase1-data-gathering.md`
- `alloy/prompts/v1.2/phase2-ui-generation.md`

#### Breaking Changes
- New `attachments` field in request context

#### Evaluation Results
| Metric | v1.1.1 | v1.2.0 | Delta |
|--------|--------|--------|-------|
| Schema Validity | 98% | 97.5% | -0.5% |
| Multi-modal Handling | N/A | 92% | New |

---

### v1.2.1 — Security Hardening

**Release Date:** 2025-04-10  
**Status:** Current Production  
**Author:** Security Team  
**PR:** #367

#### Changes
- Enhanced prompt injection prevention
- Added explicit instruction protection
- Strengthened tool output escaping

#### Files Changed
- `alloy/prompts/v1.2/phase1-data-gathering.md`
- `alloy/prompts/v1.2/phase2-ui-generation.md`
- `alloy/prompts/v1.2/repair.md`

#### Security Review
- Penetration test: PASSED
- Prompt injection resistance: 99.5%

#### Evaluation Results
| Metric | v1.2.0 | v1.2.1 | Delta |
|--------|--------|--------|-------|
| Security Score | 95% | 99.5% | +4.5% |
| Overall Score | 97.5% | 97.4% | -0.1% |

---

## 4. Rollback History

### Rollback #1: v1.1.0 → v1.0.2

**Date:** 2025-02-16  
**Triggered By:** Automated alert  
**Incident Lead:** Sarah Chen

#### Trigger
Schema validity dropped from 97.5% to 92% within 1 hour of v1.1.0 deployment.

#### Root Cause
RTL formatting instructions confused the LLM for LTR locales, causing layout errors.

#### Rollback Process
```bash
# 1. Identify issue
alloy alerts list --critical

# 2. Initiate rollback
alloy prompt rollback --to 1.0.2 --reason "Schema validity degradation"

# 3. Verify rollback
alloy health check

# 4. Create incident
alloy incident create --severity high --title "v1.1.0 rollback"
```

#### Timeline
| Time | Event |
|------|-------|
| 09:00 | v1.1.0 deployed to production |
| 09:15 | Schema validity alert triggered |
| 09:20 | Rollback initiated |
| 09:25 | Rollback complete, service restored |
| 09:30 | Incident created, investigation started |

#### Post-Mortem Actions
- Added locale-specific prompt variants
- Improved evaluation coverage for non-English locales
- Added gradual rollout gates

---

## 5. Deployment Gating

### 5.1 Gradual Rollout

```
Staging ──▶ Canary (5%) ──▶ Canary (25%) ──▶ Full (100%)
  24h          2h              4h              continuous
```

### 5.2 Rollback Criteria

| Metric | Threshold | Action |
|--------|-----------|--------|
| Schema Validity | < 95% | Immediate rollback |
| Hallucination Rate | > 2% | Immediate rollback |
| Error Rate | > 5% | Immediate rollback |
| Latency p95 | > 5s | Evaluate rollback |
| User Complaints | > 10/hour | Evaluate rollback |

---

## 6. Related Documents

- [System Prompt SOP](./System_Prompt_SOP.md)
- [Prompt Evaluation Rubric](./Prompt_Evaluation_Rubric_Testing_Playbook.md)
- [Hallucination Mitigation Case Studies](./Hallucination_Mitigation_Case_Studies.md)

---

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | AI Engineering | Initial release |
