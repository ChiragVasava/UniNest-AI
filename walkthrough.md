# Walkthrough - Demo (Read-Only) Mode Implementation

I have successfully implemented and verified the **Demo Mode (Read-Only)** for both the frontend and backend of the UniNest Campus Recruitment System. 

## Changes Made

### 1. Backend Modifications
- Created the demo mode middleware [demoMiddleware.ts](file:///c:/Users/Chirag%20Vasava/Downloads/College/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/middleware/demoMiddleware.ts) which intercepts all data-modifying requests (`POST`, `PUT`, `DELETE`, `PATCH`) except for user login.
- Applied the middleware globally in [server.ts](file:///c:/Users/Chirag%20Vasava/Downloads/College/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/src/server.ts) and updated the health-check route `/api/v1/health` to expose whether the backend is in Demo Mode.
- Appended `DEMO_MODE=true` in [backend/.env](file:///c:/Users/Chirag%20Vasava/Downloads/College/Final%20Projects/UniNest-AI-main/UniNest-AI-main/backend/.env).

### 2. Frontend Modifications
- Appended `NEXT_PUBLIC_DEMO_MODE=true` in [frontend/.env.local](file:///c:/Users/Chirag%20Vasava/Downloads/College/Final%20Projects/UniNest-AI-main/UniNest-AI-main/frontend/.env.local).
- Modified the root layout [layout.tsx](file:///c:/Users/Chirag%20Vasava/Downloads/College/Final%20Projects/UniNest-AI-main/UniNest-AI-main/frontend/app/layout.tsx) to show a persistent, warning-colored global banner indicating read-only Demo Mode at the very top of all pages.
- Modified the login component [LoginForm.tsx](file:///c:/Users/Chirag%20Vasava/Downloads/College/Final%20Projects/UniNest-AI-main/UniNest-AI-main/frontend/components/auth/LoginForm.tsx) to render a Quick Login widget with autofill buttons for Student, Recruiter, and Admin roles when Demo Mode is active.

---

## Verification Results

We verified the changes using automated browser automation, capturing the successful login flow and request interception.

### 📷 Screenshots

#### 1. Login Page Autofill widget
Showing the global warning banner at the top, along with the **Demo Mode Quick Login** panel on the login card:
![Login Page Autofill](/C:/Users/Chirag%20Vasava/.gemini/antigravity-ide/brain/f0499a50-6168-47a6-b573-4a76adccceb5/login_page_autofill_1780592392664.png)

#### 2. Student Dashboard
Showing the loaded Student Dashboard with the sticky top Demo Mode banner:
![Student Dashboard Demo](/C:/Users/Chirag%20Vasava/.gemini/antigravity-ide/brain/f0499a50-6168-47a6-b573-4a76adccceb5/student_dashboard_demo_1780592407487.png)

### 🎥 Verification Recording
The complete browser session recorded while testing the login flow:
![Verification Session](/C:/Users/Chirag%20Vasava/.gemini/antigravity-ide/brain/f0499a50-6168-47a6-b573-4a76adccceb5/demo_login_success_1780592377062.webp)
