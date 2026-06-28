# 📚 STUDENT MODULE API DOCUMENTATION

## Base URL
```
http://localhost:8000/api/v1/students
```

---

## 🔐 Endpoints

### 1️⃣ CREATE STUDENT PROFILE

**Endpoint:** `POST /api/v1/students`  
**Auth:** ✅ Required (Bearer Token)  
**Status Code:** 201 Created

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Raj",
  "lastName": "Kumar",
  "rollNumber": "BT20CSE001",
  "phone": "9876543210",
  "department": "CSE",
  "batch": 2023,
  "cgpa": 8.5,
  "college": "BITS Pilani"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student profile created successfully",
  "data": {
    "id": "student_id_123",
    "firstName": "Raj",
    "lastName": "Kumar",
    "rollNumber": "BT20CSE001",
    "email": "student@college.com",
    "phone": "9876543210",
    "department": "CSE",
    "batch": 2023,
    "cgpa": 8.5,
    "verificationStatus": "PENDING",
    "college": "BITS Pilani",
    "createdAt": "2024-05-28T10:30:00Z"
  }
}
```

**Validation Errors (400):**
```json
{
  "success": false,
  "message": "Invalid roll number format. Expected: BT20CSE001 or 20CSE001",
  "statusCode": 400
}
```

---

### 2️⃣ GET STUDENT PROFILE BY ID

**Endpoint:** `GET /api/v1/students/:id`  
**Auth:** ❌ Not Required  
**Status Code:** 200 OK

**URL Params:**
```
:id = student_id_123
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "student_id_123",
    "firstName": "Raj",
    "lastName": "Kumar",
    "rollNumber": "BT20CSE001",
    "email": "student@college.com",
    "phone": "9876543210",
    "department": "CSE",
    "batch": 2023,
    "cgpa": 8.5,
    "college": "BITS Pilani",
    "profilePhoto": null,
    "verificationStatus": "PENDING",
    "isProfileVerified": false,
    "rejectionReason": null,
    "isProfileLocked": false,
    "createdAt": "2024-05-28T10:30:00Z",
    "updatedAt": "2024-05-28T10:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Student profile not found",
  "statusCode": 404
}
```

---

### 3️⃣ GET CURRENT USER'S PROFILE

**Endpoint:** `GET /api/v1/students/me/profile`  
**Auth:** ✅ Required (Bearer Token)  
**Status Code:** 200 OK

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "student_id_123",
    "firstName": "Raj",
    "lastName": "Kumar",
    "rollNumber": "BT20CSE001",
    "email": "student@college.com",
    "phone": "9876543210",
    "department": "CSE",
    "batch": 2023,
    "cgpa": 8.5,
    "isProfileVerified": false,
    "createdAt": "2024-05-28T10:30:00Z"
  }
}
```

---

### 4️⃣ UPDATE STUDENT PROFILE

**Endpoint:** `PUT /api/v1/students/:id`  
**Auth:** ✅ Required (Bearer Token)  
**Status Code:** 200 OK

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "firstName": "Rajesh",
  "cgpa": 9.0,
  "phone": "9876543211",
  "profilePhoto": "https://cdn.example.com/photo.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student profile updated successfully",
  "data": {
    "id": "student_id_123",
    "firstName": "Rajesh",
    "lastName": "Kumar",
    "rollNumber": "BT20CSE001",
    "phone": "9876543211",
    "department": "CSE",
    "batch": 2023,
    "cgpa": 9.0,
    "college": "BITS Pilani",
    "profilePhoto": "https://cdn.example.com/photo.jpg",
    "message": "Profile updated successfully"
  }
}
```

---

### 5️⃣ GET ALL STUDENTS (Paginated & Filtered)

**Endpoint:** `GET /api/v1/students`  
**Auth:** ❌ Not Required  
**Status Code:** 200 OK

**Query Parameters:**
```
?department=CSE&batch=2023&cgpaMin=7.0&cgpaMax=9.5&isVerified=true&limit=10&offset=0
```

**All Filters (Optional):**
```
department      - Filter by department name (e.g., CSE, ECE)
batch           - Filter by batch year (e.g., 2023)
cgpaMin         - Minimum CGPA (0-10)
cgpaMax         - Maximum CGPA (0-10)
isVerified      - Filter verified profiles (true/false)
limit           - Results per page (default: 50)
offset          - Page offset (default: 0)
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "students": [
    {
      "id": "student_id_123",
      "firstName": "Raj",
      "lastName": "Kumar",
      "rollNumber": "BT20CSE001",
      "email": "raj@college.com",
      "department": "CSE",
      "batch": 2023,
      "cgpa": 8.5,
      "isVerified": false,
      "createdAt": "2024-05-28T10:30:00Z"
    },
    {
      "id": "student_id_456",
      "firstName": "Priya",
      "lastName": "Singh",
      "rollNumber": "BT20CSE002",
      "email": "priya@college.com",
      "department": "CSE",
      "batch": 2023,
      "cgpa": 9.2,
      "isVerified": false,
      "createdAt": "2024-05-28T11:00:00Z"
    }
  ]
}
```

---

### 6️⃣ DELETE STUDENT PROFILE

**Endpoint:** `DELETE /api/v1/students/:id`  
**Auth:** ✅ Required (Bearer Token)  
**Status Code:** 200 OK

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student profile deleted successfully",
  "data": {
    "message": "Student profile deleted successfully",
    "deletedId": "student_id_123"
  }
}
```

