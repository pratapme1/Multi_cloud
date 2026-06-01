# Meeting Prep — Multi-Cloud Storage Integration

> Use this file **before** every meeting (review what you need to get) and **after** (log what you got).
> Two meeting types tracked here: Manager Kickoff and Developer Kickoff.
> When a meeting is complete, fill in the "After" section and update backlog.md + decisions_log.md.

---

## Meeting 1 — Developer Kickoff (Team Kickoff)

**Status:** ✅ Complete
**Date / Time:** 2026-05-28
**Who:** Vishnu (PM) + Anushman + Anand
**Purpose:** Understand developer's background, capacity, and preferences so you can plan M1 work and close D-001.

---

### BEFORE — What You Must Get

| # | Question | Ref | Answer |
|---|----------|-----|--------|
| K01 | What are your working hours and timezone? | discovery K01 | 2–3 hours/day |
| K02 | Are there any days you are unavailable between now and June 16? | discovery K02 | Not captured — follow up |
| K03 | Can you realistically commit full-time (5–6 hrs/day)? | discovery K03 | No — 2–3 hrs/day only ⚠️ |
| K04 | What cloud providers have you worked with before? | discovery K04 | Anushman: minimal AWS, no Azure/GCP. Anand: REST API testing via Postman |
| K05 | What language and framework are you most comfortable with? | discovery K05 + D-001 | Anushman: .NET backend + React frontend. D-001 closed 2026-05-29: .NET 8 + React + SQLite |
| K06 | **CRITICAL:** Are you full-stack, or primarily backend? | discovery K06 + R09 | Anushman: Full-stack (.NET backend + React frontend) ✅ R09 resolved |
| K07 | Have you built a web UI before? Which framework? | discovery K07 + R09 | Anushman: Yes — React, built new features |
| K08 | How do you prefer to get requirements — doc, chat, or verbal? | discovery K08 | Chat: Teams. Documentation format: PM decides |
| K09 | What is your preferred check-in format and frequency? | discovery K09 | Daily standup. End of each milestone: sprint review call. Demo to leaders on last day of milestone |
| K10 | **CRITICAL:** If you hit a blocker, how will you let me know? | discovery K10 | Not captured — follow up |
| K11 | How do you feel about writing tests alongside each module (not at the end)? | discovery K11 | Anushman: agrees, will do it. Anand: can act as QA |
| K12 | Any concerns about the scope or timeline? | discovery K12 | Not captured — follow up |
| K13 | Anything in the plan you'd approach differently? | discovery K13 | Not captured — follow up |
| K14 | Any dependencies or setup you'll need help with on Day 1? | discovery K14 | Not captured — follow up |

**Three non-negotiables — do not leave the call without these:**
1. K06/K07 — Full-stack or backend-only? (Determines R09 — add frontend dev or not)
2. K05 — Tech stack preference (closes D-001 or informs it)
3. K10 — Blocker communication method (prevents silent slippage)

---

### BEFORE — Opening Script

> "Before we start, quick framing: this isn't a test — I want to understand how you work so I can support you well. The goal today is to get you set up for Day 1, close the tech stack decision, and make sure you have no blockers. About 40 minutes. Sound good?"

---

### BEFORE — Red Flags to Listen For

| If developer says… | It means… | Do this |
|--------------------|-----------|---------|
| "I'll figure out the UI when we get there" | May not have frontend experience | Ask K06/K07 directly — do not let it pass |
| "I've only used AWS, not Azure or GCP" | Ramp-up needed in M1 | Flag R04 — allocate extra time for GCP |
| "I prefer to write tests after everything is coded" | Testing debt risk | Clarify expectation: test-alongside per backlog standard |
| "Python is fine" without enthusiasm | May prefer Node or Go | Probe — wrong stack slows everyone down |
| "I'm not sure I can do full-time" | Capacity risk | Ask specific hours, update R08 if < 5 hrs/day |
| "I've done something like this before" | Great — find out what | Ask what worked, what they'd do differently |

---

### AFTER — What Was Captured

**Date completed:** 2026-05-28
**Call duration:** *(fill in)*

