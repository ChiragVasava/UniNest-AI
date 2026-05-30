# Completed: *Map visible frontend files* (1/3)

These are the browser-visible frontend files I found in the app, grouped by what they do.

**Pages**
- page.tsx - landing page
- frontend/app/(auth)/login/page.tsx/login/page.tsx) - login page
- frontend/app/(auth)/register/page.tsx/register/page.tsx) - register page
- page.tsx - unauthorized page
- page.tsx - student dashboard
- page.tsx - student profile
- page.tsx - student drives
- page.tsx - student applications
- page.tsx - student offers
- page.tsx - student resumes
- page.tsx - company dashboard
- page.tsx - company profile
- page.tsx - company drives
- page.tsx - company applications
- page.tsx - company offers
- page.tsx - company statistics

**Shared visible components**
- Navbar.tsx - top navigation bar
- LoginForm.tsx - login form
- RegisterForm.tsx - register form
- ProtectedRoute.tsx - route guard wrapper
- Button.tsx - buttons
- Badge.tsx - badges/status badges
- Card.tsx - cards
- FormField.tsx - form fields, inputs, text areas, select
- ResumeUploader.tsx - resume upload widget
- Alerts.tsx - alerts and loading spinner

# New Chat : turn this into a clean tree view or a JSON list of component names and paths.

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── unauthorized/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── student/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── drives/page.tsx
│   │   ├── applications/page.tsx
│   │   ├── offers/page.tsx
│   │   └── resumes/page.tsx
│   └── company/
│       ├── layout.tsx
│       ├── dashboard/page.tsx
│       ├── profile/page.tsx
│       ├── drives/page.tsx
│       ├── applications/page.tsx
│       ├── offers/page.tsx
│       └── statistics/page.tsx
└── components/
    ├── layout/
    │   └── Navbar.tsx
    ├── auth/
    │   ├── LoginForm.tsx
    │   ├── RegisterForm.tsx
    │   └── ProtectedRoute.tsx
    ├── ui/
    │   ├── Button.tsx
    │   ├── Badge.tsx
    │   ├── Card.tsx
    │   ├── FormField.tsx
    │   └── ResumeUploader.tsx
    └── common/
        └── Alerts.tsx
```

If you want, I can also convert this into JSON in the next message.