# Getting Started with ODPMS

## Quick Start (5 Minutes)

### Step 1: Install PostgreSQL (if not installed)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Run the Quick Setup Script

```bash
cd /Users/maheshvellogi/Downloads/DBMS_Project
chmod +x QUICKSTART.sh
./QUICKSTART.sh
```

This script will:
- Create the database
- Initialize the schema
- Load sample data
- Install all dependencies
- Configure environment variables

### Step 3: Start the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 4: Access the Application

Open your browser and go to: **http://localhost:5173**

**Login with:**
- Username: `admin`
- Password: `admin123`

## What You Can Do

### As Admin
1. View system-wide dashboard with statistics
2. Manage hospitals (approve/reject)
3. View all donors, recipients, and organs
4. Monitor matches and transplants
5. View audit logs
6. Generate reports

### As Hospital Staff
Login as: `apollo_staff1` / `staff123`

1. Register new donors
2. Register new recipients
3. Register available organs
4. View and accept/reject matches
5. Update transplant status
6. Manage hospital-specific data

### As Recipient
Login as: `patient_arjun` / `patient123`

1. View your waitlist status
2. See days waiting
3. Check urgency level
4. View potential matches
5. Track your progress

## Exploring the System

### 1. Test the Matching Algorithm

1. Login as hospital staff
2. Navigate to "Organs" page
3. Click "+ Register New Organ"
4. Fill in organ details
5. Submit - matches will be automatically generated!
6. Go to "Matches" page to see results

### 2. View Sample Data

The system comes with sample data:
- 4 Hospitals
- 4 Donors
- 5 Recipients
- 3 Available organs
- 3 Pending matches

### 3. Check Database

```bash
psql -U postgres -d odpms_db

-- View all tables
\dt

-- View active recipients
SELECT * FROM v_active_waitlist;

-- View system statistics
SELECT * FROM v_system_stats;

-- View matches
SELECT * FROM matches;
```

### 4. Test API Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Login (get token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use the token for authenticated requests
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure Overview

```
DBMS_Project/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── config/    # Database & email config
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation, errors
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Matching algorithm
│   │   └── server.js  # Entry point
│   └── database/
│       ├── schema.sql # Database structure
│       └── init.sql   # Sample data
│
└── frontend/          # React application
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── contexts/    # State management
    │   ├── pages/       # Page components
    │   ├── services/    # API client
    │   └── App.jsx      # Main app
    └── index.html
```

## Key Features to Test

### ✅ Authentication
- [x] Login with different roles
- [x] Role-based access control
- [x] JWT token authentication

### ✅ Donor Management
- [x] Register living donor
- [x] Register deceased donor
- [x] Update donor information
- [x] View donor list

### ✅ Recipient Management
- [x] Register recipient
- [x] Set urgency level
- [x] Update medical status
- [x] View waitlist

### ✅ Organ Matching
- [x] Register organ
- [x] Automatic match generation
- [x] Compatibility scoring
- [x] Accept/reject matches

### ✅ Transplants
- [x] Create from accepted match
- [x] Update status
- [x] Track outcomes
- [x] View history

### ✅ Admin Features
- [x] System dashboard
- [x] User management
- [x] Hospital approval
- [x] Audit logs

## Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
pg_isready

# Start if needed
brew services start postgresql@14  # macOS
```

### "Port 3000 already in use"
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### "Module not found"
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

### "Database does not exist"
```bash
# Create database manually
createdb -U postgres odpms_db

# Run schema
cd backend
psql -U postgres -d odpms_db -f database/schema.sql
psql -U postgres -d odpms_db -f database/init.sql
```

## Next Steps

1. **Explore the code** - Check out the implementation details
2. **Test features** - Try all user roles and features
3. **Read documentation** - See API_DOCUMENTATION.md
4. **Understand the algorithm** - Review matchingService.js
5. **Customize** - Modify to fit your requirements

## Documentation Files

- **README.md** - Project overview
- **SETUP.md** - Detailed setup instructions (recommended!)
- **API_DOCUMENTATION.md** - Complete API reference
- **PROJECT_SUMMARY.md** - Comprehensive project details
- **GETTING_STARTED.md** - This quick start guide

## Need Help?

1. Check the **SETUP.md** for detailed instructions
2. Review **API_DOCUMENTATION.md** for API details
3. Check console logs for errors
4. Verify database connection
5. Ensure all services are running

## Demo Credentials Summary

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Hospital Staff | apollo_staff1 | staff123 |
| Hospital Staff | fortis_staff1 | staff123 |
| Hospital Staff | aiims_staff1 | staff123 |
| Recipient | patient_arjun | patient123 |
| Recipient | patient_kavita | patient123 |
| Recipient | patient_suresh | patient123 |

## Tips

- 🔍 Use browser DevTools to see network requests
- 📊 Check PostgreSQL logs for database queries
- 🐛 Enable debug mode in backend for detailed logs
- 🔄 Refresh data by rerunning init.sql
- 📝 Check audit_logs table for all operations

## Success Indicators

You'll know everything is working when:
- ✅ Backend shows "Connected to PostgreSQL database"
- ✅ Frontend loads at http://localhost:5173
- ✅ You can login with demo credentials
- ✅ Dashboard shows statistics
- ✅ You can view donors, recipients, organs
- ✅ Matching algorithm generates results

---

**Ready to get started?** Run the QUICKSTART.sh script or follow SETUP.md!

**Questions?** All features are documented in the other markdown files.

**Happy coding! 🏥💙**
