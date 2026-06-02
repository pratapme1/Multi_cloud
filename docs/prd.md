# Product Requirements Document - Multi-Cloud Storage Integration

**Version:** 3.0  
**Date:** 2026-06-02  
**Status:** Current

## Product Goal

Provide a web UI for uploading, listing, downloading, deleting, syncing, and managing access for files stored across cloud providers.

## Current Scope

| Area | Current State |
|------|---------------|
| Frontend | React / Vite app in `src/frontend` |
| Backend | Node.js / Express local API in `src/backend-node` |
| Deployment | Vercel static frontend + Vercel serverless API routes |
| Active providers | AWS S3, Azure Blob |
| Placeholder provider | GCS |
| Auth | Mock tokens + browser-local prototype users |
| Roles | Super Admin, Admin, Viewer |

## Roles

| Role | Capabilities |
|------|--------------|
| Super Admin | Role management, invite links, upload, sync, delete, download, file list, health |
| Admin | Upload, sync, delete, download, file list, health |
| Viewer | File list, download, health |

Built-in demo users:

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | Super Admin |
| viewer | View@123 | Viewer |

## Implemented User Flows

- Login with built-in accounts.
- Signup new browser-local user.
- Super Admin creates manual invite links for Super Admin/Admin/Viewer.
- Invited signup inherits selected role.
- File list with AWS/Azure/GCS visual provider status.
- Upload modal with AWS + Azure active and GCS placeholder.
- Download from first available provider.
- Delete for roles with delete permission.
- Sync AWS -> Azure for roles with sync permission.
- Health drawer.
- Long filename handling across modal/table/card/drawer.

## API Contract

### Auth

```text
POST /api/auth/login
```

### Files

```text
GET    /api/files?provider=all|aws|azure
POST   /api/files/upload
POST   /api/files/upload-url
GET    /api/files/download/:filename?provider=aws|azure
DELETE /api/files/:filename?provider=aws|azure
```

`/api/files/upload-url` is used on Vercel to avoid serverless payload limits. It returns short-lived signed URLs and the browser uploads directly to AWS/Azure.

### Sync

```text
POST /api/sync
```

### Health

```text
GET /api/health
GET /api/test-credentials
```

## Deployment Requirements

Vercel should deploy from repository root:

```text
Root Directory: ./
Framework: Vite
Install Command: npm install && npm install --prefix src/frontend
Build Command: cd src/frontend && npm run build
Output Directory: src/frontend/dist
```

Environment variables must be configured in Vercel for AWS and Azure.

## Current Blocker

Direct browser upload requires CORS on AWS S3 and Azure Blob for:

```text
https://multi-cloud-cyan.vercel.app
```

Observed failure:

```text
OPTIONS 403 Forbidden
```

## Deferred / Out of Scope for Current Prototype

- Real GCS implementation.
- Production E2E automation after GCS setup.
- Persistent user database.
- Refresh-token/session renewal UX.
- Server-side invite storage.
- Full automated test suite.
- Audit log persistence.
