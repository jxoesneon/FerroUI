# Open Source Licensing & Dependency Matrix

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Legal & Engineering Teams  

---

## 1. Overview

This document tracks all open-source dependencies used in FerroUI, their licenses, and compliance status.

---

## 2. License Policy

### 2.1 Approved Licenses

| License | Category | Approval |
|---------|----------|----------|
| MIT | Permissive | ✅ Approved |
| Apache-2.0 | Permissive | ✅ Approved |
| BSD-2-Clause | Permissive | ✅ Approved |
| BSD-3-Clause | Permissive | ✅ Approved |
| ISC | Permissive | ✅ Approved |
| MPL-2.0 | Weak Copyleft | ✅ Approved |
| LGPL-3.0 | Weak Copyleft | ⚠️ Review required |
| GPL-3.0 | Strong Copyleft | ❌ Prohibited |
| AGPL-3.0 | Strong Copyleft | ❌ Prohibited |

### 2.2 License Compatibility

```
┌─────────────────────────────────────────────────────────────┐
│  PERMISSIVE (MIT, Apache, BSD)                              │
│  └── Can be used in proprietary software                    │
│      └── Can depend on weak copyleft                        │
│          └── Cannot depend on strong copyleft               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Dependency Inventory

### 3.1 Production Dependencies

| Package | Version | License | Category | Usage |
|---------|---------|---------|----------|-------|
| react | 18.3.1 | MIT | Frontend | UI framework |
| react-dom | 18.3.1 | MIT | Frontend | DOM renderer |
| zod | 3.23.8 | MIT | Backend | Schema validation |
| @opentelemetry/api | 1.9.0 | Apache-2.0 | Backend | Telemetry |
| framer-motion | 11.0.0 | MIT | Frontend | Animations |
| tailwindcss | 3.4.0 | MIT | Frontend | Styling |
| commander | 12.0.0 | MIT | CLI | Command parsing |
| inquirer | 9.2.0 | MIT | CLI | Interactive prompts |
| chalk | 5.3.0 | MIT | CLI | Terminal colors |
| ora | 8.0.0 | MIT | CLI | Loading spinners |
| openai | 4.28.0 | Apache-2.0 | Backend | OpenAI SDK |
| @anthropic-ai/sdk | 0.17.0 | MIT | Backend | Anthropic SDK |

### 3.2 Development Dependencies

| Package | Version | License | Usage |
|---------|---------|---------|-------|
| typescript | 5.3.3 | Apache-2.0 | Type system |
| vitest | 1.2.0 | MIT | Testing |
| eslint | 8.56.0 | MIT | Linting |
| prettier | 3.2.0 | MIT | Formatting |
| @storybook/react | 7.6.0 | MIT | Component docs |
| husky | 8.0.3 | MIT | Git hooks |
| lint-staged | 15.2.0 | MIT | Pre-commit linting |

### 3.3 Transitive Dependencies

Auto-generated via `npm audit` and `license-checker`:

```bash
# Generate license report
npx license-checker --production --json > licenses.json

# Check for prohibited licenses
npx license-checker --production --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC'
```

---

## 4. License Attribution

### 4.1 Third-Party Notices

Required notices file (`THIRD_PARTY_NOTICES.md`):

```markdown
# Third-Party Notices

This software contains the following third-party components:

## React
Copyright (c) Meta Platforms, Inc. and affiliates.
License: MIT

## Zod
Copyright (c) 2020 Colin McDonnell
License: MIT

## OpenTelemetry
Copyright The OpenTelemetry Authors
License: Apache-2.0

[...]
```

### 4.2 License Headers

Required in source files:

```typescript
/**
 * Copyright (c) 2026 FerroUI Contributors
 * SPDX-License-Identifier: MIT
 * 
 * This file may contain portions of third-party code.
 * See THIRD_PARTY_NOTICES.md for attribution.
 */
```

---

## 5. Vulnerability Management

### 5.1 Scanning Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| Snyk | Vulnerability scanning | CI/CD |
| npm audit | Built-in audit | Pre-commit |
| Dependabot | Automated updates | GitHub |
| Trivy | Container scanning | CI/CD |

### 5.2 Response SLA

| Severity | Response Time | Mitigation |
|----------|---------------|------------|
| Critical | 24 hours | Emergency patch |
| High | 72 hours | Scheduled patch |
| Medium | 2 weeks | Regular update |
| Low | Next release | Bundle with other changes |

### 5.3 Current Vulnerabilities

| Package | CVE | Severity | Status |
|---------|-----|----------|--------|
| None | - | - | All clear |

---

## 6. SBOM (Software Bill of Materials)

### 6.1 Generation

```bash
# Generate SBOM in SPDX format
npm run sbom:spdx

# Generate SBOM in CycloneDX format
npm run sbom:cyclonedx
```

### 6.2 SBOM Contents

```json
{
  "spdxVersion": "SPDX-2.3",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "ferroui-ui",
  "documentNamespace": "https://ferroui.dev/sbom/1.0.0",
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-react",
      "name": "react",
      "versionInfo": "18.3.1",
      "downloadLocation": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "licenseConcluded": "MIT",
      "copyrightText": "Copyright (c) Meta Platforms, Inc. and affiliates."
    }
  ]
}
```

---

## 7. Compliance Checklist

### 7.1 Release Checklist

- [ ] All dependencies have approved licenses
- [ ] `THIRD_PARTY_NOTICES.md` is up to date
- [ ] No critical or high vulnerabilities
- [ ] SBOM generated and archived
- [ ] License headers present in source files

### 7.2 Quarterly Review

- [ ] Dependency inventory updated
- [ ] License changes reviewed
- [ ] Vulnerability scan completed
- [ ] Legal team sign-off obtained

---

## 8. Related Documents

- [Security Threat Model](./Security_Threat_Model.md)
- [Data Privacy Compliance Guide](./Data_Privacy_Compliance_Guide.md)

---

## 9. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Legal Team | Initial release |
