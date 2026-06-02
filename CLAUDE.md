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
- GCP SDK: @google-cloud/storage (fully implemented — list, upload, download, delete, health, signed URLs)
- Local credentials: `.env` loaded with `dotenv` npm package
- Production secrets: Vercel Environment Variables
- Auth approach: Supabase JWT Bearer tokens (implemented). Full refresh-token handling deferred to M3.
- Deployment target: Vercel (Hobby plan, catch-all API function)

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

**All charter milestones: COMPLETE (2026-06-02)**  
**M1 — API Modules:** AWS, Azure, GCS providers all live — list, upload, download, delete, health, signed URLs.  
**M2 — Unified Interface:** Cross-cloud sync, redundant multi-provider upload, unified file management dashboard.  
**M3 — Web UI + Deploy:** React UI, Supabase JWT auth, RBAC (Super Admin/Admin/Viewer), deployed on Vercel.  
**What's running:** React frontend at `src/frontend/` (port 5173 local / Vercel). API at `api/index.js` (Vercel) / `src/backend-node/server.js` (port 3001 local).  
**Recent completions (2026-06-02 session 3):** Role-based UI enforcement in Drawer (C23). Backlog, CLAUDE.md, and presentation updated to reflect all charter milestones complete.  
**Operational watch items (not code):** AWS/Azure CORS config (B1, B2), credential rotation (B3) — cloud-admin tasks.  
**Optional hardening queue (post-charter, not blocking go-live):** CR1–CR8 code-review findings, unit tests (D3/D4), production E2E (D1). See `docs/backlog.md`.  
**Closed decisions:** D-001 through D-009 all resolved.

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
