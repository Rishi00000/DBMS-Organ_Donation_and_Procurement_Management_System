# ODPMS API Documentation

Complete REST API documentation for the Organ Donation and Procurement Management System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Obtaining a Token

**POST** `/api/auth/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "admin",
      "email": "admin@odpms.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

**Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "role": "hospital_staff",
  "additionalInfo": {
    "hospital_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "designation": "Transplant Coordinator",
    "license_number": "TC-123",
    "phone": "+919876543210"
  }
}
```

### Get Profile

**GET** `/api/auth/profile`

**Headers:** Authorization required

### Change Password

**PUT** `/api/auth/change-password`

**Headers:** Authorization required

**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Hospital Endpoints

### Get All Hospitals

**GET** `/api/hospitals`

**Query Parameters:**
- `status` - Filter by status (pending, approved, rejected)
- `city` - Filter by city
- `state` - Filter by state
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)

**Response:**
```json
{
  "data": [
    {
      "hospital_id": 1,
      "name": "Apollo Hospital",
      "registration_number": "APL-2024-001",
      "address": "21, Greams Lane",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "phone": "+914428293333",
      "email": "info@apollochennai.com",
      "status": "approved"
    }
  ]
}
```

### Get Hospital by ID

**GET** `/api/hospitals/:id`

### Create Hospital

**POST** `/api/hospitals`

