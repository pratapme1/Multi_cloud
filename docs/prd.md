# Product Requirements Document — Multi-Cloud Storage Integration

**Version:** 1.0 | **Date:** 2026-05-29 | **Status:** Approved
**Stack:** C# .NET 8 + ASP.NET Core + React (Vite) + Bootstrap 5 + SQLite + Azure App Service

> This document is the single source of truth for what to build. Every feature maps to backlog tasks.
> Scope is fixed to the items in this document — see charter.md for success criteria.

---

## 1. Project Structure

```
MultiCloudStorage/
├── src/
│   ├── MultiCloudStorage.API/               # ASP.NET Core Web API — entry point
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── FilesController.cs
│   │   │   ├── SyncController.cs
│   │   │   └── HealthController.cs
│   │   ├── Middleware/
│   │   │   └── (JWT + RBAC handled via ASP.NET Core attributes)
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── wwwroot/                         # React build output (copied at deploy)
│   ├── MultiCloudStorage.Core/              # Interfaces + models + services
│   │   ├── Interfaces/
│   │   │   └── IStorageProvider.cs
│   │   ├── Models/
│   │   │   ├── StorageFile.cs
│   │   │   ├── SyncResult.cs
│   │   │   ├── RedundantUploadResult.cs
│   │   │   └── User.cs
│   │   └── Services/
│   │       ├── StorageFactory.cs
│   │       ├── SyncService.cs
│   │       └── RedundantUploadService.cs
│   ├── MultiCloudStorage.Infrastructure/    # SDK implementations + EF Core data
│   │   ├── Storage/
│   │   │   ├── AwsS3Provider.cs
│   │   │   ├── AzureBlobProvider.cs
│   │   │   └── GcsProvider.cs
│   │   └── Data/
│   │       ├── AppDbContext.cs
│   │       └── Migrations/
│   └── MultiCloudStorage.Tests/            # xUnit unit tests
│       └── Storage/
│           ├── AwsS3ProviderTests.cs
│           ├── AzureBlobProviderTests.cs
│           └── GcsProviderTests.cs
└── frontend/                               # React (Vite) app
    ├── src/
    │   ├── components/
    │   │   ├── FileList.jsx
    │   │   ├── UploadModal.jsx
    │   │   └── NavBar.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   └── FilesPage.jsx
    │   ├── services/
    │   │   ├── api.js                       # axios base config + interceptors
    │   │   ├── authService.js
    │   │   └── fileService.js
    │   └── App.jsx
    └── package.json
```

---

## 2. NuGet Packages (Backend)

| Package | Purpose |
|---------|---------|
| AWSSDK.S3 | AWS S3 operations |
| Azure.Storage.Blobs | Azure Blob Storage operations |
| Google.Cloud.Storage.V1 | Google Cloud Storage operations |
| Microsoft.AspNetCore.Authentication.JwtBearer | JWT middleware |
| System.IdentityModel.Tokens.Jwt | JWT token generation |
| Microsoft.EntityFrameworkCore.Sqlite | SQLite via EF Core |
| BCrypt.Net-Next | Password hashing |
| dotenv.net | Load .env file in local development |
| xUnit | Unit test framework |
| Moq | Mocking in unit tests |

---

## 3. npm Packages (Frontend)

| Package | Purpose |
|---------|---------|
| axios | HTTP client for API calls |
| bootstrap | CSS framework |
| react-router-dom | Client-side routing (login → files) |

---

## 4. Database Schema

**Engine:** SQLite — single file (`app.db`) in the API project directory. Managed via Entity Framework Core migrations.

### Table: Users

```sql
CREATE TABLE Users (
    Id           INTEGER PRIMARY KEY AUTOINCREMENT,
    Username     TEXT    NOT NULL UNIQUE,
    Email        TEXT    NOT NULL UNIQUE,
    PasswordHash TEXT    NOT NULL,
    Role         TEXT    NOT NULL CHECK(Role IN ('admin', 'readonly')),
    CreatedAt    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**EF Core Model (User.cs):**
```csharp
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;  // "admin" | "readonly"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

**Seed data** — applied via `HasData` in EF Core migration or a startup seeder at first run:

