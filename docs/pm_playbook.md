# PM Playbook — Multi-Cloud Storage Integration

> Your single go-to reference for the entire project lifecycle.
> When you're unsure what to do next, start here.
> When something goes wrong, the answer is in Section 12.

---

## 1. Your Role — What You Own and What You Don't

### You Own
- **What** gets built and in what order — scope and priority
- Every document in `docs/` — keeping them current is your job
- Every milestone gate — you decide pass or fail, not the developer
- Every presentation — structure, narrative, and delivery
- Every decision log entry — decisions don't exist until they're written down
- Risk awareness — you surface risks before they become problems
- Scope control — you say no and log why
- The UI wireframe — your design artifact for the developer to build from

### The Developer Owns
- **How** things are built — architecture, patterns, libraries
- All implementation decisions within the agreed scope
- Test strategy and test coverage
- Deployment mechanics

### The Core Rule
When there's tension between "what" and "how" — PM holds "what", Dev holds "how". Neither overrides the other's domain. If the developer says "that can't be done in the time we have" — that's a scope conversation that you own the resolution of.

---

## 2. The 9-Document System — One Truth Per Topic

| File | What it is | When you update it |
|------|-----------|-------------------|
| `CLAUDE.md` | Session briefing — loaded at every Claude session | After each milestone; when tech stack is decided |
| `docs/charter.md` | Scope, objectives, constraints, assumptions | After manager sign-off; if scope changes |
| `docs/roadmap.md` | Milestones, tasks, pass criteria, key dates | When tasks move or dates shift |
| `docs/backlog.md` | Task list with live status — daily tracking tool | Daily, as tasks move; after each milestone gate |
| `docs/decisions_log.md` | Every decision + weekly Friday status | When any decision is made; every Friday |
| `docs/risk_log.md` | Risks, scores, mitigations, contingencies | At every milestone gate; when new risks appear |
| `docs/release_checklist.md` | M3 go-live gate — P0/P1/P2 sign-off items | Walk through live on Jun 15–16 |
| `docs/discovery.md` | Research, personas, manager + team questions | Pre-project; update as answers come in |
| `docs/pm_playbook.md` | This file — your operating guide | When you learn something that would have helped you earlier |

**Daily habit:** Start each session by checking `docs/backlog.md`. End each session by updating it.

**The rule on documents:** One thing per file. A decision goes in `decisions_log.md`, not in chat or inline comments. A task status goes in `backlog.md`, not in a Slack message only.

---

## 3. The Full Project Timeline — What PM Does Week by Week

### Pre-Work (May 27-29) — 3 days
**Goal:** Everything in place before Sprint 1 starts.

- [ ] Read discovery.md Part A and Part B — understand the problem
- [ ] Ask manager the Part A questions — document answers in discovery.md
- [ ] Run team kickoff with developer — ask Part A-2 questions, document answers
- [ ] Get charter signed off by both team members
- [x] D-001 (tech stack) decided and logged in decisions_log.md
- [x] D-002 (credential management) agreed — `.env` strategy confirmed
- [ ] Confirm developer has started on cloud account provisioning (tasks 1.1, 1.2, 1.3)
- [ ] Confirm developer understands M1 scope and which tasks are theirs

---

### Milestone 1 — API Integration (May 28 – Jun 5) — 8 days
**Sprint goal:** Working upload/download/list/delete modules for all 3 providers, tested with real API calls.

**Your daily habit:**
1. Check backlog — is anything Blocked?
2. If blocked: is there a mitigation in the risk log? Can you unblock it today?
3. Is pace right? 9 tasks in 8 days = roughly 1+ per day average

**Your PM tasks during M1:**
- [x] D-001 and D-002 logged in decisions_log.md
- [ ] Confirm `.gitignore` contains `.env` on Day 1 — don't wait for a breach
- [ ] Watch R01 (account provisioning) — if any account is delayed by Day 2, escalate
- [ ] Check specifically on GCS progress by Day 4 — GCP auth is the highest-complexity task (R04)
- [ ] Begin your UI wireframe (5 screens) — this is your deliverable, not the developer's
- [ ] Prepare M1 presentation by Day 7 — not the day before the gate
- [ ] Update `CLAUDE.md` Section 3 once D-001 is decided

