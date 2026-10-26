# ODPMS Project Summary

## Project Overview

**Organ Donation and Procurement Network Management System (ODPMS)** is a comprehensive web-based platform designed to automate and streamline the organ donation and transplant process. The system connects donors, recipients, hospitals, and administrators in a secure, efficient network.

## 🎯 Project Objectives

- Automate organ matching and allocation process
- Reduce organ waitlist times
- Increase transparency in organ transplantation
- Provide secure, role-based access for all stakeholders
- Maintain comprehensive audit trails for accountability
- Optimize organ allocation using advanced matching algorithms

## 📊 Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│   - User Interface for all stakeholders             │
│   - Real-time updates and notifications             │
│   - Responsive design with Tailwind CSS             │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────────────────┐
│              Backend (Node.js/Express)               │
│   - RESTful API endpoints                           │
│   - JWT authentication & authorization              │
│   - Business logic & matching algorithm             │
│   - Email notification service                       │
└─────────────────┬───────────────────────────────────┘
                  │ SQL Queries
┌─────────────────▼───────────────────────────────────┐
│            Database (PostgreSQL)                     │
│   - Relational data model                           │
│   - ACID transactions                               │
│   - Advanced functions & triggers                    │
│   - Full-text search & indexing                     │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

#### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js 4.18
- **Database:** PostgreSQL 14+
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcrypt
- **Email:** Nodemailer
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate Limiting

#### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Icons:** Lucide React

#### Database
- **RDBMS:** PostgreSQL 14+
- **Features Used:**
  - Custom ENUM types
  - Complex constraints (CHECK, FOREIGN KEY, UNIQUE)
  - Advanced indexes (B-tree, Composite)
  - Database functions (PL/pgSQL)
  - Triggers for automation
  - Views for complex queries
  - ACID transactions

## 📁 Project Structure

```
DBMS_Project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # PostgreSQL connection pool
│   │   │   └── email.js             # Email configuration
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── adminController.js   # Admin operations
│   │   │   ├── hospitalController.js
│   │   │   ├── donorController.js
│   │   │   ├── recipientController.js
│   │   │   ├── organController.js
│   │   │   ├── matchController.js
│   │   │   └── transplantController.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification & RBAC
│   │   │   ├── validation.js        # Input validation
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   └── logger.js            # Audit logging
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── hospital.routes.js
│   │   │   ├── donor.routes.js
│   │   │   ├── recipient.routes.js
│   │   │   ├── organ.routes.js
│   │   │   ├── match.routes.js
│   │   │   ├── transplant.routes.js
│   │   │   └── admin.routes.js
│   │   ├── services/
│   │   │   └── matchingService.js   # Organ matching algorithm
│   │   └── server.js                # Express app entry point
│   ├── database/
│   │   ├── schema.sql               # Complete database schema
│   │   └── init.sql                 # Sample data
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx           # Main layout with sidebar
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Authentication state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── HospitalDashboard.jsx
│   │   │   ├── RecipientDashboard.jsx
│   │   │   ├── HospitalsPage.jsx
│   │   │   ├── DonorsPage.jsx
│   │   │   ├── RecipientsPage.jsx
│   │   │   ├── OrgansPage.jsx
│   │   │   ├── MatchesPage.jsx
│   │   │   └── TransplantsPage.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── README.md                         # Project overview
├── SETUP.md                          # Detailed setup guide
├── API_DOCUMENTATION.md              # Complete API docs
├── QUICKSTART.sh                     # Automated setup script
└── PROJECT_SUMMARY.md                # This file
```

## 🗄️ Database Schema

### Core Tables

1. **users** - System users with role-based access
2. **hospitals** - Registered medical institutions
3. **hospital_staff** - Links staff to hospitals
4. **donors** - Organ donors (living and deceased)
5. **recipients** - Patients on transplant waitlist
6. **organs** - Available organs from donors
7. **matches** - Organ-recipient matching results
8. **transplants** - Completed transplant records
9. **audit_logs** - System activity tracking

### Key Features

