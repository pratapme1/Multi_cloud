# Discovery Document — Multi-Cloud Storage Integration

> **Created:** 2026-05-27
> **Purpose:** Three things in one document.
> - Part 0: The honest statement — what this project really is and why that's fine
> - Part A: Questions to ask your manager before the project starts
> - Part B: Research-based discovery — the WHY behind this project, answered through research
>
> Read Part 0 first. It reframes everything else.

---

# PART 0 — Project Purpose: The Honest Statement

## What This Project Actually Is

This is a **UST bench project** — a structured exercise assigned to team members between client engagements to keep skills sharp, demonstrate capability, and produce a portfolio piece.

That is not a weakness. That is the context. And it changes what success means.

---

## The Two Truths

**Truth 1 — The market truth:**
There are existing tools that solve multi-cloud storage management. rclone, MultCloud, Cyberduck, and enterprise platforms like Files.com all exist. A startup pitching this as a product would face serious "why not just use rclone?" questions. No one is going to displace these tools with a 20-day build.

**Truth 2 — The project truth:**
That doesn't matter. Because this project was never about building a better product. It was about building better people.

Every tool that exists was built by someone who first had to learn the underlying APIs, design an abstraction, handle auth across providers, build a UI, and ship something. This project is that learning — done deliberately, documented well, and presented as evidence of competence.

---

## What the Real Deliverable Is

| What it looks like | What it actually is |
|--------------------|---------------------|
| A working multi-cloud storage app | Proof that the team can integrate 3 different cloud SDKs |
| A web UI with login | Proof that the team can build end-to-end, not just backend modules |
| A release checklist and Go/No-Go | Proof that the PM runs a disciplined delivery process |
| 3 milestone presentations | Proof that the team can communicate progress, decisions, and trade-offs clearly |
| A decisions log with rationale | Proof that decisions weren't random — they were thought through |

UST's clients don't just hire people who can code. They hire people who can **manage, communicate, and deliver**. This project demonstrates all three.

---

## The Mental Model to Give Your Team

When you sit down with your developer colleague, say this:

> *"We're not trying to beat rclone. We're building our own version of a real problem so we understand every layer of it — the cloud SDKs, the abstraction pattern, the auth, the UI, the deployment. At the end of 20 days, you'll have done something most cloud developers haven't: worked hands-on across all three major providers in a single project. That's what we're building toward."*

This removes the "why are we doing this when it already exists" anxiety — and replaces it with "here is what I will personally be able to do and say after this."

---

## The Mental Model for Your Manager Presentation

When you present at milestones, anchor every demo to a real-world scenario. Example:

> *"Imagine a client who acquired a company last year. The acquired company runs on Azure. The parent company runs on AWS. They need files to be accessible from both environments. This integration layer solves that in a config change — not a rewrite."*

That's a real scenario. It happens after every M&A in the enterprise. Now your bench project is a prototype for something a UST client could actually use.

---

## The Build vs Buy Answer — For Any Room

If anyone in a presentation asks "why build this when rclone exists?" — answer it directly:

> *"We evaluated existing tools — rclone, MultCloud, FluentStorage. They solve the problem at the CLI or SaaS layer. What we built is an embeddable, code-owned integration that a development team can extend for their own application stack. We also built it as a learning exercise, because understanding the underlying APIs directly — not through an abstraction someone else wrote — is what makes us able to adapt it for client-specific requirements."*

That answer shows: (1) you did your homework, (2) you made a reasoned choice, (3) you understand the trade-offs.

---

## What This Means for How You Run the Project

| Implication | What to do |
|-------------|-----------|
| The process matters as much as the output | Document decisions, run milestone gates properly, don't skip retros |
| The presentation is a first-class deliverable | Prepare for it at the start of each milestone, not the day before |
| Assumptions are fine — gaps are not | Document every assumption explicitly rather than leaving things unclear |
| Your developer colleague is also being evaluated | Give them visibility into decisions and credit in presentations |
| Scope control signals PM maturity | When something is tempting to add, say no and log why |

