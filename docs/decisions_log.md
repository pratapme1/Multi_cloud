# Decisions Log - Multi-Cloud Storage Integration

## Decided

### D-001 - Tech Stack

**Date:** 2026-06-01  
**Decision:** Node.js / Express backend + React / Vite frontend.  
**Rationale:** Fast local development, official AWS/Azure SDKs, same ecosystem as frontend.  
**Consequence:** Active code lives in `src/backend-node` and `src/frontend`.

### D-002 - Credential Management

**Date:** 2026-05-29  
**Decision:** Local `.env`; production environment variables in deployment platform.  
**Rationale:** Simple local testing while keeping secrets out of git.  
**Consequence:** `.env`, `*.env`, service account JSON, and secret files must stay ignored.

### D-003 - Provider Pattern

**Date:** 2026-06-02  
**Decision:** Provider classes expose the same operational contract:

```text
listFiles()
uploadFile(buffer, name, mimetype)
getFileContent(name)
deleteFile(name)
health()
```

**Rationale:** Strategy/adapter style keeps AWS, Azure, and future GCS interchangeable without overbuilding a factory layer too early.

### D-004 - Authentication Approach for Prototype

**Date:** 2026-06-02  
**Decision:** Use mock bearer tokens and browser-local users/invites for prototype.  
**Rationale:** Keeps the demo moving while role flows are designed.  
**Consequence:** Supabase-backed persistent auth is now implemented; production session edge cases and RBAC tests remain pending.

### D-005 - Deployment Target

**Date:** 2026-06-02  
**Decision:** Deploy current prototype on Vercel.

**Rationale:** Quick public frontend deployment and serverless API route support.

**Consequence:** Multipart upload through Vercel Functions is not viable for larger files. The app now uses signed direct-to-storage upload URLs on Vercel.

### D-006 - Direct Upload Architecture

**Date:** 2026-06-02  
**Decision:** Browser uploads directly to AWS/Azure using short-lived signed URLs from `/api/files/upload-url`.

**Rationale:** Avoids Vercel function payload limits.

**Consequence:** AWS S3 and Azure Blob CORS must allow the Vercel origin.

### D-007 - Role Model

**Date:** 2026-06-02  
**Decision:** Use exactly three roles:

- Super Admin
- Admin
- Viewer

**Rationale:** Matches user request and keeps access control simple for the prototype.

## Open / Pending

| ID | Decision Needed | Owner | Notes |
|----|-----------------|-------|-------|
| D-008 | Persistent auth design | Dev + PM | JWT vs sessions once DB is added. |
| D-009 | GCS implementation date | Dev + PM | Depends on GCP credentials and bucket. |
| D-010 | Keep duplicate Vercel API routes or consolidate | Resolved | Consolidated to `api/index.js` to avoid Vercel Hobby plan function limits. |

## Weekly Status

### 2026-06-02

AWS/Azure local testing works. Vercel deployment is active with direct upload. Supabase `multi_cloud` schema is applied/exposed and auth is working. AWS/Azure CORS and credential rotation still need final cloud-side confirmation. GCS remains a placeholder until service account details are available. Production E2E automation will run after GCS setup.

Full-codebase code review completed (frontend + backend). 8 findings logged: 4 confirmed bugs, 3 plausible issues, 1 low-risk design smell. Two P0 items added to risk log (R08: unauthenticated test-credentials endpoint; R09: wrong-file drawer after sort/search). Full fix queue in backlog section "Code Review Fix Queue" (CR1–CR8). Implementation deferred; P0 fixes must land before production go-live.

GCS provider fully implemented and verified live on Vercel — all three providers healthy: AWS S3 (98 ms), Azure Blob (89 ms), GCS (153 ms). Vercel build fix applied: `installCommand` updated to install `src/backend-node` deps so `@google-cloud/storage` is available during bundling. `GCS_SERVICE_ACCOUNT_JSON` (JSON string) used in production; `GCS_SERVICE_ACCOUNT_JSON_PATH` (file path) used locally.
