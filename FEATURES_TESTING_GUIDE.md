# 🎯 ODPMS Features & Testing Guide

## 📋 **Complete Feature List**

### **1. 🏥 Hospital Registration & Approval**
**What it does:**
- Hospitals can register publicly from the home page
- Admin reviews and approves/rejects hospitals
- Approved hospitals can login and use the system

**How to Test:**
1. Go to login page
2. Click "Register Here" at the bottom
3. Fill in hospital details (name, registration number, location, email, password)
4. Submit and see "Pending Admin Approval" message
5. Login as admin → Click "Hospital Approvals" tab
6. Approve the hospital
7. Now login as that hospital with the credentials you created

---

### **2. 🩸 Donor Registration (Hospital Staff)**
**What it does:**
- Hospital staff can register new donors (living or deceased)
- Records personal info, medical details, HLA typing
- Selects which organs are being donated

**How to Test:**
1. Login as Hospital Staff
2. Click "🩸 Register Donor" tab
3. Fill in:
   - Personal info (name, DOB, gender)
   - Medical info (blood type, HLA typing, weight, height)
   - Select donor type (Living/Deceased)
   - If deceased: cause of death
   - Consent information
   - **Select organs** (click on Heart, Kidney, Liver, etc.)
4. Submit → See success message

---

### **3. 🧑‍⚕️ Recipient Registration (Hospital Staff)**
**What it does:**
- Register patients needing organ transplants
- **Automatically creates patient login account**
- Places them on the waitlist with urgency level

**How to Test:**
1. Login as Hospital Staff
2. Click "🧑‍⚕️ Register Recipient" tab
3. Fill in:
   - Personal & medical information
   - Select urgency level (Critical/Urgent/Standard)
   - Select required organ(s)
   - Contact information
   - **Patient Portal Credentials** (username & password)
4. Submit → Patient account is created automatically!
5. **Test patient login:** Logout → Select "Patient" → Login with those credentials

---

### **4. 🫀 Organ Management (Hospital Staff)**
**What it does:**
- Create organ records from registered donors
- **TRIGGERS MATCHING ALGORITHM AUTOMATICALLY**
- Shows all available organs

**How to Test:**
1. Login as Hospital Staff
2. Click "🫀 Organ Management" tab
3. Click "+ Register New Organ"
4. Select a donor (from your registered donors)
5. Select organ type (Heart, Kidney, etc.)
6. Set procurement date
7. Submit → **Matching algorithm runs automatically!**
8. You'll see: "Organ registered! X compatible recipients found."
9. View all organs in the table below

---

### **5. 📋 Waitlist Management (Hospital Staff)**
**What it does:**
- View all recipients on the waitlist
- Update urgency levels
- Mark recipients as active/inactive
- See days on waitlist

**How to Test:**
1. Login as Hospital Staff
2. Click "📋 Waitlist" tab
3. See all recipients with:
   - Name, required organ, blood type
   - Urgency level (color-coded)
   - Status (Active/Inactive)
   - Days waiting
4. Click "Edit" on any recipient
5. Change urgency level or status
6. Click "Save"

---

### **6. 🎯 Organ Matching System (Hospital Staff)**
**What it does:**
- Shows ranked list of compatible recipients for available organs
- Displays compatibility scores
- Hospital can accept/reject matches
- **Sends email to patient when match is accepted**

**How to Test:**
1. First, register a donor and create an organ (this triggers matching)
2. Click "🎯 Matching" tab
3. See ranked matches with:
   - Compatibility score (highest first)
   - Patient name, blood type, urgency
   - Organ type
   - HLA match score
   - Geographic distance
4. Click "✅ Accept Match" on the best match
5. Confirm → Transplant is scheduled
6. **Patient receives email notification** (if email configured)

---

### **7. ✅ Transplant Logging (Hospital Staff)**
**What it does:**
- Track all transplant procedures
- Update status (Scheduled → In Progress → Successful/Failed)
- Record outcomes and complications

**How to Test:**
1. Login as Hospital Staff
2. Click "✅ Transplants" tab
3. See all transplant records
4. Click "Update Status" on any transplant
5. Change status (Scheduled/In Progress/Successful/Failed)
6. Add outcome notes and complications
7. Save → Status updated

---

### **8. 🧑‍⚕️ Patient Portal**
**What it does:**
- Patients can view their waitlist status
- See potential organ matches
- Update their contact information

**How to Test:**
1. Login as Patient (use credentials created during recipient registration)
2. See your waitlist status:
   - Current status (Active/Inactive/Matched)
   - Required organ
   - Urgency level
   - Days on waitlist
   - Blood type
3. View potential matches (if any)
4. Click "Edit Contact" to update phone, email, address
5. Save changes

---

### **9. 👨‍💼 Admin Dashboard**
**What it does:**
- View system-wide statistics
- Approve/reject hospitals
- **View all donors with complete details**