| Username | Email | Password (plain) | Role |
|----------|-------|-----------------|------|
| admin | admin@app.local | Admin@123 | admin |
| viewer | viewer@app.local | View@123 | readonly |

Passwords are stored as BCrypt hashes. Plain-text values above are for first-login reference only — never stored.

---

## 5. Environment Variables

All keys below go in `.env` (local) and Azure App Service Application Settings (production).
`.env.example` with all key names (no values) must be committed to the repo.

```
# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# Azure Blob Storage
AZURE_CONNECTION_STRING=
AZURE_CONTAINER_NAME=

# Google Cloud Storage
GCS_PROJECT_ID=
GCS_BUCKET_NAME=
GCS_SERVICE_ACCOUNT_JSON_PATH=

# Active Provider — default for unified interface
# Values: aws | azure | gcs
ACTIVE_PROVIDER=aws

# JWT
JWT_SECRET=                   # min 32 chars, random string
JWT_EXPIRY_HOURS=24

# App
ASPNETCORE_ENVIRONMENT=Development
```

---

## 6. Shared Models (Core Layer)

```csharp
// IStorageProvider.cs — the contract all 3 providers implement
public interface IStorageProvider
{
    Task<UploadResult> UploadAsync(Stream fileStream, string fileName);
    Task<Stream> DownloadAsync(string fileName);
    Task<IEnumerable<StorageFile>> ListAsync();
    Task DeleteAsync(string fileName);
    string ProviderName { get; }
}

// StorageFile.cs
public record StorageFile(string Name, long SizeBytes, string Provider);

// UploadResult.cs
public record UploadResult(bool Success, string FileName, string? ErrorMessage);

// SyncResult.cs
public record SyncResult(int Copied, int Skipped, int Failed, List<string> FailedFiles);

// RedundantUploadResult.cs
public record RedundantUploadResult(
    string FileName,
    List<string> SucceededProviders,
    List<string> FailedProviders
);

// StorageException.cs — all provider errors wrap into this
public class StorageException : Exception
{
    public string Provider { get; }
    public StorageException(string message, string provider)
        : base(message) { Provider = provider; }
}
```

---

## 7. Feature Specifications

---

### F1 — AWS S3 Module

**Backlog tasks:** 1.1, 1.2
**Milestone:** M1

#### Backend — AwsS3Provider.cs

