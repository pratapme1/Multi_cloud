# Deployment Status - Vercel + Direct Upload

**Last updated:** 2026-06-02

## Current Deployment

| Item | Value |
|------|-------|
| Frontend URL | `https://multi-cloud-cyan.vercel.app` |
| Deployment platform | Vercel |
| Recommended Root Directory | `./` |
| Frontend build output | `src/frontend/dist` |
| API routes | `api/` and `src/frontend/api/` |

## Direct Upload Architecture

Uploads on Vercel do not send the file through the Vercel function body. The browser now:

1. Calls `/api/files/upload-url`.
2. Receives short-lived AWS/Azure upload URLs.
3. Uploads the file directly to AWS S3 and Azure Blob with `PUT`.

This avoids Vercel's function payload limit.

## Current Blocker

Storage CORS is not configured yet. Current symptom:

```text
OPTIONS 403 Forbidden
```

This means the browser preflight request is blocked by AWS/Azure before the upload starts.

## Required AWS S3 CORS

AWS Console -> S3 -> `multicloud-dev-anand` -> Permissions -> CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": ["https://multi-cloud-cyan.vercel.app"],
    "ExposeHeaders": ["ETag", "x-amz-request-id", "x-amz-id-2"],
    "MaxAgeSeconds": 3000
  }
]
```

## Required Azure Blob CORS

Azure Portal -> Storage Account -> Resource sharing (CORS) -> Blob service:

```text
Allowed origins: https://multi-cloud-cyan.vercel.app
Allowed methods: PUT, GET, HEAD, OPTIONS
Allowed headers: *
Exposed headers: *
Max age: 3000
```

## Security Action

The AWS/Azure credentials used during troubleshooting were exposed in chat and must be rotated before final validation.

Pending:

- Rotate AWS IAM access key.
- Rotate Azure Storage account key.
- Update `.env`.
- Update Vercel Environment Variables.
- Redeploy latest `main`.
