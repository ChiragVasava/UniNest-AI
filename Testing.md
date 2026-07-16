I will view `backend/src/utils/notification.ts` to see how the email (Nodemailer SMTP) and SMS (Twilio) configurations are wired up, and where logs are output.

Viewed notification.ts:1-83

Here is the step-by-step guide explaining how notification alerts behave in local development, followed by a comprehensive testing workflow to verify all the system's features.

---

### Part 1: How to Retrieve Verification SMS & Email OTPs

If you or your users are not receiving physical emails or SMS text messages on their phones, it is because the local backend configuration is falling back to a **Simulated Console Logging Transporter** for 100% free offline development. 

To view or retrieve the OTP codes:
1. Open the **backend terminal log window** where `npm run dev` is currently running.
2. Trigger the action (e.g., click **"Send Verification OTPs"** on the student verification page).
3. Look directly at the terminal logs. You will see the codes printed in a block like this:
   ```text
   ------------------------------------------
   ✉️  [SIMULATED EMAIL SENT]
   To:      student.email@college.edu
   Subject: UniNest Account Verification Code
   Body:    Your verification OTP is: 123456
   ------------------------------------------
   ------------------------------------------
   📲 [SIMULATED SMS SENT]
   To:      +91XXXXXXXXXX
   Message: Your UniNest verification OTP is: 654321
   ------------------------------------------
   ```
4. Copy these codes from the terminal and paste them into the frontend fields to verify the account.

> **Note on Real Integrations**: If you wish to send real emails/SMS, you must add SMTP (e.g. Gmail App Passwords, SendGrid) and Twilio API keys to your `backend/.env` file:
> * Email keys: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
> * Twilio keys: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

---

### Part 2: Step-by-Step Guide to Testing All UniNest Features

Follow this end-to-end testing flow to verify both the original recruitment system and the newly added AI/SaaS modules.

#### 1. Core SaaS Admin Panel
* **Step 1**: Log in using the SaaS Admin credentials. (If you don't have one, register a user with role `ADMIN`).
* **Step 2**: Navigate to `/admin/dashboard`. You will see global placement charts, metrics (total students, recruiters, and placement rate), and the university tenant directory.
* **Step 3**: Under "Create University Tenant", fill out the form:
  * **University Name**: `Faculty of Technology`
  * **Unique Code**: `FTE`
  * **Admin Email**: `fte@university.edu`
  * **Password**: `Fte@123`
* **Step 4**: Deploy the tenant. Locate it in the "Institution Tenants" table. Use the billing dropdown to toggle between **Free**, **Premium**, or **Enterprise** plans, or click **Suspend** to toggle tenant server access.

#### 2. University Placement Cell
* **Step 1**: Sign out of the admin panel and log in using the newly created university credentials: `fte@university.edu` / `Fte@123`.
* **Step 2**: Go to **"Manage Hierarchy"** (`/university/hierarchy`):
  * Create a Department (e.g. `Faculty of Technology`, code `FTE`).
  * Create a Sub-Department (e.g. parent `FTE`, name `Computer Science`, code `CSE`).
  * Create a Class division (e.g. sub-dept `CSE`, name `BE-IV-CSE-A`, batch `2026`).
  * Notice the visual hierarchy tree update below.
* **Step 3**: Go to **"Onboard Students"** (`/university/students`):
  * **Manual Entry**: Onboard a test student:
    * **Email**: `student.test@college.edu`
    * **Name**: `Aarav Patel`
    * **Roll Number**: `MSU-2026-CSE-001`
    * **CGPA**: `8.5`
  * **Bulk CSV Import**: Click **"Template"** to download the CSV sample, add a row of students, drag-and-drop the file, and click **Process Bulk Upload** to observe processing counts and validation logs.
* **Step 4**: Keep this tab open. We will return to verify profiles later.

#### 3. Student Registration & OTP Verification
* **Step 1**: Sign out of the portal, go to `/register`, select the **Student** role, and register `student.test@college.edu` with password `Student@123`.
* **Step 2**: Log in. You will be automatically redirected to `/student/verify` because the onboarding status is `PENDING`.
* **Step 3**: Enter a mobile number and click **"Send Verification OTPs"**.
* **Step 4**: Open your **backend dev terminal**, copy the email and SMS OTP codes, enter them into the verification inputs, and click **"Verify & Activate"** to unlock the student dashboard.

#### 4. AI Resume Reviewer & Resume Builder
* **Step 1**: In the student panel, navigate to **"Resumes"** (`/student/resumes`).
* **Step 2**: Upload a PDF resume. 
* **Step 3**: Click the **"🤖 AI Review"** button next to your uploaded resume. Gemini 1.5 Flash will extract the text and render a modal detailing:
  * Formatting improvements.
  * Bullet points to rewrite project details.
  * Structural layout recommendations.
* **Step 4**: Select **"Build Custom Resume"**:
  * Fill in your details (Degree, CGPA, Projects, Skills) and click **Export/Print Premium Resume PDF** to save or print a professionally styled resume.

#### 5. Company Drive Requests & Verification Approvals
* **Step 1**: Sign out of the student view. Go to `/register`, select **Company**, and register `recruiting@google.com`.
* **Step 2**: Log in, go to your dashboard, and navigate to **"My Drives"** to request a new recruitment drive:
  * **Role**: `Software Development Engineer`
  * **CGPA Cutoff**: `8.0`
  * **Salary**: `15` (Lakhs per Annum)
  * **Interview Format**: `Online`
* **Step 3**: Sign out, log back into the **University Admin** (`fte@university.edu`), and navigate to **"Recruiters & Drives"** (`/university/companies`). You will see Google's request. Click **Approve Request** to publish it.
* **Step 4**: Go to `/university/dashboard`. Student `Aarav Patel` will appear under **"Pending Verification Requests"**. Click **Approve** to verify their account, or click **Lock** to lock changes.

#### 6. Placement Matching & AI Offer Generator
* **Step 1**: Log back in as `student.test@college.edu`, check **"Eligible Drives"**, find Google's drive, and click **Apply**.
* **Step 2**: Log back in as the company `recruiting@google.com`, check **"Applications"**, locate Aarav's application, and move it to **Shortlisted**.
* **Step 3**: Under **"Send Offers"** (`/company/offers`), click **"Send Offer"** to Aarav. Supply a salary and start date.
* **Step 4**: An **"🤖 AI Offer Email"** button will appear under Aarav's offer. Click it to generate a formal recruitment draft using Gemini. You can review the draft and click **"Copy Details"** to send it.