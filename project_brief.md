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

AWS and Azure work locally with real file operations. The deployed Vercel app loads and uses direct browser upload to AWS/Azure, which requires storage CORS for the Vercel domain. Supabase auth/schema is applied, exposed, and working. GCS remains pending until service account details are available.

Role management has been added with three roles:

- Super Admin
- Admin
- Viewer

Super Admin can create manual invite links that assign one of those roles during signup.

## Main Pending Items

- Configure/confirm AWS/Azure CORS for direct browser upload
- Rotate exposed AWS/Azure credentials
- Implement GCS after service account details are available
- Run production E2E automation after GCS setup
