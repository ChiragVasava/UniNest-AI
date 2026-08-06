Edited test_credentials.csv

Welcome! I am stepping into the role of your **Senior Engineer, QA Lead, and Placement Mentor**. Before we touch a single line of code, we are going to make sure you know this project like you built it yourself.

Let us begin.

---

# 🎓 PHASE 1 — Understanding the Product

## 1. What Problem Does UniNest Solve?

Think about campus placements in a traditional Indian university.

- The placement cell uses **Excel sheets** to track students.
- Companies call or email to request a recruitment drive.
- Students manually send resumes to a placement officer who forwards them.
- Offer letters are typed in Word and sent over WhatsApp.
- Nobody knows what happened to their application until someone calls.

**This is the problem.** UniNest replaces that entire chaos with a single unified digital platform.

---

## 2. Who Are the Target Users?

There are exactly **4 types of users** in this system:

| # | Role | Who They Are | What They Need |
|---|------|--------------|----------------|
| 1 | **Student** | Engineering/degree students at partner universities | A verified digital profile, AI resume analysis, and a way to apply for drives |
| 2 | **Company (Recruiter)** | HR or placement representatives from companies | A way to post drives, screen candidates, and send offer letters |
| 3 | **University (Placement Officer)** | Faculty admin from university placement cells | Tools to onboard students, manage departments, and approve company drives |
| 4 | **Admin (SaaS Admin)** | The UniNest platform owner (you!) | Tools to manage universities as paying tenants, monitor the whole platform |

---

## 3. The Main Features — Grouped by Role

### 🎓 Student Features
- Register an account and verify it via Email OTP
- Build and edit a professional profile (name, department, batch, CGPA, PRN)
- Upload a PDF resume
- Get **AI-powered resume feedback** (Google Gemini 1.5 Flash analyses the resume)
- Build a formatted resume using the AI Resume Builder
- Browse open placement drives
- Apply to eligible drives
- Track application status (Applied → Shortlisted → Interview → Offer)
- Negotiate salary counter-offers

### 🏢 Company Features
- Register a company account
- Create placement drives (role, salary, CGPA cutoff, eligible departments)
- Review student applications
- Shortlist / reject candidates
- Schedule interviews
- Send offer letters
- Use **AI to generate professional offer email drafts** (Google Gemini)

### 🎓 University Features
- Create the academic hierarchy: **Department → Sub-Department → Class**
- Onboard students manually OR via **bulk CSV upload**
- Generate recruiter invite links for companies
- Approve or reject company drive requests
- Lock/unlock student profiles before placements
- Approve or reject student verification requests

### ⚙️ SaaS Admin Features
- Register new universities as client tenants
- Set billing plans (Free, Premium, Enterprise)
- Suspend or approve university access
- View global placement metrics across ALL universities

---

## 4. Pages and Navigation Map

```
PUBLIC PAGES (no login required)
├── /                   → Home / Landing Page
├── /register           → Registration form (Student, Company, University)
└── /login              → Login form

STUDENT PAGES (/student/...)
├── /student/dashboard  → Overview, drive listings, quick stats
├── /student/profile    → View & edit profile
├── /student/resumes    → Upload resume, AI Review, Resume Builder
├── /student/drives     → Browse all eligible drives, Apply button
├── /student/applications → Track submitted applications
├── /student/offers     → View received offers, negotiate salary
└── /student/verify     → OTP verification page (Email + Phone)

COMPANY PAGES (/company/...)
├── /company/dashboard  → Overview stats
├── /company/profile    → Company profile management
├── /company/drives     → Create and manage recruitment drives
├── /company/applications → Review applications for each drive
└── /company/offers     → Send and manage offer letters + AI Offer Email

UNIVERSITY PAGES (/university/...)
├── /university/dashboard  → Pending verifications, quick stats
├── /university/students   → Manual onboard, bulk CSV upload
├── /university/hierarchy  → Manage departments, sub-depts, classes
└── /university/companies  → Invite companies, approve drive requests

ADMIN PAGES (/admin/...)
├── /admin/dashboard    → Global metrics, university tenant management
└── /admin/students     → Global student directory search
```

---

## 5. Complete User Journey — The Recruitment Lifecycle

Here is how the entire placement cycle flows from start to finish:

```
1. ADMIN creates a University tenant
         ↓
2. UNIVERSITY admin logs in, sets up departments and classes
         ↓
3. UNIVERSITY onboards Students (manual or CSV)
         ↓
4. STUDENT registers, verifies OTP, fills profile, uploads resume
         ↓
5. COMPANY registers, creates a Placement Drive
         ↓
6. UNIVERSITY approves the Drive
         ↓
7. STUDENT sees the eligible drive, Applies
         ↓
8. COMPANY reviews applications, Shortlists a student
         ↓
9. COMPANY schedules Interview
         ↓
10. COMPANY sends an Offer Letter (with AI-drafted email)
         ↓
11. STUDENT accepts or Counter-Offers the salary
         ↓
12. COMPANY accepts/rejects the counter-offer → Final placement recorded
```

---

## 6. High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                       │
│           Frontend: Next.js 14 (Vercel)                │
│      Pages + Components + Context + API Client         │
└────────────────────────┬───────────────────────────────┘
                         │ HTTPS REST API calls
                         ▼
┌────────────────────────────────────────────────────────┐
│                  AWS EC2 Instance                       │
│         Backend: Node.js + Express.js                  │
│   Routes → Controllers → Services → Repositories       │
│        JWT Auth Middleware + Error Handler             │
│        AI: Google Gemini 1.5 Flash                     │
│        Email: Nodemailer (Gmail SMTP)                  │
└────────────────────────┬───────────────────────────────┘
                         │ Prisma ORM
                         ▼
┌────────────────────────────────────────────────────────┐
│         Cloud Database: Neon (PostgreSQL)               │
│   Users, Students, Companies, Universities,            │
│   Drives, Applications, Offers, Resumes, OTPs...       │
└────────────────────────────────────────────────────────┘
```

---

## ✅ Phase 1 Complete

You now understand:
- The problem this platform solves
- The 4 user roles and what each person does
- Every feature available to each role
- Every page in the application
- The full placement lifecycle from admin setup to final offer
- How the frontend, backend, and database connect to each other

---

## 📋 Before We Move to Phase 2

I need to ask you **3 quick questions** to confirm your understanding. Answer them and then I will begin the full manual QA Testing Roadmap.

**Q1.** A company posts a drive, but a student cannot see it in their drive listing. What are 2 possible reasons based on what you now know about the system?

**Q2.** Who has to act FIRST before a student can log in successfully for the first time? (Hint: think about the journey order)

**Q3.** If the SaaS Admin suspends a university, what do you think happens to the students and companies linked to that university?

Take your time and answer in your own words! 🎯

Let me first read the CSV file to understand the student data before building the roadmap.

Viewed MSU_Students.csv:1-85

Now I have everything I need. Let me give you your answer feedback, then explain the hierarchy, and then the complete QA roadmap.

---

# ✅ Answer Review — Phase 1 Questions

## Your Answer to Q1 — Partially Correct ✅

You said: *"University has made a mistake in approving the drive, or the student is not eligible."*

**The correct complete answer:**

A student cannot see a drive for **two reasons**:

1. **The drive has not been approved yet** — the University placement officer must approve each drive before students can see it. If the university has not approved it, it is invisible.
2. **The student does not meet the eligibility criteria** — the company sets:
   - A **minimum CGPA cutoff** (e.g. 7.5 CGPA — students below this are filtered out)
   - **Eligible departments** (e.g. only CSE, IT — a Civil Engineering student cannot see it)
   - **Eligible batches** (e.g. only Batch 2025 — a 2026 batch student cannot see it)

You were on the right track. You just needed to name the 3 specific eligibility filters.

---

## Your Answer to Q2 — Correct Thinking, Small Gap ✅

You said: *"University has to act first to onboard the student."*

**This is correct in spirit.** But here is the more precise answer:

Actually a student CAN register independently without being pre-onboarded. But if no university has registered with that student's college name, the student's profile will be **unverified** and they will not be linked to any university. The key action is:

```
Admin → Creates University Tenant
           ↓
