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

### Step 2 - Production E2E

Run production flow:

```text
Super Admin login -> upload -> list -> download -> delete
Viewer login -> verify read-only behavior
Role Management -> create Admin invite -> signup -> verify Admin permissions
```

### Step 3 - Security Cleanup

- Rotate exposed AWS/Azure keys.
- Update Vercel environment variables.
- Confirm browser network responses do not expose credentials.
- Confirm `.env` remains ignored.

### Step 4 - Stabilize

- Add provider unit tests.
- Add API/RBAC tests for Supabase token validation and role permissions.
- Clean up duplicate Vercel API route copies once deployment root is confirmed.
- Update release checklist evidence.

## Later

- Implement GCS.
- Add refresh-token/session renewal handling.
- Add invite email delivery.
- Add audit logging.
- Add production monitoring.
