# Roadmap — Multi-Cloud Storage Integration

**Start:** 2026-05-27 | **Go-Live:** 2026-06-16 | **Duration:** 21 calendar days / 15 working days

---

## Working Day Reality and Buffer Strategy

| Phase | Calendar dates | Working days | Buffer note |
|-------|---------------|-------------|-------------|
| Pre-work | May 27–29 | 3 | Zero slack — must be done by May 29 |
| M1 — API Integration | June 1–5 | 5 | Jun 4 = last coding day; Jun 5 = gate + presentation |
| M2 — Unified Interface | June 8–10 | 3 | Jun 9 = last coding day; Jun 10 = gate; Jun 11 = presentation (buffer day) |
| M3 — UI + Go-Live | June 11–16 | 4 | Jun 15 = checklist + E2E only; Jun 16 = go-live + presentation |
| **Total** | | **15 working days** | **~2 days buffer (13%) built into M2 and M3** |

**Where the plan is tightest:** M3 has 4 working days for auth, RBAC, full web UI, deployment, and testing. Deployment infrastructure (server provisioning) must be decided at end of M2 and started on Jun 12, not Jun 15.

**Slip contingency:** If M2 slips past Jun 11, the M3 scope must be cut — flag to manager immediately. The minimum viable M3 is: auth + file list + upload + deploy. Sync panel and admin panel are deferrable to post-go-live.

---

## Parallel Track Summary — The Whole Project

PM and Dev run concurrent tracks. This is not optional — it is how 15 working days can cover the full scope.

| Phase | Dev track | PM track |
|-------|-----------|----------|
| Pre-work | Cloud accounts, repo, architecture, DB schema | Manager kickoff, team kickoff, charter sign-off |
| M1 | AWS + Azure + GCS modules + unit tests | UI wireframe (begin 5 screens) |
| M2 | Unified interface, sync, redundancy, integration tests | Wireframe finalized and handed to dev; D-005 confirmed |
| M3 | Auth, RBAC, REST API, Web UI, deployment | Security review, E2E test, release checklist, presentation |

---

## Pre-Work (May 27–29) — 3 working days

**Goal:** Everything in place before any coding begins. No module work starts until P.6–P.8 (cloud accounts) are accessible.

| # | Task | Track | Owner | Effort | Status |
|---|------|-------|-------|--------|--------|
| P.1 | Manager kickoff — ask Part A questions (Q1–Q24 in discovery.md), document all answers | PM | PM | S | Open |
| P.2 | Team kickoff — ask Part A-2 questions (K01–K14 in discovery.md), document all answers | PM | PM | S | Open |
| P.3 | D-001: Decide tech stack — language, cloud SDKs, web framework; log decision in decisions_log.md | Both | Dev + PM | S | Open |
| P.4 | D-002: Decide credential management — confirm .env + library approach; log in decisions_log.md | Both | Dev | S | Open |
| P.5 | Repo init: folder structure, .gitignore (must include .env, *.json service accounts), .env.example listing all required keys | Dev | Dev | S | Open |
| P.6 | Provision AWS account + S3 bucket; verify credentials work with a test call | Dev | Dev | S | Open |
| P.7 | Provision Azure account + Blob container; verify connection string works | Dev | Dev | S | Open |
| P.8 | Provision GCP account + service account + GCS bucket; verify service account JSON auth | Dev | Dev | M | Open |
| P.9 | Architecture decision: document storage layer pattern (how 3 providers plug into unified layer) and app layer structure (how web app connects to backend) | Dev | Dev | S | Open |
| P.10 | DB schema design: users table — id, username, email, password_hash, role (admin\|readonly), created_at | Dev | Dev | S | Open |
| P.11 | Charter sign-off: both team members read and sign charter.md | Both | PM | S | Open |

**Parallel notes:**
- P.6, P.7, P.8 run in parallel — start all 3 on Day 1
- P.8 (GCP) is hardest — start first, not last
- P.3 and P.4 must be resolved before Dev starts any module coding
- P.9 and P.10 can be done while waiting for cloud accounts to be provisioned

