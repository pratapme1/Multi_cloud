# Backlog — Multi-Cloud Storage Integration

> Single source of truth for all tasks.
> Update status here as work moves. PM reviews this at every check-in.
> For full task rationale, pass criteria, and dependency chain — see roadmap.md.
> Effort: **S** < 2h | **M** 2–4h | **L** 4–8h

---

## Status Key

| Status | Meaning |
|--------|---------|
| `Open` | Not started |
| `In Progress` | Actively being worked |
| `Blocked` | Waiting on a decision or dependency |
| `Done` | Complete and verified |

## Track Key

| Track | Meaning |
|-------|---------|
| `PM` | PM-only task; runs in parallel with dev work |
| `Dev` | Developer-only task |
| `Both` | Requires both PM and Dev involvement |

---

## Pre-Work (Gate: 2026-05-29)

| ID | Task | Track | Owner | Effort | Status | Notes |
|----|------|-------|-------|--------|--------|-------|
| P.1 | Manager kickoff — ask Part A questions (Q1–Q24 in discovery.md), document answers | PM | PM | S | Open | Do this first — answers unblock charter sign-off |
| P.2 | Team kickoff — ask Part A-2 questions (K01–K14 in discovery.md), document answers | PM | PM | S | Open | Reveals dev's background, preferences, and capacity |
| P.3 | D-001: Decide tech stack — language, cloud SDKs, web framework; log in decisions_log.md | Both | Dev + PM | S | Open | Deadline May 28 — unblocks all dev work |
| P.4 | D-002: Decide credential management (.env + library approach); log in decisions_log.md | Both | Dev | S | Open | Deadline May 28 — must be confirmed before any coding |
| P.5 | Repo init: folder structure, .gitignore (covers .env, *.json service accounts), .env.example with all required key names | Dev | Dev | S | Open | Day 1 task — must exist before any credentials are created |
| P.6 | Provision AWS account + S3 bucket; verify credentials work | Dev | Dev | S | Open | Start Day 1 — can run in parallel with P.7 and P.8 |
| P.7 | Provision Azure account + Blob container; verify connection string works | Dev | Dev | S | Open | Parallel with P.6 and P.8 |
| P.8 | Provision GCP account + service account + GCS bucket; verify service account JSON auth | Dev | Dev | M | Open | Hardest setup — start first; GCP auth is most involved (R04) |
| P.9 | Architecture decision: document storage layer pattern + app layer structure | Dev | Dev | S | Open | Can be done while waiting for cloud accounts |
| P.10 | DB schema design: users table — id, username, email, password_hash, role (admin\|readonly), created_at | Dev | Dev | S | Open | Needed before M3 auth work begins |
| P.11 | Charter sign-off: both team members review and sign charter.md | Both | PM | S | Open | Final step before sprint starts |

---

## Milestone 1 — API Integration (Gate: 2026-06-05)

| ID | Task | Track | Owner | Effort | Status | Notes |
|----|------|-------|-------|--------|--------|-------|
| 1.1 | AWS S3 module: upload, download, list (paginated), delete; auth via IAM key+secret from .env; error handling for auth failure + file not found + network error | Dev | Dev | L | Open | Errors must return clean messages — no raw SDK traces |
| 1.2 | AWS S3 unit tests: happy path for all 4 ops; auth failure case; file not found case; mock client — no real API calls | Dev | Dev | M | Open | Tests prove correct behavior without cloud dependency |
| 1.3 | Azure Blob module: upload, download, list (paginated), delete; auth via connection string from .env; same error handling as 1.1 | Dev | Dev | L | Open | Write tests (1.4) immediately after, not at the end |
| 1.4 | Azure Blob unit tests: same coverage standard as 1.2 | Dev | Dev | M | Open | |
| 1.5 | GCS module: upload, download, list (paginated), delete; auth via service account JSON path from .env; same error handling | Dev | Dev | L | Open | GCP is hardest — if behind by Day 3, invoke R04 contingency |
| 1.6 | GCS unit tests: same coverage standard as 1.2 | Dev | Dev | M | Open | |
| 1.7 | **[PM PARALLEL]** UI wireframe — begin designing 5 screens: login, file list, upload modal, delete confirmation, sync panel | PM | PM | M | Open | Runs entirely in parallel with 1.1–1.6; must be done by Jun 8 |
| 1.8 | M1 presentation prep: slide deck + live demo rehearsal (upload to all 3 providers sequentially) | PM | PM | S | Open | Start by Day 7 (Jun 4) — not the morning of the gate |
| 1.9 | M1 internal gate check: run M1 pass criteria with developer — live demo evidence only (Jun 4) | Both | PM | S | Open | Pass or fail — document the result in decisions_log.md |
| 1.10 | M1 presentation to manager (Jun 5) | Both | PM | S | Open | PM tells the story; Dev runs the demo |

