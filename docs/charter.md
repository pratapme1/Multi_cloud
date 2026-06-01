# Project Charter - Multi-Cloud Storage Integration

**Version:** 1.0 | **Date:** 2026-05-27 | **Status:** Signed off

---

## Purpose

Build an application that integrates AWS S3, Azure Blob Storage, and Google Cloud Storage behind a single unified interface, removing the need for users to interact with each provider's SDK or console separately.

---

## Objectives

1. Working API modules for all 3 cloud providers by **2026-06-05**.
2. Unified interface with file sync and redundancy by **2026-06-10**.
3. Web UI with access control, deployed and live by **2026-06-16**.

---

## Scope

**In scope**
- AWS S3, Azure Blob Storage, and GCS integration modules
- Unified interface: upload, download, list, delete, sync, redundancy
- Web UI for file management
- User authentication and role-based access control
- Secure credential handling with no secrets in version control

**Out of scope**
- Mobile applications
- Cloud providers beyond AWS, Azure, and GCP
- Billing or cost-management product features
- CDN, edge caching, or advanced compliance enforcement
- Post-go-live UI polish items listed as deferred in the PRD/backlog

---

## Success Criteria

- [ ] Files upload to and download from all 3 providers through the unified interface.
- [ ] Sync replicates files across at least 2 providers.
- [ ] Redundant upload writes to 2+ providers in one call.
- [ ] Web UI works in a browser without CLI or API knowledge.
- [ ] Login and RBAC restrict access correctly.
- [ ] No credentials are committed or exposed to the browser.
- [ ] App is deployed and accessible at go-live.

---

## Team

| Role | Name | Responsibilities |
|------|------|------------------|
| PM / PO / Designer | Vishnu | Scope, milestone gates, stakeholder comms, UX wireframes and screen design, E2E acceptance testing on production |
| Full-stack Developer | Anushman | Architecture, implementation, unit tests, deployment |
| QA / Validation | Anand | Integration testing, manual testing, API validation with Postman |

**Role coverage decisions:**
- Vishnu owns PM and design responsibilities.
- Anushman is full-stack and can build both Node.js backend and React frontend.
- Anand owns QA and validation.
- Developer capacity is 2-3 hrs/day, so scope was recalibrated on 2026-05-29.

---

## Constraints

| Constraint | Detail |
|------------|--------|
| Time | 20 calendar days; go-live target is 2026-06-16 |
| Team | 3 people: PM, full-stack developer, QA/validation |
| Capacity | 2-3 hrs/day developer availability; roadmap is scope-reduced accordingly |
| Budget | Cloud free-tier only unless manager approves otherwise |
| Tech stack | Node.js / Express + React (Vite) |
| Deployment | Azure App Service with Node runtime |

---

## Key Assumptions

- Cloud accounts can be provisioned early enough for M1 live verification.
- Free-tier limits are sufficient for development and demo-scale testing.
- No external approval gate blocks Azure App Service deployment.
- GCP setup remains the highest setup-risk provider.
- Deferred UI items stay deferred unless a formal scope change is logged.

---

## Sign-Off

| Role | Name | Date |
|------|------|------|
| PM / PO / Designer | Vishnu | 2026-05-28 |
| Full-stack Developer | Anushman | 2026-05-28 |
| QA / Validation | Anand | 2026-05-28 |