**Pre-Work Pass Gate (May 29 EOD)**
- [ ] Manager and team kickoff conversations completed; answers in discovery.md
- [ ] D-001 and D-002 logged in decisions_log.md
- [ ] All 3 cloud accounts accessible; credentials verified
- [ ] Repo exists; .gitignore covers .env and service account files; .env.example exists
- [ ] Architecture documented; DB schema documented
- [ ] Charter signed off by both team members

---

## M1 — API Integration (June 1–5) — 5 working days

**Sprint goal:** Working upload, download, list, delete for all 3 cloud providers. Unit tests pass. No credentials in code. M1 presentation delivered.

**Gate:** Each module works against real API calls — not mocked. Developer demonstrates live.

| # | Task | Track | Owner | Effort | Status |
|---|------|-------|-------|--------|--------|
| 1.1 | AWS S3 module: upload, download, list (paginated with continuation tokens), delete; auth via IAM key+secret from .env; error handling for auth failure, file not found, network error | Dev | Dev | L | Open |
| 1.2 | AWS S3 unit tests: happy path for all 4 ops; auth failure case; file not found case; uses mock client — no real API calls | Dev | Dev | M | Open |
| 1.3 | Azure Blob module: upload, download, list (paginated with markers), delete; auth via connection string from .env; same error handling standard as 1.1 | Dev | Dev | L | Open |
| 1.4 | Azure Blob unit tests: same coverage standard as 1.2 | Dev | Dev | M | Open |
| 1.5 | GCS module: upload, download, list (paginated with page tokens), delete; auth via service account JSON path from .env; same error handling | Dev | Dev | L | Open |
| 1.6 | GCS unit tests: same coverage standard as 1.2 | Dev | Dev | M | Open |
| 1.7 | **[PM PARALLEL]** UI wireframe — begin designing 5 screens: login, file list, upload modal, delete confirmation, sync panel | PM | PM | M | Open |
| 1.8 | M1 presentation prep: slide deck + live demo rehearsal (upload same file to S3, then Azure Blob, then GCS sequentially) | PM | PM | S | Open |
| 1.9 | M1 internal gate check: run M1 pass criteria against live code with developer (Jun 4) | Both | PM | S | Open |
| 1.10 | M1 presentation to manager (Jun 5) | Both | PM | S | Open |

**Parallel notes:**
- 1.1+1.2 → 1.3+1.4 → 1.5+1.6 are sequential pairs: write module, immediately write its tests
- 1.7 and 1.8 run entirely in parallel on the PM track — dev does not wait for wireframe
- GCS (1.5) needs most time due to service account auth complexity — if behind by Day 3, invoke R04 contingency (allocate extra half-day)

**M1 Pass Criteria (Jun 5)**
- [ ] Real file upload, download, list, delete works on all 3 providers — live demo, not described
- [ ] Unit tests pass for all 3 modules: happy path + auth failure + file not found in each
- [ ] All errors return clean caller-friendly messages — no raw SDK stack traces exposed
- [ ] No credentials hardcoded in any file; .env in .gitignore; .env.example exists and is accurate
- [ ] M1 presentation delivered to manager

---

## M2 — Unified Storage Interface (June 8–11) — 4 working days incl. 1 buffer day

**Sprint goal:** One interface, three providers underneath. Config change swaps provider. Sync and redundancy working against real APIs. M2 presentation delivered.

**Gate:** Change ACTIVE_PROVIDER config value → same operation runs on different provider with zero code change.

