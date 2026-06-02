# Release Checklist - Go/No-Go

**Target:** Prototype validation after AWS/Azure CORS and GCS setup  
**Last updated:** 2026-06-02

## P0 - Must Pass

### Deployment

- [ ] Vercel deployment uses latest `main`.
- [ ] Root Directory is repository root (`./`) unless intentionally using `src/frontend`.
- [ ] `/api/test-credentials` returns JSON, not Vercel `NOT_FOUND`.
- [ ] Vercel environment variables are configured for AWS and Azure.

### Cloud Configuration

- [ ] AWS S3 CORS allows `https://multi-cloud-cyan.vercel.app`.
- [ ] Azure Blob CORS allows `https://multi-cloud-cyan.vercel.app`.
- [ ] Exposed AWS key has been rotated.
- [ ] Exposed Azure storage key has been rotated.

### Functionality

- [ ] Super Admin login works: `admin / Admin@123`.
- [ ] Viewer login works: `viewer / View@123`.
- [ ] Super Admin can upload a 1 MB file from Vercel to AWS + Azure.
- [ ] Uploaded file appears in AWS S3 console.
- [ ] Uploaded file appears in Azure Blob container.
- [ ] File list refreshes after upload.
- [ ] Download works from Vercel.
- [ ] Delete works for Super Admin/Admin.
- [ ] Viewer cannot upload/delete.
- [ ] Role Management tab is visible only to Super Admin.
- [ ] Invite link can create Admin or Viewer user.

### Security

- [ ] No AWS secret key appears in browser network responses.
- [ ] No Azure connection string appears in browser network responses.
- [ ] `.env` and standalone secret `.env` files are ignored.
- [ ] Error messages do not reveal stack traces or secrets.

## P1 - Should Pass

- [ ] Provider health drawer shows AWS/Azure status and GCS pending.
- [ ] Long filename upload modal does not break.
- [ ] Long filename table row/card/drawer does not break.
- [ ] Direct upload partial failures show provider-level diagnostics.
- [ ] Production Playwright E2E is updated and run after GCS setup.

## Deferred

- [ ] GCS implementation.
- [ ] Persistent user database.
- [ ] Real JWT/session auth.
- [ ] Server-side invite storage.
- [ ] Audit log persistence.

## Current Go/No-Go

**Current decision:** `NO-GO for full production E2E`  
**Reason:** AWS/Azure CORS and GCS setup still need final configuration.  
**Next action:** Configure CORS, rotate credentials, add GCS service account details, redeploy, then run production E2E.
