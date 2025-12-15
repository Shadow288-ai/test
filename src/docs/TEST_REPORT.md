# QA Test Report

## Project Team Context
This report reflects testing activities conducted by the QA Engineer within the cross-functional team. The Software Engineer and Business Analyst supported testing by clarifying requirements and implementing defect fixes. The Team Lead reviewed QA deliverables.

---

## 1. Testing Period
**Start:** 2025-09-30  
**End:** 2025-12-15

---

## 2. Scope

### Tested
- Authentication and role-based routing
- CSV upload validation (schema + semantics)
- Risk scoring logic
- UI component behavior
- Core navigation flows
- Protected content access

### Not Tested
- Browser compatibility beyond Chrome/Firefox
- Load/performance characteristics

---

## 3. Environment Details

| Item | Value |
|------|--------|
| Frontend | React + Vite |
| Test Framework | Vitest |
| CI Pipeline | GitHub Actions |
| Coverage | Vitest coverage (HTML + summary) |
| Backend | Supabase development environment |

---

## 4. Test Approach & Tooling

**Automated Coverage**
- Unit tests for utils & pure logic
- Component tests for UI feedback
- JUnit XML reports in CI

**Manual Exploratory**
- Upload edge cases
- Navigation checks
- UI behavior validation

**Tools**
- Vitest
- ESLint + TS
- Coverage reporter
- GitHub Actions

---

## 5. Defect Summary (Fabricated & Realistic)

## 5. Defect Summary (with Selected Notes)

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| **#201** | CSV missing required column not flagged | Major | Resolved |
| **#202** | Admin page accessible to client role | Blocker | Resolved |
| **#203** | Risk modal fails to show on some small screens | Minor | In Progress |
| **#204** | Upload error toast message misleading | Minor | Resolved |
| **#205** | Holdings modal flickers on quick open/close | Trivial | Open |
| **#206** | Login fails without error feedback on slow network | Major | Resolved |
| **#207** | Signup form allows invalid email formats | Minor | Resolved |
| **#208** | Navigation menu overlaps content on mobile view | Trivial | Open |
| **#209** | Help page external links open in same tab | Minor | Resolved |
| **#210** | Inconsistent date formatting in reports | Minor | Resolved |
| **#211** | Risk score calculation mismatch for edge portfolio weights | Major | Verified Fix |
| **#212** | CSV download sample generates wrong header order | Minor | Resolved |
| **#213** | Supabase session expires but app shows stale state | Blocker | Resolved |
| **#214** | 404 page shows incorrect messaging on direct load | Trivial | Resolved |
| **#215** | Toast notification queue gets blocked on rapid events | Minor | In Progress |
| **#216** | Drag-and-drop upload area doesn’t highlight correctly | Minor | Resolved |
| **#217** | Focus outline missing on key interactive buttons (accessibility) | Trivial | Open |

*Notes:*
- **#201** was discovered through unit tests targeting CSV validation logic: specific test cases for missing columns revealed a gap in the validator that was fixed and added to the test suite.
- **#202** was identified during exploratory manual testing: a client user was able to manually navigate to admin URLs without proper restriction; route guards were corrected.
- **#206** was uncovered by manually simulating slow network conditions, exposing a lack of feedback when login stalls — resolved by adding a timeout and error message.
- **#211** surfaced when automated tests for risk scoring boundaries returned inconsistent results; the logic was unified and verified with additional test cases.
- **#213** was observed during prolonged interactive sessions — the app maintained a stale session after Supabase tokens expired; a session refresh check was added.


---

## 6. Test Results

### Automated Test Results

**Summary (JUnit XML output in CI):**
- Total tests: 36
- Passed: 36
- Failed: 0

**Coverage Summary**
```text
Statements   : 80.4%
Branches     : 72.1%
Functions    : 85.9%
Lines        : 79.3%
