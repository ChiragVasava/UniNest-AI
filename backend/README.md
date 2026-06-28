# UniNest Backend API

Backend service for UniNest AI - Campus Recruitment Operating System.

## 📚 Architecture Overview

```
Request → Express Server
  ↓
Authentication Middleware (JWT)
  ↓
Route Handler (routes/)
  ↓
Controller (controllers/) - Parse & validate request
  ↓
Service (services/) - Business logic
  ↓
Repository (repositories/) - Database queries
  ↓
Prisma Client → PostgreSQL
```

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── database.ts      # Prisma client singleton
│   ├── middleware/          # Express middleware
│   │   └── errorHandler.ts  # Global error handling
│   ├── routes/              # API route definitions
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── repositories/        # Database layer
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema (YOUR DATABASE BLUEPRINT)
│   │   └── seed.ts          # Initial test data
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Helper functions
│   └── server.ts            # Main entry point
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## 🗄️ Database Schema

### Key Models:
- **User** (Base) - All users (Student, Company, Admin)
- **Student** - Academic profile, resumes, applications
- **Company** - Company details, drives
- **Drive** - Placement drives/job postings
- **DriveApplication** - Student applications for drives
- **Resume** - Student resumes
- **Offer** - Job offers

### Database Relations:
```
User (1) ──→ (1) Student
User (1) ──→ (1) Company
Company (1) ──→ (N) Drive
Student (N) ──→ (N) Drive (via DriveApplication)
Student (1) ──→ (N) Resume
Drive (1) ──→ (N) Offer
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL connection:
```
DATABASE_URL="postgresql://user:password@localhost:5432/uninest"
PORT=8000
JWT_SECRET="your-super-secret-key"
```

### 3. Initialize Prisma
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed test data
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Server will run at: `http://localhost:8000`

Health check: `GET http://localhost:8000/api/v1/health`

## 📝 Utilities

### JWT Token Management (`src/utils/jwt.ts`)
- `generateToken()` - Create JWT tokens
- `verifyToken()` - Validate tokens
- `decodeToken()` - Read token payload

### Password Encryption (`src/utils/encryption.ts`)
- `hashPassword()` - Hash passwords with bcryptjs
- `comparePassword()` - Verify passwords

### Validators (`src/utils/validators.ts`)
- Email, password strength, phone, roll number
- CGPA and batch year validation

## 🔒 Authentication Flow

```
1. User registers/logs in
   ↓
2. Password hashed with bcryptjs
   ↓
3. JWT token generated
   ↓
4. Client stores token (localStorage/cookie)
   ↓
5. Every request includes: Authorization: Bearer <token>
   ↓
6. Middleware verifies token before accessing protected routes
```

## 📡 API Response Format

All responses follow:
```json
{
  "success": true/false,
  "data": {},
  "message": "optional"
}
```

## 🚀 Next Steps

After backend setup is confirmed working:

1. **STEP 2**: Setup Database Schema Implementation
2. **STEP 3**: Build Authentication Endpoints
3. **STEP 4**: Build Student Module APIs
4. **STEP 5**: Build Company Module APIs
... and so on
