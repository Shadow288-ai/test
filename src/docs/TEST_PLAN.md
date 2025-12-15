# QA Test Plan

## 1. Objectives
The goal of this test plan is to define the strategy, scope, and activities to ensure quality of the software according to the defined requirements. Key objectives include:

- Validate core functionality (authentication, role-based access, upload validation, risk scoring).
- Provide detailed defect documentation.
- Ensure automated and manual tests express real expectations.
- Support team readiness for release through measurable quality evidence.

---

## 2. Scope

### In-Scope
- Authentication (login, role redirects)
- Upload CSV validation logic
- Risk scoring logic and core utilities
- React component outputs and UI behaviors
- Protected routing and role restrictions

### Out-of-Scope
- Third-party API reliability outside Supabase
- Performance / load testing
- Deep cross-browser testing (beyond primary supported browsers)

---

## 3. Entry / Exit Criteria

### Entry Criteria
- Feature development completed and merged into the test branch
- Automated test suite implemented for core logic and flows
- CI pipeline configured to run tests and report results

### Exit Criteria
- All smoke tests pass on CI
- No open critical or high severity defects
- Test coverage reports validated
- Manual exploratory tests completed

---

## 4. Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| QA Engineer | Write and execute tests, document defects, produce Test Plan & Test Report |
| Software Engineer | Fix defects, assist with testability changes, implement new tests when needed |
| Team Lead | Review and approve QA deliverables, provide oversight |
| Business Analyst | Clarify requirements, define acceptance criteria |

---

## 5. Defect Management Process

### Tools
Defects will be logged and tracked using GitHub Issues with consistent labeling.

### Severity Levels
- **Blocker:** App crashes or critical functionality unreachable
- **Major:** Core features produce incorrect behavior
- **Minor:** Non-critical flows or UI inconsistencies
- **Trivial:** Cosmetic issues, typos

### Workflow
1. QA Engineer documents defect with steps to reproduce.
2. Software Engineer investigates and fixes.
3. QA verifies and closes the issue.

---

## 6. Test Deliverables

- Automated test suite (unit + component)
- E2E test suite (Playwright or similar, where applicable)
- GitHub Actions test reports (JUnit XML)
- Coverage reports (HTML/text)
- `TEST_PLAN.md`
- `TEST_REPORT.md`

---

## 7. Risk and Mitigation

| Risk | Mitigation |
|------|------------|
| Limited test coverage | Expand tests prioritized by impact |
| Flaky tests | Stabilize or isolate unstable tests |
| Ambiguous requirements | Clarify with Business Analyst |

---

## 8. Testing Tools

- Vitest (unit/component tests)
- Playwright/Cypress (optional E2E)
- GitHub Actions (CI test runs & reports)
- Coverage reporter (HTML + summary)

---

## 9. Test Schedule

| Phase | Duration |
|-------|----------|
| Write automated tests | 1–2 weeks |
| Manual exploration | 2–4 days |
| Compile QA deliverables | 2 days |
| Retest defect fixes | As needed |

---

## 10. Release Criteria

The QA Engineer will declare readiness when:
- All smoke tests pass
- Regression tests pass
- No open critical bugs
- Coverage is reviewed and gaps documented
