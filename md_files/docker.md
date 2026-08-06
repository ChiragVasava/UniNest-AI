# 🐳 UniNest AI — Complete Project & Docker Execution Log

> **Project Name**: UniNest AI - Campus Recruitment Portal  
> **Repository**: [GitHub - ChiragVasava/UniNest-AI](https://github.com/ChiragVasava/UniNest-AI)  
> **Document Purpose**: A living, chronological log of EVERY instruction given by the user, actions performed by the AI assistant, responses provided, errors encountered, solutions implemented, and technical decisions made across all project sessions.

---

## 📜 Living Documentation Rule
> **MANDATORY**: This document MUST be updated at the end of EVERY session/chat whenever new instructions are executed, features are implemented, bugs are resolved, or architectural changes are made.

---

## 📌 Table of Session Logs
1. [Session 1 — Full Stack Technical Audit & Resume Guide](#session-1--full-stack-technical-audit--resume-guide)
2. [Session 2 — Monorepo Cleanup, Data Security & Git Hygiene](#session-2--monorepo-cleanup-data-security--git-hygiene)
3. [Session 3 — Docker & Redis Architectural Deep Dive & Strategy](#session-3--docker--redis-architectural-deep-dive--strategy)
4. [Session 4 — Phase 1: Multi-Stage Backend Dockerfile Creation](#session-4--phase-1-multi-stage-backend-dockerfile-creation)
5. [Session 5 — Phase 2: Debugging Prisma Alpine OpenSSL Engine Crash](#session-5--phase-2-debugging-prisma-alpine-openssl-engine-crash)
6. [Session 6 — Phase 3: Docker Compose Implementation & Orchestration](#session-6--phase-3-docker-compose-implementation--orchestration)
7. [Session 7 — Complete Conversation & History Consolidation](#session-7--complete-conversation--history-consolidation)

---

## Session 1 — Full Stack Technical Audit & Resume Guide

### 💬 User Instruction
> *"Act as a Senior Software Engineer, Technical Architect, and Resume Reviewer. Analyze my ENTIRE project workspace. Identify EVERY technology, framework, library, tool, platform, API, database, protocol, architecture pattern, security mechanism, and deployment actually used. Return results in a 14-section format."*

### ⚙️ Actions Performed by AI
1. Inspected `backend/package.json`, `frontend/package.json`, root `package.json`.
2. Inspected backend controllers, services, repositories (`atsService.ts`, `authService.ts`, `driveService.ts`, etc.).
3. Inspected frontend App Router routes (`(auth)`, `/admin`, `/company`, `/student`, `/university`).
4. Analyzed database ORM (`schema.prisma`) and Gemini AI integration.
5. Created markdown file `UniNest_Technical_Analysis_and_Resume_Guide.md` at workspace root.

### 📝 AI Response Summary
- Delivered a 14-part technical analysis detailing exact technologies (TypeScript, Next.js 16, React 19, Express.js 4, Prisma ORM 5, PostgreSQL, Google Gemini 2.0 Flash, Tailwind CSS, Multer, `pdf-parse`, Nodemailer, JWT, bcryptjs).
- Categorized technologies into 4 resume lists (Definitely include, Mention if understood, Omit config-only tools, Recruiter expectation list).
- Assigned honest confidence ratings for interview preparation.

---

## Session 2 — Monorepo Cleanup, Data Security & Git Hygiene

### 💬 User Instruction
> *"create csv folder and move these csv there and create md_files folder and move these extra md files there and push them to github repo. make sure csv and other important files does not get pushed."*

### ⚙️ Actions Performed by AI
1. Created `csv/` and `md_files/` directories.
2. Moved student/credential CSV files (`MSU_Students.csv`, `UniNest_Credentials.csv`) into `csv/`.
3. Moved documentation files (`Explain.md`, `UniNest_Technical_Analysis_and_Resume_Guide.md`) into `md_files/`.
4. Updated `.gitignore` to strictly ignore sensitive data:
   ```gitignore
   # --- Sensitive Credentials & Student CSV Data ---
   csv/
   *.csv
   Resumes/
   ```
5. Committed and pushed clean repository structure to GitHub (`origin/main`).

### 📝 AI Response Summary
- Verified `git status` confirmed CSV files and student credentials were ignored and isolated locally.
- Successfully pushed documentation changes to GitHub repository.

---

## Session 3 — Docker & Redis Architectural Deep Dive & Strategy

### 💬 User Instruction
> *"Act as a Senior Backend Engineer, DevOps Engineer, and Software Architect. I want to add Docker and Redis to my existing UniNest AI project. DO NOT start implementing anything yet. Inspect the entire project and explain: Current Architecture, Current Tech Stack, Docker Analysis, Redis Analysis (ranked by value), Interview Value, and Final Recommendation."*

### ⚙️ Actions Performed by AI
1. Analyzed current system deployment (Vercel Frontend + AWS EC2 Node PM2 Backend + Neon DB PostgreSQL).
2. Designed non-breaking Docker & Redis integration plan.
3. Created microservice container diagram exposing port `8000` for backend and `6379` for Redis.
4. Evaluated database strategy: Advised **against** containerizing PostgreSQL in production (keeping serverless Neon DB / AWS RDS for backup & reliability).
5. Ranked Redis use-cases:
   1. OTP Verification Cache & Expiry (10-min TTL)
   2. Placement Drive List & Filter Cache (with approval invalidation)
   3. JWT Revocation / Token Blacklist (on logout/suspension)
   4. Gemini AI API Rate Limiting (sliding window)
   5. Analytics & Leaderboard Cache
   6. Student & Company Profile Cache

### 📝 AI Response Summary
- Provided a complete System Architecture breakdown, Redis placement matrix, and Docker containerization plan without modifying source code.

---

## Session 4 — Phase 1: Multi-Stage Backend Dockerfile Creation

### 💬 User Instruction
> *"Now we will implement only Phase 1. Do NOT implement Redis. Do NOT create docker-compose.yml yet. Do NOT modify any existing application logic. Do NOT change deployment. Do NOT touch Prisma configuration. Your task is ONLY to create the backend Dockerfile."*

### ⚙️ Actions Performed by AI
1. Created `backend/Dockerfile` using multi-stage build pattern (`builder` and `runner` stages).
2. Created `backend/.dockerignore` to exclude `node_modules`, `dist`, `.env`, and git metadata.
3. Built TypeScript code to `./dist` using `npm run build` (`prisma generate && tsc`).
4. Pruned devDependencies using `npm prune --production` to keep runner container image lightweight.

### 📝 AI Response Summary
- Explained every Docker instruction line by line, why it is needed, and what fails if removed.
- Showed exact commands to build image (`docker build -t uninest-backend:latest .`) and run container locally (`docker run -p 8000:8000`).

---

## Session 5 — Phase 2: Debugging Prisma Alpine OpenSSL Engine Crash

### 💬 User Instruction
> *"The backend Docker container builds successfully, but the container exits immediately at runtime. I inspected the logs and found: PrismaClientInitializationError ... Error: libssl.so.1.1: No such file or directory. Analyze why this happens, fix the Dockerfile using current Prisma and Node.js best practices, explain every change, and do not touch application code."*

### ❓ Error Analysis
- **Root Cause**: `node:20-alpine` (Alpine Linux) uses lightweight `musl` libc instead of standard GNU `glibc`.
- Prisma ORM compiles native C++/Rust query engine binaries (`query-engine-linux-musl`) that dynamically link against system OpenSSL libraries (`libssl.so`).
- The base Alpine image strips out `openssl` and `libc6-compat`, causing Prisma Client to crash on container startup.

### ⚙️ Fix Applied in `backend/Dockerfile`
Added OS-level dependency installation in **both builder and runner stages**:
```dockerfile
RUN apk add --no-cache openssl libc6-compat
```

### 📝 AI Response Summary
- Updated `backend/Dockerfile` with `openssl` and `libc6-compat` libraries.
- Explained dynamic library linking (`libssl.so`) and `musl` compatibility layer.
- Provided re-build and verification steps (`docker build`, `docker run`, `curl http://localhost:8000/api/v1/health`).

---

## Session 6 — Phase 3: Docker Compose Implementation & Orchestration

### 💬 User Instruction
> *"Now implement ONLY docker-compose.yml. Do NOT implement Redis logic inside application yet. Do NOT modify backend source code, frontend, Prisma, or deployment. Include ONLYuninest-backend and redis (redis:7-alpine). Ensure backend and Redis communicate through Docker networking. After creating docker-compose.yml, STOP."*

### ⚙️ Actions Performed by AI
1. Created `docker-compose.yml` at workspace root.
2. Defined `redis` service using `redis:7-alpine`, container name `uninest-redis`, host port `6379:6379`, named volume `redis-data:/data`, and `redis-cli ping` health check.
3. Defined `uninest-backend` service pointing to `./backend/Dockerfile`, container name `uninest-backend`, host port `8000:8000`, env file `./backend/.env`, and `REDIS_HOST=uninest-redis`.
4. Configured container dependency ordering: `depends_on: redis: { condition: service_healthy }`.
5. Created isolated internal Docker bridge network `uninest-network`.

### 📝 AI Response Summary
- Detailed every YAML block in `docker-compose.yml`.
- Explained embedded Docker DNS service discovery (`uninest-redis`), volume persistence, container vs image vs service vs volume distinctions, and provided testing cheat sheet.

---

## Session 7 — Complete Conversation & History Consolidation

### 💬 User Instruction
> *"it is not everything we did starting to ending. i want you to add everything we did till now and update it each time we chat and implement new features in this project. i also want you to add what instruction i gave you and how yo performed it and response you give me to this chat also everything. and continue to update it as we move forward."*

### ⚙️ Actions Performed by AI
1. Consolidated all previous sessions into a comprehensive, single-source-of-truth document (`md_files/docker.md`).
2. Documented exact user instructions, AI actions, error diagnostics, fixes, code blocks, and responses for every phase.
3. Established a mandatory rule to append new session logs to `md_files/docker.md` as future features are implemented.
4. Committed and pushed updated `md_files/docker.md` to GitHub.

---

## 🛠️ Complete Technical Reference & Cheat Sheet

### 1. Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production
ENV PORT=8000
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
USER node
EXPOSE 8000
CMD ["node", "dist/server.js"]
```

### 2. Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: uninest-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - uninest-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 5s

  uninest-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: uninest-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    environment:
      - PORT=8000
      - NODE_ENV=production
      - REDIS_HOST=uninest-redis
      - REDIS_PORT=6379
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - uninest-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/api/v1/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 15s

volumes:
  redis-data:
    driver: local

networks:
  uninest-network:
    driver: bridge
```

### 3. Execution Commands
```bash
# Start all services in background
docker compose up -d

# Rebuild images & start services
docker compose up --build -d

# View live container logs
docker compose logs -f

# View status of running Compose services
docker compose ps

# Restart backend service only
docker compose restart uninest-backend

# Stop and clean up containers, networks, and volumes
docker compose down -v

# Health Check API verification
curl http://localhost:8000/api/v1/health
```

---

*This document is active and will be continuously updated as new features, Redis caching modules, or architecture updates are implemented in UniNest AI.*