**M1 Gate — Jun 5:**
Walk through the M1 pass criteria in `roadmap.md` line by line. Each criterion needs live evidence — not "it works, trust me." If anything fails: document what failed, what the fix is, and confirm whether it moves to M2 or blocks M1.

---

### Milestone 2 — Unified Interface (Jun 5–10) — 5 days
**Sprint goal:** One interface, three providers. Config change = provider change. Sync and redundancy working.

**Your PM tasks during M2:**
- [ ] D-003 (unified interface pattern) logged once the developer decides
- [ ] Ask the gate question early (Day 2 of M2): "If I change one config value, does the provider swap with no code change?" Don't wait until Jun 10.
- [ ] Finish UI wireframe — must be complete and handed to developer at M2 start
- [ ] Confirm integration tests are running against real APIs — not mocked (this matters for the M2 gate)
- [ ] Confirm D-005 (deployment target) is decided before M2 ends — M3 planning depends on it
- [ ] Watch R03 (UI scope creep) — this phase is when scope pressure usually arrives
- [ ] Prepare M2 presentation — show wireframe, show provider-swap demo live, show backlog state

**M2 Gate — Jun 10:**
If config swap doesn't work cleanly: M2 is not passed. The abstraction test is the gate. Sync and redundancy also need to be demonstrated against real APIs, not mocked.

---

### Milestone 3 — UI, Access Control, Go-Live (Jun 10–16) — 6 days
**Sprint goal:** Web UI live, access control enforced, deployed on a real server, release checklist signed off.

**Your PM tasks during M3:**
- [ ] Confirm D-004 (auth approach) is decided and logged
- [ ] Confirm D-005 (deployment target) is confirmed and the developer has what they need to deploy
- [ ] Track task 3.9 specifically — cloud credentials must never appear in any browser response or frontend source. This is a P0 security item.
- [ ] Co-lead the security review (task 3.10) — walk through the P0 Security section of `release_checklist.md` yourself
- [ ] Do the end-to-end test yourself (task 3.11): log in, upload, list, download, delete on the live server
- [ ] Walk through all of `release_checklist.md` P0 items on Jun 15 — the day before go-live
- [ ] Sign the Go/No-Go on Jun 16 — documented, not verbal

**M3 Gate — Jun 16:**
Every P0 item on the release checklist must be checked with evidence. If any P0 item fails, the call is NO-GO. Document the reason, agree on the fix, set a new go-live date. Do not call GO on unverified P0 items.

---

## 4. Running a Milestone Gate — Step by Step

A gate is a decision with evidence. Not a meeting that ends with "we're mostly done."

### 3 Days Before the Gate
- Review the pass criteria in `roadmap.md`
- Walk through the backlog — is everything that should be Done actually Done?
- If anything is at risk of failing: raise it now, not at the gate

### At the Gate Meeting
1. Walk each pass criterion — is it true **right now**? (Not "it will be done tomorrow")
2. For each criterion: developer confirms with evidence — running code, test output, or live demo
3. PM calls pass or fail — this is your call, not the developer's
4. If fail: log what failed, what needs to happen, and the new date

### After the Gate
- Update `CLAUDE.md` Section 5 (Current Focus) to show the new active milestone
- Update backlog tasks to Done for everything that passed
- Log any scope decisions made at the gate in `decisions_log.md`
- Update `risk_log.md` — close resolved risks, add any new ones surfaced
- Add a Friday status entry to `decisions_log.md` if it's near end of week

---

## 5. Working With Your Developer

### The Daily Check-in — One Question
Not a status report meeting. One question: **"Anything blocking you today?"**
- If yes: your job is to unblock it — decision, clarification, escalation
- If no: look at the backlog together, confirm what's moving