---

# PART A — Questions for Your Manager

> Take these into your kickoff conversation. You won't always get full answers.
> Write what you hear. Gaps are documented assumptions — not blockers.

---

## About the Project Purpose

| # | Question | Answer |
|---|----------|--------|
| 1 | What problem is this project meant to demonstrate solving — is it primarily a technical learning exercise, or is there a real use case in mind? | |
| 2 | Why AWS + Azure + GCP specifically? Is there an internal context (company uses all 3, a customer scenario, or purely for breadth of learning)? | |
| 3 | Is there a target user persona in mind — a developer, an ops person, an end user? Or is the audience just the evaluation panel? | |
| 4 | Should the unified interface be built as a developer-facing API, an end-user web app, or both? | |
| 5 | Is data redundancy a nice-to-have feature or a core requirement? What's the real-world justification for it? | |

---

## About Evaluation and Presentations

| # | Question | Answer |
|---|----------|--------|
| 6 | What will you be evaluating at each milestone presentation — technical output, PM process, both? | |
| 7 | What does a strong milestone presentation look like versus a weak one? | |
| 8 | Are the 3 milestones fixed, or do I have latitude to propose how work is broken down within each? | |
| 9 | Who is in the room at the presentations — just my direct manager, or a wider audience? | |
| 10 | Is there a specific format expected for the presentation (demo, slides, walkthrough of docs)? | |

---

## About Constraints

| # | Question | Answer |
|---|----------|--------|
| 11 | Is there a preferred tech stack, or is the technology choice part of what we're being evaluated on? | |
| 12 | Are we expected to use real cloud accounts, or is mocking/simulation acceptable for development? | |
| 13 | Is there a budget or are we expected to stay within free tiers? | |
| 14 | Are there company security or compliance standards we need to follow for credentials and access? | |
| 15 | Are there any existing internal tools or patterns we should align with or avoid duplicating? | |

---

## About the Team

| # | Question | Answer |
|---|----------|--------|
| 16 | What is my colleague's role — developer only, or are they also expected to contribute to PM artifacts? | |
| 17 | Is this project 100% of our time for 20 days, or are we expected to manage other work alongside it? | |
| 18 | Who do we escalate to if we hit a blocker (e.g., cloud account provisioning issue)? | |

---

## What to Listen For

When answers are vague, note it. Vague answers from managers on a capstone usually mean one of two things:
- **Intentional ambiguity** — they want to see how you handle incomplete information (this is the test)
- **They haven't thought it through** — your job as PM is to propose a reasonable interpretation and confirm it

Either way, document what you heard, what you interpreted, and flag it in the charter as an assumption.

---
---

# PART B — Research-Based Discovery

> These are the discovery questions answered through research.
> This is what you know about the project even before you speak to your manager.
> Use this to walk into that conversation informed, not blank.

---

## 1. Problem Statement — Why Does This Project Exist?

### The Real-World Problem

As of 2025, **89% of Fortune 500 companies use multi-cloud strategies**, with an average of 2.6 public cloud providers per organization. The reason is straightforward: no single provider is best at everything.

- AWS leads in breadth of services and global reach
- Azure dominates in enterprise integration (Active Directory, Office 365)
- GCP leads in data analytics and machine learning workloads

So teams end up spreading work across providers. And then the problem begins.

**Without a unified layer, a developer managing files across all 3 must:**
- Learn 3 completely different SDKs (`boto3` for AWS, `azure-storage-blob` for Azure, `google-cloud-storage` for GCP)
- Handle 3 different authentication systems (IAM roles, Azure managed identities, GCP service accounts)
- Write 3 sets of error handling, retry logic, and pagination code
- Manually coordinate when they need the same file on 2 providers
- Log into 3 separate consoles just to see what files exist where

That is the pain. The project builds the solution.

---

## 2. Who Has This Problem — Personas

Based on research, three distinct people feel this pain:

