# LifeLink - Organ Donation and Procurement Network Management System

A comprehensive web-based platform that connects organ donors, recipients, hospitals, and administrative bodies to automate and streamline the process of organ matching and allocation.

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (v14+)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer

### Frontend
- **Framework**: React (v18+)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Routing**: React Router v6

## 📋 Features

### Administrator Module
- System dashboard with real-time statistics
- User and hospital management
- Hospital verification and approval
- System-wide reporting and analytics
- Audit log monitoring

### Hospital Module
- Secure authentication for hospital staff
- Donor registration (living and deceased)
- Recipient management and waitlist tracking
- Real-time match notifications
- Transplant status logging

### Donor/Recipient Module
- Public donor registration form
- Recipient portal for waitlist status
- Educational content and FAQs
- Contact information management

### Core Features
- Automated organ matching algorithm
- Real-time notifications (email)
- Role-based access control (RBAC)
- Comprehensive audit logging
- Advanced search and filtering

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

### Installation

1. **Open a terminal in the project root directory** (the folder containing `backend` and `frontend`).

2. **Setup PostgreSQL Database**
```bash
# Create a new database
createdb lifelink_db

# Or using psql
psql -U postgres
CREATE DATABASE lifelink_db;
\q
```

3. **Install Backend Dependencies**
```bash
cd backend
npm install
```

4. **Configure Environment Variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials and settings
```

5. **Initialize Database Schema**
```bash
npm run db:init
```

6. **Start Backend Server**
```bash
npm run dev
```

7. **Install Frontend Dependencies** (in a new terminal)
```bash
cd frontend
npm install
```

8. **Start Frontend Development Server**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📁 Project Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Authentication, validation, error handling
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic and matching algorithm
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Express app entry point
│   ├── database/
│   │   ├── schema.sql      # Database schema
│   │   ├── init.sql        # Initial data and seed
│   │   └── migrations/     # Database migrations
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts for state management
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔐 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based authentication with secure tokens
- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS configuration
- HTTPS enforcement (production)
- Audit logging for all critical operations

## 🗃️ Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - System users (Admin, Hospital Staff, Recipients)
- `hospitals` - Registered medical institutions
- `donors` - Organ donors (living and deceased)
- `recipients` - Patients on the organ waitlist
- `organs` - Available organs from donors
- `matches` - Organ-recipient matches
- `transplants` - Completed transplant records
- `audit_logs` - System activity audit trail

## 🎯 Organ Matching Algorithm

The matching algorithm prioritizes recipients based on:
1. **Blood Type Compatibility** (Hard constraint)
2. **HLA Tissue Type Match** (Scored by compatibility)
3. **Urgency Level** (Critical > Urgent > Standard)
4. **Geographic Proximity** (Same hospital/region priority)
5. **Time on Waitlist** (Tie-breaker)

## 📧 Notifications

The system sends email notifications for:
- New organ matches found
- Transplant status updates
- Account activation and password reset
- System alerts for administrators

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 API Documentation

Setup instructions and the API reference are available in [PROJECT_GUIDE.md](PROJECT_GUIDE.md).

Key endpoints:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/donors` - List donors
- `POST /api/recipients` - Register recipient
- `GET /api/matches/:recipientId` - Get matches for recipient
- `POST /api/transplants` - Log transplant

## 🤝 Contributing

This is an academic project for DBMS course. For any issues or suggestions, please contact the project team.

## 📄 License

This project is developed for educational purposes as part of a Database Management Systems course project.

## 👥 Authors

- Rishi

## 🙏 Acknowledgments

- Course Instructor and Department Faculty
- Healthcare professionals who provided domain expertise
- Open-source community for the amazing tools and libraries