| # | Task | Track | Owner | Effort | Status |
|---|------|-------|-------|--------|--------|
| 2.1 | Define StorageProvider interface contract: upload(file, filename), download(filename), list(), delete(filename) — exact signatures agreed before coding | Dev | Dev | S | Open |
| 2.2 | D-003: Document chosen design pattern (Strategy / Adapter / Factory) in decisions_log.md with rationale | Dev | Dev | S | Open |
| 2.3 | Unified interface implementation: factory or strategy selects provider from ACTIVE_PROVIDER config; all 4 ops work through single interface | Dev | Dev | L | Open |
| 2.4 | Config swap verification: change ACTIVE_PROVIDER in .env → rerun same test → confirms different provider used, zero code change | Both | Dev + PM | S | Open |
| 2.5 | File sync: compare source and target provider by filename + file size; copy files missing on target; return {copied: N, skipped: N, failed: N} report | Dev | Dev | L | Open |
| 2.6 | Sync idempotency: running sync twice produces same result — no duplicates, counts match | Dev | Dev | M | Open |
| 2.7 | Redundant upload: single call writes to 2+ providers; partial failure explicitly reported — which providers succeeded, which failed; no silent swallowing | Dev | Dev | M | Open |
| 2.8 | Integration tests: all 4 unified ops against real APIs; provider swap test; sync test (missing file appears, unchanged file skipped); redundant upload + partial failure test | Dev | Dev | M | Open |
| 2.9 | D-005: Confirm and log deployment target before M2 ends — M3 planning depends on this | Both | Dev + PM | S | Open |
| 2.10 | **[PM PARALLEL]** Complete UI wireframe: finalize all 5 screens with empty states and error states; review with developer; hand over by Jun 8 start | PM | PM | M | Open |
| 2.11 | M2 presentation prep: architecture diagram + provider-swap live demo script + wireframe walkthrough | PM | PM | S | Open |
| 2.12 | M2 internal gate check: run M2 pass criteria (Jun 10) | Both | PM | S | Open |
| 2.13 | M2 presentation to manager (Jun 11 — 1 buffer day from internal gate) | Both | PM | S | Open |

**Parallel notes:**
- 2.10 is PM-only — wireframe must be fully complete and in dev's hands by Jun 8 (M2 start)
- 2.9 (D-005) can happen on any day in M2 — don't let it slip to M3
- 2.4 is the critical gate test — PM should personally verify this, not just accept developer's word

**M2 Pass Criteria (Jun 10 gate / Jun 11 presentation)**
- [ ] ACTIVE_PROVIDER config change swaps provider — no code change required — PM has verified this live
- [ ] All 4 unified operations work regardless of active provider
- [ ] Integration tests pass against real cloud APIs — not mocked
- [ ] Sync copies missing files, skips unchanged files, returns a count report
- [ ] Redundant upload writes to 2+ providers and explicitly reports partial failures
- [ ] D-003 pattern decision documented in decisions_log.md
- [ ] D-005 deployment target confirmed and logged
- [ ] UI wireframe fully complete and with developer
- [ ] M2 presentation delivered to manager

---

## M3 — UI, Auth, Access Control & Go-Live (June 11–16) — 4 working days

**Sprint goal:** Web UI live on production server. Auth and RBAC enforced at API layer. Release checklist P0 signed off. Go/No-Go called. Presentation delivered.

**Gate:** Non-technical user can log in, upload, download, and delete from a browser without reading docs.

**Critical note:** Jun 15 is checklist and E2E day only — no new features on Jun 15. Jun 16 is go-live and presentation day. All code must be deployed by Jun 15 morning.

