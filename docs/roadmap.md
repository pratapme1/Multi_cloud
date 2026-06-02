# Roadmap - Multi-Cloud Storage Integration

**Last updated:** 2026-06-02

## Current Delivery Snapshot

The project is ahead of the original UI milestone in some areas and blocked by deployment/storage configuration in one critical area.

## Delivered

| Area | Status |
|------|--------|
| Node.js backend | Delivered |
| React/Vite frontend | Delivered |
| AWS provider | Delivered |
| Azure provider | Delivered |
| GCS placeholder | Delivered |
| Local E2E with AWS + Azure | Delivered |
| Vercel frontend deployment setup | Delivered |
| Vercel API route structure | Delivered |
| Direct-to-cloud upload architecture | Delivered |
| Role management UI | Delivered |
| Invite-link prototype | Delivered |
| Long filename hardening | Delivered |
| Supabase auth/schema | Delivered |

## Now / Next

### Step 1 - Unblock Production Upload

Configure CORS for:

```text
https://multi-cloud-cyan.vercel.app
```

Required on:

- AWS S3 bucket `multicloud-dev-anand`
- Azure Blob Storage account/container

Then validate:

- Upload 1 MB file from Vercel.
- Confirm object appears in AWS S3.
- Confirm blob appears in Azure container.

### Step 2 - GCS Setup

- Add GCP service account details when available.
- Implement the GCS provider.
- Enable GCS in upload/sync flows after provider validation.

### Step 3 - Production E2E

Run production flow:

```text
Super Admin login -> upload to AWS/Azure/GCS -> list -> download -> delete
Viewer login -> verify read-only behavior
Role Management -> create Admin invite -> signup -> verify Admin permissions
```

### Step 4 - Security Cleanup

- Rotate exposed AWS/Azure keys.
- Update Vercel environment variables.
- Confirm browser network responses do not expose credentials.
- Confirm `.env` remains ignored.

### Step 5 - Stabilize

- Add provider unit tests.
- Add API/RBAC tests for Supabase token validation and role permissions.
- Keep the single catch-all Vercel API route healthy as new backend endpoints are added.
- Update release checklist evidence.

## Later

- Add refresh-token/session renewal handling.
- Add invite email delivery.
- Add audit logging.
- Add production monitoring.
