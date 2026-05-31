<div align="center">

<br />

```
██╗   ██╗███╗   ██╗██╗███╗   ██╗███████╗███████╗████████╗
██║   ██║████╗  ██║██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝
██║   ██║██╔██╗ ██║██║██╔██╗ ██║█████╗  ███████╗   ██║   
██║   ██║██║╚██╗██║██║██║╚██╗██║██╔══╝  ╚════██║   ██║   
╚██████╔╝██║ ╚████║██║██║ ╚████║███████╗███████║   ██║   
 ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝   ╚═╝   
```

**Campus Recruitment Operating System**

*From application to offer — fully orchestrated.*

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-ATS_AI-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

<br />

[Overview](#-overview) · [Architecture](#-architecture) · [Features](#-features) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Database Schema](#-database-schema) · [AI & ATS](#-ai--ats-engine) · [Environment Variables](#-environment-variables) · [Contributing](#-contributing)

<br />

</div>

---

## 📌 Overview

**UniNest** is a full-stack campus recruitment operating system that connects students and companies through a structured, end-to-end placement workflow. It handles everything from drive discovery and resume verification to interview scheduling, ATS scoring, and offer management — in a single cohesive platform.

| Role | Core Capabilities |
|---|---|
| **Student** | Browse drives, apply with verified resumes, track applications, manage interviews, accept/counter offers |
| **Company** | Post drives, review applications with AI-powered ATS analysis, schedule interviews, extend and manage offers |

> UniNest is a monorepo. The `frontend/` folder is a Next.js 15 App Router application. The `backend/` folder is an Express + Prisma API server. They communicate over a versioned REST API (`/api/v1`).

---

## 🏗 Architecture

### High-Level System Diagram

### Repository Structure

```
uninest/
├── frontend/                   # Next.js 15 App Router
│   ├── app/
│   │   ├── (auth)/             # login · register
│   │   ├── student/            # dashboard · drives · applications · offers · resumes · profile
│   │   ├── company/            # dashboard · drives · applications · offers · profile · statistics
│   │   ├── unauthorized/
│   │   └── page.tsx            # landing / root redirect
│   ├── components/
│   │   ├── auth/               # LoginForm · RegisterForm · ProtectedRoute
│   │   ├── common/             # Alerts
│   │   ├── layout/             # Navbar
│   │   └── ui/                 # Button · Badge · Card · FormField · ResumeUploader
│   ├── context/
│   │   └── AuthContext.tsx     # global auth state · localStorage · role-based redirect
│   └── lib/
│       └── api.ts              # Axios client · auto-attach Bearer · 401 redirect
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # canonical data model
│   └── src/
│       ├── server.ts           # entrypoint
│       ├── controllers/        # request/response handlers
│       ├── services/           # business logic · ATS · match
│       ├── repositories/       # DB access via Prisma
│       ├── routes/             # Express route definitions
│       ├── middleware/         # authMiddleware · resumeUpload · errorHandler
│       ├── config/
│       ├── utils/
│       └── scripts/            # seed and setup scripts
│
├── MD Files/                   # Postman guides · testing docs
├── package.json                # root scripts
└── LICENSE
```

---

## ✨ Features

<details>
<summary><strong>🎓 Student Portal</strong></summary>

- **Dashboard** — placement stats, upcoming drives, recent activity
- **Drive Discovery** — browse and filter active placement drives
- **Applications** — view status, stage history, interview timeline
- **Resume Management** — upload PDFs (≤ 5 MB), request verification, track verification status
- **Offers** — view, accept, reject, or counter salary offers
- **Profile** — manage academic info and personal details

</details>

<details>
<summary><strong>🏢 Company Portal</strong></summary>

- **Dashboard** — overview of posted drives, application volume, hire stats
- **Drive Management** — create, update, and close placement drives with eligibility criteria
- **Application Review** — view applicants, shortlist, update status, advance pipeline stages
- **ATS Analysis** — AI-powered resume scoring per drive using Gemini 1.5 Flash
- **Interview Scheduling** — create slots, confirm/reschedule with applicants
- **Offer Management** — extend offers, respond to counter-offers, audit trail
- **Statistics** — company-wide and per-drive placement analytics

</details>

<details>
<summary><strong>🤖 AI / ATS Engine</strong></summary>

- Resume vs. drive JD matching via Gemini 1.5 Flash
- Returns: score, verdict, summary, strengths, gaps, matched/missing keywords, score breakdown, confidence, rejection reason, recommendation
- Graceful fallback to heuristic scoring (keyword overlap + resume length + education signals) when `GEMINI_API_KEY` is absent or the API call fails
- Local keyword matching service (`matchService`) for lightweight analysis
- Resume preview generation with Gemini fallback to text truncation

</details>

<details>
<summary><strong>🔐 Auth & Security</strong></summary>

- JWT-based authentication, `bcryptjs` password hashing
- `authMiddleware` verifies Bearer tokens and sets `req.userId` on all protected routes
- Role enum: `STUDENT`, `COMPANY`, `ADMIN`
- CORS restricted to `FRONTEND_URL` (default: `http://localhost:3000`)
- PDF-only resume upload enforced in middleware, 5 MB file size cap
- Frontend 401 auto-logout: clears token + user from `localStorage`, redirects to `/login`
- `window.__TEST_INJECT_AUTH` hook in `AuthContext` for browser-based integration testing

</details>

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18.x |
| PostgreSQL | ≥ 14 |
| npm | ≥ 9 |

### 1. Clone the repository

```bash
git clone https://github.com/ChiragVasava/uninest.git
cd uninest
```

### 2. Configure environment variables

**Backend** — create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/uninest"
PORT=8000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key   # optional — falls back to heuristic scoring
UPLOAD_DIR=uploads/resumes           # see backend/.env.example
MAX_FILE_SIZE=5242880                # see backend/.env.example
```

**Frontend** — create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Install dependencies

```bash
# root (runs both workspaces if configured)
npm install

# or independently:
cd backend && npm install
cd ../frontend && npm install
```

### 4. Set up the database

```bash
cd backend
npm run prisma:generate   # generate Prisma client
npm run prisma:migrate    # run all migrations
npm run prisma:seed       # seed initial data (optional)
```

### 5. Start development servers

```bash
# From repo root
npm run dev:frontend   # starts Next.js on http://localhost:3000
npm run dev:backend    # starts Express on http://localhost:8000
```

Or from each folder individually:

```bash
cd backend  && npm run dev
cd frontend && npm run dev
```

### 6. Production build

```bash
npm run build:backend    # compiles TypeScript → dist/
npm run build:frontend   # Next.js production build

# Start
cd backend  && npm run start
cd frontend && npm run start
```

> **Deployment platform**: Not Found in Codebase — no Docker, Vercel, or CI configuration files exist in the repository.

---

## 📡 API Reference

All routes are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <token>`.

<details>
<summary><strong>Auth</strong> <code>/api/v1/auth</code></summary>

| Method | Path | Description |
|---|---|---|
| `POST` | `/register` | Register new user (student or company) |
| `POST` | `/login` | Authenticate and receive JWT |
| `GET` | `/me` | Get current authenticated user |

</details>

<details>
<summary><strong>Students</strong> <code>/api/v1/students</code></summary>

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List all students |
| `GET` | `/statistics` | Placement statistics |
| `GET` | `/eligible/:department` | Students eligible by department |
| `POST` | `/` | Create student profile |
| `GET` | `/me/profile` | Get own profile |
| `GET` | `/:id` | Get student by ID |
| `PUT` | `/:id` | Update student |
| `DELETE` | `/:id` | Delete student |

</details>

<details>
<summary><strong>Companies</strong> <code>/api/v1/companies</code></summary>

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List all companies |
| `GET` | `/statistics` | Global company statistics |
| `GET` | `/by-sector/:sector` | Filter companies by sector |
| `GET` | `/me/profile` | Get own company profile |
| `GET` | `/me/statistics` | Own company's placement statistics |
| `GET` | `/:id` | Get company by ID |
| `POST` | `/` | Create company profile |
| `PUT` | `/:id` | Update company |
| `DELETE` | `/:id` | Delete company |

</details>

<details>
<summary><strong>Drives</strong> <code>/api/v1/drives</code></summary>

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List all drives |
| `GET` | `/statistics` | Drive statistics |
| `GET` | `/eligible/list` | Drives the authenticated student is eligible for |
| `GET` | `/me/company` | Drives posted by own company |
| `GET` | `/:id` | Get drive by ID |
| `POST` | `/` | Create drive |
| `PUT` | `/:id` | Update drive |
| `DELETE` | `/:id` | Delete drive |

</details>

<details>
<summary><strong>Applications</strong> <code>/api/v1/applications</code></summary>

| Method | Path | Description |
|---|---|---|
| `GET` | `/statistics` | Application statistics |
| `GET` | `/me/list` | Own applications list |
| `GET` | `/drive/:driveId` | All applications for a drive |
| `GET` | `/drive/:driveId/ats` | ATS scores for all drive applicants |
| `GET` | `/drive/:driveId/shortlisted` | Shortlisted applicants |
| `GET` | `/:id` | Get application by ID |
| `GET` | `/:id/timeline` | Full stage history |
| `POST` | `/` | Submit application |
| `PUT` | `/:id/status` | Update application status |
| `POST` | `/:id/stage` | Advance pipeline stage |
| `POST` | `/:id/interviews` | Create interview slot |
| `PUT` | `/interviews/:interviewId` | Update interview |
| `POST` | `/interviews/:interviewId/confirm` | Confirm interview |
| `POST` | `/interviews/:interviewId/reschedule` | Reschedule interview |
| `DELETE` | `/:id` | Delete application |

</details>

<details>
<summary><strong>Resumes</strong> <code>/api/v1/resumes</code></summary>

| Method | Path | Description |
|---|---|---|
| `GET` | `/statistics` | Resume statistics |
| `GET` | `/pending` | Resumes pending verification |
| `GET` | `/me/list` | Own resumes |
| `GET` | `/me/verified` | Own verified resumes |
| `GET` | `/` | All resumes |
| `GET` | `/:id` | Get resume by ID |
| `POST` | `/` | Upload resume (PDF, ≤ 5 MB) |
| `PUT` | `/:id` | Update resume metadata |
| `POST` | `/:id/match` | Run ATS match against a drive |
| `POST` | `/:id/verify` | Mark resume as verified |
| `POST` | `/:id/reject` | Reject resume |
| `DELETE` | `/:id` | Delete resume |

</details>

<details>
<summary><strong>Offers</strong> <code>/api/v1/offers</code></summary>

| Method | Path | Description |
|---|---|---|
| `GET` | `/statistics` | Offer statistics |
| `GET` | `/accepted` | All accepted offers |
| `GET` | `/me/list` | Own offers |
| `GET` | `/me/accepted` | Own accepted offers |
| `GET` | `/drive/:driveId` | Offers for a specific drive |
| `GET` | `/` | All offers |
| `GET` | `/:id` | Get offer by ID |
| `GET` | `/:id/audit` | Full offer audit log |
| `POST` | `/` | Extend offer |
| `POST` | `/:id/accept` | Accept offer |
| `POST` | `/:id/reject` | Reject offer |
| `POST` | `/:id/counter` | Submit counter-offer |
| `POST` | `/:id/counter/respond` | Respond to counter-offer |

</details>

<details>
<summary><strong>Health</strong></summary>

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Server health check |

</details>

---

## 🗃 Database Schema

The canonical schema lives at `backend/prisma/schema.prisma`.

```mermaid
erDiagram
    User {
        string id PK
        string email
        string password
        UserRole role
        datetime createdAt
        datetime updatedAt
    }
    Student {
        string id PK
        string userId FK
        string profile
        string academicInfo
        bool verified
    }
    Company {
        string id PK
        string userId FK
        string profile
        bool approved
    }
    Resume {
        string id PK
        string studentId FK
        string fileMetadata
        string extractedText
        VerificationStatus verificationStatus
    }
    Drive {
        string id PK
        string companyId FK
        string eligibilityFields
        string interviewFormat
    }
    DriveApplication {
        string id PK
        string studentId FK
        string driveId FK
        DriveApplicationStatus status
        string rejectionReason
    }
    Offer {
        string id PK
        string studentId FK
        string driveId FK
        float salary
        datetime joinDate
        json offerDetails
        OfferStatus status
        string counterOfferText
        datetime expiresAt
    }
    InterviewSchedule {
        string id PK
        string applicationId FK
        string driveId FK
        string companyId FK
        string studentId FK
        datetime scheduledTime
        InterviewMode mode
        string meetingLink
        InterviewConfirmationStatus confirmationStatus
    }
    ApplicationTimeline {
        string id PK
        string applicationId FK
        ApplicationStage stage
        string note
        json metadata
        string createdByUserId
    }
    OfferAudit {
        string id PK
        string offerId FK
        OfferAuditAction action
    }

    User ||--o| Student : "has"
    User ||--o| Company : "has"
    Student ||--o{ Resume : "uploads"
    Student ||--o{ DriveApplication : "submits"
    Student ||--o{ Offer : "receives"
    Student ||--o{ InterviewSchedule : "has"
    Company ||--o{ Drive : "posts"
    Company ||--o{ InterviewSchedule : "conducts"
    Drive ||--o{ DriveApplication : "receives"
    Drive ||--o{ Offer : "generates"
    Drive ||--o{ InterviewSchedule : "has"
    DriveApplication ||--o{ ApplicationTimeline : "tracks"
    DriveApplication ||--o{ InterviewSchedule : "linked"
    Offer ||--o{ OfferAudit : "logs"
```

### Enums

| Enum | Values |
|---|---|
| `UserRole` | `STUDENT`, `COMPANY`, `ADMIN` |
| `DriveApplicationStatus` | Application pipeline statuses |
| `OfferStatus` | Offer lifecycle statuses |
| `ApplicationStage` | Interview pipeline stages |
| `InterviewMode` | `ONLINE`, `OFFLINE` (or equivalent) |
| `InterviewConfirmationStatus` | Confirmation states |
| `OfferAuditAction` | Offer action log types |
| `VerificationStatus` | Resume verification states |

---

## 🤖 AI / ATS Engine

UniNest integrates Google's **Gemini 1.5 Flash** model for resume-to-JD matching via `backend/src/services/atsService.ts`.

### ATS Response Shape

```typescript
{
  score: number;             // 0–100
  verdict: string;           // e.g. "Strong Match"
  summary: string;
  strengths: string[];
  gaps: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  scoreBreakdown: object;
  confidence: number;
  whyRejected: string | null;
  recommendation: string;
  source: "gemini" | "heuristic";
}
```

### Fallback Behavior

```
GEMINI_API_KEY present?
├── YES → call Gemini 1.5 Flash
│         ├── Success → return AI analysis (source: "gemini")
│         └── Failure → fall through to heuristic
└── NO  → heuristic scoring
          (keyword overlap + resume length + education signals)
          returns source: "heuristic"
```

A separate `matchService.ts` provides local, synchronous keyword matching without any external API dependency.

---

## 🌐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `PORT` | ✅ | Server port (default: `8000`) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `JWT_EXPIRE` | ✅ | Token expiry (e.g. `7d`) |
| `FRONTEND_URL` | ✅ | CORS allowed origin |
| `GEMINI_API_KEY` | ⚠️ optional | Gemini API key — falls back to heuristic ATS if absent |
| `UPLOAD_DIR` | ⚠️ optional | Upload directory path (see `backend/.env.example`) |
| `MAX_FILE_SIZE` | ⚠️ optional | Max file size in bytes (see `backend/.env.example`) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL (default: `http://localhost:8000/api/v1`) |

---

## 🧪 Testing

> **Automated test runner**: Not Found in Codebase — no test scripts were found in `package.json`.

Manual testing documentation is available in:

- `backend/README.md`
- `backend/STUDENT_MODULE_API.md`
- `MD Files/POSTMAN_TESTING_GUIDE.md`
- `MD Files/START_TESTING_NOW.md`

The frontend `AuthContext` exposes `window.__TEST_INJECT_AUTH` for browser-based integration testing without going through the login flow.

---

## 📜 Available Scripts

### Root

| Script | Command |
|---|---|
| `dev:frontend` | Start Next.js dev server |
| `dev:backend` | Start Express dev server |
| `build:frontend` | Build frontend for production |
| `build:backend` | Compile backend TypeScript |

### Backend (`cd backend`)

| Script | Command |
|---|---|
| `dev` | Nodemon + ts-node dev server |
| `build` | TypeScript compile |
| `start` | Run compiled production server |
| `prisma:generate` | Generate Prisma client |
| `prisma:migrate` | Run DB migrations |
| `prisma:seed` | Seed database |
| `lint` | ESLint |

### Frontend (`cd frontend`)

| Script | Command |
|---|---|
| `dev` | Next.js dev server |
| `build` | Next.js production build |
| `start` | Start production server |
| `lint` | ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feat/your-feature`
5. Open a Pull Request

Please keep PRs focused and reference any related issues.

---

## 📄 License

```
MIT License
Copyright (c) 2026 Chirag Vasava
```

See [LICENSE](./LICENSE) for the full text.

---

<div align="center">

Built by [Chirag Vasava](https://github.com/ChiragVasava)

</div>