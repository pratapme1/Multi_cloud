# Backlog - Multi-Cloud Storage Integration

**Last updated:** 2026-06-02  
**Current phase:** AWS/Azure functional prototype + Vercel deployment hardening + Code-review fix queue

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
| C6 | GCS provider — full implementation | Done | listFiles, uploadFile, getFileContent, deleteFile, health all implemented. Live on Vercel: status ok, 153 ms. |
| C7 | Local AWS/Azure end-to-end Playwright flow | Done | 11/11 headed Playwright checks passed before deployment work. |
| C8 | Vercel frontend deployment config | Done | Root `vercel.json` added. |
| C9 | Vercel API routes | Done | Consolidated into one catch-all function to stay under the Hobby plan function limit. |
| C10 | Role model | Done | Super Admin, Admin, Viewer. |
| C11 | Manual invite-link flow | Done | Super Admin creates local invite links; signup inherits role. |
| C12 | Long filename UI hardening | Done | Modal, table, cards, drawer, upload states guarded. |
| C13 | Direct-upload architecture for Vercel | Done | Browser requests signed URLs and uploads directly to AWS/Azure. |
| C14 | Supabase auth integration | Done | Login/signup now use Supabase Auth tokens instead of mock/local browser users. |
| C15 | Server-side invite storage | Done | Invite links are stored in `multi_cloud.invites`. |
| C16 | Supabase schema setup | Done | `multi_cloud` schema is applied, exposed, and working. |

## Active Blockers

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| B1 | Configure AWS S3 CORS | Blocked | Vishnu / Cloud owner | Needed for direct browser upload from `https://multi-cloud-cyan.vercel.app`. Current symptom: `OPTIONS 403 Forbidden`. |
| B2 | Configure Azure Blob CORS | Blocked | Vishnu / Cloud owner | Needed for direct browser upload from `https://multi-cloud-cyan.vercel.app`. |
| B3 | Rotate exposed AWS/Azure credentials | Blocked | Vishnu / Cloud owner | Credentials were pasted into chat and must be treated as exposed. Rotate before final deployment. |

## Remaining Development Work

| ID | Task | Status | Priority | Notes |
|----|------|--------|----------|-------|
| D1 | Production E2E after GCS setup | Open | P0 | Test login -> upload -> list -> download -> delete on Vercel after AWS, Azure, and GCS are ready. |
| D2 | Improve upload success handling after direct upload | Open | P1 | Refresh file list and show per-provider success/failure cleanly after final cloud setup. |
| D3 | Add provider unit tests | Open | P1 | AWS/Azure happy-path and error-path tests. |
| D4 | Add API tests for auth/RBAC | Open | P1 | Verify Super Admin/Admin/Viewer behavior. |
| D5 | Harden Supabase auth edge cases | Open | P1 | Add refresh-token handling, expired-session UX, and production auth settings. |
| D6 | Implement GCS provider | Done | — | Completed 2026-06-02. All three providers live on Vercel. |
| D7 | Invite email delivery | Open | P2 | Current invite links are generated and copied manually. |
| D8 | Add audit trail persistence | Deferred | P2 | Current audit trail is presentational. |
| D9 | Clean up duplicate Vercel API structure | Done | Removed duplicate route trees; one catch-all API function remains. |
| D10 | Update documentation after full cloud validation | Open | P1 | Mark production upload as done once AWS/Azure/GCS verification is complete. |

## Code Review Fix Queue

Findings from full-codebase code review on 2026-06-02. Ranked by severity; implementation deferred — all items are Open.

| ID | Finding | Severity | Priority | File | Notes |
|----|---------|----------|----------|------|-------|
| CR1 | Remove `requireAuth` guard gap on `/api/test-credentials` | Security / High | P0 | `src/backend-node/server.js:286` | Unauthenticated callers get cloud-provider health details incl. bucket names and SDK errors. Add `requireAuth` or gate behind `NODE_ENV !== 'production'`. |
| CR2 | Fix drawer showing wrong file after sort or search | Correctness / High | P0 | `src/frontend/src/pages/FilesPage.jsx:109` | `selIdx` is page-relative; `handleSearch` and `handleSort` don't call `onCloseDrawer()`, so the drawer silently targets a different file — download and delete both act on the wrong item. |
| CR3 | Fix `Content-Disposition` header for non-ASCII filenames | Correctness / Medium | P1 | `src/backend-node/server.js:186` | `filename="${encodeURIComponent(...)}"` produces literal `%xx` strings in Firefox/Safari. Replace with RFC 5987 form: `filename*=UTF-8''${encodeURIComponent(filename)}`. |
| CR4 | Parallelize `HeadObjectCommand` calls in `listFiles()` | Performance / Medium | P1 | `src/backend-node/providers/aws.js:38` | Serial `await` inside `for` loop → O(N) sequential HTTP round-trips. Replace with `Promise.all()`. For 100 files: ~5 s saved per `GET /api/files` call. |
| CR5 | Fix inverted sort direction for `modified` column | UX / Medium | P1 | `src/frontend/src/pages/FilesPage.jsx:97` | Comparator is `b.modifiedTs - a.modifiedTs` so `asc` = newest-first (opposite of every other column). Arrow label and toggle order are both backwards. Flip the comparator to `a.modifiedTs - b.modifiedTs`. |
| CR6 | Guard `ensureBootstrapUsers()` with a module-level flag | Performance / Low | P2 | `src/backend-node/auth/supabaseAuth.js:107` | Called on every `signIn()` with no guard — 4 extra Supabase round-trips per login after bootstrap users already exist. Add `let bootstrapped = false` at module scope. |
| CR7 | Remove dead client-side role escalation code | Cleanup / Low | P2 | `src/frontend/src/context/AuthContext.jsx:26` | `if (username === 'admin' && role === 'admin') role = 'super_admin'` — this branch is permanently unreachable for bootstrap admin (already `super_admin` in DB) but will silently elevate any future user with that username/role combo. Delete the block. |
| CR8 | Replace hostname-sniff for direct-upload routing with env var only | Reliability / Low | P2 | `src/frontend/src/api/index.js:66` | `hostname.endsWith('vercel.app')` silently breaks on custom domains. Remove the hostname branch; rely solely on `VITE_DIRECT_UPLOADS=true` env flag. |

### Fix Priority Summary

- **P0 (must fix before production):** CR1 (security), CR2 (wrong-file data integrity)
- **P1 (fix in M2):** CR3 (filename encoding), CR4 (performance), CR5 (sort UX)
- **P2 (tidy up, low urgency):** CR6 (login latency), CR7 (dead code), CR8 (routing)

## Current Pending Summary

The main pending items are **AWS/Azure CORS**, **credential rotation**, **GCS service account setup**, and the **Code Review fix queue above**. P0 fixes (CR1, CR2) must land before the production go-live. Production E2E automation will run after GCS is configured so the test suite validates the full three-cloud flow.