Keep it under 10 minutes unless there's a real problem.

### How to Review Progress Without Micromanaging
You don't review code. You review outcomes.
- "Does upload work to all 3 providers?" — demo it, don't describe it
- "Is the config swap working?" — swap it in front of you
- "Are the tests passing?" — show the test output, not a verbal answer

### When the Developer Says "It Can't Be Done"
Ask three questions before accepting or rejecting it:
1. "What's the minimum version that can be done in time?"
2. "What would need to be cut from scope to make the original work?"
3. "Is this 'can't be done ever' or 'can't be done in this sprint'?"

Whatever you decide: log it in `decisions_log.md`.

### When the Developer Goes Quiet
Don't wait. Blocked developers often don't escalate early enough. If nothing in the backlog has moved in 2 days, check in directly. Silence is not the same as progress.

### When You Disagree on Scope
PM owns scope. State your position, listen to the technical concern, and find the minimum version. If you can't resolve it: escalate to your manager. Log whatever you decide.

---

## 6. Technical Minimum — What You Need to Understand

You don't write code. You need enough to ask good questions and catch problems early.

| Concept | What it means in practice |
|---------|--------------------------|
| **SDK** | A code library that wraps a cloud API. 3 SDKs = 3 different ways to do the same thing. This is why M1 takes 8 days, not 2. |
| **Credentials / Auth** | Proof that your code is allowed to use a cloud account. AWS uses access key + secret, Azure uses a connection string, GCP uses a service account JSON file. These must never be in the codebase or a git commit. |
| **Abstraction / Unified interface** | A layer that hides which cloud is underneath. If it works, you call `upload(file)` and it goes to whichever provider is configured. If it doesn't work, you have 3 separate callers, not one. |
| **Unit test vs integration test** | Unit test = tests the code in isolation. Integration test = tests the code against the real cloud API. M1 needs both. "Tests pass" means nothing if they only test mocked responses. |
| **Environment variable / .env** | A credential stored outside the code file, loaded at runtime. This is how secrets stay out of the repo. `.env` must always be in `.gitignore`. |
| **Deployment** | Making the app run on a server that isn't your laptop. Required for M3. The specific question to answer: what URL does the live app run at? |
| **RBAC** | Role-Based Access Control. Admin can upload/download/delete. Read-only can only view and download. The UI enforces it and the API enforces it. Both matter. |
| **401 vs 403** | 401 = not logged in. 403 = logged in but not allowed. Your app needs both to work. A 403 from the API when a read-only user tries to delete is a P0 requirement. |
| **HTTPS** | Encrypted connection between browser and server. Required for production. Without it, credentials can be intercepted in transit. |

**The test:** If the developer uses one of these terms in conversation and you can ask a meaningful follow-up, you understand it well enough.

---

## 7. Building the UI Wireframe — Your M2 Artifact

The wireframe is yours. The developer builds from it; you define what it should look like.

### When
Start in M1 (by Day 5). Hand it to the developer at the start of M2.

### What Screens to Design (minimum 5)

| Screen | What to show |
|--------|-------------|
| **Login** | Email/password fields, login button, error state for bad credentials |
| **File list view** | Table: file name, size, provider badge (AWS / Azure / GCP), upload date, action buttons (download, delete) |
| **Upload flow** | File picker, provider selector or "all providers" checkbox, upload button, progress indicator, success/error state |
| **Delete confirmation** | Modal dialog — "Are you sure you want to delete [filename]?" with confirm/cancel |
| **Admin panel** (optional) | User list, role assignment (admin / read-only) |

### What to Show on Each Screen
- Every UI element visible to the user
- Empty state (what does the file list look like when there are no files?)
- Error state (what does the user see if upload fails?)
- Navigation path between screens

### Tools
- **Figma** — most professional; Figma integration is available in this environment if you want to use it
- **draw.io / Excalidraw** — quick, free, no account needed
- **Paper sketch photographed** — valid for a first draft; put the image in the docs folder