University → Sets up departments, classes
           ↓
University → Onboards students OR students register themselves
           ↓
University → Verifies student profiles (approval step)
           ↓
Student → Is now visible to companies in that university's drives
```

Great thinking though — you correctly identified the dependency chain.

---

## Your Answer to Q3 — Correct ✅

You said: *"Data will be there but university cannot use platform features."*

**This is exactly correct.** Suspension is a soft-block:
- All data (students, companies, drives) stays in the database
- The university login still works but they cannot create new drives or onboard new students
- Students under that university are also blocked from applying

---

# 🏗️ Understanding the University Hierarchy Feature

Before the QA roadmap, let me explain exactly how to set up MSU's hierarchy. This is the most confusing feature for first-time users.

## The 3-Level Academic Structure

```
UNIVERSITY: The Maharaja Sayajirao University Of Baroda (MSU)
│
└── DEPARTMENT (Level 1): Faculty of Technology and Engineering
    │   (This is the broad Faculty/School)
    │
    └── SUB-DEPARTMENT (Level 2): Computer Science And Engineering
        │   (This is the actual Branch/Program)
        │
        └── CLASS (Level 3): CSE-2027-A  ← The actual student group
                (This is where students are assigned)
```

## Why 3 Levels?

Real universities do not have flat departments. MSU has:

| Level | Real World | System Name | Example |
|-------|-----------|-------------|---------|
| Level 1 | Faculty / School | **Department** | Faculty of Technology & Engineering |
| Level 2 | Branch / Program | **Sub-Department** | Computer Science & Engineering |
| Level 3 | Class / Division | **Class** | CSE-2027-A (your batch) |

## How to Set Up for Your MSU CSV

Since your CSV has **84 students, all in CSE, all Batch 2027**, here is the exact setup:

```
Department (Create this):
  Name: Faculty of Technology and Engineering
  Code: FTE

Sub-Department (Create inside FTE):
  Name: Computer Science And Engineering
  Code: CSE

Class (Create inside CSE):
  Name: CSE Batch 2027
  Code: CSE-2027-A
  Batch: 2027
```

Once the class exists, you bulk-upload the CSV and all 84 students get linked to `CSE-2027-A`.

---

# 🧪 PHASE 2 — Complete Manual QA Testing Roadmap

I have mapped your exact accounts from the credentials file and the MSU CSV. Follow this **step by step, in order**. Do NOT skip steps.

---

## ⚙️ PRE-TEST SETUP CHECKLIST

Before opening the browser, confirm these:
- ✅ Local frontend running: `http://localhost:3000`
- ✅ Local backend running: `http://localhost:8000`
- ✅ Deployed app: `https://54-147-162-27.sslip.io`
- ✅ Have credentials CSV open in your editor
- ✅ Have the MSU_Students.csv ready for bulk upload test

> **TIP**: Do ALL tests first on `localhost:3000` (your local app). Then repeat critical ones on the deployed URL.

---

## 🔵 MODULE 1 — HOME PAGE

### TEST 1.1 — Landing Page Load

| Field | Detail |
|-------|--------|
| **URL** | `http://localhost:3000` |
| **Action** | Open the URL in a fresh browser |
| **Expected** | Landing page loads with hero section, features, call to action |
| **Verify** | No blank screen, no 404, no console errors (press F12) |
| **Edge Case** | Open on mobile viewport (F12 → toggle device toolbar) — verify it is responsive |

---

## 🔵 MODULE 2 — ADMIN ROLE (Do This First — Admin Creates Everything)

### TEST 2.1 — Admin Login

| Field | Detail |
|-------|--------|
| **URL** | `http://localhost:3000/login` |
| **Email** | `admin@uninest.com` |
| **Password** | `Admin@123` |
| **Role** | Admin |
| **Expected** | Redirected to `/admin/dashboard` |
| **Database** | Check `users` table — `lastLogin` timestamp updates |
| **API** | `POST /api/v1/auth/login` |
| **Error to Test** | Enter wrong password → should show "Invalid credentials" |

### TEST 2.2 — Admin Dashboard Overview

| Field | Detail |
|-------|--------|
| **Page** | `/admin/dashboard` |
| **Verify** | See total universities, students, companies, stats |
| **Action** | Check if MSU appears in university list |
| **Edge Case** | What shows if there are 0 drives? Does it show 0 or crash? |

### TEST 2.3 — Admin Approves MSU University

| Field | Detail |
|-------|--------|
| **Action** | Find MSU in university list → Click Approve |
| **Expected** | MSU status changes from Pending to Approved |
| **Database** | `universities` table → `isApproved = true` |
| **Verify** | MSU can now log in and use the platform |
| **Edge Case** | Try approving the same university twice — should be idempotent |

### TEST 2.4 — Admin Views Student Logs

| Field | Detail |
|-------|--------|
| **Action** | Navigate to Student Logs section |
| **Expected** | Table of all student accounts across all universities |
| **Verify** | Can search by name, email, roll number |
| **Error Case** | Filter by a university that has no students — shows empty state gracefully |

### TEST 2.5 — Admin Logout

| Field | Detail |
|-------|--------|
| **Action** | Click logout button |
| **Expected** | Redirected to `/login`, JWT token cleared from localStorage |
| **Edge Case** | Press browser back button after logout — should NOT go back to dashboard |

---

## 🔵 MODULE 3 — UNIVERSITY ROLE (MSU Placement Officer)

### TEST 3.1 — MSU University Login

| Field | Detail |
|-------|--------|
| **Email** | `sowino010@gmail.com` |
| **Password** | `Msu@080405` |
| **Role** | University |
| **Expected** | Redirected to `/university/dashboard` |

### TEST 3.2 — University Dashboard Overview

