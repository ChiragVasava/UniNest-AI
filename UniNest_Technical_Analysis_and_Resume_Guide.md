# UniNest AI - Comprehensive Technical Analysis & Resume Guide

> **Project Name**: UniNest AI - Campus Recruitment System  
> **Repository Type**: Decoupled Monorepo (Next.js 16 App Router Frontend + Node.js / Express Backend)  
> **Target Role**: Software Engineering Internship & Full-Time Placements  

---

## 1. Programming Languages

- **TypeScript**: Used extensively across both Frontend Next.js App Router and Backend Express.js APIs for strict type safety and schema contracts.
- **JavaScript (ES6+)**: Node.js runtime, build tools, PostCSS/Tailwind configuration files (`.mjs` / `.js`).
- **HTML5 & CSS3**: JSX component markup, Tailwind CSS styling, responsive layout structures.
- **SQL**: Underlying query language generated via Prisma ORM for PostgreSQL queries.

---

## 2. Frontend

- **Frameworks**: Next.js (v16.2.6 - App Router)
- **Libraries**: React (v19.2.4), React DOM (v19.2.4), Axios (v1.6.0)
- **UI Frameworks**: Tailwind CSS (v4 with `@tailwindcss/postcss`), Custom modular UI component design system (Card, Button, StatusBadge, Alert, Navbar, Modal)
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`), Custom React Context (`AuthContext`)
- **Routing**: Next.js App Router (File-based routing with route grouping: `(auth)`, `/admin`, `/company`, `/student`, `/university`, `/unauthorized`)
- **Forms**: Controlled React Form Inputs (State-driven form handling)
- **Validation**: Client-side Custom Regex & Conditional Inline Constraints
- **Charts**: None (Custom CSS/SVG progress bars & stat cards)
- **Editors**: None (Standard HTML `<input>` and `<textarea>` elements)
- **Utilities**: Custom Axios HTTP Instance (`lib/api.ts`) with Request & Response Interceptors for JWT handling

---

## 3. Backend

- **Frameworks**: Express.js (v4.18.2) on Node.js runtime
- **Authentication**: Custom JWT Authentication (`jsonwebtoken` with Bearer Strategy) + Email OTP Verification
- **Authorization**: Custom Role-Based Access Control (RBAC) Middleware (`authMiddleware`) enforcing roles (`STUDENT`, `COMPANY`, `UNIVERSITY`, `ADMIN`)
- **Validation**: Custom Request Payload Validation & Custom `AppError` Operational Exception Handling Middleware
- **ORM**: Prisma ORM (v5.8.0 / `@prisma/client` v5.0.0)
- **File Upload**: Multer (`multer` v1.4.5 with `memoryStorage`) + `pdf-parse` for in-memory buffer text extraction
- **Background Jobs**: None (Asynchronous Node.js Promise chains & CLI execution scripts)
- **Logging**: Standard Node `console.log` / `console.error`
- **Middleware**: `cors` (Custom dynamic origin matching), `express.json`, `multer`, `authMiddleware`, `errorHandler`
- **API Framework**: RESTful API over Express Router (`/api/v1/*`)

---

## 4. Database

- **Databases**: PostgreSQL (Hosted on Neon DB serverless PostgreSQL & AWS RDS compatible)
- **ORMs**: Prisma ORM (v5)
- **Migration Tools**: Prisma CLI (`prisma db push`, `prisma generate`, `prisma seed`)
- **Database Drivers**: `@prisma/client` (PostgreSQL native adapter over pooled connection strings)

---

## 5. AI

- **LLMs**: Google Gemini (`gemini-2.0-flash`)
- **AI SDKs**: None (Direct REST Integration via `axios` to Google Generative Language API)
- **Embedding**: None (Direct text extraction context matching)
- **Prompt Engineering**: Custom Structured System Prompts for ATS Scoring, Verdict Classification, Skill Gap Analysis, and Offer Letter Email Generation
- **Vector DB**: None
- **Inference APIs**: Google Generative Language REST API (`/v1beta/models/gemini-2.0-flash:generateContent`)

---

## 6. Testing

- **Unit Testing**: None (TypeScript compiler static type checking via `tsc --noEmit`)
- **Integration Testing**: Manual Verification via Postman API collection
- **E2E Testing**: None (Manual end-to-end user workflows)
- **API Testing**: Postman Collection (`UniNest.postman_collection.json`), cURL scripts
- **Coverage**: None

---

## 7. DevOps

- **Docker**: None
- **GitHub Actions**: None
- **CI/CD**: Vercel Git-integrated Auto-Deployments (Frontend) + Manual Git Deployment over SSH (Backend)
- **Build Tools**: TypeScript Compiler (`tsc`), Next.js Compiler, PostCSS, `ts-node`
- **Deployment**: AWS EC2 (Ubuntu Linux hosting Express API via PM2), Vercel (Next.js Frontend)

---

## 8. Cloud

- **AWS**: AWS EC2 (Ubuntu Linux instance), AWS Security Groups, Custom DNS IP Mapping
- **Vercel**: Next.js App Router Frontend Hosting (`uninest-mu.vercel.app`, `uninest.chiragvasava.me`)
- **Render**: None
- **Railway**: None
- **Firebase**: None
- **Appwrite**: None
- **Supabase**: None (Neon DB PostgreSQL used instead)

---

## 9. APIs & Integrations

- **Payment**: None
- **Email**: Nodemailer (`nodemailer` v9.0.3 over SMTP for OTP emails)
- **Authentication**: Custom JWT / Password Hashing (`bcryptjs`) + Email OTP
- **Third-party APIs**: Google Gemini REST API, Twilio (Package present in `package.json`, unused in core routes)

---

## 10. Security

- **JWT**: `jsonwebtoken` (Signing & Verifying Bearer tokens with 24-hour expiration)
- **bcrypt**: `bcryptjs` (Password hashing using salt rounds = 10)
- **OAuth**: None
- **CORS**: `cors` middleware with custom dynamic origin validator (`localhost`, `.vercel.app`, `.chiragvasava.me`)
- **Rate Limiting**: None
- **Helmet**: None
- **CSRF**: None
- **Validation**: Custom regex sanitization and backend payload checks

---

## 11. Architecture

- **MVC / Layered Architecture**: 3-Tier Layered Architecture (Routes → Controllers → Services → Repositories → Prisma/Database)
- **Clean Architecture**: Decoupled service layer containing business logic and isolated database layer
- **Repository Pattern**: Explicit Data Access Objects (`driveRepository`, `offerRepository`, `studentRepository`, `companyRepository`)
- **Service Layer**: Business domain logic isolated in (`atsService`, `driveService`, `offerService`, `studentService`, `authService`)
- **Dependency Injection**: Parameter-based module injection
- **REST**: Stateless RESTful JSON API
- **Microservices**: None
- **Monolith**: Modular Monolith (Decoupled Next.js Frontend + Express Node.js Backend Monorepo)

---

## 12. Other Technologies

- **`pdf-parse`**: Buffer-level text extraction from uploaded resume PDFs
- **`multer`**: In-memory `multipart/form-data` processing
- **`PM2`**: Production process manager running backend on Linux EC2
- **`dotenv`**: Environment variable management
- **`Postman`**: API testing and collection documentation
- **`Git`**: Monorepo source control & GitHub release workflow

---

## 13. Resume Recommendation

### A. Technologies I should definitely put on my resume because I have real hands-on experience:
1. **TypeScript / JavaScript (ES6+)**
2. **Next.js (App Router) & React 19**
3. **Node.js & Express.js**
4. **PostgreSQL & Prisma ORM**
5. **Tailwind CSS**
6. **RESTful API Design & Layered Architecture (Repository & Service Pattern)**
7. **JWT Authentication & RBAC (Role-Based Access Control)**
8. **Google Gemini REST API Integration & Prompt Engineering**
9. **Linux AWS EC2 Deployment & PM2**
10. **Multer & `pdf-parse` (In-memory document processing)**

### B. Technologies I can mention ONLY if I understand them well enough to answer interview questions:
1. **Nodemailer (SMTP integration)**
2. **Custom CORS configuration & Web Security basics**
3. **Neon Serverless PostgreSQL**
4. **Vercel Deployment Workflows**
5. **Postman API Documentation**

### C. Technologies that are present in the project but should NOT be included because they are configuration-only, auto-generated, or unused:
1. **Twilio** (Listed in `package.json`, but SMS verification is not active in core routes)
2. **PostCSS** (Internal build tooling for Tailwind)
3. **`ts-node`** (Development execution wrapper for TypeScript)
4. **`eslint` / `@typescript-eslint`** (Static linting tooling)
5. **Prisma Auto-generated Client Code**

### D. Technologies that recruiters would expect me to know if they see them on my resume:
1. **Database Indexing & Schema Relationships** (Foreign keys, `@unique`, cascading deletes)
2. **Async JavaScript & Promises** (`async/await`, error handling middleware)
3. **HTTP Status Codes & REST Conventions** (200, 201, 400, 401, 403, 404, 500)
4. **State Management & React Lifecycle Hooks** (`useState`, `useEffect`, `useContext`)
5. **Basic Git & CI/CD principles**

---

## 14. Confidence Rating

| Technology | Confidence Rating | Justification |
| :--- | :--- | :--- |
| **TypeScript** | **Advanced** | Heavily used across full stack; strict typing on APIs, payloads, and components. |
| **React / Next.js (App Router)** | **Advanced** | Full dynamic UI built with App Router, route groups, context, and state. |
| **Node.js / Express.js** | **Advanced** | Fully custom Express API built with modular routing, middleware, and controllers. |
| **Prisma ORM** | **Advanced** | Complex relational schema models, queries, indexes, migrations, and seeding scripts. |
| **PostgreSQL** | **Intermediate** | Good query and relational structure design, but managed via Prisma. |
| **Tailwind CSS** | **Advanced** | Comprehensive custom UI design without external component libraries. |
| **JWT & Authentication** | **Advanced** | End-to-end token generation, authorization middleware, OTP verification, and RBAC. |
| **Repository Pattern / Architecture**| **Advanced** | Hand-crafted Controllers, Services, and Repositories architecture. |
| **Google Gemini API** | **Intermediate** | Direct REST Integration for ATS scoring, feedback, and email generation via prompt engineering. |
| **Multer / `pdf-parse`** | **Intermediate** | In-memory buffer parsing and disk storage implementation for PDF extraction. |
| **AWS EC2 & PM2** | **Intermediate** | Deployed Express server to Ubuntu Linux instance on EC2 using PM2 and security groups. |
| **Vercel** | **Basic** | Standard frontend hosting integration. |
| **Nodemailer** | **Basic** | Basic SMTP integration for email OTP dispatch. |
| **Twilio** | **Configuration Only**| Installed dependency only; unused in active codebase. |
| **Docker / Kubernetes** | **None** | Not used or configured in this project workspace. |
