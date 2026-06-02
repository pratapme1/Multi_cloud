# Multi-Cloud Storage Integration

## Summary

Build a web app that lets users manage files across multiple cloud storage providers from one interface.

## Current Implementation

- Backend: Node.js / Express in `src/backend-node`
- Frontend: React / Vite in `src/frontend`
- Deployment: Vercel frontend + Vercel serverless API routes
- Active providers: AWS S3 and Azure Blob Storage
- Placeholder provider: Google Cloud Storage

## Current Status - 2026-06-02

AWS and Azure work locally with real file operations. The deployed Vercel app loads and API routes are present, but direct browser upload to AWS/Azure is blocked until storage CORS is configured for the Vercel domain.

Role management has been added with three roles:

- Super Admin
- Admin
- Viewer

Super Admin can create manual invite links that assign one of those roles during signup.

## Main Pending Items

- Configure AWS/Azure CORS for `https://multi-cloud-cyan.vercel.app`
- Rotate exposed cloud keys
- Validate production upload/list/download/delete after CORS
- Implement GCS
- Apply Supabase schema and finish production auth validation
