# ODPMS Setup Guide

Complete step-by-step guide to set up and run the Organ Donation and Procurement Management System.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher): [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher): [Download](https://www.postgresql.org/download/)
- **npm** or **yarn**: Comes with Node.js
- **Git**: [Download](https://git-scm.com/)

## Step 1: Verify Installations

```bash
# Check Node.js version
node --version  # Should be v18.x.x or higher

# Check npm version
npm --version

# Check PostgreSQL version
psql --version  # Should be 14.x or higher
```

## Step 2: PostgreSQL Database Setup

### 2.1 Start PostgreSQL Service

**On macOS (using Homebrew):**
```bash
brew services start postgresql@14
```

**On Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On Windows:**
PostgreSQL should start automatically. Check Services panel.

### 2.2 Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, create the database:
CREATE DATABASE odpms_db;

# Verify database was created:
\l

# Exit psql:
\q
```

Alternatively, use a single command:
```bash
createdb -U postgres odpms_db
```

### 2.3 Initialize Database Schema

Navigate to the project directory and run:

```bash
cd /Users/maheshvellogi/Downloads/DBMS_Project/backend

# Run schema creation script
psql -U postgres -d odpms_db -f database/schema.sql

# Run initial data seed
psql -U postgres -d odpms_db -f database/init.sql
```

You should see output confirming:
- Tables created
- Sample data inserted
- Default login credentials displayed

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

```bash
cd /Users/maheshvellogi/Downloads/DBMS_Project/backend
```

### 3.2 Install Dependencies

```bash
npm install
```

This will install all required Node.js packages including Express, PostgreSQL driver, bcrypt, JWT, etc.

### 3.3 Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Open .env file in your text editor
nano .env  # or use any text editor
```

**Edit the following values in `.env`:**

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=odpms_db
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password  # ⚠️ CHANGE THIS!

# JWT Configuration
JWT_SECRET=your_very_secure_random_secret_key_here  # ⚠️ CHANGE THIS!
JWT_EXPIRES_IN=24h

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com  # Optional
EMAIL_PASSWORD=your_app_password  # Optional
EMAIL_FROM=ODPMS System <noreply@odpms.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Security
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important Notes:**
- Replace `DB_PASSWORD` with your actual PostgreSQL password
- Generate a strong random string for `JWT_SECRET`
- Email configuration is optional for development

### 3.4 Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Server running on port 3000
✅ Environment: development
🌐 API URL: http://localhost:3000/api
💚 Health Check: http://localhost:3000/health
✅ Connected to PostgreSQL database
```

**Test the backend:**
```bash
# In a new terminal, test the health endpoint
curl http://localhost:3000/health
```

## Step 4: Frontend Setup

### 4.1 Open New Terminal

Keep the backend running and open a new terminal window.

### 4.2 Navigate to Frontend Directory

```bash
cd /Users/maheshvellogi/Downloads/DBMS_Project/frontend
```

### 4.3 Install Dependencies

```bash
npm install
```

This will install React, Vite, Tailwind CSS, and all frontend dependencies.

### 4.4 Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

## Step 5: Access the Application

### 5.1 Open Your Browser

Navigate to: **http://localhost:5173**

### 5.2 Login with Demo Credentials

The system comes with pre-configured demo accounts:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Access: Full system administration

**Hospital Staff Account:**
- Username: `apollo_staff1`
- Password: `staff123`
- Access: Donor, recipient, organ, match management

**Recipient/Patient Account:**
- Username: `patient_arjun`
- Password: `patient123`
- Access: View waitlist status and matches

## Step 6: Verify Everything Works

### 6.1 Backend Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-...",
  "uptime": 123.456
}
```

### 6.2 Test API Endpoints

```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 6.3 Frontend Features

1. **Login** - Test all three demo accounts
2. **Admin Dashboard** - View system statistics
3. **Hospital Dashboard** - View hospital-specific data
4. **Browse Data** - Check Donors, Recipients, Organs, Matches

## Troubleshooting

### Issue: Cannot connect to PostgreSQL

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it:
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux
```

### Issue: Database connection error

**Solution:**
- Verify database exists: `psql -U postgres -l | grep odpms_db`
- Check credentials in `.env` file
- Ensure PostgreSQL is accepting connections

### Issue: Port already in use

**Backend (Port 3000):**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Frontend (Port 5173):**
```bash
# Find and kill process
lsof -i :5173
kill -9 <PID>
```

### Issue: Module not found errors

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database tables not created

**Solution:**
```bash
# Re-run schema creation
cd backend
psql -U postgres -d odpms_db -f database/schema.sql
psql -U postgres -d odpms_db -f database/init.sql
```

## Development Workflow

### Starting the Application

**Terminal 1 (Backend):**
```bash
cd /Users/maheshvellogi/Downloads/DBMS_Project/backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd /Users/maheshvellogi/Downloads/DBMS_Project/frontend
npm run dev
```

### Stopping the Application

- Press `Ctrl+C` in both terminal windows

### Viewing Logs

**Backend logs:** Displayed in Terminal 1
**Frontend logs:** Displayed in Terminal 2
**Database logs:** Check PostgreSQL logs directory

## Database Management

### Accessing PostgreSQL

```bash
# Connect to database
psql -U postgres -d odpms_db

# Common commands:
\dt                    # List all tables
\d table_name          # Describe table structure
SELECT * FROM users;   # Query data
\q                     # Exit
```

### Resetting Database

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE odpms_db;"
psql -U postgres -c "CREATE DATABASE odpms_db;"

# Re-run setup scripts
cd backend
psql -U postgres -d odpms_db -f database/schema.sql
psql -U postgres -d odpms_db -f database/init.sql
```

### Viewing Sample Data

```bash
psql -U postgres -d odpms_db

# View users
SELECT username, role FROM users;

# View hospitals
SELECT name, status FROM hospitals;

# View active recipients
SELECT * FROM v_active_waitlist;

# View system statistics
SELECT * FROM v_system_stats;
```

## Production Deployment

For production deployment, follow these additional steps:

1. **Set `NODE_ENV=production` in backend `.env`**
2. **Use strong passwords and secrets**
3. **Enable SSL/TLS for PostgreSQL connection**
4. **Configure proper CORS settings**
5. **Set up proper logging and monitoring**
6. **Use environment-specific configurations**
7. **Enable database backups**
8. **Deploy frontend build**: `npm run build` in frontend directory

## Next Steps

- Explore the application features
- Test the organ matching algorithm
- Try registering new donors and recipients
- Review the code structure
- Customize for your requirements

## Support

For issues or questions:
- Check this documentation
- Review error logs
- Check console output
- Verify database connection
- Ensure all services are running

## Security Notes

⚠️ **Important for Production:**
- Change all default passwords
- Use strong JWT secrets
- Enable HTTPS
- Implement rate limiting
- Regular security audits
- Keep dependencies updated
- Use environment variables for sensitive data
- Never commit `.env` file to version control

---

**Setup Complete! 🎉**

You now have a fully functional Organ Donation and Procurement Management System running locally.