Implements `IStorageProvider`. Reads from configuration at injection time:
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` → `AmazonS3Client` credentials
- `AWS_BUCKET_NAME` → bucket for all operations

| Operation | SDK call | Notes |
|-----------|----------|-------|
| UploadAsync | `PutObjectAsync(PutObjectRequest)` | Set `InputStream` and `Key` |
| DownloadAsync | `GetObjectAsync(GetObjectRequest)` | Return `GetObjectResponse.ResponseStream` |
| ListAsync | `ListObjectsV2Async(ListObjectsV2Request)` | Single call, no pagination. Map each `S3Object` to `StorageFile`. |
| DeleteAsync | `DeleteObjectAsync(DeleteObjectRequest)` | |

Error handling: catch `AmazonS3Exception`, wrap as `StorageException(ex.Message, "aws")`.
`ProviderName` property returns `"aws"`.

#### Unit Tests — AwsS3ProviderTests.cs (xUnit + Moq)

Mock `IAmazonS3`. Test class uses constructor injection of the mock.

| Test | Verifies |
|------|---------|
| Upload_HappyPath | `PutObjectAsync` called once; returned `UploadResult.Success = true` |
| Download_HappyPath | `GetObjectAsync` called once; returns non-null stream |
| List_HappyPath | `ListObjectsV2Async` returns 2 objects; result contains 2 `StorageFile` |
| Delete_HappyPath | `DeleteObjectAsync` called once; no exception thrown |

---

### F2 — Azure Blob Module

**Backlog tasks:** 1.3, 1.4
**Milestone:** M1

#### Backend — AzureBlobProvider.cs

Implements `IStorageProvider`. Reads from configuration:
- `AZURE_CONNECTION_STRING` → `BlobServiceClient`
- `AZURE_CONTAINER_NAME` → `BlobContainerClient`

| Operation | SDK call | Notes |
|-----------|----------|-------|
| UploadAsync | `containerClient.GetBlobClient(fileName).UploadAsync(stream, overwrite: true)` | |
| DownloadAsync | `blobClient.OpenReadAsync()` | Returns stream directly |
| ListAsync | `containerClient.GetBlobsAsync()` | Iterate async enumerable; collect all items. Map `BlobItem` to `StorageFile`. |
| DeleteAsync | `blobClient.DeleteIfExistsAsync()` | |

Error handling: catch `RequestFailedException`, wrap as `StorageException(ex.Message, "azure")`.
`ProviderName` returns `"azure"`.

#### Unit Tests — AzureBlobProviderTests.cs

Mock `BlobContainerClient` using Moq. Same 4 happy-path tests as F1.

---

### F3 — GCS Module

**Backlog tasks:** 1.5, 1.6
**Milestone:** M1

#### Backend — GcsProvider.cs

Implements `IStorageProvider`. Reads from configuration:
- `GCS_SERVICE_ACCOUNT_JSON_PATH` → `StorageClient.Create(GoogleCredential.FromFile(path))`
- `GCS_BUCKET_NAME` → bucket for all operations
- `GCS_PROJECT_ID` → project identifier

| Operation | SDK call | Notes |
|-----------|----------|-------|
| UploadAsync | `storageClient.UploadObjectAsync(bucketName, fileName, null, stream)` | contentType = null (auto-detect) |
| DownloadAsync | `storageClient.DownloadObjectAsync(bucketName, fileName, memoryStream)` | Write to `MemoryStream`, seek to 0, return |
| ListAsync | `storageClient.ListObjectsAsync(bucketName)` | Iterate async; map `Google.Apis.Storage.v1.Data.Object` to `StorageFile` |
| DeleteAsync | `storageClient.DeleteObjectAsync(bucketName, fileName)` | |

Error handling: catch `Google.GoogleApiException`, wrap as `StorageException(ex.Message, "gcs")`.
`ProviderName` returns `"gcs"`.

#### Unit Tests — GcsProviderTests.cs

Mock `StorageClient` (abstract class — use a derived mock). Same 4 happy-path tests.

---

### F4 — Unified Storage Interface

**Backlog tasks:** 2.1, 2.2, 2.3, 2.4
**Milestone:** M2

#### Backend — StorageFactory.cs

Design pattern (D-003): **Factory**. `StorageFactory.GetProvider(name)` returns the correct `IStorageProvider`. All 3 providers are registered in DI and injected into the factory.

```csharp
public class StorageFactory
{
    private readonly IConfiguration _config;
    private readonly AwsS3Provider _aws;
    private readonly AzureBlobProvider _azure;
    private readonly GcsProvider _gcs;

    public StorageFactory(IConfiguration config,
        AwsS3Provider aws, AzureBlobProvider azure, GcsProvider gcs)
    { /* assign */ }

    public IStorageProvider GetProvider(string? providerName = null)
    {
        var name = (providerName ?? _config["ACTIVE_PROVIDER"] ?? "aws").ToLower();
        return name switch
        {
            "aws"   => _aws,
            "azure" => _azure,
            "gcs"   => _gcs,
            _ => throw new ArgumentException($"Unknown provider: {name}")
        };
    }
}
```

**Config swap test (2.4):** Change `ACTIVE_PROVIDER` in `.env` → restart → run the same list/upload/download/delete test → confirms different provider. Zero code change. PM verifies live at M2 gate.

---

### F5 — File Sync

**Backlog tasks:** 2.5, 2.6
**Milestone:** M2

#### Backend — SyncService.cs

```
SyncAsync(source: string, target: string) → SyncResult

Steps:
1. sourceProvider = factory.GetProvider(source)
2. targetProvider = factory.GetProvider(target)
3. sourceFiles = await sourceProvider.ListAsync()   → list of StorageFile
4. targetFiles  = await targetProvider.ListAsync()  → list of StorageFile
5. targetNames  = targetFiles.Select(f => f.Name).ToHashSet()
6. For each file in sourceFiles:
   a. If file.Name in targetNames → skipped++
   b. Else:
      - stream = await sourceProvider.DownloadAsync(file.Name)
      - try: await targetProvider.UploadAsync(stream, file.Name) → copied++
      - catch StorageException: failed++; add file.Name to failedFiles
