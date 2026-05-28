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

## Planning Session 2 — 2026-05-28 (Pre-Kickoff Requirements and Backlog)

**What happened:** Second planning session focused on detailed requirements, backlog revision, and roadmap rebuild from scratch.

**Artifacts updated:**
- `docs/roadmap.md` — full rewrite: added Pre-work phase (P.1–P.11), parallel track structure, buffer strategy (2 days, 13%), presentations as explicit tasks (1.10, 2.13, 3.24), handoff tasks (H.1–H.3), updated key dates (M2 presentation moved to Jun 11 for 1 buffer day)
- `docs/backlog.md` — full rewrite: 60 tasks across Pre-work/M1/M2/M3/Handoff; Track column added (PM/Dev/Both) to make parallel work visible; PM checklist added at bottom
- Detailed requirements captured in conversation (now source of truth for what to build): backend modules, unified interface contract, REST API endpoints, unit/integration/E2E testing standards, 6 UIX screen specifications

**Key planning decisions made:**
- Working days reality: 15 working days across 21 calendar days
- Buffer: 2 days (13%) — 1 to M2 (presentation Jun 11 not Jun 10), 1 to M3 (Jun 15 = checklist only)
- M3 is the tightest phase (4 working days) — deployment infra must start Jun 12 in parallel
- Deferrable if M3 slips: sync panel (3.13) and admin panel (3.14) — minimum viable is login + file operations + deploy
- Milestone presentations are distinct tasks from internal gate checks

**Still open before kickoff:**
- Manager Part A conversation (Q1–Q24) — not yet done
- Team Part A-2 conversation (K01–K14) — not yet done
- D-001 tech stack — not yet decided

---

## Planning Session 1 — 2026-05-28

**What happened:** Pre-sprint planning session completed. No code decisions made yet; this session focused on PM setup and discovery.

**Artifacts produced:**
- `docs/discovery.md` updated — rclone open-source-vs-embeddable distinction clarified; 6 deployment questions added (Q19–Q24); Part A-2 (team kickoff questions K01–K14) added
- `docs/pm_playbook.md` created — complete PM operating guide for the full 20-day lifecycle
- `CLAUDE.md` updated — 9-file structure documented; PM reference section added

**Open decisions as of today:** D-001 (tech stack) and D-002 (credential management) are due today, 2026-05-28. If not resolved by end of day, PM invokes R05 contingency (default to Python).

**Next action:** Complete manager conversation (Part A questions in discovery.md). Run developer kickoff (Part A-2 questions). Close D-001 and D-002.

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