**How to Test:**
1. Login as Admin (username: `admin`, password: `admin123`)
2. See dashboard with statistics:
   - Active Donors
   - Recipients on Waitlist
   - Available Organs
   - Successful Transplants
3. **Click "Active Donors" card** → See all donors
4. Filter by hospital using dropdown
5. Click "View Details" on any donor → See complete information including all donated organs
6. Go to "Hospital Approvals" tab → Approve/reject hospitals

---

## 🚀 **Quick Start Guide**

### **Step 1: Start Backend Server**
```bash
cd backend
npm run dev
```
Server runs on: **http://localhost:3000**

### **Step 2: Start Frontend Server** (in new terminal)
```bash
cd frontend
npm run dev
```
Frontend runs on: **http://localhost:5173**

### **Step 3: Access the Application**
- Open browser: **http://localhost:5173**
- You'll see the login page with 3 role options

---

## 🔑 **Demo Credentials**

### **Admin:**
- Username: `admin`
- Password: `admin123`

### **Hospital Staff (if you've registered one):**
- Use the credentials you created during hospital registration

### **Patient:**
- Use the credentials you created during recipient registration

---

## 📊 **Complete Testing Workflow**

### **Test Scenario: Full Organ Donation Flow**

1. **Register Hospital:**
   - Go to login → Click "Register Here"
   - Register a new hospital
   - See "Pending Approval" message

2. **Approve Hospital (as Admin):**
   - Login as admin
   - Go to "Hospital Approvals"
   - Approve the hospital

3. **Login as Hospital Staff:**
   - Use hospital credentials
   - See hospital dashboard

4. **Register a Donor:**
   - Go to "Register Donor"
   - Fill in all details
   - Select organs (Heart, Kidney)
   - Submit

5. **Register a Recipient:**
   - Go to "Register Recipient"
   - Fill in patient details
   - Select urgency (Critical)
   - Select required organ (Heart)
   - Create patient username/password
   - Submit

6. **Create Organ Record:**
   - Go to "Organ Management"
   - Click "+ Register New Organ"
   - Select the donor you registered
   - Select organ type (Heart)
   - Submit → **Matching runs automatically!**

7. **View Matches:**
   - Go to "Matching" tab
   - See ranked list of compatible recipients
   - Accept the top match

8. **Login as Patient:**
   - Logout from hospital
   - Select "Patient" role
   - Login with patient credentials
   - See waitlist status and matches

9. **Log Transplant:**
   - Login back as Hospital Staff
   - Go to "Transplants" tab
   - Update transplant status to "Successful"

10. **View as Admin:**
    - Login as admin
    - Click "Active Donors" card
    - See all donors with organ details

---

## 🎯 **Key Features to Test**

### **1. Automatic Matching Algorithm** ⭐ Most Important!
- When you register an organ, matching runs automatically
- Finds compatible recipients based on:
  - Blood type (must match)
  - HLA tissue matching
  - Urgency level
  - Wait time
  - Geographic proximity
- Ranks recipients by compatibility score

### **2. Email Notifications**
- When hospital accepts a match, patient receives email
- Email includes organ type and surgery date
- (Requires email configuration in backend)

### **3. Patient Account Auto-Creation**
- When registering recipient, patient account is created
- Patient can immediately login
- No separate registration needed

### **4. Admin Donor Viewer**
- Click "Active Donors" card in admin dashboard
- View all donors from all hospitals
- Filter by hospital
- See complete donor info including all organs

---

## 🐛 **Troubleshooting**

### **If servers won't start:**
1. Check if PostgreSQL is running
2. Check if ports 3000 and 5173 are available
3. Verify database connection in `.env` file

### **If login fails:**
1. Check if user exists in database
2. Verify password is correct
3. Check backend logs for errors

### **If matching doesn't work:**
1. Ensure you have registered recipients
2. Check if blood types are compatible
3. Verify organ is marked as available

---

## 📝 **Notes**

- **Matching Algorithm:** Runs automatically when organ is registered
- **Patient Accounts:** Created automatically during recipient registration
- **Email Notifications:** Require email service configuration
- **Authorization:** Recipients can only see their own data
- **Hospital Staff:** Can only access their hospital's data
- **Admin:** Has full system access

---

## ✅ **Testing Checklist**

- [ ] Hospital registration works
- [ ] Admin can approve hospitals
- [ ] Hospital staff can register donors
- [ ] Hospital staff can register recipients
- [ ] Patient accounts are created automatically
- [ ] Patients can login to portal
- [ ] Organs can be registered
- [ ] Matching algorithm runs automatically
- [ ] Matches are displayed ranked by score
- [ ] Hospital can accept/reject matches
- [ ] Transplant records can be updated
- [ ] Admin can view all donors
- [ ] Admin can filter donors by hospital
- [ ] Patients can update contact info
- [ ] Waitlist management works
- [ ] All statistics display correctly

---

**Happy Testing! 🎉**

