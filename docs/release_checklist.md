# Release Checklist — Go-Live Gate

> **Target:** 2026-06-16
> **Rule:** Every P0 item must be checked before Go/No-Go is called.
> **Owner:** PM signs off | **Verifier:** Dev confirms each item is true — not assumed.

---

## P0 — Must Pass (hard gate)

### Functionality
- [ ] Upload works via web UI to all 3 cloud providers
- [ ] Download works via web UI from all 3 cloud providers
- [ ] File list shows all files with correct name, size, provider
- [ ] Delete removes the correct file and it disappears from the list
- [ ] File sync replicates files from one provider to another
- [ ] Redundant upload writes to 2+ providers in a single action

### Authentication & Access Control
- [ ] Login accepts valid credentials and rejects invalid ones
- [ ] Admin role can upload, download, delete
- [ ] Read-only role cannot upload or delete; API returns 403
- [ ] All API endpoints return 401 for unauthenticated requests
- [ ] Logout works and session is invalidated

### Security
- [ ] No cloud credentials (API keys, connection strings, service account JSON) visible in any browser response or frontend source
- [ ] `.env` (or equivalent secrets file) is in `.gitignore` and not in git history
- [ ] Error messages do not expose internal paths, stack traces, or config values
- [ ] HTTPS enforced on production URL — or HTTP explicitly accepted and documented as intentional

### Deployment
- [ ] Application is running on production server (not localhost)
- [ ] Production URL is accessible from outside the dev machine
- [ ] App starts cleanly without manual steps after a reboot / restart

### Testing
- [ ] Unit tests pass for all 3 cloud modules
- [ ] Integration tests pass for unified interface
- [ ] End-to-end test completed on production: upload → list → download → delete

---

## P1 — Should Pass (document exceptions if skipping)

- [ ] Session expiry / timeout configured
- [ ] Sync correctly skips unchanged files
- [ ] Partial redundant upload failure is reported clearly to the user
- [ ] Provider badge visible per file in UI

---

## P2 — Deferred to Post-Launch

- [ ] Granular RBAC beyond admin / read-only
- [ ] RBAC UI hiding / disabled controls for read-only users
- [ ] Audit log of user actions
- [ ] File versioning across providers
- [ ] Cost / usage monitoring per provider

---

## Go/No-Go Sign-Off

| Check | Verified By | Date | Notes |
|-------|-------------|------|-------|
| P0 Functionality | | | |
| P0 Auth & Access | | | |
| P0 Security | | | |
| P0 Deployment | | | |
| P0 Testing | | | |

---

**Go/No-Go Decision:** `GO` / `NO-GO`
**Made by (PM):**
**Date:** 2026-06-16
**Notes:**
