# Backlog — Multi-Cloud Storage Integration

> Single source of truth for all tasks.
> Update status here as work moves. PM reviews this daily.
> Effort: **S** < 2h | **M** 2–4h | **L** 4–8h

---

## Status Key

| Status | Meaning |
|--------|---------|
| `Open` | Not started |
| `In Progress` | Actively being worked |
| `Blocked` | Waiting on decision or dependency |
| `Done` | Complete and reviewed |

---

## Milestone 1 — API Integration (Gate: 2026-06-05)

| ID | Task | Owner | Effort | Status | Notes |
|----|------|-------|--------|--------|-------|
| 1.1 | Provision AWS account + S3 bucket | Dev | S | Open | |
| 1.2 | Provision Azure account + Blob container | Dev | S | Open | |
| 1.3 | Provision GCP account + GCS bucket | Dev | S | Open | GCP auth setup typically more complex — see Risk R04 |
| 1.4 | Decide tech stack + initialize repo | Dev + PM | S | Open | D-001 in decisions_log.md — deadline 2026-05-28 |
| 1.5 | AWS S3 module: upload, download, list, delete | Dev | L | Open | |
| 1.6 | Azure Blob module: upload, download, list, delete | Dev | L | Open | |
| 1.7 | GCS module: upload, download, list, delete | Dev | L | Open | |
| 1.8 | Unit tests for all 3 modules | Dev | M | Open | Minimum: happy path + auth error + missing file |
| 1.9 | M1 milestone gate review | PM | S | Open | Run through M1 pass criteria in roadmap.md |

---

## Milestone 2 — Unified Interface (Gate: 2026-06-10)

| ID | Task | Owner | Effort | Status | Notes |
|----|------|-------|--------|--------|-------|
| 2.1 | Design unified interface contract | Dev + PM | S | Open | D-003 in decisions_log.md |
| 2.2 | Unified upload, download, list, delete | Dev | L | Open | Provider-agnostic calls |
| 2.3 | Provider swappable via config only | Dev | M | Open | No code change required to switch provider |
| 2.4 | File sync: copy missing/changed files across providers | Dev | L | Open | |
| 2.5 | Sync: skip unchanged files | Dev | M | Open | Compare by name + size or hash |
| 2.6 | Redundant upload: write to 2+ providers in one call | Dev | M | Open | |
| 2.7 | Graceful failure on partial redundant upload | Dev | M | Open | Report success + failed providers separately |
| 2.8 | Integration tests for unified interface | Dev | M | Open | Real API calls, not mocked |
| 2.9 | M2 milestone gate review + demo | PM | S | Open | Run through M2 pass criteria in roadmap.md |

---

## Milestone 3 — UI & Access Control (Gate: 2026-06-16)

| ID | Task | Owner | Effort | Status | Notes |
|----|------|-------|--------|--------|-------|
| 3.1 | Decide auth approach | Dev + PM | S | Open | D-004 in decisions_log.md |
| 3.2 | Decide deployment target | Dev + PM | S | Open | D-005 in decisions_log.md |
| 3.3 | Web UI: file list view with provider badge | Dev | L | Open | |
| 3.4 | Web UI: upload file from browser | Dev | L | Open | |
| 3.5 | Web UI: download and delete with confirmation | Dev | M | Open | |
| 3.6 | User login: username/password | Dev | M | Open | |
| 3.7 | Role-based access control: admin / read-only | Dev | L | Open | |
| 3.8 | All API endpoints require auth token | Dev | M | Open | Return 401 for unauthenticated requests |
| 3.9 | Cloud credentials server-side only | Dev | M | Open | Nothing in browser responses or frontend code |
| 3.10 | Security review | PM + Dev | M | Open | Credentials, HTTPS, error messages don't leak internals |
| 3.11 | End-to-end test on production | Dev + PM | M | Open | Upload → list → download → delete on live server |
| 3.12 | Deploy to production | Dev | M | Open | |
| 3.13 | Release checklist sign-off + Go/No-Go | PM | S | Open | See release_checklist.md |

---

## Backlog Health

| Metric | Count |
|--------|-------|
| Total tasks | 31 |
| Open | 31 |
| In Progress | 0 |
| Blocked | 0 |
| Done | 0 |
| M1 tasks | 9 |
| M2 tasks | 9 |
| M3 tasks | 13 |

> Update the health counts above at each milestone review.