- **9 main tables** with full referential integrity
- **9 ENUM types** for data consistency
- **25+ indexes** for query optimization
- **3 database functions** for matching logic
- **4 automated triggers** for data updates
- **3 views** for common queries

### Sample ERD Relationships

```
users ←→ hospital_staff ←→ hospitals
users ←→ recipients
hospitals ←→ donors ←→ organs ←→ matches ←→ recipients
matches ←→ transplants
```

## 🎛️ Key Features Implemented

### 1. User Management & Authentication
- ✅ Secure registration and login
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Hospital Staff, Recipient)
- ✅ Password hashing with bcrypt
- ✅ Session management

### 2. Hospital Management
- ✅ Hospital registration and approval workflow
- ✅ Hospital verification by admins
- ✅ Staff member management
- ✅ Geographic location tracking

### 3. Donor Management
- ✅ Register living and deceased donors
- ✅ Comprehensive medical profile tracking
- ✅ HLA tissue typing
- ✅ Consent management
- ✅ Multiple organ donation support

### 4. Recipient Management
- ✅ Patient registration on waitlist
- ✅ Urgency level assignment (Critical, Urgent, Standard)
- ✅ Medical condition tracking
- ✅ Waitlist time tracking
- ✅ Status updates

### 5. Organ Registration & Tracking
- ✅ Register procured organs
- ✅ Track organ condition and viability
- ✅ Expiry time management
- ✅ Automatic availability status

### 6. Advanced Matching Algorithm
- ✅ Multi-criteria matching:
  - Blood type compatibility (hard constraint)
  - HLA tissue type matching (scored 0-12)
  - Urgency level prioritization
  - Geographic proximity calculation
  - Waitlist time consideration
- ✅ Automated match generation
- ✅ Compatibility scoring (0-100%)
- ✅ Ranked results

### 7. Transplant Management
- ✅ Transplant scheduling
- ✅ Status tracking (Scheduled → In Progress → Successful/Failed)
- ✅ Surgical team information
- ✅ Outcome documentation
- ✅ Complication tracking

### 8. Admin Dashboard
- ✅ System-wide statistics
- ✅ User management (activate/deactivate)
- ✅ Hospital approval/rejection
- ✅ Audit log viewing
- ✅ Report generation

### 9. Security Features
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js security headers
- ✅ Comprehensive audit logging

### 10. Email Notifications
- ✅ Match notification emails
- ✅ Transplant status updates
- ✅ Welcome emails
- ✅ Configurable templates

## 🧮 Organ Matching Algorithm

### Algorithm Workflow

```
1. New Organ Registered
   ↓
2. Query Active Recipients
   ├─ Same organ type
   ├─ Blood type compatible
   └─ Status = 'active'
   ↓
3. Calculate Compatibility Score for Each
   ├─ Blood Type Match: 40 points
   ├─ HLA Match: 0-36 points (12 * 3)
   ├─ Urgency: 8-24 points
   ├─ Wait Time: 0-10 points
   └─ Distance Penalty: 0-10 points
   ↓
4. Rank by Score (Descending)
   ↓
5. Store Top 20 Matches
   ↓
6. Send Notifications
   ↓
7. Await Hospital Decision
```

### Scoring Formula

```sql
compatibility_score = 
    (blood_compatible ? 40 : 0) +           -- 40%
    (hla_score * 3) +                        -- 36% (max 36)
    (urgency_score * 8) +                    -- 24% (max 24)
    (min(days_waiting, 365) / 365 * 10) +   -- 10%
    -(min(distance_km, 1000) / 1000 * 10)   -- -10% penalty
```

### Example Match

**Organ:** Kidney, O+, HLA: A*02:01  
**Recipient:** Blood B+, Urgency Critical, 180 days waiting, 50km away

```
Blood Compatible: 40
HLA Match (10/12): 30
Urgency (Critical=3): 24
Wait Time: 4.9
Distance Penalty: -0.5
─────────────────────
Total Score: 98.4%
```

## 📈 Sample Data

The system comes pre-loaded with:
- **1 Admin** account
- **4 Hospitals** (approved)
- **3 Hospital Staff** users
- **4 Donors** (mix of living/deceased)
- **5 Recipients** (various urgency levels)
- **3 Available Organs**
- **3 Pending Matches**