| Field | Detail |
|-------|--------|
| **Verify** | See pending verifications count, drive requests, student count |
| **Note** | Student count will be 0 until you create hierarchy and upload |

### TEST 3.3 — Create Department (Level 1)

| Field | Detail |
|-------|--------|
| **Page** | `/university/hierarchy` or similar |
| **Action** | Click "Add Department" |
| **Name** | `Faculty of Technology and Engineering` |
| **Code** | `FTE` |
| **Expected** | Department appears in the hierarchy tree |
| **Database** | New row in `departments` table with `universityId` = MSU's ID |
| **Error Case** | Try creating a duplicate code `FTE` — should show "already exists" |

### TEST 3.4 — Create Sub-Department (Level 2)

| Field | Detail |
|-------|--------|
| **Action** | Click "Add Sub-Department" inside FTE |
| **Name** | `Computer Science And Engineering` |
| **Code** | `CSE` |
| **Expected** | Sub-department appears under FTE in the tree |
| **Database** | New row in `sub_departments` with `departmentId` = FTE's ID |
| **Error Case** | Create sub-dept without selecting a parent department — should block |

### TEST 3.5 — Create Class (Level 3)

| Field | Detail |
|-------|--------|
| **Action** | Click "Add Class" inside CSE |
| **Name** | `CSE Batch 2027` |
| **Code** | `CSE-2027-A` |
| **Batch Year** | `2027` |
| **Expected** | Class appears under CSE in the tree |
| **Database** | New row in `classes` with `subDepartmentId` = CSE's ID |
| **Edge Case** | Try creating class with batch year `1990` — should validate |

### TEST 3.6 — Bulk Upload MSU Students (CSV)

| Field | Detail |
|-------|--------|
| **Action** | Go to Students section → Click "Bulk Upload CSV" |
| **File** | `MSU_Students.csv` (84 students) |
| **Expected** | Upload processes, 84 students imported |
| **Verify** | Students appear in the student list with status "Pending Verification" |
| **Database** | 84 new rows in `users` + 84 rows in `students` tables |
| **Error Cases** | ① Upload a non-CSV file (e.g. .xlsx) — should reject ② Upload empty CSV — should say "No data found" ③ Notice line 58 has bad email `milangagiva10@amail com` — observe if system catches it ④ Notice line 72 has truncated email `suhanikumariroh4321@gmail` — observe error |
| **Edge Case** | Upload the same CSV twice — should not duplicate (or should show conflict) |

> 🔴 **IMPORTANT**: Lines 58 and 72 in your CSV have **invalid email addresses**. This is a great real-world test case. Watch how the system handles bad data in a bulk upload.

### TEST 3.7 — Manually Onboard Sanjay Vasava

| Field | Detail |
|-------|--------|
| **Action** | Go to Students → Add Student Manually |
| **First Name** | `Sanjay` |
| **Last Name** | `Vasava` |
| **Email** | `sv690649@gmail.com` |
| **Roll Number** | `8024058199` |
| **Department** | `Computer Science And Engineering` |
| **Batch** | `2027` |
| **CGPA** | `8.5` |
| **Expected** | Sanjay linked to MSU, status Pending |

### TEST 3.8 — Verify a Student

| Field | Detail |
|-------|--------|
| **Action** | Find Sanjay in the list → Click "Verify" |
| **Expected** | Sanjay's `verificationStatus` changes to VERIFIED |
| **Database** | `students.verificationStatus = 'VERIFIED'` |
| **Effect** | Sanjay can now appear to companies as a verified candidate |

### TEST 3.9 — Generate Company Invite Link

| Field | Detail |
|-------|--------|
| **Page** | Companies section |
| **Action** | Click "Generate Invite Link" or "Invite Company" |
| **Expected** | A shareable URL is generated |
| **Use** | Copy this link — you will use it when testing company invite flow |

### TEST 3.10 — University Logout

| Field | Detail |
|-------|--------|
| **Action** | Click logout |
| **Expected** | Session cleared, back to login |

---

## 🔵 MODULE 4 — STUDENT REGISTRATION & PROFILE

### TEST 4.1 — Student Registration (New Account: Chirag Vasava)

| Field | Detail |
|-------|--------|
| **URL** | `http://localhost:3000/register` |
| **First Name** | `Chirag` |
| **Last Name** | `Vasava` |
| **Email** | `chirag@gmail.com` |
| **Password** | `Chirag@2005` |
| **Confirm Password** | `Chirag@2005` |
| **Role** | Student |
| **Expected** | Account created, OTP sent to email |
| **Database** | New row in `users` + new row in `students` with `rollNumber = null` |
| **API** | `POST /api/v1/auth/register` then `POST /api/v1/auth/send-otp` |
| **Error Cases** | ① Passwords don't match → inline error ② Weak password (no special char) → validation error ③ Already-used email → "Email already exists" |

### TEST 4.2 — OTP Email Verification

| Field | Detail |
|-------|--------|
| **Action** | Check `chirag@gmail.com` inbox for OTP |
| **Expected** | Receive a 6-digit OTP email |
| **Enter OTP** | Enter it in the verification form |
| **Expected** | Email marked as verified, redirected to dashboard or profile |
| **Error Cases** | ① Enter wrong OTP → "Invalid OTP" ② Wait 10 minutes, enter expired OTP → "OTP expired" ③ Click "Resend OTP" → New OTP arrives |

### TEST 4.3 — Student Login (Sanjay Vasava — Existing Account)

| Field | Detail |
|-------|--------|
| **Email** | `sv690649@gmail.com` |
| **Password** | `Sanjay@080405` |
| **Expected** | Login → `/student/dashboard` |
| **Verify** | Dashboard shows Sanjay's name, PRN, college (MSU) |

### TEST 4.4 — Student Profile Edit

| Field | Detail |
|-------|--------|
| **Page** | `/student/profile` |
| **Action** | Click Edit Profile |
| **Fill Fields** | Department: CSE, Batch: 2027, CGPA: 8.5, Phone: 9687566713 |
| **Roll Number** | `8024058199` (numeric PRN — testing our fix!) |
| **Expected** | Profile saves successfully |
| **Database** | `students` table updated with all new values |
| **Error Cases** | ① CGPA > 10 → validation error ② Batch year `1900` → validation error ③ Roll number `XYZ` (invalid format) → validation error |
| **Our Fix** | Numeric PRN `8024058199` should now pass — this tests the regex fix we just pushed |

### TEST 4.5 — Student Profile — All Other Seeded Students

Repeat TEST 4.3 and 4.4 for each of these accounts:

| Name | Email | Password | PRN |
|------|-------|----------|-----|
| Priyanshu Makwana | `priyanshumakwana2003+student@gmail.com` | `priyanshustudent@123` | `8024058198` |
| Krish Palat | `krishpalat9+student@gmail.com` | `krishstudent@123` | `8023050788` |
| Raviraj Dhokiya | `ravirajdhokiya10+student@gmail.com` | `ravirajstudent@123` | `8023053977` |
| Bharat Dhuva | `dhuvabharat1705+student@gmail.com` | `bharatstudent@123` | `8024060920` |
| Aakash Patel | `aakashpatel20032003+student@gmail.com` | `aakashstudent@123` | `8023055061` |

