# Backlog - Multi-Cloud Storage Integration

**Last updated:** 2026-06-02  
**Current phase:** AWS/Azure functional prototype + Vercel deployment hardening

## Status Key

| Status | Meaning |
|--------|---------|
| Done | Complete and verified enough for current prototype |
| In Progress | Partially implemented or actively being worked |
| Blocked | Waiting on external setup or decision |
| Open | Not started |
| Deferred | Intentionally out of current scope |

## Completed

| ID | Task | Status | Notes |
|----|------|--------|-------|
| C1 | Move active backend from .NET to Node.js / Express | Done | Active backend is `src/backend-node`. |
| C2 | Build React/Vite frontend | Done | Active frontend is `src/frontend`. |
| C3 | Wire frontend to backend APIs | Done | Frontend uses `/api/*`; Vite proxies locally. |
| C4 | AWS S3 provider | Done | List, upload, download, delete, health implemented. |
| C5 | Azure Blob provider | Done | List, upload, download, delete, health implemented. |
| C6 | GCS placeholder | Done | Visible but disabled for upload/sync. |
| C7 | Local AWS/Azure end-to-end Playwright flow | Done | 11/11 headed Playwright checks passed before deployment work. |
| C8 | Vercel frontend deployment config | Done | Root `vercel.json` added. |
| C9 | Vercel API routes | Done | Explicit routes added under root `api/` and `src/frontend/api/`. |
| C10 | Role model | Done | Super Admin, Admin, Viewer. |
| C11 | Manual invite-link flow | Done | Super Admin creates local invite links; signup inherits role. |
| C12 | Long filename UI hardening | Done | Modal, table, cards, drawer, upload states guarded. |
| C13 | Direct-upload architecture for Vercel | Done | Browser requests signed URLs and uploads directly to AWS/Azure. |
| C14 | Supabase auth integration | Done | Login/signup now use Supabase Auth tokens instead of mock/local browser users. |
| C15 | Server-side invite storage | Done | Invite links are stored in `multi_cloud.invites`. |

## Active Blockers

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| B1 | Configure AWS S3 CORS | Blocked | Vishnu / Cloud owner | Needed for direct browser upload from `https://multi-cloud-cyan.vercel.app`. Current symptom: `OPTIONS 403 Forbidden`. |
| B2 | Configure Azure Blob CORS | Blocked | Vishnu / Cloud owner | Needed for direct browser upload from `https://multi-cloud-cyan.vercel.app`. |
| B3 | Rotate exposed AWS/Azure credentials | Blocked | Vishnu / Cloud owner | Credentials were pasted into chat and must be treated as exposed. Rotate before final deployment. |
| B4 | Apply Supabase schema | Blocked | Vishnu / Supabase owner | Migration is in `supabase/migrations`; local apply failed from this machine due DB host connectivity/reset. |

## Remaining Development Work

| ID | Task | Status | Priority | Notes |
|----|------|--------|----------|-------|
| D1 | Production E2E after CORS | Open | P0 | Test login -> upload -> list -> download -> delete on Vercel. |
| D2 | Improve upload success handling after direct upload | Open | P1 | Refresh file list and show per-provider success/failure cleanly after CORS is fixed. |
| D3 | Add provider unit tests | Open | P1 | AWS/Azure happy-path and error-path tests. |
| D4 | Add API tests for auth/RBAC | Open | P1 | Verify Super Admin/Admin/Viewer behavior. |
| D5 | Harden Supabase auth edge cases | Open | P1 | Add refresh-token handling, expired-session UX, and production auth settings. |
| D6 | Implement GCS provider | Deferred | P2 | Requires GCP bucket and service account JSON. |
| D7 | Invite email delivery | Open | P2 | Current invite links are generated and copied manually. |
| D8 | Add audit trail persistence | Deferred | P2 | Current audit trail is presentational. |
| D9 | Clean up duplicate Vercel API structure | Open | P2 | Keep both roots until Vercel root setting is confirmed stable. |
| D10 | Update documentation after CORS validation | Open | P1 | Mark production upload as done once verified. |

## Current Pending Summary

The main pending item is **cloud storage CORS**. The deployed app can generate signed upload URLs, but AWS/Azure reject browser preflight requests until their CORS rules allow the Vercel origin.
