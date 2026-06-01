# Cloud Account Setup Guide — Multi-Cloud Storage Integration

> **Owner:** PM (Vishnu) — share this with Anushman before P.6/P.7/P.8 work begins
> **Purpose:** Step-by-step provisioning of GCP, AWS, and Azure free-trial accounts for development use.
> **Recommended order:** GCP first (most complex) → AWS → Azure
> **Prerequisite:** Complete P.5 (repo init + `.gitignore`) before creating any credentials.

---

## Before You Start — Read This First

| Item | Detail |
|------|--------|
| **Credit card required** | All 3 providers require a card for identity verification. You will NOT be charged unless you manually upgrade or exceed free-tier limits. |
| **UST email — Azure warning** | If UST uses Microsoft 365, your work email is already inside UST's Azure Active Directory tenant. Using it for the free trial may be blocked by IT policy or create the account under UST's control. **Use a personal Microsoft account for Azure.** AWS and GCP are safe to use with your work email. |
| **`.gitignore` first** | `.env` and `secrets/gcp-service-account.json` must be in `.gitignore` before you generate any credentials. If credentials are committed even once, treat them as compromised and rotate them. |
| **One person provisions** | Anushman provisions and holds all credentials. They go into `.env` on dev machine only. PM does not need the actual values — only that they work. |
| **GCP JSON key location** | Save it to `backend/secrets/gcp-service-account.json`. The `secrets/` folder must be in `.gitignore`. Never rename or move the file without updating `.env`. |

---

## `.gitignore` — Minimum Required Entries (Do P.5 First)

Before creating any account or credential, verify these lines are in the root `.gitignore`:

```
# Environment / secrets
.env
.env.local
.env.*.local

# GCP service account key
secrets/
*.json

# .NET build artifacts
bin/
obj/
*.user

# Node / React
node_modules/
dist/
.vite/

# IDE
.vs/
.vscode/
*.suo
*.user
```

---

## `.env.example` — Commit This File (No Values, Only Key Names)

```env
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
GCS_SERVICE_ACCOUNT_JSON_PATH=./backend/secrets/gcp-service-account.json

# Database (M3)
DB_CONNECTION_STRING=

# Auth (M3)
JWT_SECRET=

# App config
ACTIVE_PROVIDER=aws
```

---

## Part 1 — Google Cloud Platform (P.8)

**Free tier:** $300 credit + 90 days trial. Always Free: 5 GB GCS per month.
**Why first:** GCP has the most steps (project → API → bucket → service account → JSON key). Start here while the other accounts are being processed.

---

### 1.1 — Create a Google Cloud Account

1. Open a browser and go to: `cloud.google.com`
2. Click **Get started for free** (top right)
3. Sign in with your Google account
   - If UST uses Google Workspace, you can try your UST email — if it redirects to an org login or blocks free trial, use a personal Gmail account instead
4. On the registration form:
   - **Country:** Select your country
   - **Terms of Service:** Read and accept
5. Click **Continue**
6. **Account type:** Select **Individual**
7. Enter your **credit card details** (for verification only — not charged during free trial)
8. Click **Start my free trial**
9. You will land on the Google Cloud Console dashboard at `console.cloud.google.com`

---

### 1.2 — Create a Project

1. At the top of the Console, click the **project dropdown** (it may say "My First Project" or similar)
2. Click **New Project** (top right of the modal)
3. **Project name:** `multi-cloud-integration`
4. **Organization:** Leave as "No organization" unless you are in a Workspace account
5. Note the **Project ID** shown below the name (auto-generated, e.g. `multi-cloud-integration-123456`) — you will need this exact ID
6. Click **Create**
7. Wait a few seconds, then select the new project from the dropdown to make it active

---

### 1.3 — Enable the Cloud Storage API

1. Left sidebar → **APIs & Services** → **Library**
2. In the search bar, type `Cloud Storage`
3. Click **Cloud Storage JSON API** from the results
4. Click **Enable**
5. Wait for the API to activate (the button will change to "Manage" when done)

---

### 1.4 — Create a GCS Bucket

1. Left sidebar → **Cloud Storage** → **Buckets**
2. Click **Create**
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Bucket name** | Must be globally unique. Use: `multicloud-dev-[yourname]` e.g. `multicloud-dev-vishnu` |
| **Region** | `us-east1` (South Carolina) — single region is cheapest |
| **Storage class** | Standard |
| **Access control** | Uniform |
| **Public access** | Leave "Prevent public access" checked ON |
| **Data protection** | No retention policy needed — leave defaults |