7. Return SyncResult { Copied, Skipped, Failed, FailedFiles }
```

**Idempotency:** Filename-based comparison means running sync twice naturally produces `{copied:0, skipped:N, failed:0}` on the second run. No special handling needed.

**Constraints:**
- Source and target must be different providers — return error if same
- File size check is out of scope for MVP (filename only)

---

### F6 — Redundant Upload

**Backlog task:** 2.7
**Milestone:** M2

#### Backend — RedundantUploadService.cs

```
UploadToMultipleAsync(fileStream: Stream, fileName: string, providers: string[]) → RedundantUploadResult

Steps:
1. For each providerName in providers:
   a. fileStream.Seek(0, SeekOrigin.Begin)   ← reset stream for each provider
   b. provider = factory.GetProvider(providerName)
   c. try: await provider.UploadAsync(stream, fileName) → add to succeeded
   d. catch StorageException: add providerName to failed
2. Return RedundantUploadResult { FileName, SucceededProviders, FailedProviders }
```

**Rule:** Never rethrow. Partial failure is a valid outcome — caller receives the full report. It is the caller's responsibility to decide if partial success is acceptable.

---

### F7 — User Authentication

**Backlog tasks:** 3.1, 3.3, 3.4, 3.5
**Milestone:** M3
**Auth approach (D-004):** JWT Bearer tokens

#### Database

Table `Users` — see Section 4.

#### Backend — AuthController.cs

**POST /api/auth/login**

Request body:
```json
{ "username": "admin", "password": "Admin@123" }
```

Logic:
1. Look up user by `Username` (case-insensitive)
2. If not found: return 401 (same message — do not reveal if username exists)
3. `BCrypt.Verify(password, user.PasswordHash)` → if false: return 401
4. Generate JWT:
   - Claims: `sub` (userId), `username`, `role`
   - Signed with `JWT_SECRET`
   - Expires: `DateTime.UtcNow.AddHours(JWT_EXPIRY_HOURS)`
5. Return 200

Response 200:
```json
{ "token": "eyJ...", "role": "admin", "username": "admin" }
```

Response 401:
```json
{ "error": "Invalid username or password" }
```

---

**POST /api/auth/logout**

JWT is stateless — no server-side session to invalidate.
Response 200: `{ "message": "Logged out" }`
Frontend clears JWT from `localStorage` on receiving this response.

---

**GET /api/auth/me**

Requires valid JWT in `Authorization: Bearer <token>` header.
Response 200: `{ "username": "admin", "role": "admin" }`
Response 401: `{ "error": "Unauthorized" }`

---

#### Auth Middleware (Program.cs configuration)

Add `AddAuthentication(JwtBearerDefaults.AuthenticationScheme)` with JWT validation parameters:
- `ValidateIssuerSigningKey: true` — verify signature with `JWT_SECRET`
- `ValidateLifetime: true` — reject expired tokens
- `ValidateAudience: false`, `ValidateIssuer: false` — single app, no need

Apply `[Authorize]` to all `/api/files` and `/api/sync` endpoints. Unauthenticated requests return 401 automatically.

---

### F8 — Role-Based Access Control (RBAC)

**Backlog task:** 3.6
**Milestone:** M3

Enforced at the controller level using `[Authorize(Roles = "admin")]`.

| Endpoint | Admin | Readonly |
|----------|-------|----------|
| GET /api/files | ✓ | ✓ |
| GET /api/files/download | ✓ | ✓ |
| POST /api/files/upload | ✓ | ✗ 403 |
| DELETE /api/files | ✓ | ✗ 403 |
| POST /api/sync | ✓ | ✗ 403 |
| GET /api/health | ✓ (no auth needed) | ✓ |

Response 403:
```json
{ "error": "Forbidden: admin role required" }
```

**Rule:** RBAC is enforced at the API layer only. UI hiding (3.15) is deferred — the API is the security boundary.

---

### F9 — REST API: File Endpoints

**Backlog task:** 3.7
**Milestone:** M3

All endpoints under `/api/files`. All require `[Authorize]`. Upload and delete additionally require `[Authorize(Roles = "admin")]`.

---

**GET /api/files**

Query param: `?provider=aws|azure|gcs` (optional — defaults to `ACTIVE_PROVIDER` if omitted)

Logic: `storageFactory.GetProvider(provider).ListAsync()`

Response 200:
```json
[
  { "name": "report.pdf", "sizeBytes": 45234, "provider": "aws" },
  { "name": "image.png",  "sizeBytes": 12000, "provider": "aws" }
]
```

Response 500: `{ "error": "Failed to list files: <message>" }`

---

**POST /api/files/upload**

Auth: admin only
Content-Type: `multipart/form-data`

Form fields:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| file | binary | yes | The file to upload |
| provider | string | yes | `aws` \| `azure` \| `gcs` \| `all` |

Logic:
- If `provider = "all"`: call `RedundantUploadService.UploadToMultipleAsync(stream, fileName, ["aws","azure","gcs"])`
- Otherwise: `storageFactory.GetProvider(provider).UploadAsync(stream, fileName)`

Response 200 (single provider):
```json
{ "fileName": "report.pdf", "provider": "aws", "success": true }
```

Response 200 (all providers):
```json
{
  "fileName": "report.pdf",
  "succeededProviders": ["aws", "azure"],
  "failedProviders": ["gcs"]
}
```

Response 400: `{ "error": "No file provided" }`

---

**GET /api/files/download**

Query params: `?fileName=report.pdf&provider=aws`

Logic: `storageFactory.GetProvider(provider).DownloadAsync(fileName)` → stream to response

Response headers:
```
Content-Disposition: attachment; filename="report.pdf"
Content-Type: application/octet-stream
```

Response 404: `{ "error": "File not found" }`

---

**DELETE /api/files**

Auth: admin only
Query params: `?fileName=report.pdf&provider=aws`

Logic: `storageFactory.GetProvider(provider).DeleteAsync(fileName)`

Response 200: `{ "message": "Deleted successfully" }`
Response 404: `{ "error": "File not found" }`

---

### F10 — REST API: Sync & Health

**Backlog task:** 3.8
**Milestone:** M3

---

**POST /api/sync**

Auth: admin only
Request body:
```json
{ "source": "aws", "target": "azure" }
```

Validation: source and target must be different; both must be valid provider names.

Logic: `syncService.SyncAsync(source, target)`

Response 200:
```json
{ "copied": 3, "skipped": 2, "failed": 0, "failedFiles": [] }
```

Response 400: `{ "error": "Source and target must be different providers" }`

---

**GET /api/health**

No auth required. Calls `ListAsync()` on all 3 providers. Returns individual status per provider.

Response 200 (all healthy):
```json
{
  "status": "ok",
  "providers": {
    "aws":   "ok",
    "azure": "ok",
    "gcs":   "ok"
  }
}
```

Response 200 (degraded):
```json
{
  "status": "degraded",
  "providers": {
    "aws":   "ok",
    "azure": "error: Connection refused",
    "gcs":   "ok"
  }
}
```

Note: Always returns HTTP 200 — the health payload itself contains the status. Use this endpoint for the go-live readiness check.

---

### F11 — Web UI: Login Screen

**Backlog task:** 3.9
**Milestone:** M3
**Component:** `LoginPage.jsx`

#### Layout (Bootstrap)

Centered card, mid-page:
```
┌──────────────────────────────────┐
│  Multi-Cloud Storage             │
│                                  │
│  Username  [________________]    │
│  Password  [________________]    │
│                                  │
│           [  Sign In  ]          │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Error message (if any)   │  ← red alert, hidden by default
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

