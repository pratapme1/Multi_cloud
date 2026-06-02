# Multi-Cloud Storage Integration

Unified file management across AWS S3 and Azure Blob Storage, with Google Cloud Storage kept as a visible placeholder for now.

## Current Status

**Date:** 2026-06-02  
**Active stack:** Node.js / Express + React / Vite  
**Frontend deployment:** Vercel  
**Backend deployment path:** Single Vercel catch-all serverless function at `api/index.js`

### What Works

- React/Vite web UI with login, file list, upload modal, download, delete, sync drawer, health drawer, and role management.
- AWS S3 provider supports list, upload, download, delete, health.
- Azure Blob provider supports list, upload, download, delete, health.
- GCS is shown in the UI as a placeholder and intentionally disabled for upload/sync.
- Local end-to-end Playwright flow passed for AWS + Azure.
- Vercel frontend loads and API route structure has been added.
- Role model now supports:
  - Super Admin
  - Admin
  - Viewer
- Super Admin can create invite links manually and assign invited users to one of the three roles.
- Supabase Auth integration has been added for persistent users, real access tokens, and server-side invite storage in the `multi_cloud` schema.
- Supabase `multi_cloud` schema is applied, exposed, and working.
- Long filenames are now guarded in modal, table, card, drawer, and upload states.
- Vercel upload flow uses direct-to-cloud signed URLs to avoid Vercel payload limits.

### Current Cloud Setup Tasks

Direct browser upload from Vercel to AWS/Azure requires CORS on:

- AWS S3 bucket: `multicloud-dev-anand`
- Azure Blob Storage account/container

Storage CORS must allow:

```text
https://multi-cloud-cyan.vercel.app
```

## Run Locally

Backend:

```powershell
cd src/backend-node
npm.cmd start
```

Frontend:

```powershell
cd src/frontend
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

## Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | Super Admin |
| viewer | View@123 | Viewer |

Demo users are bootstrapped in Supabase on first login when `SUPABASE_BOOTSTRAP_DEMO_USERS` is not set to `false`.

## Environment Variables

Use `.env` locally and Vercel Environment Variables for deployment.

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

AZURE_CONNECTION_STRING=
AZURE_CONTAINER_NAME=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
POOLED_DATABASE_URL=
DIRECT_URL=

GCS_PROJECT_ID=
GCS_BUCKET_NAME=
GCS_SERVICE_ACCOUNT_JSON_PATH=
```

Do not commit real credentials.

## Vercel Deployment

Recommended Vercel settings:

```text
Root Directory: ./
Framework Preset: Vite
Install Command: npm install && npm install --prefix src/frontend
Build Command: cd src/frontend && npm run build
Output Directory: src/frontend/dist
```

After deploy, verify:

```text
https://multi-cloud-cyan.vercel.app/api/test-credentials
```

## Pending

- Configure AWS S3 and Azure Blob CORS for direct browser upload.
- Rotate exposed AWS/Azure credentials and update local/Vercel env vars.
- Implement GCS provider after service account details are available.
- Add automated unit tests for provider modules.
- Add production E2E automation after GCS is also configured.