4. Click **Create**
5. Confirm the bucket appears in your bucket list

---

### 1.5 — Create a Service Account

A service account is how the application authenticates to GCP — it is not a human user account.

1. Left sidebar → **IAM & Admin** → **Service Accounts**
2. Click **+ Create Service Account**
3. Fill in:
   - **Service account name:** `multicloud-dev-sa`
   - **Service account ID:** auto-fills as `multicloud-dev-sa` — leave it
   - **Description:** `Dev service account for multi-cloud project`
4. Click **Create and Continue**
5. On the "Grant this service account access to project" step:
   - Click the **Role** dropdown
   - Search for `Storage Admin`
   - Select **Cloud Storage > Storage Admin**
6. Click **Continue** → **Done**
7. The service account now appears in the list: `multicloud-dev-sa@[project-id].iam.gserviceaccount.com`

---

### 1.6 — Download the Service Account JSON Key

> This is the most sensitive file in the project. Treat it like a password.

1. Click on the service account you just created (`multicloud-dev-sa`)
2. Click the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** → Click **Create**
5. A `.json` file downloads automatically to your Downloads folder
6. Rename it to `gcp-service-account.json`
7. Move it to: `backend/secrets/gcp-service-account.json`
8. **Verify** the `secrets/` folder is listed in `.gitignore` before proceeding

---

### 1.7 — Verify the Credential Works (Anushman's step)

In a terminal, set the environment variable and list buckets to confirm auth works:

```bash
export GCS_SERVICE_ACCOUNT_JSON_PATH="./backend/secrets/gcp-service-account.json"
```

Then from a test script or the SDK, call `ListBuckets` for the project. The bucket `multicloud-dev-[yourname]` should appear in the response.

---

### 1.8 — Record in `.env`

```env
GCS_PROJECT_ID=multi-cloud-integration-123456
GCS_BUCKET_NAME=multicloud-dev-yourname
GCS_SERVICE_ACCOUNT_JSON_PATH=./backend/secrets/gcp-service-account.json
```

---

### GCP — Common Issues

| Problem | Fix |
|---------|-----|
| "Permission denied" when calling GCS | Check the service account has `Storage Admin` role, not just `Storage Object Viewer` |
| "Bucket name already exists" | Bucket names are globally unique across all GCP users — add more characters to the name |
| JSON key not found at runtime | Check that `GCS_SERVICE_ACCOUNT_JSON_PATH` in `.env` matches the actual file location relative to where the process starts |
| "API not enabled" error | Go back to APIs & Services → Library and confirm Cloud Storage JSON API is enabled |

---

## Part 2 — Amazon Web Services (P.6)

**Free tier:** 12 months. S3 free tier: 5 GB storage, 20,000 GET requests, 2,000 PUT requests/month.

---

### 2.1 — Create an AWS Account

1. Go to: `aws.amazon.com`
2. Click **Create an AWS account** (top right)
3. Fill in:
   - **Email address:** Your UST email (AWS does not conflict with corporate accounts the way Azure does)
   - **Password:** Strong password
   - **AWS account name:** `multicloud-dev` or your name
4. Click **Verify email address** — check your inbox and enter the verification code
5. Click **Continue**
6. **Contact information:**
   - Account type: **Personal**
   - Fill in name, phone, address
7. Click **Continue** → Enter credit card details → **Verify and Continue**
8. **Identity verification:** Enter phone number → choose call or text → enter the PIN you receive
9. **Support plan:** Select **Basic support — Free**
10. Click **Complete sign up**
11. Sign in to the AWS Console at `console.aws.amazon.com`

---

### 2.2 — Create an S3 Bucket

> Always choose the same region for all AWS resources to avoid cross-region charges.

1. In the Console, search for **S3** in the top search bar → click **S3**
2. Click **Create bucket**
3. Fill in:

| Field | Value |
|-------|-------|
| **Bucket name** | Globally unique. Use: `multicloud-dev-[yourname]` e.g. `multicloud-dev-vishnu` |
| **AWS Region** | `us-east-1` (N. Virginia) — default, cheapest, most SDK compatibility |
| **Object Ownership** | ACLs disabled (recommended) |
| **Block Public Access** | Leave all 4 checkboxes ON — bucket stays private |
| **Versioning** | Disabled (not needed for this project) |
| **Encryption** | Server-side encryption with S3 managed keys (SSE-S3) — leave default |

4. Click **Create bucket**
5. Confirm the bucket appears in your S3 bucket list

---

### 2.3 — Create an IAM User

> Never use root account credentials in code. Always create a dedicated IAM user.

