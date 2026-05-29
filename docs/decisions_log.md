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
- **Date:** 2026-05-29
- **Decision:** C# (.NET 8) backend + React (Vite) frontend + SQLite database
- **Options considered:**
  - Python — boto3, azure-storage-blob, google-cloud-storage. Mature SDKs, strong cloud tooling ecosystem, easy to read. Developer unfamiliar.
  - Node.js / TypeScript — aws-sdk v3, @azure/storage-blob, @google-cloud/storage. Good async model. Developer unfamiliar.
  - Go — high performance, strong concurrency, but steep ramp. Developer unfamiliar.
  - **C# / .NET 8 + React** — Anushman's 5-year primary stack. ASP.NET Core Web API for REST endpoints. All 3 cloud providers have official first-class .NET SDKs. React for frontend (Anushman has built React features before).
- **Chosen because:** Developer's strongest stack — productivity over PM preference. All 3 cloud SDKs have official .NET support (AWSSDK.S3, Azure.Storage.Blobs, Google.Cloud.Storage.V1). ASP.NET Core is purpose-built for REST APIs. Switching to another stack wastes ramp-up days we do not have at 2–3 hrs/day capacity. Java is explicitly off the table — .NET only.
- **Consequences:** React app built and served from ASP.NET Core wwwroot (single deployment unit). Azure App Service free tier natively supports .NET — simplifies D-005. xUnit + Moq for unit tests. Entity Framework Core + SQLite for user data — no separate database server.
- **Decided by:** Dev + PM

---

### D-002 — Credential Management
- **Date:** 2026-05-29
- **Decision:** `.env` file (local dev) + Azure App Service Application Settings (production)
- **Options considered:**
  - `.env` file + library (dotenv.net) — simple, must be in `.gitignore`
  - Environment variables only — no file, injected per environment
  - Cloud secrets manager (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager) — most secure, significant added complexity
- **Chosen because:** .env is the simplest local approach and keeps all keys in one place for the developer. In production, Azure App Service Application Settings inject all env vars directly — no .env file on the server, no secrets in any file. Secrets manager is overkill for a 20-day project on free tier.
- **Consequences:** `.env` must be in `.gitignore` from Day 1. `.env.example` with all key names (no values) must be committed. On Azure App Service, each key in `.env.example` becomes an Application Setting.
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
- **Date:** 2026-05-29
- **Decision:** Azure App Service (free tier F1)
- **Options considered:**
  - Docker + VPS (DigitalOcean, Linode, EC2) — full control, low cost; requires infra management
  - PaaS (Railway, Render, Heroku) — fast deploy, no infra management; extra account setup
  - **Azure App Service (free tier F1)** — stays in the Azure account already needed for Azure Blob module; native .NET support; Application Settings replace .env in production
  - Local server — no public URL; does not satisfy charter criterion 7
- **Chosen because:** Azure account is already being provisioned for P.7 (Azure Blob Storage). Free tier F1 supports .NET 8 natively. No new account or billing setup. Application Settings eliminate the need for any secrets file on the server. Single deployment unit: React built into wwwroot, served by ASP.NET Core.
- **Consequences:** Azure account provisioning (P.7) and deployment (3.2) share the same account — delay in P.7 delays deployment setup. GitHub Actions or zip deploy — Anushman decides the CI/CD mechanism.
- **Decided by:** Dev + PM

---

## Planning Session 3 — 2026-05-29 (Capacity-Driven Scope Reduction)

**What happened:** Full capacity audit completed. Backlog and roadmap recalibrated from 8-hr/day assumptions to 2–3 hrs/day reality.

**Capacity math (before changes):**
- M1 available: ~12.5 hrs dev | was estimated ~27 hrs (2.2× over)
- M2 available: ~7.5 hrs dev | was estimated ~25 hrs (3.3× over)
- M3 available: ~7.5 hrs coding | was estimated ~55 hrs (7.3× over)

**Scope changes applied:**
- 1.1, 1.3, 1.5 (cloud modules): L → M — removed pagination; generic error return only
- 1.2, 1.4, 1.6 (unit tests): M → S — happy path only; error cases moved to Anand's Postman validation
- 2.3 (unified interface implementation): L → M — simpler once modules share consistent structure
- 2.5 (file sync): L → M — filename comparison only; no file-size check
- 2.6 (sync idempotency): M → S — natural property of filename match; not a separate test suite
- 2.8 (integration tests): M → S — replaced with Anand's Postman manual validation (real API calls)
- 3.7 (REST API file endpoints): L → M — simplified error handling; no provider filter param
- 3.8 (REST API sync/admin/health): M → S — removed admin user CRUD; POST /sync + GET /health only; seed 1 admin + 1 readonly user at deploy
- 3.10 (file list UI): L → M — removed date column, loading state, provider filter tabs
- 3.11 (upload modal): L → M — file picker only; no drag-drop
- 3.12 (delete confirmation): custom modal → browser native confirm()
- 3.13 (sync panel UI): **Formally deferred** — post go-live; sync available via API
- 3.14 (admin panel UI): **Formally deferred** — post go-live; users seeded at deploy
- 3.15 (RBAC UI hiding): **Formally deferred** — API enforcement (3.5, 3.6) satisfies charter criterion 5

**Sequencing adjustments:**
- 2.1 (interface contract) + 2.2 (D-003) + 2.9 (D-005): start at end of M1 week (Jun 4) — not M2 start
- 3.1 (D-004 auth decision) + 3.2 (deployment infra): start in M2 week — not M3 start

**New risks logged:** R11 (M2 coding window — score 9), R12 (M3 coding window — score 9)

**Residual risk:** Even after these reductions, M2 and M3 remain the tightest phases. All 7 charter success criteria are still fully targeted. If M2 slips, sync moves to M3 start. If M3 slips, minimum viable delivery is auth + login + file list + upload + download + delete + deploy.

**Artifacts updated:** backlog.md, roadmap.md, risk_log.md, decisions_log.md, meetings_prep.md

---

## Developer Kickoff — 2026-05-28

**What happened:** Team kickoff call completed with Anushman and Anand.

**Key findings:**
- Team is 3 people (PM + Anushman + Anand) — not 2. Charter and backlog updated.
- Anushman: full-stack (.NET C# backend + React frontend, 5 yrs, Signify/Philips Lighting). R09 closed.
- Anand: QA/validation specialist (11 yrs, Dell Technologies, hardware + software validation). Dedicated QA role confirmed.
- Availability: 2–3 hrs/day each — not full-time. Timeline built on 5–6 hrs/day assumption. R08 elevated to Critical (score 9).
- Cloud experience gap confirmed: Anushman has minimal AWS only, no Azure/GCP. R04 elevated (score 6).
- Stack lean: .NET + React. No Spring Boot. D-001 still open — close by 2026-05-29 morning.
- Check-in: daily standup + sprint review at each milestone end + demo to leaders on final day.

**Still open after kickoff:**
- D-001 (tech stack) — close tomorrow; PM makes unilateral call if not resolved
- K02, K10, K12–K14 — not captured; ask in next check-in
- "Core Java — what framework?" — must clarify before D-001 closes (see R10)
- PM evaluating additional help (design / tech stack)

**Artifacts updated:** charter.md, backlog.md, risk_log.md, discovery.md, meetings_prep.md

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
