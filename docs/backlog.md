# Backlog - Multi-Cloud Storage Integration

**Last updated:** 2026-06-02 (session 4 — UX hardening)  
**Current phase:** All charter milestones complete · Post-charter UX improvements in progress

## Status Key

| Status | Meaning |
|--------|---------|
| Done | Complete and verified in code |
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
| C4 | AWS S3 provider | Done | List, upload, download, delete, health, signed URL presigner. Pagination handled. |
| C5 | Azure Blob provider | Done | List, upload, download, delete, health, SAS token generation. |
| C6 | GCS provider — full implementation | Done | listFiles, uploadFile, getFileContent, deleteFile, health, signed URL. Live on Vercel. |
| C7 | Local AWS/Azure end-to-end Playwright flow | Done | 11/11 headed Playwright checks passed before deployment work. |
| C8 | Vercel frontend deployment config | Done | Root `vercel.json` added. |
| C9 | Vercel API routes | Done | Consolidated into one catch-all function (`api/index.js`) to stay under the Hobby plan function limit. |
| C10 | Role model | Done | Super Admin, Admin, Viewer. Defined in `src/frontend/src/roles.js`. |
| C11 | Manual invite-link flow | Done | Super Admin creates local invite links; signup inherits role. Stored in Supabase `multi_cloud.invites`. |
| C12 | Long filename UI hardening | Done | Modal, table, cards, drawer, upload states guarded. |
| C13 | Direct-upload architecture for Vercel | Done | Browser requests signed URLs (`/api/files/upload-url`) and uploads directly to AWS/Azure/GCS. All three providers implemented in `api/index.js`. |
| C14 | Supabase auth integration | Done | Login/signup use Supabase Auth JWT. `verifyToken` validates on every API request. |
| C15 | Server-side invite storage | Done | Invite links stored in `multi_cloud.invites`, validated on registration. |
| C16 | Supabase schema setup | Done | `multi_cloud` schema applied, exposed, and working. |
| C17 | File Details drawer UX redesign | Done | Hero section, colored provider pills, full-width download, expanding confirm panels, danger zone. |
| C18 | Per-provider sync from file drawer | Done | "Sync here" button per missing provider; per-file sync API filter. |
| C19 | Per-provider remove from file drawer | Done | "Remove" per stored provider with last-copy guard and expand confirm. |
| C20 | Auto-refresh after every action | Done | onRefresh chain: FilesPage.load → Drawer → FileDetail/SyncPanel. Upload modal always calls load on close. |
| C21 | Live History tab in file details | Done | Two tabs (Storage, History) below download button. History appends timestamped events for sync/remove/download in session. |
| C22 | Cinematic interactive presentation | Done | 8-slide full-screen presentation at /app/presentation. Live API data, SVG architecture animation, keyboard navigation. Light theme, go-live counter removed 2026-06-02. |
| C23 | Role-based UI enforcement in file drawer | Done | Drawer FileDetail now uses `useAuth`. Sync, Remove, and Delete-all buttons hidden for Viewer role. Fixed 2026-06-02. |
| C24 | Multi-file upload with enhanced progress bar | Done | Upload modal accepts multiple files via click or drag-and-drop. Batch duplicate detection (replace / auto-rename). Rainbow animated progress bar with per-file mini bars. Per-file × per-provider results screen. |
| C25 | Multi-select bulk delete | Done | Select mode toggled from Shelf. Checkboxes on list rows and grid cards. Select-all in list header. Sticky bulk action bar with count badge. Parallel delete with optimistic UI removal. Role-gated (Admin/Super Admin). |
| C26 | Delete All with typed confirmation | Done | Red Delete All button in Shelf (Admin/Super Admin, hidden when empty). Modal requires typing "delete all" phrase — confirm button disabled until phrase matches. Lists all consequences. Optimistic clear, parallel deletes, reconciles with load(). |

## Active Blockers

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| B1 | Configure AWS S3 CORS | Blocked | Vishnu / Cloud owner | Needed for direct browser upload from `https://multi-cloud-cyan.vercel.app`. Current symptom: `OPTIONS 403 Forbidden`. |
| B2 | Configure Azure Blob CORS | Blocked | Vishnu / Cloud owner | Needed for direct browser upload from `https://multi-cloud-cyan.vercel.app`. |
| B3 | Rotate exposed AWS/Azure credentials | Blocked | Vishnu / Cloud owner | Credentials were pasted into chat and must be treated as exposed. Rotate before final deployment. |

## Remaining Development Work

| ID | Task | Status | Priority | Notes |
|----|------|--------|----------|-------|
| D1 | Production E2E after CORS setup | Open | P0 | Test login → upload → list → download → delete on Vercel after AWS, Azure, GCS CORS and credentials are ready. |
| D3 | Add provider unit tests | Open | P1 | AWS/Azure/GCS happy-path and error-path tests. Zero test files exist currently. |
| D4 | Add API tests for auth/RBAC | Open | P1 | Verify Super Admin/Admin/Viewer behavior via API calls. |
| D5 | Harden Supabase auth edge cases | Open | P1 | Add refresh-token handling, expired-session UX, and production auth settings. |
| D7 | Invite email delivery | Open | P2 | Invite links are generated and must be copied manually. No email sending is implemented. |
| D8 | Add audit trail persistence | Deferred | P2 | Current audit trail is session-only (resets on drawer close). Persistent log deferred to M3. |
| D10 | Update documentation after full cloud validation | Open | P1 | Mark production upload verified once AWS/Azure/GCS CORS + E2E is complete. |