**Body:**
```json
{
  "name": "New Hospital",
  "registration_number": "NH-2024-001",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "phone": "+912212345678",
  "email": "info@newhospital.com",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

### Approve Hospital (Admin only)

**PUT** `/api/hospitals/:id/approve`

### Reject Hospital (Admin only)

**PUT** `/api/hospitals/:id/reject`

---

## Donor Endpoints

### Get All Donors

**GET** `/api/donors`

**Query Parameters:**
- `hospital_id` - Filter by hospital
- `blood_type` - Filter by blood type
- `status` - Filter by status
- `is_living` - Filter living/deceased (true/false)

### Get Donor by ID

**GET** `/api/donors/:id`

### Create Donor

**POST** `/api/donors`

**Body:**
```json
{
  "hospital_id": 1,
  "first_name": "John",
  "last_name": "Smith",
  "date_of_birth": "1985-05-15",
  "gender": "Male",
  "blood_type": "O+",
  "hla_typing": "A*02:01-B*07:02-DRB1*15:01",
  "weight_kg": 75.5,
  "height_cm": 175.0,
  "phone": "+919876543210",
  "email": "john@example.com",
  "address": "123 Street",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "is_living": false,
  "consent_signed": true,
  "consent_date": "2024-01-15",
  "status": "active"
}
```

### Update Donor

**PUT** `/api/donors/:id`

### Delete Donor

**DELETE** `/api/donors/:id`

---

## Recipient Endpoints

### Get All Recipients

**GET** `/api/recipients`

**Query Parameters:**
- `hospital_id`
- `blood_type`
- `required_organ`
- `urgency_level` - critical, urgent, standard
- `status` - active, matched, transplanted

### Get Active Waitlist

**GET** `/api/recipients/waitlist`

Returns all active recipients sorted by urgency and wait time.

### Create Recipient

**POST** `/api/recipients`

**Body:**
```json
{
  "hospital_id": 1,
  "first_name": "Jane",
  "last_name": "Doe",
  "date_of_birth": "1990-03-20",
  "gender": "Female",
  "blood_type": "A+",
  "required_organ": "kidney",
  "hla_typing": "A*01:01-B*08:01-DRB1*03:01",
  "urgency_level": "critical",
  "medical_condition": "End-stage renal disease",
  "weight_kg": 62.0,
  "height_cm": 165.0,
  "phone": "+919123456789",
  "email": "jane@example.com",
  "address": "456 Avenue",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

### Update Recipient

**PUT** `/api/recipients/:id`

---

## Organ Endpoints

### Get All Organs

**GET** `/api/organs`

**Query Parameters:**
- `donor_id`
- `organ_type` - heart, kidney, liver, lung, pancreas, intestine, cornea
- `blood_type`
- `is_available` - true/false

### Get Available Organs

**GET** `/api/organs/available`

Returns only currently available organs.

### Create Organ

**POST** `/api/organs`

**Body:**
```json
{
  "donor_id": 1,
  "organ_type": "kidney",
  "blood_type": "O+",
  "hla_typing": "A*02:01-B*07:02-DRB1*15:01",
  "procurement_date": "2024-10-25T08:30:00Z",
  "expiry_time": "2024-10-27T08:30:00Z",
  "organ_condition": "Excellent condition"
}
```

**Response:** Includes organ details and top matches found

### Trigger Matching

**POST** `/api/organs/:id/match`

Manually triggers the matching algorithm for an organ.

---

## Match Endpoints

### Get All Matches

**GET** `/api/matches`

**Query Parameters:**
- `status` - pending, accepted, rejected
- `recipient_id`
- `organ_id`

### Get Match by ID

**GET** `/api/matches/:id`

### Get Recipient Matches

**GET** `/api/matches/recipient/:recipientId`

### Accept Match

**POST** `/api/matches/:id/accept`

Creates a transplant record and updates statuses.

### Reject Match

**POST** `/api/matches/:id/reject`

**Body:**
```json
{
  "reason": "Medical contraindication found"
}
```

### Get Matching Statistics

**GET** `/api/matches/stats`

---

## Transplant Endpoints

### Get All Transplants

**GET** `/api/transplants`

**Query Parameters:**
- `status` - scheduled, in_progress, successful, failed
- `hospital_id`

### Get Transplant by ID

**GET** `/api/transplants/:id`

### Update Transplant Status

**PUT** `/api/transplants/:id/status`

**Body:**
```json
{
  "status": "successful",
  "outcome_notes": "Surgery completed successfully",
  "complications": "None",
  "completion_date": "2024-10-26T15:30:00Z"
}
```

---

## Admin Endpoints

### Get Dashboard Statistics

**GET** `/api/admin/dashboard`

**Response:**
```json
{
  "data": {
    "active_donors": 4,
    "active_recipients": 5,
    "available_organs": 3,
    "successful_transplants": 0,
    "approved_hospitals": 4,
    "pending_matches": 3
  }
}
```

### Get All Users

**GET** `/api/admin/users`

**Query Parameters:**
- `role` - admin, hospital_staff, recipient
- `is_active` - true/false

### Deactivate User

**PUT** `/api/admin/users/:id/deactivate`

### Activate User

**PUT** `/api/admin/users/:id/activate`

### Get Audit Logs

**GET** `/api/admin/audit-logs`

**Query Parameters:**
- `user_id`
- `action` - INSERT, UPDATE, DELETE
- `table_name`
- `page`
- `limit`

### Generate Report

**GET** `/api/admin/reports`

**Query Parameters:**
- `report_type` - transplants, waitlist
- `start_date` - YYYY-MM-DD
- `end_date` - YYYY-MM-DD

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Invalid email address",
      "param": "email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An error occurred while processing your request"
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP

When rate limit is exceeded:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Matching Algorithm

The organ matching algorithm considers multiple factors:

1. **Blood Type Compatibility** (40% weight) - Hard constraint
2. **HLA Tissue Match** (36% weight) - Scored 0-12
3. **Urgency Level** (24% weight) - Critical > Urgent > Standard
4. **Wait Time** (10% weight) - Days on waitlist
5. **Geographic Distance** (-10% penalty) - Hospital proximity

**Compatibility Score Formula:**
```
Score = (Blood_Compatible * 40) 
      + (HLA_Score * 3)
      + (Urgency * 8)
      + (Days_Waiting / 365 * 10)
      - (Distance / 1000 * 10)
```

Results are sorted by compatibility score in descending order.

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Validate input data** before sending requests
3. **Handle errors gracefully** in your client application
4. **Implement retry logic** for failed requests
5. **Use pagination** for large datasets
6. **Cache responses** when appropriate
7. **Log API interactions** for debugging

---

## Support

For API issues or questions:
- Check response error messages
- Verify authentication token
- Review request payload format
- Check server logs
- Consult this documentation

---

**API Version:** 1.0.0  
**Last Updated:** November 2024