---

## Milestone 2 — Unified Interface (Gate: 2026-06-10 / Presentation: 2026-06-11)

| ID | Task | Track | Owner | Effort | Status | Notes |
|----|------|-------|-------|--------|--------|-------|
| 2.1 | Define StorageProvider interface contract: upload(file, filename), download(filename), list(), delete(filename) — signatures agreed before coding starts | Dev | Dev | S | Open | PM reviews and approves the contract before 2.3 begins |
| 2.2 | D-003: Document chosen design pattern (Strategy / Adapter / Factory) in decisions_log.md with rationale | Dev | Dev | S | Open | Log this the day the decision is made, not after |
| 2.3 | Unified interface implementation: factory or strategy selects provider from ACTIVE_PROVIDER config; all 4 ops work through single interface | Dev | Dev | L | Open | Gate test (2.4) immediately follows |
| 2.4 | Config swap verification: change ACTIVE_PROVIDER in .env → same test runs on different provider, zero code change — PM verifies live | Both | Dev + PM | S | Open | This IS the M2 gate question — if this fails, M2 is not passed |
| 2.5 | File sync: compare source and target by filename + file size; copy files missing on target; return {copied, skipped, failed} report | Dev | Dev | L | Open | Sync must be idempotent — see 2.6 |
| 2.6 | Sync idempotency: running sync twice produces same result — no duplicates, skipped count matches | Dev | Dev | M | Open | |
| 2.7 | Redundant upload: single call writes to 2+ providers; partial failure explicitly reported — which succeeded, which failed | Dev | Dev | M | Open | No silent swallowing of failures — caller must know |
| 2.8 | Integration tests: all 4 unified ops against real APIs; provider swap test; sync test (missing file + unchanged file); redundant upload + partial failure test | Dev | Dev | M | Open | Real APIs only — no mocking for integration tests |
| 2.9 | D-005: Confirm and log deployment target before M2 ends — M3 planning depends on this | Both | Dev + PM | S | Open | Do not let this slip to M3 — it delays 3.2 |
| 2.10 | **[PM PARALLEL]** Complete UI wireframe: finalize all 5 screens with empty + error states; review with developer; hand over by Jun 8 | PM | PM | M | Open | Must be done before M2 starts so dev can reference it |
| 2.11 | M2 presentation prep: architecture diagram + provider-swap demo script + wireframe walkthrough | PM | PM | S | Open | |
| 2.12 | M2 internal gate check: run M2 pass criteria (Jun 10) | Both | PM | S | Open | Jun 11 is buffer day for presentation — use it |
| 2.13 | M2 presentation to manager (Jun 11) | Both | PM | S | Open | Show: swap demo live, wireframe, sync + redundancy |

---

## Milestone 3 — UI, Auth, Access Control & Go-Live (Gate: 2026-06-16)

> **Jun 15 rule:** No new features on Jun 15. Checklist and E2E test only.
> **Deferrable if timeline slips:** 3.13 (sync panel), 3.14 (admin panel) — minimum viable M3 is login + file list + upload + download + delete + deploy.

