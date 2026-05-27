# Decisions Log — Multi-Cloud Storage Integration

> Every significant decision lives here — tech choices, architecture patterns, scope calls.
> Add an entry when a decision is made, not after. Date it. State the alternatives.
> This is also the session log — add a weekly status entry every Friday.

---

## Open Decisions (need resolution)

| ID | Decision Needed | Deadline | Owner |
|----|----------------|----------|-------|
| D-001 | Tech stack (language + SDKs) | 2026-05-28 | Dev + PM |
| D-002 | Credential management strategy | 2026-05-28 | Dev |
| D-003 | Unified interface design pattern | 2026-06-06 (M2 start) | Dev |
| D-004 | Authentication approach for web UI | 2026-06-11 (M3 start) | Dev + PM |
| D-005 | Deployment target for go-live | 2026-06-07 (end of M2 week) | Dev + PM |

---

## Decided

---

### D-001 — Tech Stack
- **Date:** *(fill in)*
- **Decision:** *(fill in)*
- **Options considered:**
  - Python — boto3, azure-storage-blob, google-cloud-storage. Mature SDKs, strong cloud tooling ecosystem, easy to read.
  - Node.js / TypeScript — aws-sdk v3, @azure/storage-blob, @google-cloud/storage. Good async model, strong typing with TS.
  - Go — high performance, strong concurrency, but steeper ramp if team isn't familiar.
- **Chosen because:** *(fill in)*
- **Consequences:** *(fill in — what becomes easier, what becomes harder)*
- **Decided by:** Dev + PM

---

### D-002 — Credential Management
- **Date:** *(fill in)*
- **Decision:** *(fill in)*
- **Options considered:**
  - `.env` file + library (python-dotenv / dotenv) — simple, must be in `.gitignore`
  - Environment variables only — no file, injected per environment
  - Cloud secrets manager (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager) — most secure, adds complexity
- **Chosen because:** *(fill in)*
- **Decided by:** Dev

---

### D-003 — Unified Interface Design Pattern
- **Date:** *(fill in — at M2 start)*
- **Decision:** *(fill in)*
- **Options considered:**
  - Strategy / Adapter pattern — each provider implements a common interface; caller is provider-agnostic
  - Factory pattern — factory returns the right provider instance from config
  - Simple facade — thin wrapper, no abstraction, easiest to write but hardest to swap
- **Chosen because:** *(fill in)*
- **Decided by:** Dev

---

### D-004 — Authentication Approach
- **Date:** *(fill in — at M3 start)*
- **Decision:** *(fill in)*
- **Options considered:**
  - JWT token-based — stateless, good for API-first apps
  - Session-based — simpler, server holds state
  - OAuth / third-party (Google, GitHub) — no password management, adds external dependency
- **Chosen because:** *(fill in)*
- **Decided by:** Dev + PM

---

### D-005 — Deployment Target
- **Date:** *(fill in — by end of M2 week)*
- **Decision:** *(fill in)*
- **Options considered:**
  - Docker + VPS (DigitalOcean, Linode, EC2) — full control, low cost
  - PaaS (Railway, Render, Heroku) — fast deploy, no infra management
  - Cloud-native (Elastic Beanstalk / App Service / Cloud Run) — stays in existing cloud accounts
  - Local server — no public URL; only viable if internal use
- **Chosen because:** *(fill in)*
- **Decided by:** Dev + PM

---

## Weekly Status

> Add a short paragraph here every Friday. What moved, what's at risk, what's next week.

### 2026-05-30 (Week 1)
*(fill in)*

### 2026-06-06 (Week 2)
*(fill in)*

### 2026-06-13 (Week 3)
*(fill in)*

### 2026-06-16 (Go-Live)
*(fill in — final status)*
