# Multi-Cloud Storage Integration

Unified storage layer across AWS S3, Azure Blob Storage, and Google Cloud Storage: one interface for upload, download, sync, redundancy, and access control.

---

## Current Status

| Milestone | Target | Status |
|-----------|--------|--------|
| M1 - API Integration | 2026-06-05 | In Progress |
| M2 - Unified Interface | 2026-06-10 | Not Started |
| M3 - UI & Access Control | 2026-06-16 | Not Started |

**Active Phase:** M1 / API Integration  
**Backend going forward:** Node.js / Express in `src/backend-node`  
**Frontend:** React / Vite in `src/frontend`

AWS and Azure are the active local-test providers. GCS remains visible as a placeholder until its provider implementation and credentials are added.

---

## Team

| Role | Name |
|------|------|
| Project Manager / PO / Designer | Vishnu |
| Full-stack Developer | Anushman |
| QA / Validation | Anand |

---

## Implementation Target

- Backend: Node.js / Express
- Frontend: React (Vite)
- Cloud SDKs: `@aws-sdk/client-s3`, `@azure/storage-blob`, `@google-cloud/storage` later
- Auth: mock bearer tokens for local M1/M2 testing; JWT planned for M3
- Secrets: local `.env`; production app settings
- Deployment target: Azure App Service with Node runtime

---

## Run Locally

Backend:

```powershell
cd src/backend-node
npm.cmd start
```

Frontend:

```powershell
cd src/frontend
npm.cmd run dev
```

Open `http://localhost:5173`.

Demo credentials:

- `admin` / `Admin@123`
- `viewer` / `View@123`

---

## Project Docs

| Document | Purpose |
|----------|---------|
| [Charter](docs/charter.md) | Scope, objectives, success criteria |
| [PRD](docs/prd.md) | Build specification and target architecture |
| [Roadmap](docs/roadmap.md) | Timeline and milestone plan |
| [Backlog](docs/backlog.md) | Tasks, owners, status |
| [Risk Log](docs/risk_log.md) | Risks and mitigations |
| [Decisions Log](docs/decisions_log.md) | Key decisions and rationale |
| [Release Checklist](docs/release_checklist.md) | Go-live gate criteria |