| ID | Task | Track | Owner | Effort | Status | Notes |
|----|------|-------|-------|--------|--------|-------|
| 3.1 | D-004: Decide auth approach (JWT vs session); log in decisions_log.md | Both | Dev + PM | S | Open | Must be decided before 3.3 starts |
| 3.2 | **[START DAY 1 OF M3]** Deployment infrastructure: provision server or PaaS; confirm production URL; set environment variables | Dev | Dev | M | Open | Start Jun 12 — runs in parallel with auth work; do not wait for UI |
| 3.3 | User model + DB setup: users table per schema in P.10; bcrypt password hashing | Dev | Dev | M | Open | |
| 3.4 | Auth endpoints: POST /auth/login → token + role; POST /auth/logout; GET /auth/me | Dev | Dev | M | Open | |
| 3.5 | Auth middleware: all /files and /sync endpoints require valid token; return 401 if missing or invalid | Dev | Dev | M | Open | Must exist before UI can be tested end-to-end |
| 3.6 | RBAC middleware: admin vs readonly enforced at API layer; admin-only ops return 403 for readonly users | Dev | Dev | M | Open | RBAC at API layer is mandatory — UI hiding alone is not enough |
| 3.7 | REST API — file endpoints: GET /files (?provider filter), POST /files/upload (multipart + provider param), GET /files/download, DELETE /files | Dev | Dev | L | Open | |
| 3.8 | REST API — sync + admin + health: POST /sync, GET /admin/users, POST /admin/users, PUT /admin/users/:id, GET /health | Dev | Dev | M | Open | /health endpoint confirms all 3 cloud connections |
| 3.9 | Web UI — Login screen: username + password fields, error state for invalid credentials, redirect on success | Dev | Dev | M | Open | No self-registration — admin creates accounts |
| 3.10 | Web UI — File list: table with filename, size, provider badge (AWS=orange, Azure=blue, GCP=green), date, download + delete actions; provider filter; empty state; loading state | Dev | Dev | L | Open | Matches wireframe from 2.10 |
| 3.11 | Web UI — Upload modal: file picker + drag-drop zone, provider selector (incl. All Providers for redundant), progress indicator, success/error states | Dev | Dev | L | Open | |
| 3.12 | Web UI — Delete confirmation dialog: filename + provider shown, confirm (red) + cancel, cannot-be-undone warning | Dev | Dev | S | Open | |
| 3.13 | Web UI — Sync panel: source + target provider selectors, Run Sync button, result card with counts | Dev | Dev | M | Open | Deferrable if M3 is behind |
| 3.14 | Web UI — Admin panel: user list + role badges, Add User form, role change; admin-only access | Dev | Dev | M | Open | Deferrable if M3 is behind — can use API directly for user management |
| 3.15 | RBAC in UI: hide upload button, delete icon, sync link, admin panel for readonly users | Dev | Dev | S | Open | Quick task — API still enforces even if UI hides |
| 3.16 | Confirm no cloud credentials in browser: PM opens network tab on live app and checks all responses | Both | PM + Dev | S | Open | P0 security item — must pass before go-live |
| 3.17 | Security review: .env only on server, HTTPS enforced or exception documented, error messages safe | Both | PM + Dev | M | Open | Walk through release_checklist.md P0 Security section |
| 3.18 | Deploy to production: app starts cleanly; accessible from outside dev machine at confirmed URL | Dev | Dev | M | Open | Must be done before Jun 15 (checklist day) |
| 3.19 | End-to-end test on production — PM runs this: login → upload → list → download → delete; verify readonly role cannot delete via API | Both | PM | M | Open | PM runs this personally — not just developer's verbal confirmation |
| 3.20 | README: setup from fresh clone, how to run locally, full .env variable list with descriptions | Dev | Dev | S | Open | |
| 3.21 | Release checklist walkthrough: all P0 items verified with evidence (Jun 15) | Both | PM | S | Open | Every P0 item needs evidence — not verbal confirmation |
| 3.22 | M3 presentation prep: project story arc, live demo script, D-001–D-005 summary, lessons learned | PM | PM | S | Open | |
| 3.23 | Go/No-Go decision: documented in decisions_log.md and release_checklist.md (Jun 16 morning) | PM | PM | S | Open | If NO-GO: document what failed, fix required, new date |
| 3.24 | M3 presentation to manager + Go-Live announcement (Jun 16) | Both | PM | S | Open | |

---

## Post Go-Live — Handoff

| ID | Task | Track | Owner | Effort | Status | Notes |
|----|------|-------|-------|--------|--------|-------|
| H.1 | Credentials and accounts handover: document who owns each cloud account, how to access, expiry dates | PM | PM | S | Open | |
| H.2 | Lessons learned in decisions_log.md: one technical lesson, one PM lesson | PM | PM | S | Open | |
| H.3 | Final backlog review: all tasks marked Done or deferred with reason; update health counts below | PM | PM | S | Open | |

---

## Backlog Health

> Update these counts at every milestone gate.

| Metric | Count |
|--------|-------|
| Total tasks | 60 |
| Open | 60 |
| In Progress | 0 |
| Blocked | 0 |
| Done | 0 |
| Pre-work tasks | 11 |
| M1 tasks | 10 |
| M2 tasks | 13 |
| M3 tasks | 23 |
| Handoff tasks | 3 |

---

## PM Checklist — What to Review Every Session

- [ ] Any tasks moved to Blocked since last check? If yes — unblock today.
- [ ] Any tasks that should be In Progress but are still Open? If yes — ask why.
- [ ] Are we on pace? Check which phase we're in against today's date.
- [ ] Any risks materialising? If yes — update risk_log.md.
- [ ] End of session: update this file before closing.
