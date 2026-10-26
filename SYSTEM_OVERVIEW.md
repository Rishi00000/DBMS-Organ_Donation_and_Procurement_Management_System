# ODPMS System Overview

## 1. Purpose and Scope
The Organ Donation and Procurement Management System (ODPMS) digitises the full organ allocation lifecycle—spanning donor registration, recipient waitlists, hospital coordination, and post-match transplant tracking—to streamline the DBMS course project deliverable into a production-style web platform.@README.md#1-53

This document explains:
- Overall system architecture and execution flow.
- Feature catalogue and how each feature operates end-to-end.
- How the React frontend integrates with the Express/Node.js backend.
- The responsibility of key files and folders across both stacks.

---

## 2. High-Level Architecture
| Layer | Responsibilities | Key Technologies |
| --- | --- | --- |
| Frontend (React + Vite) | Role-aware dashboards, CRUD flows, waitlist views, organ availability tracking | React 18, Vite, Tailwind CSS, shadcn/ui, Axios@README.md#15-24 |
| Backend (Express API) | REST endpoints, business logic, validation, authentication, matching engine | Node.js, Express, JWT, bcrypt, nodemailer@backend/src/server.js#1-158 @backend/src/controllers/authController.js#1-247 |
| Data Layer | Persist users, hospitals, donors, recipients, organs, matches, transplants, audit logs | PostgreSQL, custom SQL functions (blood compatibility, HLA scoring, distance)@README.md#164-175 @backend/database/schema.sql#1-400

The backend Express app boots in `server.js`, wires security middleware, then exposes route groups for auth, hospitals, donors, recipients, organs, matches, transplants, and admin services.@backend/src/server.js#31-155

---

## 3. Feature Catalogue
| Feature | Description | Primary Backend | Primary Frontend |
| --- | --- | --- | --- |
| Authentication & RBAC | JWT-powered login/registration, password hashing, role guards | `authController`, `authenticateToken` middleware@backend/src/controllers/authController.js#15-247 @backend/src/middleware/auth.js#5-144 | `AuthContext`, `<ProtectedRoute>` routing guard@frontend/src/contexts/AuthContext.jsx#6-75 @frontend/src/App.jsx#17-141 |
| Hospital Onboarding | Public registration, admin approval/rejection, staff lookups | `hospitalRegisterController`, `hospitalController`@backend/src/controllers/hospitalRegisterController.js#1-260 @backend/src/controllers/hospitalController.js#30-263 | Hospital registration page, admin dashboards@frontend/src/pages/HospitalRegister.jsx#1-320 @frontend/src/pages/AdminDashboard.jsx#6-107 |
| Donor Management | CRUD donors, organ association, filtering by blood type, status | `donorController`@backend/src/controllers/donorController.js#3-258 | Donor listing & detail pages@frontend/src/pages/DonorsPage.jsx#1-320 |
| Recipient Waitlist | Recipient CRUD, waitlist prioritisation, status changes | `recipientController`@backend/src/controllers/recipientController.js#1-360 | Recipient dashboards and admin views@frontend/src/pages/RecipientsPage.jsx#1-340 |
| Organ Inventory | Register organs, availability flags, trigger matching | `organController`, `matchingService`@backend/src/controllers/organController.js#1-360 @backend/src/services/matchingService.js#20-318 | Organs management UI, trigger matching actions@frontend/src/pages/OrgansPage.jsx#1-240 |
| Algorithmic Matching | Blood/HLA/urgency/geography-based scoring, email alerts | `matchingService`@backend/src/services/matchingService.js#20-375 | Match tables and status updates@frontend/src/pages/MatchesPage.jsx#1-360 |
| Transplant Tracking | Accept/reject matches, schedule and update surgeries | `transplantController`@backend/src/controllers/transplantController.js#1-260 | Transplant management view@frontend/src/pages/TransplantsPage.jsx#1-320 |
| Admin Oversight | System stats, user lifecycle, audit logs, reporting | `adminController`@backend/src/controllers/adminController.js#1-360 | Admin dashboard, quick actions@frontend/src/pages/AdminDashboard.jsx#6-107 |

---