---

## 🔵 MODULE 5 — RESUME UPLOAD & AI FEATURES

### TEST 5.1 — Upload PDF Resume

| Field | Detail |
|-------|--------|
| **Login as** | Sanjay Vasava (`sv690649@gmail.com`) |
| **Page** | `/student/resumes` |
| **Action** | Click "Upload Resume" → Select any valid PDF file |
| **Expected** | File uploads, appears in resume list |
| **Database** | New row in `resumes` with `filePath`, `fileName`, `fileSize` |
| **API** | `POST /api/v1/student/resume` (multipart form-data) |
| **Error Cases** | ① Upload a .docx file → should reject "Only PDF allowed" ② Upload a 50MB file → should reject "File too large" ③ Upload an empty PDF → system should handle gracefully |

### TEST 5.2 — AI Resume Analysis

| Field | Detail |
|-------|--------|
| **Action** | After upload, click "Analyze with AI" or "Get AI Feedback" |
| **Expected** | System sends PDF text to Google Gemini API → returns detailed feedback |
| **Response** | Skills identified, missing sections, improvement suggestions, ATS score |
| **Time** | May take 5-15 seconds — verify a loading spinner appears |
| **Error Case** | What if Gemini API is down? Verify a graceful error message, not a crash |

### TEST 5.3 — AI Resume Builder

| Field | Detail |
|-------|--------|
| **Action** | Click "Build Resume" or "AI Resume Builder" |
| **Expected** | Form to enter details → AI generates a formatted resume |
| **Verify** | Generated resume can be previewed and downloaded |

---

## 🔵 MODULE 6 — COMPANY ROLE

### TEST 6.1 — Company Login (CodeCraft Studios)

| Field | Detail |
|-------|--------|
| **Email** | `v.chira.007@gmail.com` |
| **Password** | `Chirag@123` |
| **Role** | Company |
| **Expected** | Redirected to `/company/dashboard` |

### TEST 6.2 — Company Profile Setup

| Field | Detail |
|-------|--------|
| **Page** | `/company/profile` |
| **Fill** | Company Name, Registration ID, Sector, Address, Website, Contact details |
| **Expected** | Profile saved, `isProfileComplete = true` in database |
| **Edge Case** | Try saving with empty required fields → inline validation errors |

### TEST 6.3 — Create a Placement Drive

| Field | Detail |
|-------|--------|
| **Page** | `/company/drives` → Click "Create Drive" |
| **Title** | `Full Stack Developer Intern` |
| **Description** | `Looking for talented CSE students for a 6-month internship` |
| **Salary (CTC)** | `12` (Lakhs) |
| **CGPA Cutoff** | `7.0` |
| **Eligible Departments** | `Computer Science And Engineering` |
| **Eligible Batches** | `2027` |
| **Interview Format** | `Online` |
| **Expected** | Drive created with `isApproved = false` (pending university approval) |
| **Database** | New row in `drives` table |
| **API** | `POST /api/v1/company/drives` |
| **Error Cases** | ① CGPA cutoff > 10 → validation error ② No eligible departments selected → should warn ③ Past batch year → should warn |

### TEST 6.4 — Create a Second Drive (for Rejection Test)

Create another drive with different data — you will use this to test rejection later.

| Field | Detail |
|-------|--------|
| **Title** | `Data Analyst` |
| **CGPA Cutoff** | `8.5` |
| **Departments** | `Computer Science And Engineering` |
| **Batch** | `2027` |

### TEST 6.5 — Company Logout

| Field | Detail |
|-------|--------|
| **Action** | Logout from CodeCraft account |

### TEST 6.6 — Other Company Accounts Login & Create Drives

Repeat 6.1 to 6.5 for each seeded company:

| Company | Email | Password |
|---------|-------|----------|
| Priyanshu Tech Labs | `priyanshumakwana2003+company@gmail.com` | `priyanshucompany@123` |
| Krish Systems & AI | `krishpalat9+company@gmail.com` | `krishcompany@123` |

Have each company create at least 1 drive targeted at CSE Batch 2027.

---

## 🔵 MODULE 7 — UNIVERSITY APPROVES DRIVES

### TEST 7.1 — Login MSU and Approve Drive Requests

| Field | Detail |
|-------|--------|
| **Login** | `sowino010@gmail.com` / `Msu@080405` |
| **Page** | University Dashboard → Drive Requests / Approvals |
| **Action** | Approve the "Full Stack Developer Intern" drive |
| **Expected** | Drive `isApproved = true` in database |
| **Effect** | Drive now visible to eligible MSU students |
| **Also Test** | Reject the "Data Analyst" drive → verify it does NOT appear to students |

---

## 🔵 MODULE 8 — STUDENT VIEWS & APPLIES TO DRIVES

### TEST 8.1 — Student Sees Eligible Drives

| Field | Detail |
|-------|--------|
| **Login as** | Sanjay Vasava (`sv690649@gmail.com` / `Sanjay@080405`) |
| **Page** | `/student/drives` |
| **Expected** | "Full Stack Developer Intern" appears (CGPA 7.0 cutoff, Sanjay qualifies) |
| **Verify** | "Data Analyst" does NOT appear (rejected by university) |
| **Edge Case** | Log in as Priyanshu (CGPA 8.5) — does he see the drive? Yes. Log in as a student with CGPA 6.5 — he should NOT see a 7.0 cutoff drive |

### TEST 8.2 — Student Applies to a Drive

| Field | Detail |
|-------|--------|
| **Action** | Click "Apply" on the Full Stack Developer Intern drive |
| **Expected** | Application submitted, status = "Applied" |
| **Database** | New row in `drive_applications` with `studentId`, `driveId`, `status = APPLIED` |
| **API** | `POST /api/v1/student/drives/:driveId/apply` |
| **Error Case** | Click Apply again → "Already applied" error |

### TEST 8.3 — Student Tracks Application Status

| Field | Detail |
|-------|--------|
| **Page** | `/student/applications` |
| **Expected** | Application listed with status "Applied" |
| **Verify** | Status badge renders correctly |

---

## 🔵 MODULE 9 — COMPANY REVIEWS & SHORTLISTS

### TEST 9.1 — Company Reviews Applications

| Field | Detail |
|-------|--------|
| **Login** | CodeCraft Studios (`v.chira.007@gmail.com` / `Chirag@123`) |
| **Page** | `/company/applications` → Select "Full Stack Developer Intern" |
| **Expected** | See list of student applicants with name, CGPA, college, roll number |
| **Verify** | Sanjay Vasava appears in the list |

### TEST 9.2 — Shortlist a Student

| Field | Detail |
|-------|--------|
| **Action** | Click "Shortlist" next to Sanjay Vasava |
| **Expected** | Status changes to "Shortlisted" |
| **Database** | `drive_applications.status = SHORTLISTED` |
| **Student Side** | Sanjay's application page should now show "Shortlisted" |

