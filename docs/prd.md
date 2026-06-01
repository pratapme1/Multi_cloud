# Product Requirements Document - Multi-Cloud Storage Integration

**Version:** 2.0 | **Date:** 2026-06-01 | **Status:** Current  
**Stack:** Node.js / Express + React / Vite

---

## 1. Current Implementation Structure

```text
src/
  backend-node/
    server.js
    utils.js
    providers/
      aws.js
      azure.js
      gcs.js          # placeholder for now
    package.json
  frontend/
    src/
      api/index.js
      components/
      context/
      pages/
      App.jsx
      main.jsx
    vite.config.js
    package.json
```

---

## 2. Provider Status

| Provider | Status | Notes |
|----------|--------|-------|
| AWS S3 | Active | Real list/upload/download/delete through `@aws-sdk/client-s3` |
| Azure Blob | Active | Real list/upload/download/delete through `@azure/storage-blob` |
| GCS | Placeholder | Visible in UI, not used for local testing yet |

---

## 3. Local Run Commands

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

---

## 4. Environment Variables

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

AZURE_CONNECTION_STRING=
AZURE_CONTAINER_NAME=

GCS_PROJECT_ID=
GCS_BUCKET_NAME=
GCS_SERVICE_ACCOUNT_JSON_PATH=

ACTIVE_PROVIDER=aws
JWT_SECRET=
JWT_EXPIRY_HOURS=24
```

GCS variables may stay blank while GCS is a placeholder.

---

## 5. API Contract

Base URL in local development:

```text
http://localhost:3001/api
```

The frontend uses `/api/*` and Vite proxies to the Node backend.

### Auth

`POST /api/auth/login`

```json
{ "username": "admin", "password": "Admin@123" }
```

Demo users:

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | admin |
| viewer | View@123 | viewer |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files?provider=all|aws|azure` | List files |
| POST | `/api/files/upload` | Multipart upload. Form fields: `file`, `providers` JSON array |
| GET | `/api/files/download/:filename?provider=aws|azure` | Download file |
| DELETE | `/api/files/:filename?provider=aws|azure` | Delete file |

### Sync

`POST /api/sync`

```json
{ "from": "aws", "targets": ["azure"] }
```

### Health

`GET /api/health`

Returns provider health, with GCS allowed to report pending while it is a placeholder.

---

## 6. M1 Acceptance Focus

- AWS list/upload/download/delete works with real S3 bucket.
- Azure list/upload/download/delete works with real Blob container.
- Frontend can log in, upload to AWS + Azure, list files, download, and delete as admin.
- Viewer role receives `403` for upload/delete.
- GCS remains visible but disabled/placeholder in upload and sync flows.

---

## 7. Deferred

- GCS implementation.
- Persistent user database.
- JWT token signing and validation.
- Production deployment packaging.