### Persona 1 — The Developer on a Multi-Cloud Team
**Context:** Works at a company that has AWS for production, Azure for enterprise tooling, and GCP for data pipelines. They need to move files between environments constantly.
**Pain:** Writing provider-specific code every time. When the AWS module breaks, the Azure module is a completely different codebase to debug.
**What they need:** One interface. Write it once, point it at any provider.

### Persona 2 — The DevOps / Ops Engineer
**Context:** Responsible for backup, redundancy, and disaster recovery across cloud environments.
**Pain:** No tool gives them a single view of what's stored where. If AWS goes down, there's no automatic failover to another provider's copy.
**What they need:** Redundant storage and sync without building it from scratch every time.

### Persona 3 — The End User in a File-Heavy Business
**Context:** Works in legal, healthcare, or media. Files live across multiple vendors for compliance or historical reasons.
**Pain:** Logging into 3 dashboards to find one file. No single search, no single download button.
**What they need:** A web interface that hides which cloud the file is on.

> **For this capstone:** The primary persona is likely Persona 1 (developer) since the brief emphasizes API integration. The web UI in Milestone 3 serves Persona 3.

---

## 3. Why Not Just Use Existing Tools?

This is a question your manager may ask — or that you should answer proactively in your presentation. Here's what exists and why the project still makes sense:

| Tool | What it does | Why it's not the answer here |
|------|-------------|-------------------------------|
| **rclone** | CLI tool, supports 70+ cloud providers including S3/Azure/GCS | Powerful but command-line only, no web UI, no developer API, not embeddable into an application |
| **RcloneView** | GUI wrapper for rclone | Still tied to rclone's model, not a library you integrate into your own app |
| **MultCloud** | SaaS web interface for multi-cloud file management | Third-party SaaS dependency, no code ownership, not suitable for embedding into a company's own product |
| **Cyberduck** | Desktop app for cloud file browsing | Desktop-only, not a developer library, no redundancy or sync programming |
| **FluentStorage (.NET)** | Code abstraction library for multi-cloud storage | .NET only, limited to the languages/patterns it supports, no web UI |
| **Files.com** | Enterprise managed file transfer platform | Expensive SaaS, not a learning or build-it-yourself solution |

**The gap this project fills:** A purpose-built, code-owned integration layer that a developer can embed in their own application, extend, and control — with a web UI on top. That's what none of the above fully provides in a single, ownable package.

> **For the presentation:** Frame it as: "We evaluated existing tools. Here's why we built our own." That's a mark of a PM who does discovery, not just execution.

---

## 4. Technical Landscape — What Makes This Hard to Build

Understanding the technical complexity makes you a better PM. Here is what your developer will face:

### The 3 APIs Are Fundamentally Different

| Aspect | AWS S3 | Azure Blob Storage | Google Cloud Storage |
|--------|--------|-------------------|---------------------|
| **Authentication** | IAM Access Key + Secret | Connection String or Managed Identity | Service Account JSON file |
| **Main concept** | Buckets → Objects | Containers → Blobs | Buckets → Objects |
| **SDK** | `boto3` (Python) / `aws-sdk` (JS) | `azure-storage-blob` | `google-cloud-storage` |
| **Listing files** | Paginated with continuation tokens | Paginated with markers | Paginated with page tokens |
| **URL structure** | `s3://bucket/key` | `https://account.blob.core.windows.net/container/blob` | `gs://bucket/object` |
| **S3 compatibility** | Native | Partial (not full) | Partial (interoperability mode) |
| **Setup complexity** | Medium | Medium | Higher (service account, IAM roles) |

### The Core Engineering Challenge
Building a unified layer means every operation (upload, download, list, delete) needs to work identically from the caller's perspective regardless of which provider it hits underneath. This is an **abstraction problem** — and it's non-trivial because the providers don't agree on naming, error formats, or auth models.

This is why the Milestone 2 gate question was: *"Can you swap providers by changing one config value?"* If yes — the abstraction worked. If no — it's just a wrapper, not a real unified interface.

