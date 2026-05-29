# CLAUDE.md — Project Briefing

> This file is auto-loaded at the start of every Claude Code session.
> Update Section 5 at each milestone. Update Section 3 once tech stack is decided.

---

## 1. Project Snapshot

**Project:** Multi-Cloud Storage Integration
**Goal:** Build a unified interface over AWS S3, Azure Blob, and GCS — upload, download, sync, redundancy, web UI, access control.
**Duration:** 20 days | Start: 2026-05-27 | Go-Live: 2026-06-16
**Current Phase:** Initiation / Planning ← update this as the project moves

---

## 2. Team

| Role | Name | Responsibilities |
|------|------|-----------------|
| PM / PO | **Vishnu** | Scope, priorities, milestone gates, sessions with Claude, **UX wireframes + screen design (Designer)**, E2E acceptance testing |
| Developer (Full-stack) | Anushman | Architecture, implementation, unit tests alongside each module, deployment. Stack: .NET (C#) / Core Java + React. |
| QA / Validation | Anand | Integration testing, manual testing, API validation (Postman). 11 yrs hardware + software validation. |

**Role decisions (confirmed 2026-05-28):**
- Vishnu = PM + Designer. Owns all wireframes and screen definitions.
- Anushman = Developer + unit test author. Full-stack confirmed (React frontend + .NET backend).
- Anand = dedicated QA. Runs integration and manual tests. Not a coder — validation specialist.
- Vishnu acts as independent E2E tester on production (task 3.19) and co-leads security review (task 3.17).
- R09 closed — no additional frontend developer needed.

Vishnu drives Claude sessions. Anushman owns all implementation decisions unless explicitly asking for suggestions.

---

## 3. Tech Stack

> **Status: TBD — fill in once D-001 is decided (deadline: 2026-05-28)**

- Language: TBD
- AWS SDK: TBD
- Azure SDK: TBD
- GCP SDK: TBD
- Web framework: TBD
- Auth approach: TBD
- Deployment target: TBD

---

## 4. Conventions

- Effort sizing uses S / M / L only — no story points
- Credentials go in `.env` file, never hardcoded, `.env` always in `.gitignore`
- Decisions go in `docs/decisions_log.md` — not in inline comments, not in chat
- Task status in `docs/backlog.md` is the single source of truth for progress
- Risks reviewed at every milestone gate, not just when something goes wrong
- Milestone gates have explicit pass/fail criteria — see `docs/release_checklist.md` for M3; milestone criteria in `docs/roadmap.md`

---

## 5. Current Focus

**Active Milestone:** Pre-work — Initiation & Planning
**Current Goal:** Complete manager kickoff (P.1); provision cloud accounts (P.6–P.8); repo init (P.5)
**Blockers:** Manager kickoff (P.1) not yet done; K02/K10/K12–K14 not captured from developer kickoff
**Decisions closed today (2026-05-29):** D-001 (tech stack), D-002 (credentials), D-005 (deployment)

> Update this section format at each milestone:
> Active Milestone: M1 / M2 / M3
> Sprint Goal: [one line]
> Blockers: [any open blockers]

---

## 6. What NOT To Do

- **Do not create files without explicit approval.** Brainstorm and propose first.
- **Do not add documents not in the agreed 9-file structure** unless PM explicitly asks. The 9 files are: `CLAUDE.md`, `charter.md`, `roadmap.md`, `backlog.md`, `decisions_log.md`, `risk_log.md`, `release_checklist.md`, `discovery.md`, `pm_playbook.md`.
- **Do not suggest out-of-scope features** — scope is locked in `docs/charter.md`.
- **Do not use story points, velocity tracking, or sprint burndown** — this project uses S/M/L sizing only.
- **Do not assume a tech stack** until D-001 is decided and Section 3 above is filled in.
- **Do not write multi-paragraph docstrings or comment blocks** in code.
- **Do not run destructive commands** (rm -rf, git reset --hard, etc.) without confirming.

---

## 7. Session Logging

Every session that produces a significant decision → add an entry to `docs/decisions_log.md`.
Every session that moves tasks to done → update status in `docs/backlog.md`.
Weekly on Fridays → add a status paragraph to the bottom of `docs/decisions_log.md` under `## Weekly Status`.

---

## 8. PM Reference

The PM's complete operating guide is at `docs/pm_playbook.md`. It covers: role boundaries, the full week-by-week timeline, how to run milestone gates, working with the developer, technical minimum, wireframe guidance, presentation templates, decision framework, and escalation paths.
