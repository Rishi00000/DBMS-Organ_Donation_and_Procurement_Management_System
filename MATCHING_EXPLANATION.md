# 🎯 Organ Matching System - How It Works

## 📋 **Overview**

The Organ Matching System automatically finds compatible recipients when a new organ is registered. It uses a sophisticated algorithm that considers multiple criteria to ensure the best possible match.

---

## 🔄 **When Matching Happens**

### **Automatic Trigger:**
- **Matching runs automatically** when you:
  1. Register a new organ in "Organ Management"
  2. Click "Register Organ & Trigger Matching"
  3. The system immediately searches for compatible recipients

### **Matching Process:**
```
Register Organ → Matching Algorithm Runs → Compatible Recipients Found → Matches Created → Displayed in "Matching" Tab
```

---

## 🎯 **Matching Criteria (In Order of Importance)**

### **1. Blood Type Compatibility (Hard Requirement) ✅**
- **MUST match** - This is the most critical factor
- The system checks if the donor's blood type is compatible with the recipient's blood type
- **Compatible Blood Types:**
  - O- can donate to: O+, O-, A+, A-, B+, B-, AB+, AB- (universal donor)
  - O+ can donate to: O+, A+, B+, AB+
  - A- can donate to: A+, A-, AB+, AB-
  - A+ can donate to: A+, AB+
  - B- can donate to: B+, B-, AB+, AB-
  - B+ can donate to: B+, AB+
  - AB- can donate to: AB+, AB-
  - AB+ can donate to: AB+ only

### **2. Organ Type Match (Hard Requirement) ✅**
- The recipient must need the same organ type
- Example: Kidney can only match with recipients needing a kidney

### **3. Recipient Status (Hard Requirement) ✅**
- Recipient must be **"active"** on the waitlist
- Inactive recipients are not considered

### **4. HLA Typing Match (Scored: 0-12 points, 36% weight)**
- Human Leukocyte Antigen compatibility
- Higher HLA match = lower rejection risk
- Score of 12 = perfect match (best)
- Score of 0 = poor match (may still match if other factors are good)

### **5. Urgency Level (Scored: 24% weight)**
- **Critical** = 3 points (highest priority)
- **Urgent** = 2 points
- **Standard** = 1 point

### **6. Days on Waitlist (Scored: 10% weight)**
- Longer wait = higher priority
- Fair distribution ensures patients waiting longer get priority

### **7. Geographic Distance (Penalty: -10% weight)**
- Closer hospitals = better match
- Organs have limited viability time
- Shorter distance = faster transport = better organ condition

---

## 📊 **Compatibility Score Calculation**

The system calculates a **compatibility score (0-100)** using this formula:

```
Compatibility Score = 
  (Blood Compatible: 40 points) +
  (HLA Score × 3: up to 36 points) +
  (Urgency Score × 8: up to 24 points) +
  (Days on Waitlist / 365 × 10: up to 10 points) -
  (Distance Penalty: up to -10 points)
```

**Example:**
- Blood compatible: ✅ (40 points)
- HLA match score: 10 (30 points)
- Urgency: Critical (24 points)
- Days waiting: 30 days (1 point)
- Distance: 50km (penalty: -0.5 points)
- **Total Score: 94.5** (Excellent match!)

---

## 🏥 **Why You Might See "No Matches Found"**

### **Scenario: You have a kidney available and a patient needing a kidney**

**Possible Reasons:**

1. **Blood Type Mismatch** ❌
   - Most common reason
   - Example: Organ is A+, but patient is B+
   - **Solution:** Register more donors or wait for compatible blood type

2. **Recipient Not Active** ❌
   - Patient status is "inactive" instead of "active"
   - **Solution:** Go to Waitlist tab → Edit recipient → Set status to "active"

3. **HLA Mismatch** ⚠️
   - Very poor HLA match (score < 3)
   - Combined with other low scores, might not create a match
   - **Note:** This is rare, as even low HLA scores can still match if other factors are good

4. **Matching Algorithm Not Triggered** ⚠️
   - If organ was created before recipient was registered
   - Or if there was an error during organ registration
   - **Solution:** Re-register the organ or manually trigger matching

5. **Database Function Issues** ⚠️
   - Functions like `is_blood_compatible()` or `calculate_distance()` might have errors
   - **Solution:** Check backend logs for errors

---

## 🔍 **How to Debug "No Matches" Issue**

### **Step 1: Check Recipient Details**
- Go to **Waitlist** tab
- Verify patient:
  - Status = **"active"** ✅
  - Required organ matches available organ ✅
  - Blood type is compatible ✅

### **Step 2: Check Organ Details**
- Go to **Organ Management** tab
- Verify organ:
  - Status = **"Available"** ✅
  - Blood type matches recipient ✅
  - Organ type matches recipient need ✅

### **Step 3: Check for Matches in Database**
- Check backend logs when you registered the organ
- Look for: "🎯 Triggering organ matching algorithm..."
- Look for: "✅ Found X compatible recipients"

### **Step 4: Verify Matching Ran**
- When you register an organ, you should see:
  - "Organ registered! X compatible recipients found."
- If you see "0 compatible recipients found", check the criteria above

---

## 📈 **Example: Why Your Case Might Not Match**

**Your Situation:**
- **Organ:** Kidney, O- blood type, from Galla Hospital
- **Patient:** Hari Charan, needs kidney, O- blood type, Critical urgency, from Galla Hospital

**This SHOULD match!** ✅

**Possible Issues:**
1. **Matching didn't run** - Check if matching was triggered when organ was created
2. **Database function error** - `is_blood_compatible()` or `calculate_distance()` might have failed
3. **Recipient registered after organ** - If patient was registered after organ, matching might not have run again
4. **HLA data missing** - If recipient has no HLA typing, might affect scoring

---

## ✅ **When Patient Gets a Match**

A patient will receive a match when:

1. ✅ **Organ is registered** (or becomes available)
2. ✅ **Matching algorithm runs** (automatically triggered)
3. ✅ **All hard requirements met:**
   - Blood type compatible
   - Organ type matches
   - Recipient is active
4. ✅ **Compatibility score calculated** (even if score is low, it still creates a match)
5. ✅ **Match appears in "Matching" tab** (for recipients from your hospital)

**Note:** The matching algorithm creates matches for ALL compatible recipients across ALL hospitals, but you only see matches for YOUR hospital's patients in the "Matching" tab.

---

## 🛠️ **Troubleshooting Steps**

### **If No Matches Found:**

1. **Re-trigger Matching:**
   - Option 1: Delete and re-register the organ
   - Option 2: Update the organ status (this might trigger matching)

2. **Check Backend Logs:**
   - Look for errors in the matching service
   - Check if database functions are working

3. **Verify Data:**
   - Ensure recipient is "active"
   - Ensure blood types are truly compatible
   - Check HLA typing exists

4. **Manual Test:**
   - Try registering a test organ with same blood type as your patient
   - See if matching works

---

## 📝 **Summary**

**Your Question:** "Why no matches when I have a kidney and a patient needing kidney?"

**Answer:** This SHOULD match if:
- ✅ Blood types are compatible (O- matches O-)
- ✅ Organ type matches (kidney matches kidney)
- ✅ Recipient is active
- ✅ Matching algorithm ran successfully

**Most Likely Issue:** The matching algorithm might not have run when the organ was created, or there was an error during matching.

**Solution:** Try registering the organ again, or check backend logs for matching errors.

---

**Need Help?** Check the browser console and backend logs for detailed error messages when registering organs.

