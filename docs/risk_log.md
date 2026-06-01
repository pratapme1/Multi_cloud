# Risk Log — Multi-Cloud Storage Integration

> **Review cadence:** At every milestone gate.
> **Owner:** PM tracks; Dev mitigates technical risks.
> **Score = Likelihood × Impact** (each 1–3). Score ≥ 4 = actively watch.

---

## Active Risks

| ID | Risk | L | I | Score | Mitigation | Contingency | Owner | Status |
|----|------|---|---|-------|-----------|-------------|-------|--------|
| R01 | Cloud account provisioning delayed (identity verification, billing) | 2 | 3 | **6** | Start all 3 accounts immediately; have backup personal accounts ready | Use existing personal/educational accounts | Dev | Open - still pending as of 2026-06-01 |
| R02 | Credentials accidentally committed to version control | 2 | 3 | **6** | `.env` + `.gitignore` from Day 1; add pre-commit hook to scan for secrets; use committed `.env.example` as the template | Rotate all exposed keys immediately; audit git history | Dev | Open - `.gitignore` and `.env.example` now exist |
| R03 | UI scope expands beyond what M3 time allows | 2 | 2 | **4** | 3.13/3.14/3.15 formally deferred 2026-05-29; UI capped to login + file list + upload + download + delete (browser confirm) | Go-live with API-only access; ship UI as follow-up | PM | **Partially mitigated — 2026-05-29** |
| R04 | No Azure or GCP experience on team — **confirmed at kickoff**: Anushman has minimal AWS only; Anand has no cloud SDK experience | 3 | 2 | **6** | Start P.8 (GCP) before P.6/P.7; budget first 2 days of M1 for cloud account setup; Anand validates via Postman | Allocate extra half-day per cloud provider; PM assists with documentation lookup | Dev | **Elevated 2026-05-28** |
| R05 | Tech stack (D-001) not decided — was due 2026-05-28, now overdue | 2 | 3 | **6** | Close D-001 by 2026-05-29 morning; leans .NET + React but not confirmed | PM makes unilateral call if not closed by 2026-05-29 | PM | **Closed 2026-05-29** |
| R06 | Cloud API rate limits hit during development | 2 | 2 | **4** | Use small test files; stay within free-tier; mock in unit tests | Throttle test runs; batch calls | Dev | Open |
| R07 | Auth implementation more complex than estimated | 2 | 2 | **4** | Use established library (not home-grown); simple JWT or session | Seed 1 hardcoded admin user at deploy as fallback; full auth library in M3 | Dev | Open |
| R08 | **Developer capacity is 2–3 hrs/day, not 5–6** — entire timeline built on wrong assumption | 3 | 3 | **9** | Scope recalibrated 2026-05-29: all L tasks resized to M/S, 3.13/3.14/3.15 formally deferred, unit tests simplified to happy-path only, manual QA replaces automated integration tests — see decisions_log.md Planning Session 3 | Raise with manager if M2 or M3 gate cannot be met; minimum viable delivery is auth + file ops + deploy | PM | **Scope reduction applied 2026-05-29 — residual risk remains in M2 and M3** |
| R09 | Developer is backend-only — cannot build web UI for M3 | — | — | — | — | — | PM | **Closed 2026-05-28 — Anushman confirmed full-stack (React + .NET)** |
| R10 | Core Java without a framework chosen for backend — hand-building HTTP routing adds 2–3 days of boilerplate | 2 | 3 | **6** | Clarify with Anushman exactly what he means — Javalin/Spark are acceptable; truly no-framework is not viable | Switch to .NET ASP.NET Core minimal API or Python FastAPI if no lightweight Java framework agreed | Dev + PM | **Closed 2026-05-29** |
| R11 | M2 coding window is ~7.5 hrs; unified interface + sync + redundancy chain estimates ~11 hrs after scope reduction | 3 | 3 | **9** | Start 2.1/2.2 (interface contract + D-003 decision) at end of M1 week (Jun 4); decide D-005 in M1 week to unblock M3 infra | Slip sync (2.5/2.6) to M3 start; deliver unified interface + redundancy as M2 pass criteria | Dev + PM | Open |
| R12 | M3 has ~7.5 hrs of dev coding (3 days); auth + REST API + Web UI estimates ~28 hrs after scope reduction | 3 | 3 | **9** | Start D-004 (auth decision) + 3.2 (deployment infra) in M2 week; Anand owns validation tasks (3.16, 3.19); PM drafts README scaffold | Reduce Web UI to login + file list only; deliver upload/delete via API with Anand's Postman test as go-live evidence | Dev + PM | Open |

---

## Risk Score Reference

| Score | Level | Action |
|-------|-------|--------|
| 6–9 | High | Active monitoring; mitigation in place before work starts |
| 4–5 | Medium | Review at each milestone gate |
| 1–3 | Low | Log and monitor; no immediate action |

---

## Risk History

| ID | Date Closed | Outcome |
|----|-------------|---------|
| R09 | 2026-05-28 | Resolved — Anushman confirmed full-stack at developer kickoff. React frontend + .NET backend. No additional developer needed. |
| R05 | 2026-05-29 | Resolved — D-001 closed. Stack decided: C# .NET 8 + React (Vite) + Bootstrap 5. See decisions_log.md D-001. |
| R10 | 2026-05-29 | Resolved — Java is off the table. D-001 confirmed .NET only. ASP.NET Core Web API is the backend framework. |

> Move risks here when they close (resolved, contingency activated, or no longer relevant).
