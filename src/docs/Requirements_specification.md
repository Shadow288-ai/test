# Requirements Specification

## 1. Project Overview
This document defines the functional and non-functional requirements for the investment risk analysis web application. It includes requirements grouped by priority and aligned with acceptance criteria.

### 1.1 Purpose
To deliver a secure and robust web application where users can:
- Upload portfolio holdings via CSV
- View risk scores and analytics
- Navigate based on user role (admin vs client)

---

## 2. Functional Requirements

### 2.1 Authentication & User Roles
**Priority: Must Have**
- The system shall allow users to sign up with email and password.
- The system shall allow users to log in and log out.
- The system shall assign user roles (`admin` or `client`).
- The system shall redirect authenticated users to correct dashboards:
  - `admin` → `/admin`
  - `client` → `/client`

### 2.2 Portfolio Upload
**Priority: Must Have**
- The system shall allow users to upload a CSV file containing holdings.
- The system shall validate that the file is a CSV.
- The system shall validate that required columns exist (`Ticker`, `Purchase_Price`, `Quantity`).
- The system shall validate values (positive numbers for price/quantity).
- The system shall display warnings for high values (large quantity).

### 2.3 Risk Scoring
**Priority: Must Have**
- The system shall compute a risk score based on portfolio characteristics.
- The system shall categorize risk into `Low`, `Medium`, or `High`.
- The system shall display risk scores in dashboard components.

### 2.4 Navigation
**Priority: Must Have**
- The system shall protect routes based on user authentication and authorization.
- The system shall show a 404 page for undefined routes with proper logging.

---

## 3. Non-Functional Requirements

### 3.1 Performance
**Priority: Must Have**
- The system shall respond to UI actions within 1-2 seconds under normal load.

### 3.2 Security
**Priority: Must Have**
- Passwords shall be stored securely via Supabase authentication.
- API routes shall be protected against unauthorized access.

### 3.3 Usability
**Priority: Nice to Have**
- The system shall provide clear error and success toasts for user actions.
- The system shall be responsive on mobile and desktop viewports.

---

## 4. Acceptance Criteria

| Feature | Acceptance Criteria |
|---------|---------------------|
| Auth | Users can register, login, and navigate correctly by role |
| Upload | Invalid CSVs produce errors; valid CSVs are accepted |
| Risk Score | Risk categories match expected thresholds |
| Navigation | Protected routes enforce access correctly |

---

## 5. Stakeholders
- Business/System Analyst — defines requirements
- Software Engineer — implements features
- QA Engineer — validates correctness and coverage
- Team Lead — oversees project delivery