### How to Use It in Presentations
Show it at M2. Walk through each screen and explain the UX decision behind it. Frame it as: "Here is what the developer is building toward. We aligned on this at the end of M1."

---

## 8. Milestone Presentation Templates

### M1 Presentation — Jun 5

| Section | Time | What to cover |
|---------|------|--------------|
| Problem recap | 1 min | Why this project exists — the 3-SDK pain point |
| What we built | 2 min | Three working cloud modules — what each does |
| Live demo | 5 min | Upload a file to S3. Then Azure Blob. Then GCS. One after another. |
| What we learned | 1 min | One honest reflection — e.g. GCP setup took longer than expected |
| Decisions and risks | 2 min | D-001 and D-002 decided; show the risk log, show what's being watched |
| M2 plan | 1 min | What the unified interface will do; the M2 gate question |

**Your job:** Tell the story. Developer runs the demo. You frame it.

---

### M2 Presentation — Jun 10

| Section | Time | What to cover |
|---------|------|--------------|
| M1 recap | 30s | "We shipped 3 independent modules. M2 connected them." |
| The abstraction | 2 min | Show the architecture: one interface, three providers underneath. Name the pattern. |
| Provider-swap demo | 3 min | Change one config value. Run the same operation. Different provider. No code change. |
| UI wireframe | 3 min | Your PM artifact. Walk through each screen. Explain the UX choices. |
| Sync and redundancy | 3 min | Show files appearing on both providers after sync. Show a redundant upload. |
| Scope and risks | 2 min | What was in M2, what moved, why. Risk log status. |
| M3 plan | 1 min | What's left. Deployment decision. Go-live date. |

---

### M3 Presentation — Jun 16 (Go-Live)

| Section | Time | What to cover |
|---------|------|--------------|
| Project story | 2 min | 20 days. What we set out to do. What we delivered. |
| Live demo on production | 5 min | Not localhost. Login → upload → list → download → delete on the live URL. |
| Security and access control | 2 min | Show role enforcement. Show that cloud credentials don't appear in the browser. |
| Release checklist walkthrough | 2 min | P0 items checked. Announce Go/No-Go. |
| Decisions made | 2 min | D-001 through D-005 — what we decided and why. |
| Lessons learned | 1 min | One technical, one PM. |
| What's next | 1 min | If this were a real product, what would follow? |

---

## 9. Decision Framework — Making and Recording Decisions

### When to Make a Decision
A decision is needed when:
- Two or more reasonable options exist and both can't be done
- The developer can't proceed without clarity on direction
- Something is going to change scope, timeline, or quality

### How to Record a Decision
Every decision in `decisions_log.md` needs:
1. **Decision ID** (D-001, D-002, etc.)
2. **What was decided**
3. **Options that were considered** (at least 2)
4. **Why this option was chosen**
5. **What becomes easier and what becomes harder** as a result
6. **Who decided it and when**

A decision with no rationale documented is the same as no decision — the next person (or future you) will question it and there's no answer.

### The 5 Open Decisions in This Project

| ID | Decision | Deadline | Who decides |
|----|----------|----------|-------------|
| D-001 | Tech stack — language + SDKs | Closed 2026-05-29 | Dev + PM |
| D-002 | Credential management strategy | Closed 2026-05-29 | Dev |
| D-003 | Unified interface design pattern | M2 start | Dev |
| D-004 | Authentication approach for web UI | M3 start | Dev + PM |
| D-005 | Deployment target | Closed 2026-05-29 | Dev + PM |

If D-001 or D-002 are not resolved by May 28, invoke the contingency: Python stack (R05), `.env` + dotenv (R02 mitigation). Log it as PM's unilateral call.

---

## 10. Scope Control — How to Say No

When anyone (including yourself) wants to add something:

1. Ask: "Is this in the charter scope?"
2. If no: "Is this worth a formal scope change discussion?"
3. If yes to scope change: log it in `decisions_log.md` with the trade-off — what you gain, what you give up, what moves or gets cut
4. If no to scope change: log it as "considered and deferred" with a one-line reason

