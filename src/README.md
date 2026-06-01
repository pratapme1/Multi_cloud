# Running the App Locally

## Backend - Node / Express

```powershell
cd src/backend-node
npm.cmd start
```

Runs on:

```text
http://localhost:3001
```

Useful checks:

```text
GET http://localhost:3001/api/test-credentials
GET http://localhost:3001/api/health
```

## Frontend - React / Vite

```powershell
cd src/frontend
npm.cmd run dev
```

Runs on:

```text
http://localhost:5173
```

The frontend calls `/api/*`, and Vite proxies those requests to the Node backend on `localhost:3001`.

## Demo Credentials

- `admin` / `Admin@123` - upload, delete, sync
- `viewer` / `View@123` - read-only

## Current Provider Status

- AWS S3: enabled for real list/upload/download/delete
- Azure Blob: enabled for real list/upload/download/delete
- GCS: placeholder only for now

GCS remains visible in the UI as a future provider, but upload and sync defaults use only AWS + Azure for local testing.
