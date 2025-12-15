# QA Test Report

## Project Team Context
This report reflects testing activities conducted by the QA Engineer within the cross-functional team. The Software Engineer and Business Analyst supported testing by clarifying requirements and implementing defect fixes. The Team Lead reviewed QA deliverables.

---

## 1. Testing Period
**Start:** 2025-02-10  
**End:** 2025-02-17

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
| E2E Testing | Playwright (integrated where applicable) |
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
- Playwright
- ESLint + TS
- Coverage reporter
- GitHub Actions

---

## 5. Defect Summary (Fabricated & Realistic)

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| #201 | CSV missing required column not flagged | Major | Resolved |
| #202 | Admin page accessible to client role | Blocker | Resolved |
| #203 | Risk modal fails to show with specific data set | Minor | In Progress |
| #204 | Upload error toast message misleading | Minor | Resolved |
| #205 | Holdings modal flickers on quick open/close | Trivial | Open |

*Notes:*
- #201 was discovered through unit tests targeting CSV validation.
- #202 was identified during exploratory manual testing.

---

## 6. Test Results

### Automated Test Results

**Summary (JUnit XML output in CI):**
- Total tests: 112
- Passed: 107
- Failed: 5

**Coverage Summary**
```text
Statements   : 80.4%
Branches     : 72.1%
Functions    : 85.9%
Lines        : 79.3%
