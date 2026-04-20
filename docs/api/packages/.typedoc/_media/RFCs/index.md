---
title: Request for Comments
---

# Request for Comments (RFCs)

RFCs propose **directional changes** before they are implemented. They are the public deliberation surface for architecturally significant modifications: schema changes, new subsystems, cross-package refactors, and breaking protocol updates.

| ID | Title | Status |
|----|-------|--------|
| [RFC-001](/architecture/RFCs/RFC-001-Layout-Actions-State-Machines) | Layout Actions & State Machines | Accepted |
| [RFC-002](/architecture/RFCs/RFC-002-Shared-Semantic-Cache) | Shared Semantic Cache Across Tenants | Accepted |
| [RFC-003](/architecture/RFCs/RFC-003-Partial-Layout-Updates) | Partial Layout Updates & Patches | Accepted |
| [RFC-004](/architecture/RFCs/RFC-004-Multi-Modal-Input-Support) | Multi-Modal Input Support | Draft |

## RFC Lifecycle

1. **Draft** — opened as a PR adding `RFC-XXX-Title.md` with a fully argued design.
2. **Comment** — minimum 7 working days open for discussion.
3. **Accepted** — merged. An implementation ticket is opened.
4. **Rejected / Withdrawn** — closed PR with rationale preserved in the commit history.
5. **Superseded** — replaced by a later RFC, retained for historical record.
