# Roadmap — Multi-Cloud Storage Integration

**Start:** 2026-05-27 | **Go-Live:** 2026-06-16 | **Duration:** 20 days

---

## Milestone Overview

```
May 27          Jun 05          Jun 10          Jun 16
    |               |               |               |
[===== M1 =========|===== M2 =======|===== M3 =======]
  API Integration   Unified         UI + Access
                    Interface       Control + Go-Live
```

---

## M1 — API Integration (by 2026-06-05)

**Gate:** Each cloud module works independently in real API calls — not mocked.

| # | Task | Owner | Effort | Status |
|---|------|-------|--------|--------|
| 1.1 | Provision AWS account + S3 bucket | Dev | S | Open |
| 1.2 | Provision Azure account + Blob container | Dev | S | Open |
| 1.3 | Provision GCP account + GCS bucket | Dev | S | Open |
| 1.4 | Decide tech stack + initialize repo (D-001) | Dev + PM | S | Open |
| 1.5 | AWS S3 module — upload, download, list, delete | Dev | L | Open |
| 1.6 | Azure Blob module — upload, download, list, delete | Dev | L | Open |
| 1.7 | GCS module — upload, download, list, delete | Dev | L | Open |
| 1.8 | Unit tests for all 3 modules | Dev | M | Open |
| 1.9 | M1 milestone review | PM | S | Open |

**M1 Pass Criteria**
- [ ] Real file upload/download works on all 3 providers (no mocks)
- [ ] List and delete work on all 3
- [ ] Unit tests pass
- [ ] No credentials hardcoded in any file

---

## M2 — Unified Storage Interface (by 2026-06-10)

**Gate:** Swap provider via config change only — no code change required.

| # | Task | Owner | Effort | Status |
|---|------|-------|--------|--------|
| 2.1 | Design unified interface contract (D-003) | Dev + PM | S | Open |
| 2.2 | Unified upload, download, list, delete | Dev | L | Open |
| 2.3 | Provider-swappable via config (no code change) | Dev | M | Open |
| 2.4 | File sync — copy missing/changed files across providers | Dev | L | Open |
| 2.5 | Sync skips unchanged files | Dev | M | Open |
| 2.6 | Redundant upload — write to 2+ providers in one call | Dev | M | Open |
| 2.7 | Graceful failure on partial redundant upload | Dev | M | Open |
| 2.8 | Integration tests | Dev | M | Open |
| 2.9 | M2 milestone review + demo | PM | S | Open |

**M2 Pass Criteria**
- [ ] Single config change swaps provider — no code change
- [ ] Sync works between at least 2 providers and skips unchanged files
- [ ] Redundant upload writes to 2+ providers
- [ ] Integration tests pass against real APIs

---

## M3 — UI, Access Control & Go-Live (by 2026-06-16)

**Gate:** A non-technical person can use the app without reading docs. Release checklist signed off.

| # | Task | Owner | Effort | Status |
|---|------|-------|--------|--------|
| 3.1 | Decide auth approach (D-004) | Dev + PM | S | Open |
| 3.2 | Decide deployment target (D-005) | Dev + PM | S | Open |
| 3.3 | Web UI — file list with provider badge | Dev | L | Open |
| 3.4 | Web UI — upload from browser | Dev | L | Open |
| 3.5 | Web UI — download and delete | Dev | M | Open |
| 3.6 | User login (username/password) | Dev | M | Open |
| 3.7 | Role-based access control (admin / read-only) | Dev | L | Open |
| 3.8 | API endpoints require auth token | Dev | M | Open |
| 3.9 | Cloud credentials server-side only — never in browser | Dev | M | Open |
| 3.10 | Security review — credentials, HTTPS, error messages | PM + Dev | M | Open |
| 3.11 | End-to-end test on production | Dev + PM | M | Open |
| 3.12 | Deploy to production | Dev | M | Open |
| 3.13 | Release checklist sign-off + Go/No-Go | PM | S | Open |

**M3 Pass Criteria**
- [ ] Non-technical person can log in, upload, download, delete without docs
- [ ] No credentials visible in browser dev tools at any point
- [ ] App running on production server (not localhost)
- [ ] Release checklist fully signed off

---

## Dependency Chain

```
Cloud Accounts (1.1–1.3)
        ↓
Tech Stack Decision (1.4)
        ↓
Individual API Modules (1.5–1.7) + Tests (1.8)
        ↓              [M1 Gate]
Unified Interface (2.2–2.3)
        ↓
Sync + Redundancy (2.4–2.7) + Integration Tests (2.8)
        ↓              [M2 Gate]
Auth Decision (3.1) + Deployment Decision (3.2)
        ↓
Web UI (3.3–3.5) + Auth + RBAC (3.6–3.9)
        ↓
Security Review (3.10) → Deploy (3.12) → E2E Test (3.11)
        ↓              [M3 Gate = Go-Live]
```

---

## Key Dates

| Date | Event |
|------|-------|
| 2026-05-27 | Project kickoff |
| **2026-05-28** | **Tech stack decision deadline (D-001)** |
| 2026-06-05 | **M1 Gate — API Integration review** |
| 2026-06-10 | **M2 Gate — Unified Interface review + demo** |
| 2026-06-15 | Release checklist walkthrough |
| 2026-06-16 | **M3 Gate — Go/No-Go — Go-Live** |
