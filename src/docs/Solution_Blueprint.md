# Solution Blueprint (Focused)

This document provides the required high-level views based on the Analyst’s instructions:
- **Application landscape**
- **Process overview**
- **Integration and interfaces**
- **Data model**

---

## 1. Application Landscape

Below is a simplified component view of the system architecture illustrating major parts and their relationships:

```mermaid
flowchart TD
    A["Client Browser (React UI)"]
    B["Frontend (Vite + React)"]
    C["Supabase Backend (Authentication + Database)"]
    D["PostgreSQL Tables"]

    A -->|HTTP/HTTPS| B
    B -->|API Calls| C
    C -->|Reads/Writes| D


```



## 2. Process Overview

```mermaid
flowchart TD
    Start[User launches app] --> AuthCheck{Authenticated?}
    AuthCheck -- No --> Login[Login Page]
    AuthCheck -- Yes --> RoleCheck{User Role}
    RoleCheck -- Admin --> AdminDash[Admin Dashboard]
    RoleCheck -- Client --> ClientDash[Client Dashboard]
    ClientDash --> UploadCSV[Upload CSV]
    UploadCSV --> ValidateCSV[Validate CSV Structure]
    ValidateCSV -->|Valid| SaveHoldings[Save Holdings]
    ValidateCSV -->|Invalid| ShowError[Show Validation Errors]
    SaveHoldings --> CalcRisk[Compute Risk Score]
    CalcRisk --> ShowResults[Render Risk Results]
```



## 3. Integration and Interfaces

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase

    U->>F: Enter credentials & login
    F->>S: Verify credentials
    S-->>F: Return auth token

    U->>F: Upload CSV file
    F->>F: Parse & validate CSV
    F->>S: Insert holdings into DB
    S-->>F: Success response

    F->>F: Calculate risk score
    F-->>U: Display results
```



## 4.Data Model

Users
---------
id (PK)
email
role (admin/client)
created_at

Holdings
---------
id (PK)
client_id (FK -> Users.id)
ticker
purchase_price
quantity
market_value
risk_score
created_at