**The test:** If you can't write a one-line reason for keeping it out, you haven't thought it through yet.

**The hardest no to say:** Features that feel quick. "It's just one small thing" is how scope creep starts. Log it, defer it, and stay on the plan.

---

## 11. What You're Learning — Skills This Project Builds

By the end of 20 days you will have done all of the following, which most PMs don't get to practice in a single project:

| Skill | Where you practiced it |
|-------|----------------------|
| Running discovery | Parts A, A-2, B of discovery.md — researching before asking |
| Writing a project charter | charter.md — scope boundaries, assumptions, success criteria |
| Backlog management and prioritization | Deciding what goes in M1 vs M2 vs M3 and why |
| Decision documentation | D-001 to D-005 — alternatives, rationale, consequences |
| Risk management | risk_log.md — anticipating problems before they happen |
| Milestone gate discipline | Pass/fail criteria with live evidence |
| Go/No-Go decision | release_checklist.md — owning the final call |
| Stakeholder communication | 3 milestone presentations with different content and framing |
| Scope control under pressure | Saying no to features and logging why |
| UI/UX ownership | Wireframe — defining what gets built before it gets built |
| Technical literacy | Enough to review outcomes, not code |
| Working with a developer | Daily check-ins, unblocking, not micromanaging |

The PM role on this project is not administrative support for a developer. It is co-ownership of a delivery.

---

## 12. When Things Go Wrong — Quick Reference

| Situation | What to do |
|-----------|-----------|
| Cloud account not provisioned by Day 2 | Escalate to manager (Q18 in discovery.md). Log as R01 contingency activated. |
| Developer blocked on GCP auth | Allocate extra half-day — this is the R04 contingency. PM handles docs/planning tasks meanwhile. |
| Tech stack decision missed May 28 deadline | PM makes the call: Python (R05 contingency). Log it in decisions_log.md as PM unilateral. |
| Feature is taking longer than estimated | Assess: minimum version? What to cut? Document the decision. Don't silently let it slip. |
| M1 gate criteria not met | Document what failed. Agree on fix + date. Do not call it a pass. |
| Credentials accidentally committed to git | Rotate all exposed keys immediately. Audit git history. Update R02 in risk_log.md. Inform manager. |
| Developer unavailable 1+ days | PM handles docs and planning tasks. Defer non-critical dev tasks. Log in risk_log.md as R08 activated. |
| Scope disagreement with developer | PM owns scope. State your position, hear the technical concern, find minimum version. Escalate if unresolved. |
| M3 demo environment not ready | This is D-005 and R03 converging. Default to documenting a NO-GO with specific fix required. |
| Presentation not going well | Anchor to a real-world scenario: "Imagine a client who acquired a company on Azure while running AWS..." — this always lands. |

---

## 13. Common PM Mistakes in Capstones — What to Avoid

| Mistake | What it looks like | What to do instead |
|---------|-------------------|-------------------|
| Treating PM as note-taker | Just tracking what the developer does | Own scope, present decisions, call pass/fail at gates |
| Leaving gate decisions vague | "We're mostly done with M1" | Pass or fail — write it down |
| Updating documents after the fact | Decisions log written the day before the presentation | Log decisions the day they're made |
| Skipping the wireframe | "The developer will figure out the UI" | Build it in M1, hand it to dev at M2 start |
| Over-documenting the "what" | Long recaps of what code was written | Document the WHY — why this decision, why this trade-off |
| Letting scope creep in silently | Adding features without a decision log entry | Every scope change needs a logged decision |
| Making the presentation a report | Reading out the backlog task by task | Tell the story — problem, decision, result, lesson |
| Waiting for problems to escalate | Developer blocked for 2 days before PM heard about it | Daily one-question check-in: "Anything blocking you?" |
| Calling GO on hope | P0 items not fully verified | Walk every P0 item. If you can't confirm it, it's a NO-GO. |