### GCP Is the Hardest to Set Up
Research confirms this consistently. GCP uses service account JSON files and IAM role bindings that are more involved than AWS access keys or Azure connection strings. Budget extra time for GCP provisioning and authentication testing.

---

## 5. What Real Problems Does Each Feature Solve?

| Feature | Real-world problem it solves |
|---------|------------------------------|
| **Unified upload/download/list/delete** | Developers write one integration, not three — reduces code duplication and maintenance |
| **File sync across providers** | Ops teams need files mirrored between providers for backup and disaster recovery |
| **Data redundancy** | If AWS goes down, a redundantly uploaded file is already on Azure — no recovery delay |
| **Web UI** | Non-technical users can manage files without CLI access or cloud console training |
| **Access control / RBAC** | Not everyone should be able to delete files — admins vs. read-only users is a basic enterprise need |

---

## 6. What This Capstone Is Testing — Skills Map

Based on the milestones and research on cloud capstone evaluation criteria, here is what your managers are likely evaluating at each presentation:

### Milestone 1 Presentation — API Integration
| They're watching for | How to demonstrate it |
|---------------------|----------------------|
| Can you navigate cloud SDK documentation? | Show the 3 modules working with real API calls |
| Do you understand auth and credentials? | Show that credentials are stored securely, not hardcoded |
| Did you test it properly? | Show unit tests running and passing |
| PM: Did you manage the setup complexity? | Reference the risk log — did you anticipate GCP being harder? |

### Milestone 2 Presentation — Unified Interface
| They're watching for | How to demonstrate it |
|---------------------|----------------------|
| Can you design an abstraction? | Show the provider-swap config test live |
| Do you understand architecture patterns? | Name the pattern used (Strategy, Adapter, etc.) and why |
| Can you handle edge cases? | Show partial failure behavior on redundant upload |
| PM: Is scope controlled? | Show backlog — what was in M2, what moved, why |

### Milestone 3 Presentation — UI + Go-Live
| They're watching for | How to demonstrate it |
|---------------------|----------------------|
| Can you deliver end-to-end? | Live demo on production — not localhost |
| Do you take security seriously? | Show the security checklist was run, show credentials aren't in the browser |
| PM: Can you close a project properly? | Walk through the release checklist, announce Go/No-Go |
| PM: Can you present clearly? | Tell the project story — problem → decisions → delivery → lessons learned |

---

## 7. Documented Assumptions

> These are things we believe to be true in the absence of manager confirmation.
> Each one should be validated in the manager conversation (Part A) and updated here.

| ID | Assumption | Confidence | Validate with Question # |
|----|-----------|------------|--------------------------|
| A01 | The project is primarily a learning/demonstration exercise, not a production system | High | Q1 |
| A02 | The target persona is a developer working across cloud environments | Medium | Q3 |
| A03 | We are expected to use real cloud accounts (not mocked APIs) | Medium | Q12 |
| A04 | Free-tier cloud usage is sufficient — no budget for paid tiers | Medium | Q13 |
| A05 | The tech stack is our choice — no mandate | Medium | Q11 |
| A06 | The milestone presentations are the primary evaluation moments | High | Q6, Q7 |
| A07 | GCP setup will take longer than AWS or Azure — buffer needed in Sprint 1 | High | (research-based, no question needed) |
| A08 | The web UI is for demo purposes only — not production-scale | High | Q4 |
| A09 | Both team members are full-time on this project for 20 days | Medium | Q17 |
| A10 | The manager audience includes at least one technical evaluator | Medium | Q9 |

---

## 8. Open Questions After Research

Things research could not answer — only your manager can:

1. Is there a specific internal system this is meant to integrate with eventually?
2. Are the milestone dates fixed or is there flexibility if we hit a blocker?
3. Is there a preferred presentation format — live demo, slides, or documentation walkthrough?
4. Will the same people attend all 3 milestone presentations, or different audiences each time?
5. Is post-go-live maintenance expected, or does the project end at June 16?