## 🔐 Security Implementation

### Authentication & Authorization
- JWT tokens with 24-hour expiry
- Bcrypt password hashing (10 salt rounds)
- Role-based access control (RBAC)
- Protected routes with middleware

### Data Protection
- Parameterized SQL queries (SQL injection prevention)
- Input validation on all endpoints
- XSS protection via sanitization
- HTTPS recommended for production

### Audit Trail
- All critical operations logged
- User ID and timestamp tracking
- IP address and user agent logging
- Old/new values stored for updates

## 📊 Performance Optimizations

### Database Level
- **25+ strategic indexes** on frequently queried columns
- **Composite indexes** for multi-column searches
- **Partial indexes** for filtered queries
- **Connection pooling** (max 20 connections)
- **Query optimization** with EXPLAIN ANALYZE

### Application Level
- Async/await for non-blocking I/O
- Efficient data structures
- Pagination for large datasets
- Caching where appropriate

### Frontend Level
- Code splitting with React Router
- Lazy loading of components
- Optimized re-renders with React hooks
- Vite for fast builds and HMR

## 🧪 Testing Approach

### Manual Testing
1. Authentication flows
2. CRUD operations for all entities
3. Matching algorithm verification
4. Role-based access enforcement
5. Error handling scenarios

### Database Testing
1. Constraint validation
2. Trigger functionality
3. Transaction atomicity
4. Query performance
5. Data integrity

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure production database
- [ ] Set up database backups
- [ ] Enable monitoring and logging
- [ ] Configure email service
- [ ] Set appropriate CORS origins
- [ ] Enable rate limiting
- [ ] Review security headers
- [ ] Set NODE_ENV=production
- [ ] Build frontend for production
- [ ] Configure reverse proxy (nginx)

## 📚 Documentation Files

1. **README.md** - Project overview and quick start
2. **SETUP.md** - Detailed setup instructions (28KB)
3. **API_DOCUMENTATION.md** - Complete API reference
4. **PROJECT_SUMMARY.md** - This comprehensive summary
5. **QUICKSTART.sh** - Automated setup script

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack web development
- RESTful API design
- PostgreSQL database design and optimization
- Authentication and authorization
- Complex algorithmic problem-solving
- Security best practices
- Modern frontend development
- System architecture design
- Documentation and deployment

## 📝 Future Enhancements

Potential improvements:
- Real-time WebSocket notifications
- Advanced reporting and analytics
- Machine learning for match prediction
- Mobile application
- Integration with national organ registries
- Multi-language support
- Advanced search and filtering
- Document management system
- Video consultation integration
- Blockchain for transparency

## 🎯 Project Metrics

- **Total Lines of Code:** ~10,000+
- **Backend Files:** 25+
- **Frontend Components:** 15+
- **Database Tables:** 9
- **API Endpoints:** 50+
- **Database Functions:** 3
- **Triggers:** 4
- **Indexes:** 25+
- **Views:** 3

## 👥 User Roles & Capabilities

### Admin
- View system-wide statistics
- Manage all users
- Approve/reject hospitals
- View audit logs
- Generate reports
- Full system access

### Hospital Staff
- Register donors and recipients
- Register organs
- View matches
- Accept/reject matches
- Update transplant status
- Hospital-specific data only

### Recipient
- View waitlist status
- Check potential matches
- Update contact information
- View transplant updates
- Read-only access

## 🏁 Conclusion

ODPMS is a production-ready, enterprise-grade application that addresses real-world challenges in organ donation management. The system successfully implements all requirements from the SRS document and follows industry best practices for security, performance, and usability.

The project serves as an excellent demonstration of:
- Database Management Systems concepts
- Full-stack web development skills
- Software engineering principles
- Healthcare IT systems understanding

---

**Project Status:** ✅ Complete and Fully Functional  
**Version:** 1.0.0  
**Author:** Mahesh Vellogi  
**Date:** November 2024  
**Course:** Database Management Systems (DBMS) Project