## 4. Feature Workflows in Detail
### 4.1 Authentication & Authorization
1. User submits credentials via `AuthContext.login`, which posts to `/api/auth/login` with Axios.@frontend/src/contexts/AuthContext.jsx#21-37 @frontend/src/services/api.js#39-43
2. `authController.login` validates credentials, hashes, and issues a JWT with role metadata.@backend/src/controllers/authController.js#73-147
3. `authenticateToken` middleware verifies the JWT on subsequent requests, attaching the user record and enforcing activation state.@backend/src/middleware/auth.js#5-44
4. Role-specific guards (`isAdmin`, `isHospitalStaff`, `isRecipient`) enforce module access in route handlers.@backend/src/middleware/auth.js#48-144 @frontend/src/App.jsx#59-142

### 4.2 Hospital Registration & Approval
- Public hospitals self-register through the `/api/hospitals` public route, handled by `hospitalRegisterController`.
- Admins review pending hospitals via `hospitalController.approveHospital` or `rejectHospital`, which stamp audit metadata and change status.@backend/src/controllers/hospitalController.js#130-263
- Approved hospitals appear in admin stats and become selectable for staff assignments.@frontend/src/pages/AdminDashboard.jsx#25-104

### 4.3 Donor & Organ Registration
- Hospital staff create donors via `donorController.createDonor`, which enforces ownership, records medical history, and links registered user IDs.@backend/src/controllers/donorController.js#117-185
- Organs created through `organController` inherit donor metadata, track availability, and can trigger matching with the algorithm service.@backend/src/controllers/organController.js#120-290 @backend/src/services/matchingService.js#20-188

### 4.4 Recipient Waitlist & Monitoring
- Recipient CRUD flows capture urgency, HLA typing, and hospital association, enabling priority computation later.@backend/src/controllers/recipientController.js#1-340
- The Recipient dashboard displays waitlist state and pending matches rendered from `/matches/recipient/:id` endpoints.@backend/src/routes/match.routes.js#8-16 @frontend/src/pages/RecipientDashboard.jsx#1-320

### 4.5 Automated Matching
1. `matchingService.findMatches` fetches organ details, calculates compatibility via SQL helper functions, ranks recipients, persists pending matches, and optionally emails stakeholders.@backend/src/services/matchingService.js#20-170
2. Accepting a match transitions the organ to allocated, updates recipient status, cancels competing matches, creates a transplant record, and emails confirmation.@backend/src/services/matchingService.js#190-319

### 4.6 Transplant Lifecycle
- `transplantController` exposes endpoints to list, inspect, and update transplant surgeries, syncing schedules with hospital operations.@backend/src/controllers/transplantController.js#1-240
- Frontend pages surface status changes (scheduled, completed, cancelled) for admin and hospital roles.@frontend/src/pages/TransplantsPage.jsx#1-320

### 4.7 Administrative Oversight & Analytics
- `adminController` aggregates global counts (donors, recipients, organs, transplants, matches) plus audit and reporting actions.@backend/src/controllers/adminController.js#1-360
- `AdminDashboard` renders metric cards and quick actions using these aggregates.@frontend/src/pages/AdminDashboard.jsx#6-107

---

## 5. Frontend ↔ Backend Integration
- All network calls funnel through `frontend/src/services/api.js`, which centralises the API base URL, injects Bearer tokens via Axios interceptors, and handles 401 logout cascades.@frontend/src/services/api.js#1-114
- Feature modules import the relevant API client (e.g., `donorAPI`, `organAPI`) and connect UI components to backend resources.
- Authentication context persists user info and tokens in `localStorage`, ensuring route guards (`ProtectedRoute`) render the correct dashboard for the signed-in role.@frontend/src/contexts/AuthContext.jsx#21-75 @frontend/src/App.jsx#17-142
- Frontend entry (`main.jsx`) currently mounts `AppComprehensive`, which bundles the full navigation and layout stack for development.@frontend/src/main.jsx#1-22

---

