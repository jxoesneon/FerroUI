# Support Escalation Paths

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Customer Success Team  

---

## 1. Support Tiers

### 1.1 Tier Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         TIER 1                                  │
│                    Frontline Support                            │
│  - Initial triage                                               │
│  - Common issues                                                │
│  - Documentation references                                     │
│  - Escalation to Tier 2 if needed                               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TIER 2                                  │
│                    Technical Support                            │
│  - Complex troubleshooting                                      │
│  - Bug investigation                                            │
│  - Workaround identification                                    │
│  - Escalation to Engineering if needed                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TIER 3                                  │
│                    Engineering Support                          │
│  - Code-level investigation                                     │
│  - Bug fixes                                                    │
│  - Feature requests                                             │
│  - Escalation to Leadership if needed                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TIER 4                                  │
│                    Leadership / Executive                       │
│  - Escalations                                                  │
│  - Account issues                                               │
│  - Contract disputes                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Escalation Criteria

### 2.1 Automatic Escalation

| Scenario | From | To | Timeframe |
|----------|------|-----|-----------|
| No response | Tier 1 | Tier 2 | 4 hours |
| No resolution | Tier 2 | Engineering | 24 hours |
| SEV1 incident | Any | Leadership | Immediate |
| Enterprise customer | Tier 1 | Tier 2 | Immediate |

### 2.2 Manual Escalation

Support agents can escalate when:
- Issue requires code changes
- Customer requests escalation
- Workaround not acceptable
- Multiple customers affected

---

## 3. Escalation Process

### 3.1 How to Escalate

1. **Document the issue**
   - Steps to reproduce
   - Expected vs actual behavior
   - Customer impact

2. **Attempted resolutions**
   - What was tried
   - Why it didn't work

3. **Escalate via**
   - Internal ticket system
   - Slack #support-escalations
   - Handoff meeting (complex cases)

### 3.2 Escalation Template

```
ESCALATION: [Ticket ID]

Customer: [Name/Company]
Tier: [Current tier]
Priority: [P1/P2/P3/P4]

Issue Summary:
[One-line summary]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]

Expected: [Expected behavior]
Actual: [Actual behavior]

Attempted Resolutions:
- [What was tried]
- [Why it failed]

Why Escalating:
[Reason for escalation]

Attachments:
- [Logs, screenshots, etc.]
```

---

## 4. Contact Information

### 4.1 Support Teams

| Team | Email | Slack | Hours |
|------|-------|-------|-------|
| Tier 1 | support@alloy.dev | #support-tier1 | 24/7 |
| Tier 2 | tech-support@alloy.dev | #support-tier2 | 24/7 |
| Engineering | eng-oncall@alloy.dev | #incidents | 24/7 |
| Leadership | leadership@alloy.dev | #escalations | Business hours |

### 4.2 Emergency Contacts

| Role | Phone | When to Use |
|------|-------|-------------|
| On-call SRE | [PagerDuty] | SEV1 incidents |
| VP Engineering | [Number] | Critical escalations |
| CEO | [Number] | Business-critical issues |

---

## 5. Response Times

| Tier | Initial Response | Update Frequency |
|------|------------------|------------------|
| Tier 1 | < 1 hour | Every 4 hours |
| Tier 2 | < 4 hours | Every 8 hours |
| Engineering | < 24 hours | Daily |
| Leadership | < 4 hours | As needed |

---

## 6. Related Documents

- [KB Article Templates](./KB_Article_Templates.md)
- [Known Issues & Troubleshooting](./Known_Issues_Troubleshooting.md)
- [End User FAQ](./End_User_FAQ.md)

---

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Customer Success | Initial release |
