# Decisions Log - Multi-Cloud Storage Integration

> Every significant decision lives here. Date it, state the alternatives, and keep the current implementation direction clear.

---

## Open Decisions

| ID | Decision Needed | Deadline | Owner |
|----|-----------------|----------|-------|
| D-003 | Unified interface design pattern | 2026-06-06 | Dev |
| D-004 | Authentication approach for web UI | 2026-06-11 | Dev + PM |

---

## Decided

### D-001 - Tech Stack

- **Date:** 2026-06-01
- **Decision:** Node.js / Express backend + React / Vite frontend.
- **Options considered:**
  - Node.js / Express: already installed, fast to run locally, official SDKs for AWS and Azure, same ecosystem as frontend.
  - Python: mature cloud SDKs, but would add a separate runtime/toolchain.
- **Chosen because:** It removes local toolchain friction and lets the team test real AWS/Azure APIs quickly.
- **Consequences:** Backend lives in `src/backend-node/`. Frontend lives in `src/frontend/`. GCS remains a placeholder until credentials and provider implementation are ready.
- **Decided by:** PM + Dev

---

### D-002 - Credential Management

- **Date:** 2026-05-29
- **Decision:** Local `.env` file loaded by `dotenv`; production values supplied through app settings.
- **Options considered:**
  - `.env` + `dotenv`: simplest for local development.
  - Environment variables only: clean but less convenient locally.
  - Cloud secrets manager: more secure, but too much setup for the current scope.
- **Chosen because:** It supports quick local testing while keeping secrets out of git.
- **Consequences:** `.env` must stay ignored. `.env.example` is committed with blank values only.
- **Decided by:** Dev

---

### D-003 - Unified Interface Design Pattern

- **Date:** Pending
- **Decision:** Pending formal closure.
- **Current implementation direction:** Provider classes under `src/backend-node/providers/` expose common methods: `listFiles`, `uploadFile`, `getFileContent`, `deleteFile`, and `health`.
- **Options considered:**
  - Strategy / Adapter: each provider implements the same contract.
  - Factory: a resolver chooses a provider by key.
  - Simple facade: easy initially, weaker for provider swapping.

---

### D-004 - Authentication Approach

- **Date:** Pending
- **Decision:** Pending M3 closure.
- **Current implementation direction:** Mock bearer tokens for local M1/M2 testing. JWT planned for M3.
- **Options considered:**
  - JWT bearer tokens
  - Server sessions
  - OAuth / third-party login

---

### D-005 - Deployment Target

- **Date:** 2026-05-29 | **Updated:** 2026-06-01
- **Decision:** Azure App Service with Node runtime.
- **Options considered:**
  - Azure App Service: already aligned with Azure Blob account and supports app settings.
  - VPS/Docker: more control, more infrastructure work.
  - Localhost-only: not acceptable for go-live.
- **Chosen because:** It gives a public URL, supports Node apps, and keeps production secrets out of files.
- **Consequences:** Deploy the Node backend and built React frontend as the production unit, or configure a frontend build served by the Node app during deployment.
- **Decided by:** Dev + PM

---

## Weekly Status

### 2026-05-30 (Week 1)

Planning, team kickoff, capacity recalibration, and core delivery decisions completed. Scope was reduced for 2-3 hrs/day developer capacity. Deferred UI polish remains post-go-live.

### 2026-06-06 (Week 2)

React/Vite frontend and Node/Express backend are now the active implementation path. AWS and Azure provider modules are wired for real local testing. GCS is kept as a visible placeholder until provider implementation and credentials are added. The stale backend scaffold was removed from the repo records.

### 2026-06-13 (Week 3)

*(fill in)*

### 2026-06-16 (Go-Live)

*(fill in)*
