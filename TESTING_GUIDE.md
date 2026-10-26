# 🧪 ODPMS Testing Guide - Phase 1

## ✅ What's Ready to Test Right Now

### 🌐 Both Servers Are Running:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Database:** PostgreSQL connected ✅

---

## 🎯 Feature Testing Scenarios

### **Scenario 1: New Hospital Registration Flow** 🏥

#### Step 1: Register a New Hospital
1. Open browser: `http://localhost:5173/register-hospital`
2. Fill in the form:
   ```
   Hospital Name: City General Hospital
   Registration Number: CGH001
   Phone: +919876543210
   Address: 123 Main Street
   City: Mumbai
   State: Maharashtra
   Postal Code: 400001
   Email: info@citygeneral.com
   Username: citygen_admin
   Password: citygen123
   Confirm Password: citygen123
   ```
3. Click "Register Hospital"
4. ✅ You should see: **"Thank You for Registering!"** success page
5. ✅ Message should say: **"Waiting for admin approval"**

#### Step 2: Admin Approves the Hospital
1. Click "Back to Login" or go to: `http://localhost:5173/`
2. Select **"Admin"** role
3. Login with: `admin` / `admin123`
4. ✅ You'll see the Admin Dashboard with statistics
5. Click the **"Hospital Approvals"** tab at the top
6. ✅ You should see your newly registered hospital in the list
7. Review the hospital details
8. Click **"✅ Approve Hospital"**
9. Confirm the approval
10. ✅ Success! The hospital will disappear from pending list

#### Step 3: Hospital Can Now Login
1. Logout from admin (click "Logout" button)
2. Select **"Hospital Staff"** role
3. Login with the credentials you created: `citygen_admin` / `citygen123`
4. ✅ You should see: **"Hospital Staff Module - Coming soon"** page
5. This confirms the account is active!

---

### **Scenario 2: Admin Dashboard Exploration** 👨‍💼

1. Go to: `http://localhost:5173/`
2. Select **"Admin"** role
3. Login: `admin` / `admin123`
4. ✅ View real-time statistics:
   - Active Donors
   - Recipients on Waitlist
   - Available Organs
   - Successful Transplants
5. Navigate between tabs:
   - **Dashboard** - System overview
   - **Hospital Approvals** - Pending registrations

---

### **Scenario 3: Hospital Staff Login (Existing)** 🏥

1. Go to: `http://localhost:5173/`
2. Select **"Hospital Staff"** role
3. Login with existing account: `apollo_staff1` / `staff123`
4. ✅ See: "Hospital Staff Module - Coming soon"
5. Can logout successfully

---

### **Scenario 4: Patient Login (Existing)** 🧑‍⚕️

1. Go to: `http://localhost:5173/`
2. Select **"Patient"** role
3. Login: `patient_arjun` / `patient123`
4. ✅ See: "Patient Portal - Coming soon"
5. Can logout successfully

---

### **Scenario 5: Hospital Rejection Flow** ❌

1. Register another hospital (use different details)
2. Login as admin
3. Go to "Hospital Approvals"
4. Click **"❌ Reject"** on a pending hospital
5. Enter rejection reason (e.g., "Incomplete documentation")
6. ✅ Hospital is rejected
7. Try to login with that hospital's credentials
8. ❌ Should fail - account not activated

---

## 🔍 What to Look For (Quality Checks)

### ✅ UI/UX Features:
- [ ] Login page shows all 3 role cards
- [ ] Selected role is highlighted
- [ ] Forms validate required fields
- [ ] Passwords must match during registration
- [ ] Success/error messages display clearly
- [ ] Buttons change color on hover
- [ ] Responsive layout on different screen sizes

### ✅ Functionality:
- [ ] Can't register hospital with duplicate registration number
- [ ] Can't register with duplicate username/email
- [ ] Hospital account is inactive until admin approves
- [ ] Admin can see all pending hospitals
- [ ] Approval activates the hospital user account
- [ ] Statistics update in real-time
- [ ] Logout works from all dashboards
- [ ] Role-based access works correctly

### ✅ Security:
- [ ] Can't access admin pages without admin login
- [ ] Can't approve hospitals without admin role
- [ ] Passwords are hashed (not visible in database)
- [ ] JWT tokens are used for authentication
- [ ] Session persists after page refresh

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:** Check both servers are running:
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`

### Issue: "Invalid credentials" on login
**Solution:** Use exact credentials (case-sensitive):
- Admin: `admin` / `admin123`
- Hospital: `apollo_staff1` / `staff123`
- Patient: `patient_arjun` / `patient123`

### Issue: Registered hospital not appearing in pending list
**Solution:** 
1. Check backend console for errors
2. Verify database connection
3. Query database: `SELECT * FROM hospitals WHERE status = 'pending';`

### Issue: Can't login after hospital approval
**Solution:** 
1. Check if user is activated in database
2. Query: `SELECT is_active FROM users WHERE username = 'your_username';`
3. Should return `true` (t) after approval

---

## 📊 Database Verification Queries

### Check if hospital was registered:
```sql
SELECT h.*, u.username, u.is_active 
FROM hospitals h
LEFT JOIN hospital_staff hs ON h.hospital_id = hs.hospital_id
LEFT JOIN users u ON hs.user_id = u.user_id
WHERE h.name = 'City General Hospital';
```

### Check pending hospitals:
```sql
SELECT * FROM hospitals WHERE status = 'pending';
```

### Check if user is activated:
```sql
SELECT username, email, role, is_active 
FROM users 
WHERE username = 'citygen_admin';
```

### View audit logs:
```sql
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;
```

---

## 📸 Expected Screenshots

### Login Page:
- 3 role cards (Admin, Hospital, Patient)
- Clean, modern gradient design
- Demo credentials shown

### Hospital Registration:
- Multi-section form (Hospital Info, Address, Credentials)
- All fields clearly labeled
- Submit button at bottom

### Success Page:
- Large green checkmark
- "Thank you" message
- "Pending approval" warning
- "Back to Login" button

### Admin Dashboard:
- Statistics in cards (4 cards)
- Navigation tabs at top
- Clean, professional layout

### Hospital Approvals:
- List of pending hospitals
- Detailed information for each
- Approve and Reject buttons
- Empty state when no pending hospitals

---

## 🎯 Success Criteria

You know Phase 1 is working perfectly when:

✅ You can register a new hospital  
✅ Registration shows pending approval message  
✅ Admin can see pending hospitals  
✅ Admin can approve hospitals  
✅ Approved hospitals can login  
✅ Rejected hospitals cannot login  
✅ Statistics display correctly  
✅ Logout works from all pages  
✅ All role-based access controls work  
✅ No console errors in browser or backend  

---

## 🚀 Ready for Phase 2?

Once you've tested everything above and it works:
- ✅ Hospital Registration & Approval System - **WORKING**
- ✅ Role-Based Login - **WORKING**
- ✅ Admin Dashboard - **WORKING**

**Next:** I'll implement the Hospital Staff Module with:
- Donor Registration Form
- Recipient Registration Form
- Organ Matching Algorithm
- Waitlist Management
- Transplant Logging

---

## 💬 Feedback Needed

After testing, please let me know:
1. ✅ Does everything work as expected?
2. 🐛 Any bugs or issues found?
3. 💡 Any UI/UX improvements needed?
4. 🚀 Ready to proceed with Hospital Staff Module?