#### State Machine

| State | What changes |
|-------|-------------|
| Default | Empty fields, Sign In button enabled |
| Submitting | Sign In button disabled, text = "Signing in..." |
| Error | Red Bootstrap alert below form: "Invalid username or password." Password field cleared |
| Network error | Red alert: "Connection error — please try again." |
| Success | Store token + role in `localStorage`. Navigate to `/files`. |

#### `localStorage` keys

| Key | Value |
|-----|-------|
| `auth_token` | JWT string |
| `auth_role` | `"admin"` or `"readonly"` |
| `auth_username` | username string |

#### API Call

```javascript
// authService.js
export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  return res.data;  // { token, role, username }
}
```

On success: save to localStorage → navigate to `/files`.
On 401: show error alert.

---

### F12 — Web UI: File List

**Backlog task:** 3.10
**Milestone:** M3
**Components:** `FilesPage.jsx` (page) + `FileList.jsx` (table component)

#### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Multi-Cloud Storage                        [Logout]      │  ← NavBar
├──────────────────────────────────────────────────────────┤
│  Files                          [+ Upload]  ← admin only │
│                                                          │
│  ┌──────┬───────┬──────────┬──────────────────────────┐ │
│  │ Name │ Size  │ Provider │ Actions                  │ │
│  ├──────┼───────┼──────────┼──────────────────────────┤ │
│  │ a.pdf│ 44 KB │ [AWS]    │ [Download] [Delete]      │ │
│  │ b.png│ 12 KB │ [Azure]  │ [Download] [Delete]      │ │
│  └──────┴───────┴──────────┴──────────────────────────┘ │
│                                                          │
│  Empty state: "No files found."                          │
│  Error state: "Failed to load files: <message>"          │
└──────────────────────────────────────────────────────────┘
```

#### Provider Badges (Bootstrap badge component)

| Provider | Badge colour |
|----------|-------------|
| aws | `bg-warning text-dark` (orange) |
| azure | `bg-primary` (blue) |
| gcs | `bg-success` (green) |

#### File Size Formatting

```javascript
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
```

#### States

| State | Display |
|-------|---------|
| Loading | Text: "Loading files..." |
| Empty | Text: "No files found." |
| Loaded | Table with rows |
| Error | Bootstrap danger alert with message |

#### Actions

**Download:** `GET /api/files/download?fileName=X&provider=Y`
Trigger browser download using a hidden `<a>` tag with a blob URL, or direct link.

**Delete:** Call `window.confirm("Delete \"fileName\"? This cannot be undone.")`. If confirmed, call `DELETE /api/files?fileName=X&provider=Y`. On success, reload the file list.

**Upload button:** Visible only when `localStorage.auth_role === 'admin'`. Opens `UploadModal`.

#### On Mount

```javascript
useEffect(() => {
  fileService.listFiles().then(setFiles).catch(setError);
}, []);
```

`listFiles()` calls `GET /api/files` (uses `ACTIVE_PROVIDER` default on backend).

---

### F13 — Web UI: Upload Modal

**Backlog task:** 3.11
**Milestone:** M3
**Component:** `UploadModal.jsx`

#### Layout (Bootstrap Modal)

```
┌────────────────────────────────────────┐
│  Upload File                       [×] │
├────────────────────────────────────────┤
│                                        │
│  File    [  Choose File  ] no file...  │
│                                        │
│  Provider  [AWS S3          ▼]         │
│            AWS S3                      │
│            Azure Blob Storage          │
│            Google Cloud Storage        │
│            All Providers               │
│                                        │
│  [Cancel]              [Upload]        │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ Success / Error message        │   │
│  └────────────────────────────────┘   │
└────────────────────────────────────────┘
```

#### State Machine

| State | Upload button | Message area |
|-------|--------------|-------------|
| Default | Disabled (no file selected) | — |
| File selected | Enabled | — |
| Uploading | Disabled, text "Uploading..." | — |
| Success | — | Green alert: "Upload successful." + Close button |
| Error | Enabled (retry) | Red alert: "Upload failed: \<message\>" |

#### Props

```javascript
<UploadModal
  show={boolean}
  onClose={() => void}
  onSuccess={() => void}   // parent reloads file list
