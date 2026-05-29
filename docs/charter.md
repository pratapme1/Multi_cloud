# Project Charter — Multi-Cloud Storage Integration

**Version:** 1.0 | **Date:** 2026-05-27 | **Status:** Draft — pending sign-off

---

## Purpose

Build an application that integrates AWS S3, Azure Blob Storage, and Google Cloud Storage behind a single unified interface — removing the need for users to interact with each provider's SDK or console separately.

---

## Objectives

1. Working API modules for all 3 cloud providers by **2026-06-05**
2. Unified interface with file sync and redundancy by **2026-06-10**
3. Web UI with access control, deployed and live by **2026-06-16**

---

## Scope

**In scope**
- AWS S3, Azure Blob, GCS integration modules
- Unified interface: upload, download, list, delete, sync, redundancy
- File size and file types
- Web UI for file management
- User authentication and role-based access control
- Security: credential management, no secrets in version control

**Out of scope**
- Mobile applications
- Cloud providers beyond AWS, Azure, GCP
- Billing / cost management
- CDN, edge caching
- Advanced compliance (HIPAA, GDPR enforcement)

---

## Success Criteria

- [ ] Files upload to and download from all 3 providers via the unified interface
- [ ] Sync replicates files across at least 2 providers
- [ ] Redundant upload writes to 2+ providers in one call
- [ ] Web UI works in a browser without CLI or API knowledge
- [ ] Login and RBAC restrict access correctly
- [ ] No credentials in plain text or version control
- [ ] App deployed and accessible at go-live

---

## Team

| Role | Name | Responsibilities |
|------|------|-----------------|
| PM / PO | Vishnu | Scope, milestone gates, stakeholder comms, **UX wireframes and screen design (Designer role)**, E2E acceptance testing on production |
| Developer (Full-stack) | Anushman | Architecture, implementation, unit tests (written alongside each module), deployment. Stack: .NET (C#) / Core Java + React. 5 yrs experience. |
| QA / Validation | Anand | Integration testing, manual testing, API validation (Postman). 11 yrs hardware + software validation experience. |

**Role coverage decisions (updated 2026-05-28 post-kickoff):**
- No dedicated Designer — PM owns all UX wireframes, screen layouts, and interaction flows. Developer implements using a CSS framework (Bootstrap / Tailwind / Material UI).
- QA covered by Anand — dedicated QA role. Anand runs integration and manual tests; Anushman writes unit tests alongside each module. PM runs independent E2E on production (task 3.19).
- R09 resolved — Anushman confirmed full-stack (React + .NET). No additional frontend developer needed.
- Capacity constraint: Both developers are 2–3 hrs/day only (not full-time). Timeline under review.

---

## Constraints

| Constraint | Detail |
|------------|--------|
| Time | 20 calendar days — go-live June 16, 2026 |
| Team | 3 people (PM + Anushman + Anand). Developer capacity: 2–3 hrs/day each — not full-time. |
| Budget | Cloud free-tier only (assumed) |
| Tech stack | TBD — D-001 overdue (was due 2026-05-28); stack leans .NET + React but not formally closed |

---

## Key Assumptions

- Cloud accounts provisionable within 2 days
- Free-tier limits sufficient for development and testing
- No external review gates between milestones
- Developer has prior experience with at least one cloud provider *(partially invalidated — Anushman has minimal AWS only, no Azure/GCP)*
- Both developers available 2–3 hrs/day — timeline built on 5–6 hrs/day assumption; may require scope review

---

## Sign-Off

| Role | Name | Date |
|------|------|------|
| PM / PO/PD | Vishnu |28-05-2026 |
| FullStack Developer |Anushman |28-05-2026 |
| QA-Manual Testing |Anand |28-05-2026 |