| # | Task | Track | Owner | Effort | Status |
|---|------|-------|-------|--------|--------|
| 3.1 | D-004: Decide auth approach (JWT vs session); log in decisions_log.md | Both | Dev + PM | S | Open |
| 3.2 | **[START IMMEDIATELY]** Deployment infrastructure: provision server or PaaS account; confirm production URL; set up environment variables on server | Dev | Dev | M | Open |
| 3.3 | User model + DB setup: users table per schema in P.10; password hashing with bcrypt | Dev | Dev | M | Open |
| 3.4 | Auth endpoints: POST /auth/login → token + role; POST /auth/logout; GET /auth/me | Dev | Dev | M | Open |
| 3.5 | Auth middleware: all /files and /sync endpoints require valid token; return 401 if missing or invalid | Dev | Dev | M | Open |
| 3.6 | RBAC middleware: admin vs readonly enforced at API layer; admin-only: upload, delete, sync, admin panel; return 403 for unauthorized operations | Dev | Dev | M | Open |
| 3.7 | REST API — file endpoints: GET /files (with ?provider filter), POST /files/upload (multipart, provider param), GET /files/download, DELETE /files | Dev | Dev | L | Open |
| 3.8 | REST API — remaining: POST /sync, GET /admin/users, POST /admin/users, PUT /admin/users/:id, GET /health | Dev | Dev | M | Open |
| 3.9 | Web UI — Login screen: username + password fields, error state for invalid credentials, redirect to file list on success | Dev | Dev | M | Open |
| 3.10 | Web UI — File list: table with filename, size, provider badge (AWS=orange, Azure=blue, GCP=green), upload date, download + delete actions; provider filter tabs; empty state; loading state | Dev | Dev | L | Open |
| 3.11 | Web UI — Upload modal: file picker + drag-drop zone, provider selector (AWS / Azure / GCP / All Providers), upload button, progress indicator, success/error states | Dev | Dev | L | Open |
| 3.12 | Web UI — Delete confirmation dialog: filename + provider shown, confirm (red) + cancel, "cannot be undone" warning | Dev | Dev | S | Open |
| 3.13 | Web UI — Sync panel: source + target provider selectors, Run Sync button, result card with counts (copied / skipped / failed) | Dev | Dev | M | Open |
| 3.14 | Web UI — Admin panel: user list with roles, Add User form (username, email, password, role), role change; admin-only access | Dev | Dev | M | Open |
| 3.15 | RBAC in UI: upload button and delete icon hidden for read-only users; sync and admin panel hidden; enforcement at API layer remains regardless | Dev | Dev | S | Open |
| 3.16 | Confirm cloud credentials not in browser: PM checks network tab on live app — no API keys, connection strings, or service account data in any response | Both | PM + Dev | S | Open |
| 3.17 | Security review: credentials only in .env on server, HTTPS enforced or documented exception, error messages do not expose stack traces or internal paths | Both | PM + Dev | M | Open |
| 3.18 | Deploy to production: app starts cleanly on server; accessible from outside dev machine at confirmed URL | Dev | Dev | M | Open |
| 3.19 | End-to-end test on production — PM runs this: login → upload → list → download → delete; test read-only role cannot delete | Both | PM | M | Open |
| 3.20 | README: setup from fresh clone, how to run locally, full .env variable list with descriptions | Dev | Dev | S | Open |
| 3.21 | Release checklist walkthrough: all P0 items verified with evidence (Jun 15) | Both | PM | S | Open |
| 3.22 | M3 presentation prep: project story arc, live demo script, D-001 to D-005 summary, lessons learned | PM | PM | S | Open |
| 3.23 | Go/No-Go decision: documented in decisions_log.md and release_checklist.md sign-off (Jun 16 morning) | PM | PM | S | Open |
| 3.24 | M3 presentation to manager + Go-Live announcement (Jun 16) | Both | PM | S | Open |

**Parallel notes:**
- 3.2 (deployment infra) starts Jun 12 in parallel with 3.3–3.6 (auth) — do not wait until code is done
- 3.9–3.15 (Web UI) can only start after 3.5 and 3.6 (auth + RBAC middleware) are working
- 3.22 (presentation prep) is PM-only; runs in parallel with dev's final testing and fixes
- **Deferrable if time runs short:** 3.13 (sync panel), 3.14 (admin panel) — minimum viable M3 is login + file list + upload + download + delete + deploy

**M3 Pass Criteria (Jun 16)**
- [ ] Login and logout work; invalid credentials return 401 in API and error message in UI
- [ ] Admin role has full access; read-only role gets 403 from API on upload, delete, sync
- [ ] All /files and /sync endpoints return 401 for unauthenticated requests
- [ ] No cloud credentials visible in any browser network tab response or frontend bundle
- [ ] File list, upload modal, delete confirmation functional in browser
- [ ] App deployed and accessible at production URL — not localhost
- [ ] End-to-end test on production completed by PM
- [ ] Security review complete
- [ ] All release checklist P0 items checked and signed off
- [ ] README complete
- [ ] Go/No-Go decision documented
- [ ] M3 presentation delivered to manager

---

## Post Go-Live — Handoff (June 16 onwards)