> **KEY DISCOVERY: Team is 3 people, not 2.** PM + Anushman (full-stack dev) + Anand (QA/validation). Update charter.md and backlog.md.

**Team roster confirmed:**
| Person | Role | Background |
|--------|------|-----------|
| Anushman | Full-stack Developer | .NET backend, Java, React (5 yrs); Signify (Philips Lighting), .NET device platform; minimal AWS, no Azure/GCP |
| Anand | QA / Validation | 11 yrs; hardware + software validation, Dell Technologies, server validation, manual testing, integration testing, GPU/DPU platforms |

**Availability: ⚠️ RISK — only 2–3 hrs/day (not 5–6)**
- Working hours: 2–3 hours/day
- Unavailable dates: Not captured — ask next session
- Daily commitment: Below plan assumption — need to recalibrate timeline or scope

**Background:**
- Cloud experience: Anushman has minimal AWS only; no Azure or GCP — GCP ramp-up risk (R04) is now confirmed for ALL 3 providers
- Language/stack: Anushman → .NET (C#) backend + React frontend; Anand → manual/integration testing, Postman
- Full-stack confirmed: Yes (Anushman) — R09 resolved, no need for additional frontend developer
- UI/frontend experience: React (Anushman built new features in React)

**Working model:**
- Check-in: Daily standup + sprint review at end of each milestone + demo to leaders on final milestone day
- Blocker communication: Not captured — follow up ⚠️
- Requirements format: Chat via Teams; documentation format = PM decides
- Testing alongside coding: Agreed — Anushman writes tests, Anand acts as QA

**Developer's read on the project:**
- Concerns raised: Not captured — follow up
- Suggestions offered: Not captured — follow up
- Day 1 dependencies: Not captured — follow up

**D-001 — Tech Stack Decision:**
- Decision: .NET 8 / ASP.NET Core backend + React (Vite) frontend + SQLite
- Formally decided: Closed 2026-05-29
- Reference: `docs/decisions_log.md` D-001

---

### AFTER — Immediate Post-Call Actions

- [ ] Update `docs/discovery.md` Part A-2 with K01–K14 answers (use clean summary above)
- [ ] Update `docs/charter.md` Team section — team is now PM + Anushman + Anand (3 people)
- [ ] Update `docs/backlog.md` — reassign QA tasks to Anand; Anushman = Dev; reconsider timeline given 2–3 hrs/day capacity
- [ ] Update `docs/risk_log.md` — R09 CLOSED (full-stack confirmed); R08 ELEVATED (only 2–3 hrs/day, not 5–6); R04 status update (no Azure/GCP experience)
- [x] Close D-001 tomorrow (2026-05-29 morning) — closed 2026-05-29 as .NET 8 + React + SQLite
- [ ] Follow up: K02 (unavailable days), K10 (blocker communication), K12–K14 (concerns, suggestions, Day 1 needs)
- [ ] Mark **P.2** (Team Kickoff) as `Done` in `docs/backlog.md`
- [ ] Send Day 1 task list to Anushman: P.5 (repo init), P.6–P.8 (cloud accounts), P.9 (architecture sketch)

---

---

## Meeting 2 — Manager Kickoff

**Status:** ⬜ Not started
**Date / Time:** *(schedule ASAP — P.1 is open and blocking charter sign-off)*
**Who:** Vishnu (PM) + Manager
**Purpose:** Confirm constraints, get answers to scope and deployment questions, obtain charter sign-off.

---

### BEFORE — What You Must Get

| # | Question | Ref | Answer |
|---|----------|-----|--------|
| Q1 | What problem are we solving — what's frustrating users today? | discovery Q1 | |
| Q2 | Who is the primary user of this tool? | discovery Q2 | |
| Q3 | Does the user need to switch providers, or just have one? | discovery Q3 | |
| Q4 | What does success look like at go-live? | discovery Q4 | |
| Q5 | Are there security or compliance requirements? | discovery Q5 | |
| Q6 | Which 3 providers are mandatory? Any priority order? | discovery Q6 | |
| Q7 | Any existing credentials or accounts we can use? | discovery Q7 | |
| Q8 | Budget — free tier only, or is there a spend limit? | discovery Q8 | |
| Q9 | Is the tech stack already decided, or open? | discovery Q9 | |
| Q10 | Any preferred frameworks or corporate standards? | discovery Q10 | |
| Q11 | What are the milestone gate dates? | discovery Q11 | |
| Q12 | Who will be present at each milestone presentation? | discovery Q12 | |
| Q13 | What format should presentations take? | discovery Q13 | |
| Q14 | What happens if a milestone is missed? | discovery Q14 | |
| Q15 | Is go-live a hard deadline or a target? | discovery Q15 | |
| Q16 | How much work is expected in 20 days — MVP or production-grade? | discovery Q16 | |
| Q17 | Will this be handed over to another team after go-live? | discovery Q17 | |
| Q18 | Is there anyone else whose input we need? | discovery Q18 | |
| Q19 | Does the app need a public URL at go-live? | discovery Q19 | |
| Q20 | Is there company-provisioned hosting, or should we use personal/cloud accounts? | discovery Q20 | |
| Q21 | Any IT approval gates for deploying on company infrastructure? | discovery Q21 | |
| Q22 | Who owns the deployed app after go-live? | discovery Q22 | |
| Q23 | How long does the app need to stay live after go-live? | discovery Q23 | |
| Q24 | Any constraints on where data can be stored? | discovery Q24 | |
| Q25 | Is the developer expected to be full-stack, or only backend? | discovery Q25 | |
| Q26 | Can we request a frontend developer if the developer is backend-only? | discovery Q26 | |
| Q27 | Is UI quality being scored, or is API functionality the primary evaluation? | discovery Q27 | |

**Non-negotiables — do not leave without:**
1. Q19–Q21 — Deployment: public URL? company hosting? IT gates?
2. Q27 — Is UI quality being evaluated or just API?
3. Q15 — Is June 16 hard or a target?
4. Charter sign-off (if manager is ready)

---

### BEFORE — Opening Script

> "I want to make sure I'm building the right thing and not discovering constraints in week 3. I have about 25 questions — some are quick confirms, a few need a decision from you. Should take about 30 minutes."

---

### AFTER — What Was Captured

**Date completed:** *(fill in)*
**Call duration:** *(fill in)*

**Deployment answers (Q19–Q24):**
- Public URL required: *(Yes / No)*
- Hosting: *(Company-provisioned / personal accounts / cloud free tier)*
- IT approval needed: *(Yes / No — if yes, lead time: )*
- Post go-live ownership: *(fill in)*
- Data storage constraints: *(fill in)*

**Evaluation answers (Q15, Q16, Q27):**
- June 16 deadline: *(Hard / Target)*
- Expected depth: *(MVP / production-grade)*
- UI quality scored: *(Yes / No / API-first)*

**Team answers (Q25, Q26):**
- Developer expected full-stack: *(Yes / No / Not specified)*
- Frontend dev request possible: *(Yes / No)*

**Other key answers:** *(fill in notable answers to Q1–Q18)*

---

### AFTER — Immediate Post-Call Actions

- [ ] Fill in all Q1–Q27 answers in `docs/discovery.md` Part A
- [ ] Update charter constraints section if any answers change assumptions
- [ ] Get charter signed by manager (`docs/charter.md` sign-off section)
- [ ] Mark **P.1** (Manager Kickoff) as `Done` in `docs/backlog.md`
- [ ] If UI quality IS scored: confirm wireframe timeline (1.7 must be done before M1 gate)
- [ ] If hard June 16: flag M3 density risk immediately; brief developer

---

---

## Meeting 3 — M1 Internal Gate Check (Jun 4)

**Status:** ⬜ Not started
**Date / Time:** 2026-06-04
**Who:** PM + Developer
**Purpose:** Confirm M1 pass/fail before the manager presentation on Jun 5.

### Pass Criteria (all must be true)
- [ ] Live demo: upload a file to each of the 3 providers successfully
- [ ] Live demo: download that file from each provider successfully
- [ ] Live demo: list files on each provider
- [ ] Live demo: delete a file on each provider
- [ ] All 3 module unit test suites pass (happy path coverage)
- [ ] No raw SDK errors surfaced to the caller — clean error messages only

**Result:** *(Pass / Fail — log in decisions_log.md)*

---

## Meeting 4 — M1 Presentation to Manager (Jun 5)

**Status:** ⬜ Not started
**Date / Time:** 2026-06-05
**Who:** PM + Developer + Manager

### PM Tells the Story:
1. What we built (3 independent provider modules)
2. How we tested it (unit tests + live demo)
3. What's next (M2: unified interface, sync, redundancy)

### Developer Runs the Demo:
- Upload → List → Download → Delete — live, on all 3 providers

### Bring:
- Slide deck (built in 1.8)
- Passing unit test output
- Any open risks to flag

**Result:** *(Pass / Fail / Feedback received — log in decisions_log.md)*

---

## Meeting 5 — M2 Internal Gate Check (Jun 10)

**Status:** ⬜ Not started
**Date / Time:** 2026-06-10
**Who:** PM + Developer

### Pass Criteria (all must be true)
- [ ] Change ACTIVE_PROVIDER in .env → same test works on a different provider, zero code changes
- [ ] PM verifies the swap live — not just developer's verbal confirmation
- [ ] Sync: copies missing files (by filename), skips unchanged, returns {copied, skipped, failed}
- [ ] Redundant upload: writes to 2 providers; partial failure explicitly reported
- [ ] Anand's Postman validation passes against real APIs for all 4 unified ops

**Result:** *(Pass / Fail — log in decisions_log.md)*

---

## Meeting 6 — M2 Presentation to Manager (Jun 11)

**Status:** ⬜ Not started
**Date / Time:** 2026-06-11
**Who:** PM + Developer + Manager

### PM Tells the Story:
1. Unified interface (one call works for any provider)
2. Config swap demo — same test, different provider, no code change
3. Sync and redundancy
4. Wireframe walkthrough (screens designed in 1.7 and 2.10)

### Bring:
- Architecture diagram
- Provider swap demo script
- Wireframe printout or screen share

**Result:** *(Pass / Fail / Feedback received — log in decisions_log.md)*

---

## Meeting 7 — M3 Release Checklist Walkthrough (Jun 15)

**Status:** ⬜ Not started
**Date / Time:** 2026-06-15
**Who:** PM + Developer
**Rule:** No new features today. Checklist and E2E only.

### PM Runs This Personally:
- [ ] Login → Upload → List → Download → Delete on production URL
- [ ] Verify readonly user cannot delete via direct API call
- [ ] Open browser network tab — confirm no cloud credentials in any response
- [ ] Walk through release_checklist.md P0 items — every item needs evidence

**Result:** *(Go / No-Go — log in decisions_log.md and release_checklist.md)*

---

## Meeting 8 — Go/No-Go + M3 Presentation to Manager (Jun 16)

**Status:** ⬜ Not started
**Date / Time:** 2026-06-16
**Who:** PM + Developer + Manager

### PM Tells the Story (arc):
1. What we set out to build (charter summary)
2. What we built (all 3 milestones)
3. Key decisions made (D-001 through D-005)
4. Live demo
5. Lessons learned

### Developer Runs the Demo:
- Login → Upload (to All Providers) → List → Download → Delete → Sync

### If NO-GO:
- Document what failed
- State fix required and new date
- Do not present until GO

**Result:** *(Go-Live confirmed / Deferred — log in decisions_log.md)*

---

## Quick Reference — All Meeting Dates

| Meeting | Date | Status |
|---------|------|--------|
| M0-A: Developer Kickoff | 2026-05-28 | Complete |
| M0-B: Manager Kickoff | TBD (ASAP) | ⬜ Schedule now |
| M1 Internal Gate | 2026-06-04 | ⬜ |
| M1 Manager Presentation | 2026-06-05 | ⬜ |
| M2 Internal Gate | 2026-06-10 | ⬜ |
| M2 Manager Presentation | 2026-06-11 | ⬜ |
| M3 Release Checklist | 2026-06-15 | ⬜ |
| M3 Go/No-Go + Presentation | 2026-06-16 | ⬜ |
