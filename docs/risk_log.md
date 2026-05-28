# Risk Log — Multi-Cloud Storage Integration

> **Review cadence:** At every milestone gate.
> **Owner:** PM tracks; Dev mitigates technical risks.
> **Score = Likelihood × Impact** (each 1–3). Score ≥ 4 = actively watch.

---

## Active Risks

| ID | Risk | L | I | Score | Mitigation | Contingency | Owner | Status |
|----|------|---|---|-------|-----------|-------------|-------|--------|
| R01 | Cloud account provisioning delayed (identity verification, billing) | 2 | 3 | **6** | Start all 3 accounts on Day 1; have backup personal accounts ready | Use existing personal/educational accounts | Dev | Open |
| R02 | Credentials accidentally committed to version control | 2 | 3 | **6** | `.env` + `.gitignore` from Day 1; add pre-commit hook to scan for secrets | Rotate all exposed keys immediately; audit git history | Dev | Open |
| R03 | UI scope expands beyond what 3 days can deliver | 2 | 3 | **6** | Cap UI to: list, upload, download, delete. No extras. | Go-live with API-only access; ship UI as follow-up | PM | Open |
| R04 | GCP service account setup more complex than expected | 2 | 2 | **4** | Follow GCP quickstart; test credentials on provisioning day | Allocate extra half-day in M1 schedule | Dev | Open |
| R05 | Tech stack decision delayed past May 28 | 1 | 3 | **3** | PM sets hard deadline; default to Python if no consensus | PM makes unilateral call: Python | PM | Open |
| R06 | Cloud API rate limits hit during development | 2 | 2 | **4** | Use small test files; stay within free-tier; mock in unit tests | Throttle test runs; batch calls | Dev | Open |
| R07 | Auth implementation more complex than estimated | 2 | 2 | **4** | Use established library (not home-grown); simple JWT or session | Ship with hardcoded admin user as MVP; full auth post-launch | Dev | Open |
| R08 | Developer unavailable for 1+ days mid-project | 1 | 2 | **2** | Keep sprint at 80% capacity; no overtime assumed | PM handles docs/planning tasks; defer non-critical work | PM | Open |
| R09 | Developer is backend-only — cannot build web UI for M3 | 2 | 3 | **6** | Confirm full-stack capability at team kickoff (K06, K07 in discovery.md); if gap found, decide immediately — not at M3 start | Add frontend developer for M3, OR reduce UI to server-rendered templates + CSS framework (Bootstrap/Tailwind); PM assists with UI structure and layout decisions | PM | Open |

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
| — | — | — |

> Move risks here when they close (resolved, contingency activated, or no longer relevant).