1. Search for **IAM** in the Console → click **IAM**
2. Left sidebar → **Users** → **Create user**
3. **Username:** `multicloud-dev`
4. **Provide user access to AWS Management Console:** Leave unchecked (this user is for API access only)
5. Click **Next**
6. **Set permissions:** Choose **Attach policies directly**
7. Search for `AmazonS3FullAccess` → check the box next to it
8. Click **Next** → **Create user**

---

### 2.4 — Generate Access Keys

1. Click on the user `multicloud-dev` you just created
2. Click the **Security credentials** tab
3. Scroll down to **Access keys** → Click **Create access key**
4. **Use case:** Select **Application running outside AWS** → click **Next**
5. Description tag: `multicloud-dev-key` (optional but helpful)
6. Click **Create access key**
7. **Critical:** The **Secret access key** is shown only once. Either:
   - Click **Download .csv file** to save both keys, OR
   - Copy both values immediately into your `.env` file
8. Click **Done**

---

### 2.5 — Record in `.env`

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_BUCKET_NAME=multicloud-dev-yourname
```

---

### AWS — Common Issues

| Problem | Fix |
|---------|-----|
| "Access Denied" on S3 operations | Confirm IAM user has `AmazonS3FullAccess` policy attached, not just inline policy |
| "NoSuchBucket" error | Bucket name in `.env` must exactly match what was created in S3 console (case-sensitive) |
| "InvalidSignatureException" | Region in `.env` must match the region where the bucket was created |
| Secret key lost | You cannot retrieve it again. Go back to IAM → user → Security credentials → deactivate old key → create a new key |

---

## Part 3 — Microsoft Azure (P.7)

**Free tier:** $200 credit + 30 days. Azure Blob Storage: 5 GB LRS storage free for 12 months.

> **UST email warning (important):** If UST uses Microsoft 365 / Azure Active Directory, your UST email is already registered in UST's Azure tenant. Signing up for an Azure free trial with it may:
> - Be blocked by your company's IT policy
> - Create the Azure subscription inside UST's tenant (which IT can see, manage, or remove)
>
> **Action:** Use a personal Microsoft account for Azure. If you don't have one, create one at `account.microsoft.com` using your personal email (e.g. Gmail). This keeps the Azure account fully independent of UST.

---

### 3.1 — Create a Personal Microsoft Account (if needed)

1. Go to: `account.microsoft.com`
2. Click **Create a Microsoft account**
3. Enter your personal email address (e.g. Gmail) and a password
4. Verify via email — enter the code sent to your inbox
5. You now have a personal Microsoft account — use this for Azure

---

### 3.2 — Create an Azure Free Account

1. Go to: `azure.microsoft.com/free`
2. Click **Start free**
3. Sign in with your **personal Microsoft account** (from step 3.1 — NOT your UST email)
4. Fill in:
   - **Country/Region:** Your country
   - **Phone number:** For verification
   - Agree to the subscription agreement and privacy statement
5. Click **Next** → Enter credit card for verification
6. Click **Sign up**
7. You will land on the Azure Portal at `portal.azure.com`

---

### 3.3 — Create a Resource Group

A resource group is a container that holds related Azure resources. Required before creating anything.

1. In the Azure Portal, search for **Resource groups** in the top search bar
2. Click **+ Create**
3. Fill in:
   - **Subscription:** Should show "Azure subscription 1" (your free trial)
   - **Resource group name:** `multicloud-rg`
   - **Region:** `(US) East US`
4. Click **Review + create** → **Create**
5. Wait a few seconds for it to appear in the resource group list

---

### 3.4 — Create a Storage Account

1. Search for **Storage accounts** in the top bar → click **Storage accounts**
2. Click **+ Create**
3. Fill in the **Basics** tab:

| Field | Value |
|-------|-------|
| **Subscription** | Azure subscription 1 |
| **Resource group** | `multicloud-rg` |
| **Storage account name** | Lowercase letters and numbers only, globally unique. Use: `multicloudev[yourname]` e.g. `multicloudevvishnu` (max 24 chars) |
| **Region** | `(US) East US` |
| **Performance** | Standard |
| **Redundancy** | Locally-redundant storage (LRS) — cheapest option |

4. Leave all other tabs at defaults
5. Click **Review** → **Create**
6. Wait 1–2 minutes for deployment to complete
7. Click **Go to resource** when deployment finishes

---

### 3.5 — Create a Blob Container

1. In your Storage Account, find **Containers** in the left sidebar (under Data storage)
2. Click **+ Container**
3. Fill in:
   - **Name:** `files`
   - **Public access level:** Private (no anonymous access)
4. Click **Create**
5. The container `files` now appears in the list

---

### 3.6 — Get the Connection String

1. In your Storage Account, look in the left sidebar under **Security + networking**
2. Click **Access keys**
3. Click **Show** next to the **Connection string** field under **key1**
4. Click the copy icon to copy the full connection string
5. It looks like: `DefaultEndpointsProtocol=https;AccountName=multicloudevvishnu;AccountKey=...;EndpointSuffix=core.windows.net`
6. Paste it into `.env` immediately — do not save it anywhere else

---

### 3.7 — Record in `.env`

```env
AZURE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=multicloudevvishnu;AccountKey=xxxxxxxxxxxx==;EndpointSuffix=core.windows.net
AZURE_CONTAINER_NAME=files
```

---

### Azure — Common Issues

| Problem | Fix |
|---------|-----|
| Sign-up blocked or redirects to company portal | You are using your UST email. Switch to personal Microsoft account |
| "AuthorizationFailure" when connecting | Connection string is wrong or truncated — re-copy it from Access keys in the portal |
| Container not found | Confirm `AZURE_CONTAINER_NAME` in `.env` matches exactly (case-sensitive: `files` not `Files`) |
| "The specified resource does not exist" | Storage account name in the connection string must match what was created |
| Credit card declined for verification | Try a different card or use a debit card — Azure requires billing instrument even for free accounts |

---

## Verification Checklist — Run After All 3 Are Set Up

Before Anushman starts coding the SDK modules (1.1, 1.3, 1.5), confirm every item below:

| # | Check | Who | Status |
|---|-------|-----|--------|
| V1 | GCS bucket exists and is accessible | Anushman | |
| V2 | GCP service account JSON key file is at `backend/secrets/gcp-service-account.json` | Anushman | |
| V3 | `secrets/` folder is in `.gitignore` | Anushman | |
| V4 | AWS S3 bucket exists in `us-east-1` | Anushman | |
| V5 | IAM user `multicloud-dev` has `AmazonS3FullAccess` | Anushman | |
| V6 | AWS access key + secret copied to `.env` | Anushman | |
| V7 | Azure Storage Account created in `multicloud-rg` | Anushman | |
| V8 | Azure Blob container `files` exists | Anushman | |
| V9 | Azure connection string copied to `.env` | Anushman | |
| V10 | `.env` is NOT committed to git (`git status` confirms it is untracked) | Anushman | |
| V11 | `.env.example` IS committed — key names only, no values | Anushman | |
| V12 | PM can see all 3 cloud consoles are active (screen share or screenshot) | Vishnu | |

---

## Free Tier Limits — Know Before You Hit Them

| Provider | Storage | Requests | Duration | What happens if exceeded |
|----------|---------|----------|----------|--------------------------|
| AWS S3 | 5 GB | 20K GET / 2K PUT per month | 12 months | Charged at standard rates — minimal cost for dev use |
| Azure Blob | 5 GB (LRS) | — | 12 months | $200 credit covers overages during trial |
| GCP GCS | 5 GB | 50K Class A / 50K Class B ops/month | Always Free (after $300 credit expires) | Charged after free ops — fractions of a cent for dev |

For development and testing, you will not approach these limits. The only risk is leaving uploads running in an automated loop without cleanup.

---

## Cost Control — Do This After Setup

### AWS
1. Console → **Billing and Cost Management** → **Budgets**
2. Create a budget: $0 actual cost, alert at 80% → email notification
3. This fires if you accidentally incur any charge

### Azure
1. Portal → **Cost Management + Billing** → **Budgets**
2. Set a budget of $10, alert at 80%
3. The $200 credit is the real safeguard — the budget is a secondary alert

### GCP
1. Console → **Billing** → **Budgets & alerts**
2. Create budget: $0, threshold 100% of budget → email alert
3. GCP will also email you when the $300 credit drops below 20%

---

## Backlog Status — Update After This Task

Once all 3 accounts are verified working, update `docs/backlog.md`:

| Task | Status | Notes |
|------|--------|-------|
| P.5 | Done | Repo init, `.gitignore`, `.env.example` created |
| P.6 | Done | AWS S3 bucket `[name]` in `us-east-1`. IAM user `multicloud-dev` created |
| P.7 | Done | Azure Storage Account `[name]`. Container `files`. Resource group `multicloud-rg` |
| P.8 | Done | GCS bucket `[name]`. Service account `multicloud-dev-sa`. JSON key at `backend/secrets/` |

---

*Document created: 2026-05-28 | Owner: PM (Vishnu)*
