# Risk Log - Multi-Cloud Storage Integration

**Last updated:** 2026-06-02

## Active Risks

| ID | Risk | Level | Status | Mitigation / Next Step |
|----|------|-------|--------|------------------------|
| R01 | Cloud credentials exposed in chat/history | High | Active | Rotate AWS access key and Azure storage key, then update `.env` and Vercel env vars. |
| R02 | Vercel direct upload blocked by AWS/Azure CORS | High | Active | Add CORS rules for `https://multi-cloud-cyan.vercel.app` to S3 and Azure Blob. |
| R03 | GCS not implemented | Medium | Accepted | Keep disabled placeholder until GCP service account and bucket are ready. |
| R04 | Supabase auth needs production validation | High | Active | Supabase Auth code is implemented; apply schema, validate token expiry/session behavior, and add RBAC tests before production use. |
| R05 | Duplicate Vercel API route locations may create maintenance drift | Medium | Active | Keep temporarily while deployment root was uncertain; consolidate after Vercel root is confirmed. |
| R06 | Direct upload exposes object names in signed URLs | Medium | Active | Accept for prototype; add object key sanitization/prefixing later. |
| R07 | Lack of automated tests for providers/RBAC | Medium | Active | Add unit/API tests after CORS unblock. |

## Closed / Mitigated

| ID | Risk | Outcome |
|----|------|---------|
| R08 | Vercel function payload too large for upload | Mitigated with signed direct-to-cloud upload URLs. |
| R09 | Long filenames break UI layout | Mitigated with truncation, wrapping, and `minmax(0, 1fr)` layout fixes. |
| R10 | Admin/viewer login broken due missing API routes | Mitigated by explicit Vercel API routes; verify on latest deployment. |

## Highest Priority

1. Rotate exposed keys.
2. Configure AWS/Azure CORS.
3. Run production E2E.
