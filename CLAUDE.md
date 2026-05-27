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

| Role | Responsibilities |
|------|-----------------|
| PM / PO | Scope, priorities, milestone gates, sessions with Claude |
| Developer | Architecture, implementation, testing, deployment |

PM drives Claude sessions. Developer owns all implementation decisions unless explicitly asking for suggestions.

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
**Current Goal:** Finalize charter, decide tech stack (D-001), confirm team names

> Update this section format at each milestone:
> Active Milestone: M1 / M2 / M3
> Sprint Goal: [one line]
> Blockers: [any open blockers]

---

## 6. What NOT To Do

- **Do not create files without explicit approval.** Brainstorm and propose first.
- **Do not add documents not in the agreed 8-file structure** unless PM explicitly asks.
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