---

### 7️⃣ GET STUDENT STATISTICS

**Endpoint:** `GET /api/v1/students/statistics`  
**Auth:** ❌ Not Required  
**Status Code:** 200 OK

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalDepartments": 3,
    "byDepartment": [
      {
        "department": "CSE",
        "count": 45
      },
      {
        "department": "ECE",
        "count": 38
      },
      {
        "department": "ME",
        "count": 42
      }
    ]
  }
}
```

---

### 8️⃣ GET ELIGIBLE STUDENTS FOR DRIVE

**Endpoint:** `GET /api/v1/students/eligible/:department?cgpaMin=7.5`  
**Auth:** ❌ Not Required  
**Status Code:** 200 OK

**URL Params & Query:**
```
:department = CSE (required)
?cgpaMin = 7.5 (required)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 15,
    "department": "CSE",
    "cgpaMin": 7.5,
    "students": [
      {
        "id": "student_id_123",
        "firstName": "Raj",
        "lastName": "Kumar",
        "rollNumber": "BT20CSE001",
        "cgpa": 8.5,
        "phone": "9876543210"
      },
      {
        "id": "student_id_456",
        "firstName": "Priya",
        "lastName": "Singh",
        "rollNumber": "BT20CSE002",
        "cgpa": 9.2,
        "phone": "9876543211"
      }
    ]
  }
}
```

---

## 🧪 POSTMAN TEST EXAMPLES

### Step 1: Get Auth Token

**POST** `http://localhost:8000/api/v1/auth/register`

```json
{
  "email": "student@college.com",
  "password": "SecurePass123",
  "role": "STUDENT"
}
```

Copy the `token` from response.

---

### Step 2: Create Student Profile

**POST** `http://localhost:8000/api/v1/students`

**Headers:**
```
Authorization: Bearer <token_from_step_1>
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Raj",
  "lastName": "Kumar",
  "rollNumber": "BT20CSE001",
  "phone": "9876543210",
  "department": "CSE",
  "batch": 2023,
  "cgpa": 8.5,
  "college": "BITS Pilani"
}
```

---

### Step 3: Get Your Profile

**GET** `http://localhost:8000/api/v1/students/me/profile`

**Headers:**
```
Authorization: Bearer <token_from_step_1>
Content-Type: application/json
```

---

### Step 4: Get All Students

**GET** `http://localhost:8000/api/v1/students?department=CSE&cgpaMin=7.0&limit=10`

(No auth required)

---

### Step 5: Update Profile

**PUT** `http://localhost:8000/api/v1/students/<student_id>`

**Headers:**
```
Authorization: Bearer <token_from_step_1>
Content-Type: application/json
```

**Body:**
```json
{
  "cgpa": 9.0,
  "firstName": "Rajesh"
}
```

---

## ✅ VALIDATION RULES

| Field | Rules |
|-------|-------|
| firstName | Required, non-empty string |
| lastName | Required, non-empty string |
| rollNumber | Required, format: BT20CSE001 or 20CSE001 (unique) |
| phone | Required, exactly 10 digits |
| department | Required, non-empty string |
| batch | Required, number between 2020 and future |
| cgpa | Required, decimal between 0-10 |
| college | Optional, string |
| profilePhoto | Optional, URL string |

---

## 🔒 AUTHENTICATION

Protected endpoints require:
```
Header: Authorization: Bearer <jwt_token>
```

Token obtained from:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

Token expires in: **7 days**

---

## ❌ COMMON ERRORS

| Error | Status | Solution |
|-------|--------|----------|
| Roll number already registered | 400 | Use different roll number |
| Invalid roll number format | 400 | Use format: BT20CSE001 |
| Phone must be 10 digits | 400 | Use 10-digit phone number |
| Student profile not found | 404 | Check student ID |
| User ID not found | 401 | Send valid JWT token |
| CGPA must be between 0-10 | 400 | Use CGPA in range 0-10 |

---

## 📊 DATA MODELS

### Student Model
```prisma
model Student {
  id              String      @id @default(cuid())
  userId          String      @unique
  firstName       String?
  lastName        String?
  rollNumber      String      @unique
  phone           String?
  profilePhoto    String?
  cgpa            Float       @default(0)
  department      String
  batch           Int
  college         String?
  isProfileVerified Boolean   @default(false)
  verificationStatus VerificationStatus @default(PENDING)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## 🎯 NEXT STEPS

After testing these endpoints:
1. Create database migration: `npx prisma migrate dev --name "init_student_module"`
2. Test all endpoints with Postman
3. Then build Company Module APIs
4. Then build Drive Module APIs

---

**Created:** May 28, 2026  
**Module:** Student Module  
**Status:** Complete & Ready to Test
