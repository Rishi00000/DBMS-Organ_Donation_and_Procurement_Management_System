# LifeLink Project Guide

This guide combines setup, getting-started, and API reference information for LifeLink, an Organ Donation and Procurement Management System.

## Requirements

- Node.js 18 or later and npm
- PostgreSQL 14 or later
- Git (optional)

Verify the installations:

```powershell
node --version
npm --version
psql --version
```

## Setup

### 1. Create and initialize the database

Start PostgreSQL, then create the project database:

```powershell
createdb -U postgres lifelink_db
```

From the project root, run the schema and sample-data scripts:

```powershell
cd backend
psql -U postgres -d lifelink_db -f database\schema.sql
psql -U postgres -d lifelink_db -f database\init.sql
```

> **Warning:** `schema.sql` drops and recreates the project tables. Do not rerun it if you need to keep existing database data.

### 2. Configure and start the backend

Install dependencies:

```powershell
npm install
```

Create `backend\.env` with your local PostgreSQL credentials and a private JWT secret:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lifelink_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

Keep `.env` private and do not commit it. Email settings are optional; configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, and `EMAIL_FROM` if you want email notifications.

Start the API from the `backend` directory:

```powershell
npm run dev
```

The API listens at `http://localhost:3000`. Check that it can reach PostgreSQL:

```powershell
curl.exe http://localhost:3000/health
```

### 3. Install and start the frontend

In a second terminal, from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 4. Demo accounts

Sample accounts are inserted by `backend/database/init.sql`:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Hospital staff | `apollo_staff1` | `staff123` |
| Recipient | `patient_arjun` | `patient123` |

These are development-only credentials. Change or remove them before deploying the application.

## Basic usage and database checks

After signing in, the admin can review system-wide data and manage hospitals. Hospital staff can manage donor, recipient, organ, match, and transplant records. Recipients can view their waitlist information and matches.

To inspect the database:

```powershell
psql -U postgres -d lifelink_db
```

Useful `psql` commands:

```sql
\dt
SELECT username, role FROM users;
SELECT * FROM v_active_waitlist;
SELECT * FROM v_system_stats;
```

Exit `psql` with `\q`.

## API reference

Base URL: `http://localhost:3000/api`

Except for login, registration, and the health check, API routes require a JWT. Send it in the request header:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Health and authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Check API and database availability (outside `/api`) |
| `POST` | `/auth/login` | Sign in and receive a token |
| `POST` | `/auth/register` | Register a user |
| `GET` | `/auth/profile` | Get the signed-in user's profile |
| `PUT` | `/auth/change-password` | Change the signed-in user's password |

Login request:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Hospitals

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/hospitals` | List hospitals; supports status, city, and state filters |
| `GET` | `/hospitals/my-hospital` | Get the signed-in staff member's hospital |
| `GET` | `/hospitals/:id` | Get a hospital |
| `POST` | `/hospitals` | Register a hospital |
| `PUT` | `/hospitals/:id` | Update a hospital |
| `PUT` | `/hospitals/:id/approve` | Approve a hospital (admin) |
| `PUT` | `/hospitals/:id/reject` | Reject a hospital (admin) |
| `GET` | `/hospitals/:id/staff` | List hospital staff |

### Donors and recipients

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/donors` | List donors; supports hospital, blood type, status, and living-status filters |
| `GET` | `/donors/:id` | Get a donor |
| `POST` | `/donors` | Register a donor |
| `PUT` | `/donors/:id` | Update a donor |
| `DELETE` | `/donors/:id` | Delete a donor |
| `GET` | `/recipients` | List recipients; supports hospital, blood type, organ, urgency, and status filters |
| `GET` | `/recipients/waitlist` | Get the active waitlist |
| `POST` | `/recipients` | Register a recipient |
| `PUT` | `/recipients/:id` | Update a recipient |

### Organs and matches

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/organs` | List organs; supports donor, organ type, blood type, and availability filters |
| `GET` | `/organs/available` | List available organs |
| `POST` | `/organs` | Register an organ and generate potential matches |
| `POST` | `/organs/:id/match` | Manually run matching for an organ |
| `GET` | `/matches` | List matches; supports status, recipient, and organ filters |
| `GET` | `/matches/:id` | Get a match |
| `GET` | `/matches/recipient/:recipientId` | Get matches for a recipient |
| `GET` | `/matches/stats` | Get matching statistics |
| `POST` | `/matches/:id/accept` | Accept a match and create a transplant record |
| `POST` | `/matches/:id/reject` | Reject a match; may include a `reason` in the request body |

### Transplants and administration

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/transplants` | List transplants; supports status and hospital filters |
| `GET` | `/transplants/:id` | Get a transplant |
| `PUT` | `/transplants/:id/status` | Update transplant status and outcome details |
| `GET` | `/admin/dashboard` | Get system dashboard statistics |
| `GET` | `/admin/users` | List users; supports role and active-status filters |
| `PUT` | `/admin/users/:id/deactivate` | Deactivate a user |
| `PUT` | `/admin/users/:id/activate` | Activate a user |
| `GET` | `/admin/audit-logs` | List audit events; supports user, action, table, and pagination filters |
| `GET` | `/admin/reports` | Generate a report; supports report type and date range |

### Example requests

Log in and copy the returned token:

```powershell
curl.exe -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'
```

Then use it for an authenticated request:

```powershell
curl.exe http://localhost:3000/api/admin/dashboard `
  -H "Authorization: Bearer <token>"
```

Successful responses generally contain data in a `data` property. Errors use an HTTP error status and a JSON `error` message; validation errors may also include a `details` list.

## Troubleshooting

- **Database connection fails:** Confirm PostgreSQL is running, `lifelink_db` exists, and the credentials in `backend\.env` are correct.
- **Tables are missing:** Run the schema and seed commands from the backend setup section. The schema script drops existing project tables before recreating them.
- **A port is already in use:** Stop the process using port 3000 (backend) or 5173 (frontend), or configure the backend `PORT`.
- **A dependency is missing:** Run `npm install` in the affected `backend` or `frontend` directory.
- **Login fails:** Confirm the seed script has been applied and use one of the demo accounts above.

## Security and deployment notes

- Do not deploy with demo passwords or a default JWT secret.
- Keep database credentials and email passwords in environment variables, not source control.
- Use HTTPS and secure database connections in production.
- Review CORS settings, backups, logging, and access controls before deployment.
