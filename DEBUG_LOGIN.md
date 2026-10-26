# 🔍 Debug Login Issues

## Steps to Debug:

### 1. **Open Browser Console**
- Press `F12` or `Cmd+Option+I` (Mac)
- Go to **Console** tab
- Go to **Network** tab

### 2. **Clear Browser Storage**
- In Developer Tools, go to **Application** tab (Chrome) or **Storage** tab (Firefox)
- Click **Clear Storage** or manually delete:
  - Local Storage
  - Session Storage
  - Cookies

### 3. **Try Login and Check Console**
- Enter credentials: `admin` / `admin123`
- Click Login
- **Check Console tab** for:
  - `🔐 Login attempt:` - Should show your credentials
  - `📦 Response received:` - Should show server response
  - `✅ Login successful:` - Should show user data
  - OR `❌ Login error:` - Will show the actual error

### 4. **Check Network Tab**
- Look for the request to `http://localhost:3000/api/auth/login`
- Click on it to see:
  - **Request Headers**
  - **Request Payload** (should have username and password)
  - **Response** (should have token and user data)
  - **Status Code** (should be 200)

### 5. **Common Issues:**

#### Issue: CORS Error
- **Error Message:** "CORS policy: No 'Access-Control-Allow-Origin' header"
- **Fix:** Backend CORS is configured, but check if backend is running on port 3000

#### Issue: Network Error
- **Error Message:** "Network Error" or "Unable to connect"
- **Fix:** 
  - Check if backend is running: `lsof -i :3000`
  - Restart backend: `cd backend && npm run dev`

#### Issue: 401 Unauthorized
- **Error Message:** "Invalid credentials"
- **Fix:** 
  - Verify password hash: Run `cd backend && node fix-all-passwords.js`
  - Check username is correct: `admin` (not `Admin`)

#### Issue: 400 Bad Request
- **Error Message:** "Validation failed"
- **Fix:** Check that username and password are not empty

### 6. **Test Backend Directly:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Should return:
```json
{
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

---

## Quick Fixes:

### Fix 1: Clear Browser Cache
```bash
# Chrome: Settings > Privacy > Clear browsing data
# Or use Incognito mode
```

### Fix 2: Reset Passwords
```bash
cd backend
node fix-all-passwords.js
```

### Fix 3: Restart Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Fix 4: Check Environment Variables
Make sure `.env` file exists in `backend/` with:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=odpms_db
DB_USER=maheshvellogi
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

---

## Expected Console Output:

### Successful Login:
```
🔐 Login attempt: {username: "admin", role: "admin"}
📦 Response received: {message: "Login successful", data: {...}}
✅ Login successful: {user_id: 1, username: "admin", role: "admin"}
```

### Failed Login:
```
🔐 Login attempt: {username: "admin", role: "admin"}
❌ Login error: Error: Request failed with status code 401
❌ Error response: {status: 401, data: {error: "Invalid credentials"}}
❌ Error details: {error: "Invalid credentials"}
```

---

**If you see errors in console, share them and I'll help fix!**