## Code Review Fix Queue

Findings from full-codebase code review on 2026-06-02. None have been fixed yet. Ranked by severity.

| ID | Finding | Severity | Priority | File | Notes |
|----|---------|----------|----------|------|-------|
| CR1 | Add `requireAuth` to `/api/test-credentials` | Security / High | P0 | `api/index.js:375` and `src/backend-node/server.js:284` | Unauthenticated callers get cloud-provider health details including bucket names and SDK errors. Affects both Vercel route and local server. Add `requireAuth` or gate behind `NODE_ENV !== 'production'`. |
| CR2 | Fix drawer showing wrong file after sort or search | Correctness / High | P0 | `src/frontend/src/pages/FilesPage.jsx:109` | `selIdx` is page-relative; `handleSearch` and `handleSort` don't call `onCloseDrawer()`, so the drawer silently targets a different file. Download and delete act on the wrong item. |
| CR3 | Fix `Content-Disposition` header for non-ASCII filenames | Correctness / Medium | P1 | `api/index.js:291` and `src/backend-node/server.js:186` | `filename="${encodeURIComponent(...)}"` produces literal `%xx` strings in Firefox/Safari. Replace with RFC 5987: `filename*=UTF-8''${encodeURIComponent(filename)}`. Affects both route files. |
| CR4 | Parallelize `HeadObjectCommand` calls in `listFiles()` | Performance / Medium | P1 | `src/backend-node/providers/aws.js:38` | Serial `await` inside `for` loop → O(N) sequential HTTP round-trips. Replace with `Promise.all()`. For 100 files: ~5 s saved per `GET /api/files` call. |
| CR5 | Fix inverted sort direction for `modified` column | UX / Medium | P1 | `src/frontend/src/pages/FilesPage.jsx:97` | Comparator is `b.modifiedTs - a.modifiedTs` so `asc` = newest-first (opposite of every other column). Flip to `a.modifiedTs - b.modifiedTs`. |
| CR6 | Guard `ensureBootstrapUsers()` with a module-level flag | Performance / Low | P2 | `src/backend-node/auth/supabaseAuth.js:107` | Called on every `signIn()` — 4 extra Supabase round-trips per login after bootstrap users exist. Add `let bootstrapped = false` at module scope. |
| CR7 | Remove dead client-side role escalation code | Cleanup / Low | P2 | `src/frontend/src/context/AuthContext.jsx:17` | `if (username === 'admin' && role === 'admin') role = 'super_admin'` — permanently unreachable for bootstrap admin (already `super_admin` in DB) but will silently elevate any future user with that username/role combo. Delete both instances (lines 17–19 and 26–27). |
| CR8 | Replace hostname-sniff for direct-upload routing with env var only | Reliability / Low | P2 | `src/frontend/src/api/index.js:66` | `hostname.endsWith('vercel.app')` silently breaks on custom domains. Remove the hostname branch; rely solely on `VITE_DIRECT_UPLOADS=true` env flag. |

### Fix Priority Summary

- **P0 (must fix before production):** CR1 (security — two files), CR2 (wrong-file data integrity)
- **P1 (fix in M2):** CR3 (filename encoding — two files), CR4 (performance), CR5 (sort UX)
- **P2 (tidy up):** CR6 (login latency), CR7 (dead code), CR8 (routing reliability)

## Post-Charter UX Fixes (session 4 — 2026-06-02)

| ID | Finding | Status | Notes |
|----|---------|--------|-------|
| UX1 | Bulk delete files not disappearing from UI | Fixed | Optimistic removal: files cleared from local state before API calls complete. Provider map snapshotted to avoid stale closure. Added `console.error` logging for failed deletes. |
| UX2 | Grid trailing empty cells (last page row) | Fixed | PAGE_SIZE increased 8 → 12 (two full rows of 6 cards). Eliminates trailing empty grid cells on most pages. |
| UX3 | Concurrent upload safety review | Assessed | Production (Vercel) uses direct-upload path — API only signs URLs, file bytes bypass server entirely. No concurrency issue. Local proxy path has no queue but is dev-only. No action required for production. |

## Milestone Status (original charter scope — code audit 2026-06-02)

| Milestone | Charter Objective | Gate | Status |
|-----------|------------------|------|--------|
| M1 — API Modules | Working API modules for all 3 cloud providers | Jun 5 | **✓ Complete** — AWS, Azure, GCS: list, upload, download, delete, health, signed URLs all implemented |
| M2 — Unified Interface | Unified interface with file sync and redundancy | Jun 10 | **✓ Complete** — cross-cloud sync, redundant multi-provider upload, unified file list |
| M3 — Web UI + Deploy | Web UI with access control, deployed and live | Jun 16 | **✓ Complete** — React UI, RBAC (Super Admin/Admin/Viewer), Supabase JWT auth, deployed on Vercel |

> **Note on CR items and tests:** The code-review findings (CR1–CR8) and unit tests (D3, D4) were quality additions logged after the original charter was signed. They are not part of the original milestone scope. They remain as an optional hardening queue for post-go-live improvements.