/>
```

#### API Call

```javascript
// fileService.js
export async function uploadFile(file, provider) {
  const form = new FormData();
  form.append('file', file);
  form.append('provider', provider);
  const res = await api.post('/files/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}
```

On success: show success alert, call `onSuccess()` after 1 second to refresh list.

---

### F14 — Web UI: Delete Confirmation

**Backlog task:** 3.12
**Milestone:** M3

No custom component. Use browser's native `window.confirm()` in the FileList delete handler:

```javascript
async function handleDelete(fileName, provider) {
  if (!window.confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
  try {
    await fileService.deleteFile(fileName, provider);
    setFiles(files.filter(f => !(f.name === fileName && f.provider === provider)));
  } catch (err) {
    alert(`Delete failed: ${err.message}`);
  }
}
```

---

### F15 — API Client Setup (Frontend)

**File:** `frontend/src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',     // relative — works for both local dev proxy and production
  timeout: 30000
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

**Vite proxy config** (`vite.config.js`) — for local development only:

```javascript
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

---

### F16 — Deployment

**Backlog tasks:** 3.2, 3.18, 3.20
**Milestone:** M3
**Target:** Azure App Service (free tier F1)

#### Build Steps

1. Build React app:
   ```
   cd frontend && npm run build
   ```
   Output: `frontend/dist/`

2. Copy dist to backend wwwroot:
   ```
   cp -r frontend/dist/* src/MultiCloudStorage.API/wwwroot/
   ```

3. Publish .NET app:
   ```
   dotnet publish src/MultiCloudStorage.API -c Release -o ./publish
   ```

4. Deploy to Azure App Service:
   - Via Azure CLI: `az webapp deploy` or zip deploy via portal
   - Set all `.env` keys as Application Settings in Azure Portal

#### Azure App Service Configuration

- Runtime: .NET 8
- Plan: Free tier F1
- App Settings: one entry per `.env` key (no `.env` file on the server)
- Startup command: (default — `dotnet MultiCloudStorage.API.dll`)
- SPA routing: configure ASP.NET Core to serve `index.html` for unmatched routes:

```csharp
// In Program.cs — after API routes
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
```

#### README requirements (3.20)

Minimum content:
1. Prerequisites: .NET 8 SDK, Node.js 18+, cloud accounts provisioned
2. Clone → copy `.env.example` to `.env` → fill in all values
3. Run locally: `dotnet run` (backend, port 5000) + `npm run dev` (frontend, port 5173)
4. Full table of all env variables with descriptions and example values
5. How to run tests: `dotnet test`

---

## 8. Security Checklist (Pre-Go-Live)

| Check | Owner | How to verify |
|-------|-------|--------------|
| No credentials in any committed file | Dev + PM | `git grep -i "AWS_SECRET\|CONNECTION_STRING\|PRIVATE_KEY"` returns nothing |
| `.env` in `.gitignore` | Dev | `git status` shows `.env` as untracked |
| `*.json` service account files in `.gitignore` | Dev | Same check |
| No cloud credentials in browser network tab | PM | Open DevTools → Network → check all `/api/*` responses |
| HTTPS on production URL | Dev | Browser padlock; redirect HTTP → HTTPS in App Service |
| JWT secret is at least 32 random chars | Dev | Check App Service Application Settings |
| Error messages do not expose stack traces | PM | Trigger a bad request in browser, check response body |
| Admin and readonly roles tested via API | PM | Postman: readonly token → DELETE → expect 403 |

---

## 9. Deferred Features (Post Go-Live)

These were removed from the go-live scope to fit within 2–3 hrs/day capacity. They do not need to be built before June 16.

| Feature | Backlog task | Why deferred |
|---------|-------------|--------------|
| Sync panel UI | 3.13 | Sync works via API; no UI needed for charter compliance |
| Admin panel UI | 3.14 | Users seeded at deploy; no user management UI needed |
| RBAC UI hiding | 3.15 | API enforcement satisfies charter criterion 5 |
| List pagination | 1.1, 1.3, 1.5 | Basic list sufficient for demo scale |
| Error-case unit tests | 1.2, 1.4, 1.6 | Anand covers via Postman integration testing |
| File size comparison in sync | 2.5 | Filename-only match is sufficient |
| Drag-and-drop upload | 3.11 | File picker is sufficient |
| Upload progress indicator | 3.11 | Success/error state is sufficient |
| Provider filter tabs | 3.10 | No filter UI; uses ACTIVE_PROVIDER default |
| Upload date column | 3.10 | Not a charter requirement |
