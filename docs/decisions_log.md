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
**Consequence:** Persistent DB + real JWT/session auth remains pending.

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
| D-010 | Keep duplicate Vercel API routes or consolidate | Dev | Keep both until Vercel root directory is confirmed. |

## Weekly Status

### 2026-06-02

AWS/Azure local testing works. Vercel deployment is active, but production direct upload is blocked by cloud CORS. Role management and invite-link prototype are implemented. GCS remains a placeholder. Exposed cloud credentials must be rotated before production validation.