## 6. Backend Module Guide
| Path | Responsibility |
| --- | --- |
| `src/server.js` | Express bootstrap: loads env vars, applies security (Helmet, CORS, rate limits), logging, health check, and route registration before attaching error handlers.@backend/src/server.js#1-158 |
| `src/config/database.js` | PostgreSQL pool setup, with helper functions for queries, transactions, and connection lifecycle logging.@backend/src/config/database.js#1-64 |
| `src/config/email.js` | Nodemailer transporter configuration and send helper for match/transplant alerts.@backend/src/config/email.js#1-50 |
| `src/middleware/` | Shared middleware: authentication/authorization, request logging, validation, and error handling.@backend/src/middleware/logger.js#46-64 @backend/src/middleware/errorHandler.js#1-99 @backend/src/middleware/auth.js#5-144 |
| `src/routes/` | REST route definitions mapping HTTP verbs and URLs to controller handlers (e.g., `/api/donors`, `/api/matches`).@backend/src/routes |
| `src/controllers/` | Request handlers encapsulating validation, data access, and response shaping per domain (auth, hospital, donor, recipient, organ, match, transplant, admin).@backend/src/controllers |
| `src/services/matchingService.js` | Core business service implementing the compatibility engine, email notifications, and transactional match acceptance flow.@backend/src/services/matchingService.js#20-375 |
| `database/schema.sql` & `database/init.sql` | Relational schema definitions, helper SQL functions, seed data for hospitals, users, donors, recipients, organs, and audit logs.@backend/database/schema.sql#1-400 |
| Scripts (`fix-password*.js`, `trigger-matching.js`) | One-off maintenance scripts for data hygiene and manual match execution.@backend/fix-all-passwords.js#1-160 @backend/trigger-matching.js#1-180

---

## 7. Frontend Module Guide
| Path | Responsibility |
| --- | --- |
| `src/main.jsx` | Application entry; boots the comprehensive app variant and logs boot diagnostics.@frontend/src/main.jsx#1-22 |
| `src/App.jsx` | React Router configuration gating routes per role via `<ProtectedRoute>` and mapping URLs to pages.@frontend/src/App.jsx#17-178 |
| `src/contexts/AuthContext.jsx` | Authentication provider exposing login/logout/register helpers, persistent session state, and derived role flags for components.@frontend/src/contexts/AuthContext.jsx#6-75 |
| `src/services/api.js` | Axios instance plus typed API clients for auth, hospitals, donors, recipients, organs, matches, transplants, and admin modules.@frontend/src/services/api.js#1-114 |
| `src/components/` | Shared UI: layout shell, organ/recipient viewers, error boundaries, comprehensive dashboards.@frontend/src/components/Layout.jsx#1-200 @frontend/src/components/HospitalDashboard.comprehensive.jsx#1-760 |
| `src/pages/` | Page-level containers for dashboards and resource CRUD, each orchestrating API calls and rendering via reusable components.@frontend/src/pages |

---

## 8. Data & Matching Logic Deep Dive
- The matching query leverages SQL helper functions (`is_blood_compatible`, `calculate_hla_match_score`, `calculate_distance`) to compute composite compatibility scores weighted across medical and logistical constraints.@backend/src/services/matchingService.js#45-110
- Matches are persisted with conflict-handling to keep compatibility scores current, ensuring deterministic recipient ordering.@backend/src/services/matchingService.js#104-125
- Accepting a match cascades updates across organs, recipients, competing matches, and transplants inside a database transaction to maintain consistency.@backend/src/services/matchingService.js#196-319

---

## 9. Example Request Lifecycle (Login)
1. React login form calls `authAPI.login` and stores JWT/user on success.@frontend/src/contexts/AuthContext.jsx#21-38
2. Axios interceptor injects `Authorization: Bearer <token>` into subsequent requests.@frontend/src/services/api.js#12-34
3. Backend `authenticateToken` middleware authorises the request and attaches the user object, which controllers use to enforce row-level access (e.g., hospital-scoped donor queries).@backend/src/middleware/auth.js#5-108 @backend/src/controllers/donorController.js#51-55
4. Responses bubble through the Express stack, and any thrown errors are handled by the global `errorHandler` with PostgreSQL-aware messages.@backend/src/middleware/errorHandler.js#2-78

---

## 10. Related Documentation
Supplement this overview with the existing guides in the repository:
- `README.md` – installation, tech stack, and feature overview.@README.md#1-216
- `PROJECT_SUMMARY.md` – milestone tracking and deliverable history.
- `MATCHING_EXPLANATION.md` – detailed algorithm rationale.
- `FEATURES_TESTING_GUIDE.md` & `TESTING_GUIDE.md` – validation procedures and manual test scripts.

---

## 11. Next Steps
- Keep this document updated as new modules or services are introduced.
- Cross-link to API documentation (`/api` + `/api/docs`) once OpenAPI or Swagger specs are generated.@backend/src/server.js#98-114