### TEST 9.3 — Reject Another Applicant

| Field | Detail |
|-------|--------|
| **Action** | Click "Reject" on another student's application |
| **Expected** | Status = "Rejected" |
| **Student Side** | That student sees "Rejected" on their application page |

---

## 🔵 MODULE 10 — INTERVIEW SCHEDULING

### TEST 10.1 — Company Schedules an Interview

| Field | Detail |
|-------|--------|
| **Action** | On shortlisted application → Click "Schedule Interview" |
| **Date** | Any future date |
| **Time** | `10:00 AM` |
| **Format** | `Online` |
| **Meeting Link** | `https://meet.google.com/test-link` |
| **Expected** | Interview scheduled, student notified |
| **Database** | New row in `interview_schedules` |
| **Student Side** | Interview details visible on student dashboard |
| **Error Cases** | ① Past date → should warn ② No meeting link for Online format → should warn |

---

## 🔵 MODULE 11 — OFFER LETTER & AI FEATURES

### TEST 11.1 — Company Sends Offer Letter

| Field | Detail |
|-------|--------|
| **Action** | After interview → Click "Send Offer" |
| **CTC Offered** | `12 LPA` |
| **Joining Date** | Any future date |
| **Expected** | Offer created, student notified |
| **Database** | New row in `offers` |

### TEST 11.2 — AI Offer Email Generation

| Field | Detail |
|-------|--------|
| **Action** | Before sending, click "Generate AI Email Draft" |
| **Expected** | Google Gemini generates a professional offer letter email |
| **Verify** | You can edit the AI text before sending |
| **Error Case** | If Gemini is unavailable → graceful error, not crash |

### TEST 11.3 — Student Views & Accepts Offer

| Field | Detail |
|-------|--------|
| **Login as** | Sanjay Vasava |
| **Page** | `/student/offers` |
| **Action** | Click "Accept Offer" |
| **Expected** | Offer status = ACCEPTED |
| **Database** | `offers.status = ACCEPTED` |

### TEST 11.4 — Student Counter-Offers (Salary Negotiation)

| Field | Detail |
|-------|--------|
| **Action** | Instead of Accept, click "Counter Offer" |
| **Counter Amount** | `14 LPA` |
| **Message** | `Based on my skills in React and Node.js, I would like to negotiate` |
| **Expected** | Offer status = COUNTERED |
| **Company Side** | Company sees the counter offer |
| **Error Case** | Counter with lower than original salary — should the system allow it? |

### TEST 11.5 — Company Accepts or Rejects Counter Offer

| Field | Detail |
|-------|--------|
| **Action (Accept)** | Company clicks "Accept Counter" → Offer = ACCEPTED at 14 LPA |
| **Action (Reject)** | Company clicks "Reject Counter" → Offer goes back to original |

---

## 🔵 MODULE 12 — EDGE CASES & SECURITY TESTS

### TEST 12.1 — Unauthorized Access

| Test | Steps | Expected |
|------|-------|----------|
| Student tries to access `/admin/dashboard` | Type URL directly | Redirected to login or 403 error |
| Company tries to access `/student/profile` | Type URL directly | Redirected or 403 |
| Not logged-in user hits `/api/v1/student/profile` | In browser address bar | `{"success": false, "message": "Unauthorized"}` |

### TEST 12.2 — Session Expiry

| Field | Detail |
|-------|--------|
| **Action** | Log in, wait for JWT to expire (default is usually 24 hours — check `.env`) |
| **Expected** | API calls return 401, user redirected to login |

### TEST 12.3 — Concurrent Role Check

| Field | Detail |
|-------|--------|
| **Action** | Open two browser windows — Student in Window 1, Admin in Window 2 |
| **Expected** | Both sessions work independently |

---

## 🔵 MODULE 13 — FINAL LOGOUT TEST (All Roles)

Test logout for every role and confirm:
- Token cleared from localStorage
- Back button doesn't restore session
- Redirected to login page

---

## 📊 QA Testing Summary Checklist

```
✅ MODULE 1  — Home Page Load
✅ MODULE 2  — Admin Login, Dashboard, University Approval
✅ MODULE 3  — University Login, Hierarchy Setup, Bulk CSV Upload, Student Verify
✅ MODULE 4  — Student Registration, OTP, Login, Profile Edit (PRN fix test)
✅ MODULE 5  — Resume Upload, AI Analysis, AI Resume Builder
✅ MODULE 6  — Company Login, Profile, Create Drives
✅ MODULE 7  — University Approves/Rejects Drives
✅ MODULE 8  — Student Views Eligible Drives, Applies
✅ MODULE 9  — Company Reviews, Shortlists, Rejects Applications
✅ MODULE 10 — Interview Scheduling
✅ MODULE 11 — Offer Letter, AI Email, Accept, Negotiate, Counter Offer
✅ MODULE 12 — Edge Cases & Security
✅ MODULE 13 — Logout All Roles
```

---

## ⚠️ Known Data Issues in Your CSV to Watch

| Line | Issue | Expected System Behaviour |
|------|-------|--------------------------|
| Line 58 | `milangagiva10@amail com` — space in email | Should be flagged/skipped in bulk upload |
| Line 72 | `suhanikumariroh4321@gmail` — incomplete domain | Should be flagged as invalid email |
| Line 65 | Phone `8023055434` same as roll number — data entry error | System should accept unless phone uniqueness is enforced |

---

Start with **Module 1 → Module 2** in order. After you finish each module, come back and tell me what happened. I will help you debug any issue you hit.

Once you complete all 13 modules, we move to **Phase 3 — How Every Feature Works Internally** with full code flow diagrams. 🚀


# PHASE 3 — How Every Feature Works Internally
## Complete Code Flow Diagrams & Technical Deep Dive

> **Goal**: After reading this phase, you can explain every feature to a senior engineer — not just *what* it does, but *how* the code flows from button click to database and back.

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (Next.js)                      │
│  app/(role)/page.tsx  →  lib/api.ts  →  HTTP Request       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (Bearer JWT)
┌──────────────────────────▼──────────────────────────────────┐
│                   EC2 / Express.js Server                   │
│                                                             │
│  server.ts                                                  │
│    │                                                         │
│    ├── CORS Middleware  (whitelist: Vercel + localhost)      │
│    ├── authMiddleware   (verify JWT → inject userId/role)   │
│    │                                                         │
│    ├── /api/v1/auth      → authRoutes → authController      │
│    ├── /api/v1/students  → studentRoutes → studentController│
│    ├── /api/v1/companies → companyRoutes → companyController│
│    ├── /api/v1/drives    → driveRoutes → driveController    │
│    ├── /api/v1/offers    → offerRoutes → offerController    │
│    ├── /api/v1/universities → universityRoutes              │
│    └── /api/v1/admin     → adminRoutes → adminController    │
│                                                             │
│  Controller → Service → Repository → Prisma ORM            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma Client (TLS)
┌──────────────────────────▼──────────────────────────────────┐
│              Neon PostgreSQL (Cloud Database)                │
│   Tables: users, students, companies, universities,          │
│           drives, drive_applications, offers,                │
│           offer_audits, resumes, interview_schedules...     │
└─────────────────────────────────────────────────────────────┘
                           │
                    External Services
           ┌───────────────┴──────────────┐
           │ Gemini API (AI features)     │
           │ Nodemailer (Email OTP)       │
           └──────────────────────────────┘
