# CLAUDE.md - Project Briefing

> This file is auto-loaded at the start of every Claude Code session.
> Update Section 5 at each milestone. Update Section 3 when technical decisions change.

---

## 1. Project Snapshot

**Project:** Multi-Cloud Storage Integration  
**Goal:** Build a unified interface over AWS S3, Azure Blob Storage, and GCS: upload, download, sync, redundancy, web UI, and access control.  
**Duration:** 20 days | Start: 2026-05-27 | Go-Live: 2026-06-16  
**Current Phase:** M1 / API Integration

---

## 2. Team

| Role | Name | Responsibilities |
|------|------|------------------|
| PM / PO / Designer | Vishnu | Scope, priorities, milestone gates, Claude sessions, UX wireframes, E2E acceptance testing |
| Full-stack Developer | Anushman | Architecture, implementation, unit tests alongside each module, deployment |
| QA / Validation | Anand | Integration testing, manual testing, API validation with Postman |

**Role decisions confirmed 2026-05-28:**
- Vishnu owns PM, scope, and screen design.
- Anushman is full-stack and owns implementation.
- Anand owns validation and manual/integration testing.
- No additional frontend developer is needed.

---

## 3. Tech Stack

> **Status:** Decided 2026-05-29; D-001 revised 2026-06-01. See D-001, D-002, and D-005 in `docs/decisions_log.md`.

- Backend: Node.js / Express (D-001 revised 2026-06-01; .NET SDK not installed on dev machine)
- Frontend: React (Vite) + Bootstrap 5
- Database: SQLite via better-sqlite3 (deferred to M3 — not yet wired up)
- AWS SDK: @aws-sdk/client-s3 (v3)
- Azure SDK: @azure/storage-blob
- GCP SDK: @google-cloud/storage (placeholder — not yet implemented)
- Local credentials: `.env` loaded with `dotenv` npm package
- Production secrets: Azure App Service Application Settings
- Auth approach: Mock Bearer tokens (admin / viewer) for M1–M2; JWT Bearer tokens in M3 after D-004 closure
- Deployment target: Azure App Service free tier F1

---

## 4. Conventions

- Effort sizing uses S / M / L only; no story points.
- Credentials go in `.env` locally, never hardcoded, and `.env` stays in `.gitignore`.
- Decisions go in `docs/decisions_log.md`.
- Task status in `docs/backlog.md` is the single source of truth for progress.
- Risks are reviewed at every milestone gate.
- Milestone gates need evidence: running code, test output, live demo, or checklist proof.

---

## 5. Current Focus

**Active Milestone:** M1 - API Integration (Gate: 2026-06-05)  
**Current Goal:** Manual testing of the running Node.js + React stack. Next gaps: write unit tests (1.2, 1.4), wire up GCS (1.5/1.6), close D-003 (unified interface decision), and prepare M1 gate demo.  
**What's running:** Backend at `src/backend-node/` (port 3001) + React frontend at `src/frontend/` (port 5173). AWS S3 and Azure Blob live; GCS is a placeholder.  
**Blockers / watch items:** P.1 Manager kickoff still open; P.8 GCS provisioning still open; K02/K10/K12-K14 still need follow-up from developer kickoff. Unit tests (1.2, 1.4, 1.6) not yet written.  
**Closed decisions:** D-001 (tech stack — Node.js, revised 2026-06-01), D-002 (credential management), D-005 (deployment target).  
**Open decisions:** D-003 (unified interface pattern — provider strategy is implicit in current code; needs formal decision entry), D-004 (auth approach — JWT deferred to M3).

---

## 6. What NOT To Do

- Do not add out-of-scope features. Scope is locked in `docs/charter.md` and `docs/prd.md`.
- Do not add documents outside the agreed doc set unless PM explicitly asks.
- Do not commit credentials, service account JSON, `.env`, or generated build artifacts.
- Do not treat deferred items as M3 requirements: sync panel UI, admin panel UI, and RBAC UI hiding are post-go-live.
- Do not call a milestone complete without evidence.

---

## 7. Session Logging

- Significant decision: add an entry to `docs/decisions_log.md`.
- Task status change: update `docs/backlog.md`.
- New or changed risk: update `docs/risk_log.md`.
- Friday status: add a paragraph under `## Weekly Status` in `docs/decisions_log.md`.

---

## 8. PM Reference

The PM operating guide is at `docs/pm_playbook.md`. The approved build specification is at `docs/prd.md`.
