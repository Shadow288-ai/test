# QA Checklists (RiskTwo)

## Purpose
This document defines repeatable QA checks for the RiskTwo web app. It is designed to be run locally and to provide a clear “release readiness” signal even when we don’t have a formal QA toolchain yet.

---

## How to use this document
### Status labels
- ✅ **PASS** = item behaves as expected
- ⚠️ **PASS (Risk)** = item works but with known concerns (slow, flaky, unclear requirements, mismatched docs)
- ❌ **FAIL** = item does not behave as expected

### Release readiness (simple rule)
- **GREEN**: All Smoke items ✅
- **YELLOW**: Smoke ✅ but there are ⚠️ risks (non-blocking)
- **RED**: Any Smoke item ❌ OR any blocker bug found

### Golden rule (keeps the checklist strong)
Whenever a bug escapes or surprises you, add **one new checklist item** that would have caught it next time.

---

## Test environment (Local)
### Run the app
- Install deps: `npm ci` (or `npm install`)
- Start: `npm run dev`
- Open: `http://localhost:8080`

### Required environment variables
Create a `.env.local` (or equivalent) with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Optional (feature-dependent):
- `VITE_ALPHA_VANTAGE_API_KEY` (used as a fallback for price refresh)

### Browser / device baseline
- Primary: Chrome (latest)
- Also try (when time allows): Firefox / Safari

---

## Test data (repeatable accounts)
If seeded users exist (from migrations):
- Admin user: `admin@risktwo.com` / `Admin123!`
- Client user: `client@risktwo.com` / `Client123!`

If these accounts do not exist in your Supabase instance, create equivalents:
- One **admin** role user
- One **client** role user

---

## Routes reference (what exists in the app)
Public:
- `/` (Index)
- `/auth` (Auth)

Protected (must be logged in):
- `/client` (Client dashboard)
- `/upload` (CSV upload)
- `/help` (Help)

Admin-only:
- `/admin` (Admin dashboard)
- `/admin/clients` (Admin clients)

Other:
- `*` (NotFound)

---

# SMOKE CHECKLIST
Run this:
- Before demos / deadlines
- After major merges
- When something “important” changes (auth, upload, routes, roles)

## A) App boots & basic navigation
- [ ] App starts locally without crashing (no blank screen)
- [ ] Landing page (`/`) loads
- [ ] Navigating to `/auth` works (page renders)

## B) Access control (logged OUT)
- [ ] Logged out → open `/client` → redirected to `/auth` (or blocked)
- [ ] Logged out → open `/upload` → redirected to `/auth` (or blocked)
- [ ] Logged out → open `/help` → redirected to `/auth` (or blocked)

## C) Client login smoke
- [ ] Sign in as **client** → redirected to `/client`
- [ ] Client can open:
  - [ ] `/client`
  - [ ] `/upload`
  - [ ] `/help`
- [ ] Client CANNOT access admin pages:
  - [ ] client opening `/admin` is blocked/redirected
  - [ ] client opening `/admin/clients` is blocked/redirected

## D) Upload smoke (happy + one negative)
CSV expected columns:
- `Ticker`
- `Purchase_Price`
- `Quantity`

- [ ] Go to `/upload` (while logged in as client)
- [ ] Click “Download Sample CSV” → file downloads
- [ ] Upload the sample CSV → shows success feedback and returns to dashboard (or indicates success)
- [ ] Upload invalid CSV (missing `Quantity`) → shows validation failure (does NOT proceed)

## E) Admin login smoke
- [ ] Sign out (from client)
- [ ] Sign in as **admin** → redirected to `/admin`
- [ ] Admin can open:
  - [ ] `/admin`
  - [ ] `/admin/clients`

## F) 404 behavior
- [ ] Open `/this-route-does-not-exist` → NotFound page appears

## G) Logout
- [ ] Logout works (session cleared)
- [ ] After logout, protected routes redirect/block again

---

# REGRESSION CHECKLIST 
Run this:
- Before a release/deadline (when you need confidence)
- Weekly (if the app changes frequently)
- After big refactors (auth/routing/upload/data)

## 1) Auth & session behavior
- [ ] Client login works
- [ ] Refresh browser on `/client` → still logged in (session persists)
- [ ] Logout → refresh → still logged out
- [ ] Admin login works
- [ ] Refresh browser on `/admin` → still logged in (session persists)

## 2) Role-based access (admin gating)
- [ ] Client cannot access `/admin`
- [ ] Client cannot access `/admin/clients`
- [ ] Admin can access `/admin`
- [ ] Admin can access `/admin/clients`

## 3) Client dashboard basic behavior
(Goal: page loads, modals open, no obvious runtime errors.)
- [ ] `/client` loads without runtime crash
- [ ] No blocking errors in Console on initial load
- [ ] Key UI sections render (cards/charts/holdings areas)
- [ ] Risk score/modal opens (if present)
- [ ] Holdings/modal opens (if present)

## 4) Upload behavior: validation, safety, replacement
Important behavior expectation:
- Invalid CSV must fail without destructive changes
- Valid CSV replaces holdings (no duplicates explosion)

### 4.1 Validation rules
- [ ] Missing `Ticker` in a row → validation error
- [ ] `Purchase_Price` <= 0 → validation error
- [ ] `Quantity` <= 0 → validation error
- [ ] Non-CSV upload rejected (“Please upload a CSV file”)

### 4.2 Safety checks
- [ ] Upload invalid CSV → confirm it fails and does not proceed
- [ ] Upload valid CSV → success
- [ ] Upload valid CSV again → still success, holdings look replaced (not duplicated)

### 4.3 Edge cases (time permitting)
- [ ] Large quantity row triggers warning (if warnings exist)
- [ ] CSV with extra columns still works (if supported)
- [ ] CSV with trailing spaces in header names (Ticker vs "Ticker ") behaves reasonably (document expected behavior)

## 5) Admin pages stability
- [ ] `/admin` loads without runtime crash
- [ ] `/admin/clients` loads without runtime crash
- [ ] Search/filter/basic interactions do not crash (if present)
- [ ] Empty state handling: if no clients or no data, UI still behaves

## 6) Cross-browser quick check (time permitting)
- [ ] Repeat Smoke items in a second browser (Firefox or Safari)

---


# Bug report template (copy/paste)
- **Id(example #341)**  
- **Description of the bug:**   
- **Severity:** Blocker / Major / Minor...
- **Status of the report:** Reslove / Open / In progress
- **Notes:** (any extra context if needed)

---

# Test run log (optional, but recommended)
Use this to track what you ran and what the status was.

## YYYY-MM-DD
- **Branch/commit:**  
- **Run type:** Smoke / Regression  
- **Result:** GREEN / YELLOW / RED  
- **Notes / bug links:**  
  -  