```

---

## 🔑 FEATURE 1 — Authentication & JWT

### What happens when a user clicks "Login"?

```
BROWSER
  │
  ├─ [1] User fills email + password → clicks "Login"
  │
  ├─ [2] frontend/lib/api.ts
  │       authAPI.login(email, password)
  │       → POST /api/v1/auth/login
  │         body: { email, password }
  │
SERVER
  │
  ├─ [3] authRoutes.ts
  │       router.post("/login", authController.login)
  │
  ├─ [4] authController.ts → login()
  │       const { email, password } = req.body
  │
  ├─ [5] authService.ts → loginUser(email, password)
  │       │
  │       ├─ prisma.user.findUnique({ where: { email } })
  │       │   → fetches user from DB
  │       │
  │       ├─ bcrypt.compare(password, user.passwordHash)
  │       │   → if wrong → throw AppError(401, "Invalid credentials")
  │       │
  │       └─ jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "24h" })
  │           → generates signed token
  │
  ├─ [6] Response: { success: true, token, user: { id, email, role } }
  │
BROWSER
  │
  └─ [7] frontend stores token in localStorage
          localStorage.setItem("token", token)
          localStorage.setItem("user", JSON.stringify(user))
          → redirects to /[role]/dashboard
```

**Key Files:**
- [`authController.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/controllers/authController.ts)
- [`authService.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/services/authService.ts)
- [`authMiddleware.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/middleware/authMiddleware.ts)

### How does authMiddleware protect every API?

```
Every protected API call:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
        │
        ▼
  authMiddleware.ts
        │
        ├─ jwt.verify(token, JWT_SECRET)
        │     → decodes payload: { userId, role, iat, exp }
        │
        ├─ if expired → throw 401 "Token expired"
        │
        ├─ req.userId = payload.userId   ← injected into request
        │   req.userRole = payload.role  ← used by controllers
        │
        └─ next() → continues to controller
```

---

## 👤 FEATURE 2 — Student Registration & OTP Verification

### Full registration flow:

```
BROWSER
  │
  ├─ [1] POST /api/v1/auth/register
  │       { email, password, confirmPassword, role: "STUDENT" }
  │
SERVER → authController.register()
  │
  ├─ [2] authService.registerUser()
  │       ├─ check: email already exists? → throw 409
  │       ├─ bcrypt.hash(password, 10)  → passwordHash
  │       ├─ prisma.user.create({ email, passwordHash, role })
  │       │     → new row in `users` table (emailVerified: false)
  │       │
  │       └─ if role === STUDENT:
  │             prisma.student.create({ userId, rollNumber: null })
  │             → new row in `students` table (unlinked to any university)
  │
  ├─ [3] POST /api/v1/auth/send-otp
  │       → authService.sendOtp(userId)
  │       │
  │       ├─ generate 6-digit OTP:  Math.floor(100000 + Math.random() * 900000)
  │       ├─ store in DB: prisma.user.update({ emailOtp, emailOtpExpiry })
  │       └─ nodemailer.sendMail({ to: email, subject: "OTP", text: otp })
  │
  ├─ [4] POST /api/v1/auth/verify-otp
  │       { emailOtp: "123456" }
  │       │
  │       ├─ fetch user.emailOtp from DB
  │       ├─ check: otp matches && not expired (10 min window)
  │       └─ prisma.user.update({ emailVerified: true, emailOtp: null })
  │
DATABASE STATE after registration:
  users table:   { id, email, passwordHash, role: STUDENT, emailVerified: true }
  students table: { id, userId, rollNumber: null, department: null, cgpa: null }
```

---

## 🏛️ FEATURE 3 — University Drive Approval Workflow

### The complete approval lifecycle:

```
COMPANY
  │
  ├─ [1] POST /api/v1/drives
  │       { title, salary, cgpaCutoff, eligibleDepts, eligibleBatches, universityId }
  │
  │   driveController → driveService.createDrive()
  │       └─ driveRepository.createDrive()
  │             data: { ...payload, isApproved: false }  ← ALWAYS FALSE
  │             → new row in `drives` table
  │
DATABASE: drives { isApproved: false, isActive: true, universityId: "MSU_ID" }
  │
  │   ┌─────────────────────────────────────────────────┐
  │   │  Student visits /student/drives                 │
  │   │  driveRepository.getEligibleDrivesForStudent()  │
  │   │  WHERE isActive=true AND isApproved=true        │
  │   │  → drive NOT returned (still pending)           │
  │   └─────────────────────────────────────────────────┘
  │
UNIVERSITY
  │
  ├─ [2] GET /api/v1/universities/drives/requests
  │       WHERE universityId = myUniversityId AND isApproved = false
  │       → sees pending drive
  │
  ├─ [3a] POST /api/v1/universities/drives/:id/approve
  │         prisma.drive.update({ isApproved: true })
  │         → drive is now LIVE
  │
  │   ┌─────────────────────────────────────────────────┐
  │   │  Student now sees drive in Browse Drives        │
  │   │  isApproved: true → included in query results  │
  │   └─────────────────────────────────────────────────┘
  │
  └─ [3b] POST /api/v1/universities/drives/:id/reject
            prisma.drive.update({ isApproved: false, isActive: false })
            → drive permanently hidden
```

**Key Files:**
- [`driveRepository.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/repositories/driveRepository.ts)
- [`universityController.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/controllers/universityController.ts) — `getDriveRequests`, `approveDrive`, `rejectDrive`

---

## 📄 FEATURE 4 — Resume Upload & AI Analysis

### Upload flow:

```
BROWSER
  │
  ├─ [1] Student selects PDF file
  │       → FormData with file field = "resume"
  │
  ├─ [2] POST /api/v1/resumes
  │       multipart/form-data
  │
SERVER → middleware/resumeUpload.ts
  │
  ├─ [3] multer({ storage: memoryStorage() })
  │       → file stored in req.file.buffer (RAM, not disk)
  │       → Why memoryStorage? So pdf-parse can read the buffer immediately
  │
  ├─ [4] resumeController.uploadResume()
  │       │
  │       ├─ pdf-parse(req.file.buffer) → extracts all text from PDF
  │       │
  │       ├─ writes PDF to disk: /uploads/{studentId}/{filename}.pdf
  │       │   (for file serving via URL)
  │       │
  │       └─ prisma.resume.create({
  │             studentId, fileName, filePath,
  │             extractedText,          ← key field for AI
  │             fileSize, mimeType
  │           })
  │
DATABASE: resumes { id, studentId, extractedText: "John Doe\nSkills: React..." }
```