| # | Task | Track | Owner | Effort | Status |
|---|------|-------|-------|--------|--------|
| H.1 | Credentials and accounts handover: document who owns each cloud account, how to access, what to do when it expires | PM | PM | S | Open |
| H.2 | Lessons learned: one technical lesson, one PM lesson — documented in decisions_log.md weekly status | PM | PM | S | Open |
| H.3 | Final backlog review: all tasks marked Done or explicitly deferred with reason; update health counts | PM | PM | S | Open |

---

## Dependency Chain

```
PRE-WORK (May 27-29)
─────────────────────────────────────────────────────────────────
PM:   P.1 Manager kickoff ──→ P.2 Team kickoff ──→ P.11 Charter sign-off
Dev:  P.6 AWS account  ─┐
      P.7 Azure account ─┼──(parallel)──→ P.9 Architecture ──→ P.10 Schema
      P.8 GCP account  ─┘
Both: P.3 Tech stack + P.4 Credentials  ←─ must unblock all dev work on Day 1
      P.5 Repo init ──────────────────────────────────────────────────→
─────────────────────────────────────────────────────────────────
M1 (June 1-5)
─────────────────────────────────────────────────────────────────
Dev:  1.1+1.2 AWS ──→ 1.3+1.4 Azure ──→ 1.5+1.6 GCS
PM:   1.7 Wireframe (start) ─────────────────────────→ 1.8 Pres. prep
Gate: 1.9 Internal check (Jun 4) ──→ 1.10 Manager presentation (Jun 5)
─────────────────────────────────────────────────────────────────
M2 (June 8-11)
─────────────────────────────────────────────────────────────────
Dev:  2.1 Interface ──→ 2.2 D-003 ──→ 2.3 Implementation ──→ 2.4 Swap verify
      ──→ 2.5 Sync ──→ 2.6 Idempotency ──→ 2.7 Redundancy ──→ 2.8 Int. tests
PM:   2.10 Wireframe complete + hand over ──→ 2.11 Pres. prep
Both: 2.9 D-005 (any time in M2, must not slip to M3)
Gate: 2.12 Internal (Jun 10) ──→ 2.13 Manager presentation (Jun 11)
─────────────────────────────────────────────────────────────────
M3 (June 11-16)
─────────────────────────────────────────────────────────────────
Dev:  3.1 D-004 ──→ 3.3 DB ──→ 3.4 Auth endpoints ──→ 3.5 Auth middleware
      ──→ 3.6 RBAC ──→ 3.7+3.8 REST APIs ──→ 3.9–3.15 Web UI ──→ 3.18 Deploy
Dev:  3.2 Deployment infra ─────────────────────── (parallel, start Jun 12)
PM:   3.19 E2E test ──→ 3.21 Checklist (Jun 15) ──→ 3.22 Pres. prep ──→ 3.23 Go/No-Go
Gate: 3.24 Manager presentation + Go-Live (Jun 16)
─────────────────────────────────────────────────────────────────
POST: H.1 Handover ──→ H.2 Lessons learned ──→ H.3 Backlog close
```

---

## Key Dates

| Date | Day | Event |
|------|-----|-------|
| 2026-05-27 | Wed | Project start — manager kickoff conversation (P.1) |
| **2026-05-28** | **Thu** | **D-001 and D-002 decision deadline; team kickoff (P.2)** |
| 2026-05-29 | Fri | All 3 cloud accounts provisioned; repo initialized; charter signed (Pre-work gate) |
| 2026-06-01 | Mon | M1 sprint begins — coding starts |
| 2026-06-04 | Thu | M1 last coding day |
| **2026-06-05** | **Fri** | **M1 Gate — internal check (morning) + manager presentation** |
| 2026-06-08 | Mon | M2 sprint begins; UI wireframe handed to developer |
| 2026-06-09 | Tue | M2 last coding day |
| 2026-06-10 | Wed | M2 internal gate check |
| **2026-06-11** | **Thu** | **M2 Presentation to manager** (buffer day — absorbs M2 complexity) |
| 2026-06-12 | Fri | M3 sprint begins; deployment infra provisioning starts |
| 2026-06-15 | Mon | Release checklist walkthrough + E2E on production — no new dev features |
| **2026-06-16** | **Tue** | **M3 Gate — Go/No-Go decision — Manager presentation — Go-Live** |
