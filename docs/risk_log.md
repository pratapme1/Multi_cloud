# Risk Log - Multi-Cloud Storage Integration

**Last updated:** 2026-06-02 (updated with code-review findings)

## Active Risks

| ID | Risk | Level | Status | Mitigation / Next Step |
|----|------|-------|--------|------------------------|
| R01 | Cloud credentials exposed in chat/history | High | Active | Rotate AWS access key and Azure storage key, then update `.env` and Vercel env vars. |
| R02 | Vercel direct upload blocked by AWS/Azure CORS | High | Active | Add CORS rules for `https://multi-cloud-cyan.vercel.app` to S3 and Azure Blob. |
| R03 | GCS not implemented | Medium | Accepted | Keep disabled placeholder until GCP service account and bucket are ready. |
| R04 | Supabase auth needs production validation | Medium | Active | Schema is applied/exposed and auth is working; validate token expiry/session behavior and add RBAC tests before production use. |
| R05 | Duplicate Vercel API route locations may create maintenance drift | Medium | Active | Keep temporarily while deployment root was uncertain; consolidate after Vercel root is confirmed. |
| R06 | Direct upload exposes object names in signed URLs | Medium | Active | Accept for prototype; add object key sanitization/prefixing later. |
| R07 | Lack of automated tests for providers/RBAC | Medium | Active | Add unit/API tests and production E2E after GCS setup. |
| R08 | `/api/test-credentials` is publicly accessible without auth | High | Active | Endpoint leaks bucket names and SDK error details to unauthenticated callers. Fix: add `requireAuth` middleware or gate on `NODE_ENV` (backlog CR1). Must close before production. |
| R09 | File drawer acts on wrong file after sort or search | High | Active | `selIdx` is page-relative; reordering/filtering without closing the drawer causes download/delete to target the wrong file. Fix: call `onCloseDrawer()` in `handleSearch` and `handleSort` (backlog CR2). Must close before production. |
| R10 | Non-ASCII filenames download with garbled `%xx` names | Medium | Active | `Content-Disposition` header uses percent-encoding inside a plain quoted-string; Firefox/Safari show literal `%xx` filename. Fix: RFC 5987 extended form (backlog CR3). |

## Closed / Mitigated

| ID | Risk | Outcome |
|----|------|---------|
| R08 | Vercel function payload too large for upload | Mitigated with signed direct-to-cloud upload URLs. |
| R09 | Long filenames break UI layout | Mitigated with truncation, wrapping, and `minmax(0, 1fr)` layout fixes. |
| R10 | Admin/viewer login broken due missing API routes | Mitigated by explicit Vercel API routes; verify on latest deployment. |

## Highest Priority

1. Rotate exposed keys (R01).
2. Fix unauthenticated `/api/test-credentials` endpoint — R08 / backlog CR1.
3. Fix wrong-file drawer bug after sort/search — R09 / backlog CR2.
4. Configure AWS/Azure CORS (R02).
5. Add GCS service account details and implementation (R03).
6. Fix Content-Disposition for non-ASCII filenames — R10 / backlog CR3.
7. Run production E2E after GCS setup.