### AI Analysis flow (Gemini):

```
BROWSER → POST /api/v1/resumes/:id/feedback
  │
SERVER → resumeController → atsService.analyzeResume(resumeId)
  │
  ├─ [1] fetch resume.extractedText from DB
  │       if (!extractedText) → throw "No text to analyze"
  │
  ├─ [2] Build Gemini prompt:
  │       "You are a professional resume reviewer. Analyze this resume:
  │        [extractedText]
  │        Provide: ATS Score (0-100), Key Skills Found,
  │        Missing Sections, Improvement Suggestions"
  │
  ├─ [3] POST https://generativelanguage.googleapis.com/v1beta/models/
  │           gemini-2.0-flash:generateContent
  │       headers: { "X-goog-api-key": GEMINI_API_KEY }
  │       body: { contents: [{ parts: [{ text: prompt }] }] }
  │
  ├─ [4] Parse Gemini response → structured JSON
  │
  └─ [5] Return { atsScore, skills, missingSections, suggestions }
```

**Key Files:**
- [`resumeUpload.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/middleware/resumeUpload.ts)
- [`resumeController.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/controllers/resumeController.ts)
- [`atsService.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/services/atsService.ts)

---

## 🎯 FEATURE 5 — Student Application & Eligibility Filter

### How the system decides which drives a student sees:

```
Student visits /student/drives
  │
GET /api/v1/drives/eligible/list
  │
driveController → driveService.getEligibleDrives(userId)
  │
  ├─ [1] studentRepository.getStudentByUserId(userId)
  │       → fetches: department, batch, cgpa
  │       Example: { department: "CSE", batch: 2027, cgpa: 8.5 }
  │
  ├─ [2] driveRepository.getEligibleDrivesForStudent(dept, batch, cgpa)
  │       SQL equivalent:
  │       SELECT * FROM drives
  │       WHERE isActive = true
  │         AND isApproved = true            ← university approved
  │         AND cgpaCutoff <= 8.5           ← CGPA check
  │         AND 'CSE' = ANY(eligibleDepartments)  ← dept check
  │         AND 2027 = ANY(eligibleBatches)        ← batch check
  │       ORDER BY createdAt DESC
  │
  └─ [3] Returns only drives the student qualifies for
```

### How student applies:

```
Student clicks "Apply" on a drive
  │
POST /api/v1/applications
  body: { driveId: "drive_id" }
  │
applicationController → applicationService.applyToDrive(studentId, driveId)
  │
  ├─ [1] Check: student already applied?
  │       prisma.driveApplication.findFirst({ where: { studentId, driveId } })
  │       → if exists → throw 409 "Already applied"
  │
  ├─ [2] Check: student eligible for this drive?
  │       fetch drive.cgpaCutoff, eligibleDepts, eligibleBatches
  │       compare against student.cgpa, department, batch
  │       → if not eligible → throw 403 "Not eligible"
  │
  └─ [3] prisma.driveApplication.create({
           studentId, driveId, status: "APPLIED"
         })
         → new row in drive_applications table
```

---

## 💼 FEATURE 6 — Offer Letter & Counter-Offer Negotiation

### Complete offer lifecycle with counter-offer fix:

```
─── STAGE 1: Company Sends Offer ────────────────────────────────

Company clicks "Send Offer" → POST /api/v1/offers
  body: { studentId, driveId, salary: 12, joinDate, offerDetails }
  │
  offerController → offerService.createOffer()
  │
  └─ prisma.offer.create({
       studentId, driveId,
       salary: 12,
       status: "PENDING",
       counterOfferText: null,
       counterSalary: null       ← both null initially
     })

DATABASE: offers { salary: 12, status: PENDING }

─── STAGE 2: Student Sends Counter ─────────────────────────────

Student fills counter modal:
  counterSalary: 14
  counterOfferText: "Based on my React expertise..."
  │
POST /api/v1/offers/:id/counter
  body: { counterOfferText, counterSalary: 14 }
  │
  offerController.counterOffer()
  │
  ├─ validate: counterSalary > 0, text not empty
  ├─ validate: offer.status === "PENDING" (can only counter pending)
  ├─ validate: offer.studentId === this student
  │
  └─ offerRepository.updateOfferStatus(id, "COUNTERED", text, 14)
       └─ prisma.offer.update({
            status: "COUNTERED",
            counterOfferText: "Based on my React expertise...",
            counterSalary: 14     ← stored!
          })

DATABASE: offers { salary: 12, status: COUNTERED,
                   counterSalary: 14, counterOfferText: "..." }

─── STAGE 3: Company Sees Counter ──────────────────────────────

Company visits /company/offers
  │
GET /api/v1/offers/drive/:driveId
  │
  Returns offer with:
    salary: 12          ← original
    status: COUNTERED
    counterSalary: 14   ← student's ask
    counterOfferText: "Based on my React expertise..."

  UI shows amber box:
    "Counter Salary: ₹14 LPA (original: ₹12 LPA)"
    "Based on my React expertise..."
    [Accept Counter]  [Reject Counter]

─── STAGE 4a: Company Accepts Counter ──────────────────────────

Company clicks "Accept Counter"
  │
POST /api/v1/offers/:id/counter/respond
  body: { decision: "ACCEPT" }
  │
  offerService.respondToCounterOffer() → nextStatus = ACCEPTED
  │
  offerRepository.updateOfferStatus(id, "ACCEPTED")
    │
    ├─ fetches existing offer → counterSalary = 14
    ├─ updateData.salary = 14    ← PROMOTED from counter!
    ├─ updateData.counterSalary = null   ← cleared
    └─ updateData.counterOfferText = null  ← cleared

DATABASE: offers { salary: 14, status: ACCEPTED }
                  ^^^^^ salary updated to negotiated amount!

─── STAGE 4b: Company Rejects Counter ──────────────────────────

Company clicks "Reject Counter"
  │
  nextStatus = REJECTED
  offerRepository.updateOfferStatus(id, "REJECTED")
    └─ counterSalary: null, counterOfferText: null, status: REJECTED

DATABASE: offers { salary: 12, status: REJECTED }
```

**Key Files:**
- [`offerController.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/controllers/offerController.ts)
- [`offerService.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/services/offerService.ts)
- [`offerRepository.ts`](file:///c:/Users/Chirag%20Vasava/Downloads/Personal/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/repositories/offerRepository.ts)

---

## 🏫 FEATURE 7 — University Bulk Student Onboarding (CSV)

### How bulk CSV upload works:

```
BROWSER
  │
POST /api/v1/universities/students/bulk
  Content-Type: multipart/form-data
  file: MSU_Students.csv
  │
SERVER → universityRoutes → multer({ storage: memoryStorage() })
  │
  ├─ [1] universityController.bulkOnboardStudents()
  │
  ├─ [2] Parse CSV from buffer (csv-parse library):
  │       Columns: firstName, lastName, email, rollNumber,
  │                department, batch, cgpa, phone
  │
  ├─ [3] For EACH row:
  │       │
  │       ├─ validate email format → skip if invalid
  │       ├─ check user exists by email
  │       │     if exists → link student to this university
  │       │     if not → create new user + student record
  │       │
  │       └─ prisma.student.update({
  │             universityId: myUniversityId,
  │             rollNumber: row.rollNumber,
  │             department: row.department,
  │             batch: parseInt(row.batch),
  │             cgpa: parseFloat(row.cgpa),
  │             verificationStatus: "PENDING"
  │           })
  │
  └─ [4] Response: {
           success: true,
           imported: 82,
           skipped: 2,    ← bad emails skipped
           errors: [...]   ← detailed error list
         }
```

---

## 🔐 FEATURE 8 — Role-Based Access Control (RBAC)

### How the system prevents cross-role access:

```
Every API call flow:
  │
  authMiddleware → injects req.userId, req.userRole
  │
  Controller checks role:
  │
  Example — driveController.createDrive():
  │
  ├─ const role = req.userRole
  ├─ if (role !== "COMPANY") throw 403 "Only companies can create drives"
  │
  Example — universityController.getDriveRequests():
  │
  ├─ const role = req.userRole
  ├─ if (role !== "UNIVERSITY") throw 403
  │
  Example — adminController:
  │
  └─ if (role !== "ADMIN") throw 403

The 4 roles and what they can do:
┌──────────────┬──────────────────────────────────────────────────┐
│ Role         │ Can Access                                       │
├──────────────┼──────────────────────────────────────────────────┤
│ ADMIN        │ Manage universities, view all data, billing      │
│ UNIVERSITY   │ Onboard students, approve drives, verify students│
│ COMPANY      │ Create drives, send offers, view applications    │
│ STUDENT      │ Browse drives, apply, upload resumes, manage     │
│              │ offers (accept/reject/counter)                   │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## 📊 FEATURE 9 — Audit Trail System (Offers)

### Every offer action is logged:

```
Student counters → Company accepts → student accepts
  each action creates a row in offer_audits table

offerAudit schema:
  id, offerId, action, performedBy (userId),
  note, metadata (JSON), createdAt

Actions tracked:
  CREATED       → when offer is first sent
  ACCEPTED      → student accepts
  REJECTED      → student rejects  
  COUNTERED     → student submits counter
  COUNTER_RESPONSE → company responds to counter
  EXPIRED       → system marks as expired

addOfferAudit(offerId, action, userId, note, metadata)
  │
  └─ prisma.offerAudit.create({ offerId, action, performedBy, note,
                                 metadata: JSON.stringify(metadata) })

GET /api/v1/offers/:id/audit
  └─ returns full timeline of every action on this offer
```

---

## 🗄️ FEATURE 10 — Database Schema Relationships

```
users (1) ──────────────── (1) students
users (1) ──────────────── (1) companies
users (1) ──────────────── (1) universities

universities (1) ─────── (M) students          ← university onboards students
universities (1) ─────── (M) drives            ← drives need approval
companies (1) ────────── (M) drives            ← company creates drives

drives (1) ──────────────── (M) drive_applications
drives (1) ──────────────── (M) offers
drives (1) ──────────────── (M) interview_schedules

students (1) ─────────── (M) drive_applications
students (1) ─────────── (M) offers
students (1) ─────────── (M) resumes

offers (1) ──────────────── (M) offer_audits

Key Constraints:
  drive_applications: UNIQUE(studentId, driveId) ← prevents duplicate apply
  offers: index on (studentId, driveId, status)
  drives: index on (isActive, isApproved)        ← fast student query
```

---

## 🚀 FEATURE 11 — EC2 Deployment Architecture

```
User → Vercel (Next.js Frontend)
         │
         │ API calls (CORS whitelist: uninest-mu.vercel.app)
         ▼
       EC2 Instance (Amazon Linux)
         │
         ├─ PM2 process manager
         │   └─ node dist/server.js (built Express app)
         │
         ├─ Port 8000 → mapped to 54-147-162-27.sslip.io via sslip.io DNS
         │
         └─ .env variables:
               DATABASE_URL   → Neon PostgreSQL connection string
               JWT_SECRET     → signing key for tokens
               GEMINI_API_KEY → AI features
               SMTP_*         → email OTP

How to update after a code change:
  ssh ubuntu@54.147.162.27
  cd ~/UniNest-AI
  git pull origin main
  cd backend
  npm install          ← if package.json changed
  npm run build        ← compiles TypeScript → dist/
  pm2 restart all      ← zero-downtime restart
```

---

## 🧠 Interview Questions & Model Answers

### Q1: How does the drive approval system prevent unapproved drives from leaking to students?

> **Answer**: Three layers of protection. First, `driveRepository.createDrive()` always sets `isApproved: false` explicitly regardless of the schema default. Second, `getEligibleDrivesForStudent()` has `WHERE isApproved = true AND isActive = true` in the Prisma query — so even if you query the API, unapproved drives are filtered at the database level. Third, the university-facing endpoint `getDriveRequests()` explicitly queries `WHERE isApproved = false` so the placement officer only sees pending drives.

### Q2: What bug existed in the counter-offer flow and how did you fix it?

> **Answer**: The original code set `nextStatus = OfferStatus.PENDING` when the company accepted a counter — so the salary never changed. There was no `counterSalary` field in the schema at all; only `counterOfferText` existed. I fixed it in 4 layers: (1) Added `counterSalary Float?` to the Prisma schema and pushed with `prisma db push`. (2) Updated `updateOfferStatus()` in the repository to detect when status becomes `ACCEPTED` and automatically promote `counterSalary` to `salary`. (3) Updated `respondToCounterOffer()` in the service to use `OfferStatus.ACCEPTED` instead of `PENDING`. (4) Replaced the `window.prompt()` in the student UI with a proper modal that collects both salary and message, with validation.

### Q3: How does the JWT token get attached to every API request?

> **Answer**: In `frontend/lib/api.ts`, an Axios request interceptor runs before every HTTP call. It reads the token from `localStorage.getItem("token")` and adds it as `Authorization: Bearer <token>` to the request headers. On the server, `authMiddleware.ts` calls `jwt.verify(token, JWT_SECRET)` which decodes the payload and injects `userId` and `userRole` into the `req` object for the controller to use.

### Q4: Why does the system use `memoryStorage` for file uploads instead of `diskStorage`?

> **Answer**: Originally the code used `diskStorage`, which saved the PDF to disk but left `req.file.buffer` empty — so `pdf-parse` had nothing to read and `extractedText` was never populated. Switching to `memoryStorage` keeps the file in `req.file.buffer` in RAM, allowing `pdf-parse` to extract text immediately during the upload request. The controller then manually writes the PDF to disk for file serving while also saving the extracted text to the database for AI analysis.

---

*Phase 3 complete. You now understand every feature at the code level.*
*Next: Practice explaining each flow out loud as if in a technical interview.*
