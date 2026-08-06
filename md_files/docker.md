# 🐳 UniNest AI — Complete Project & Docker Master Execution Log

> **Project Name**: UniNest AI - Campus Recruitment Portal  
> **Repository**: [GitHub - ChiragVasava/UniNest-AI](https://github.com/ChiragVasava/UniNest-AI)  
> **Document Purpose**: A single-source-of-truth master log of system architecture, technology evaluation, Docker containerization, OpenSSL fixes, Docker Compose orchestration, infrastructure verification, and session-by-session execution history.

---

## 📜 Living Documentation Rule
> **MANDATORY**: This document MUST be updated at the end of EVERY session/chat whenever new instructions are executed, features are implemented, bugs are resolved, or architectural changes are made.

---

## 📌 Table of Contents
1. [Part 1: Architecture & Containerization Strategy](#part-1-architecture--containerization-strategy)
   - [1.1 Current Architecture](#11-current-architecture)
   - [1.2 Current Tech Stack](#12-current-tech-stack)
   - [1.3 Docker Containerization Strategy](#13-docker-containerization-strategy)
   - [1.4 Redis Caching Strategy & Ranking](#14-redis-caching-strategy--ranking)
   - [1.5 System Design & Interview Value](#15-system-design--interview-value)
   - [1.6 Recommended Target Architecture](#16-recommended-target-architecture)
2. [Part 2: Chronological Session Execution Logs](#part-2-chronological-session-execution-logs)
   - [Session 1 — Full Stack Technical Audit & Resume Guide](#session-1--full-stack-technical-audit--resume-guide)
   - [Session 2 — Monorepo Cleanup, Data Security & Git Hygiene](#session-2--monorepo-cleanup-data-security--git-hygiene)
   - [Session 3 — Docker & Redis Architectural Deep Dive & Strategy](#session-3--docker--redis-architectural-deep-dive--strategy)
   - [Session 4 — Phase 1: Multi-Stage Backend Dockerfile Creation](#session-4--phase-1-multi-stage-backend-dockerfile-creation)
   - [Session 5 — Phase 2: Debugging Prisma Alpine OpenSSL Engine Crash](#session-5--phase-2-debugging-prisma-alpine-openssl-engine-crash)
   - [Session 6 — Phase 3: Docker Compose Implementation & Orchestration](#session-6--phase-3-docker-compose-implementation--orchestration)
   - [Session 7 — History Consolidation & Continuous Logging Rule](#session-7--history-consolidation--continuous-logging-rule)
   - [Session 8 — Phase 3.5: Infrastructure Verification Test Plan](#session-8--phase-35-infrastructure-verification-test-plan)
   - [Session 9 — Master Documentation Structuring](#session-9--master-documentation-structuring)
   - [Session 10 — Phase 4: Redis Infrastructure Integration & Terminal Log Evidence](#session-10--phase-4-redis-infrastructure-integration--terminal-log-evidence)
3. [Part 3: Complete Technical Reference & Artifacts](#part-3-complete-technical-reference--artifacts)
   - [3.1 Multi-Stage Dockerfile (`backend/Dockerfile`)](#31-multi-stage-dockerfile-backenddockerfile)
   - [3.2 Docker Compose (`docker-compose.yml`)](#32-docker-compose-docker-composeyml)
   - [3.3 Infrastructure Verification & Operations Commands](#33-infrastructure-verification--operations-commands)

---

# Part 1: Architecture & Containerization Strategy

## 1.1 Current Architecture

```
                  ┌────────────────────────────────────────┐
                  │          Vercel (Next.js 16)           │
                  │        uninest.chiragvasava.me         │
                  └───────────────────┬────────────────────┘
                                      │ HTTPS (Bearer JWT)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       AWS EC2 Ubuntu (Node / PM2)      │
                  │      54.147.162.27 / Express API       │
                  └───────────────────┬────────────────────┘
                                      │ TLS / TCP (Prisma ORM)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │   Neon DB (Serverless PostgreSQL)      │
                  └────────────────────────────────────────┘
```

- **Frontend**: Next.js (v16.2.6 App Router) deployed on **Vercel** (`uninest.chiragvasava.me`). Uses client-side React 19 hooks and an Axios instance (`lib/api.ts`) with request interceptors to automatically attach JWT Bearer tokens to backend requests.
- **Backend**: Express.js (v4.18.2) REST API running directly on **AWS EC2 (Ubuntu)** managed by **PM2**. Architecture follows a strict 3-tier pattern: `Routes → Controllers → Services → Repositories → Prisma ORM`.
- **Database**: Serverless PostgreSQL hosted on **Neon DB** (also compatible with AWS RDS PostgreSQL). Schema management and migrations are handled via Prisma ORM v5 (`schema.prisma`).
- **Authentication & Authorization**: Stateless JWT (`jsonwebtoken`) signed with a 24-hour expiration key. Dual verification includes 6-digit Email OTPs sent via Nodemailer (`SMTP`) and Role-Based Access Control (RBAC) middleware (`authMiddleware`) enforcing roles: `STUDENT`, `COMPANY`, `UNIVERSITY`, and `ADMIN`.
- **Deployment**:
  - **Frontend**: Automated Git-based deployment via Vercel.
  - **Backend**: Manual SSH deployment to AWS EC2 instance running PM2 process manager behind a custom CORS whitelist.
- **Environment Variables**:
  - Backend: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.
  - Frontend: `NEXT_PUBLIC_API_URL`.

---

## 1.2 Current Tech Stack

| Category | Technology | Role in UniNest |
| :--- | :--- | :--- |
| **Language** | **TypeScript (v5.3)** | Strict typing across full stack (API parameters, DB models, UI state). |
| **Frontend Framework** | **Next.js 16 & React 19** | App Router, Server Components, and Client Pages. |
| **Styling** | **Tailwind CSS v4** | Modular utility styling for dashboard UI components. |
| **Backend API** | **Node.js & Express.js 4** | Stateless REST API server handling request orchestration. |
| **ORM** | **Prisma ORM v5** | Type-safe database queries, auto-generated client, migrations. |
| **Database** | **PostgreSQL (Neon DB)** | Relational data persistence (users, profiles, drives, offers, audit logs). |
| **AI LLM** | **Google Gemini (gemini-2.0-flash)** | Resume ATS scoring, keyword extraction, and offer letter generation. |
| **File Processing** | **Multer & pdf-parse** | In-memory PDF buffer upload and text extraction. |
| **Email Service** | **Nodemailer** | Sending 6-digit OTP verification codes over SMTP. |
| **Security** | **JWT & bcryptjs** | Signed Bearer tokens and 10-round salted password hashes. |

---

## 1.3 Docker Containerization Strategy

```
                           DOCKER COMPOSE ECOSYSTEM (Local / EC2)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐  │
│  │   uninest-frontend    │   │    uninest-backend    │   │      uninest-redis       │  │
│  │   Next.js (Port 3000) │──▶│   Express (Port 8000) │──▶│  Redis v7 (Port 6379)    │  │
│  └───────────────────────┘   └───────────┬───────────┘   └──────────────────────────┘  │
│                                          │                                             │
│                                          │ (Database Connection over TLS)              │
│                                          ▼                                             │
│                              ┌───────────────────────┐                                 │
│                              │   Neon DB / AWS RDS   │ (External Managed Database)     │
│                              └───────────────────────┘                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Container Decisions:
1. **`uninest-backend` (Express API)**: Containerized into an optimized, multi-stage Docker build (`node:20-alpine`). Runs TypeScript compilation and Prisma Client generation.
2. **`uninest-redis` (Redis Cache)**: Containerized using official `redis:7-alpine` image with volume persistence (`redis-data`).
3. **`uninest-frontend` (Next.js)**: Kept on Vercel for production, but containerizable using Next.js standalone mode for self-hosted Docker environments.
4. **PostgreSQL Database**: **NOT** containerized in production. Maintained on managed serverless Neon DB / AWS RDS for automated backups, point-in-time recovery, and zero data loss risk.

---

## 1.4 Redis Caching Strategy & Ranking

Redis transforms UniNest into a high-throughput, enterprise-ready platform.

### Ranked Use Cases (Highest to Lowest Technical Value):
1. 🥇 **OTP Verification Cache & Expiry (Highest Value)**: Store short-lived 6-digit OTPs in Redis with a 10-minute TTL (`SETEX otp:user@gmail.com 600 "849204"`). Eliminates disk writes on PostgreSQL.
2. 🥈 **Placement Drive List & Filter Cache (High Value)**: Cache expensive relational queries (`drives` + `companies` + `cgpaCutoff` + `departments` + `batches`) per department key. Invalidate automatically on University drive approval/rejection (`DEL drives:*`).
3. 🥉 **JWT Revocation / Token Blacklist (High Value - Security)**: Store invalidated JWT token signatures in Redis on user logout or University Admin account suspension with TTL matching remaining token lifespan.
4. 🏅 **API Rate Limiting (High Value - Security)**: Implement sliding-window rate limiting (`INCR rate:ai_resume:user_id`) to prevent spamming Google Gemini AI endpoints.
5. 🏅 **System Analytics & Leaderboard Cache (Medium Value)**: Cache aggregated University dashboard stats (`HSET stats:university:MSU`) for 15 minutes to reduce DB load.
6. 🏅 **Student & Company Profile Cache (Medium Value)**: Cache verified profile payloads to speed up authorized requests.

---

## 1.5 System Design & Interview Value

### Key Interview Highlights:
- **JWT Blacklisting with Dynamic TTL**: Combines stateless JWT efficiency with real-time session revocation for account security.
- **Event-Driven Write-Through Cache Invalidation**: Guarantees placement officers and students see consistent drive states without stale reads.
- **Docker Environment Parity**: Guarantees identical execution across local development (Windows) and production servers (AWS EC2 Linux) via multi-stage containerization.

---

## 1.6 Recommended Target Architecture

```
[ Vercel / Next.js ] ──▶ [ AWS EC2: Nginx Reverse Proxy ]
                                    │
                                    ├──▶ [ Docker Container: Express API ]
                                    │           │
                                    │           ├──▶ [ Docker Container: Redis 7 ]
                                    │           │
                                    │           └──▶ [ Cloud DB: Neon PostgreSQL ]
```

---

# Part 2: Chronological Session Execution Logs

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
5. Ranked Redis use-cases (OTP cache, Placement Drive cache, JWT blacklist, Gemini AI rate limiting, Analytics cache, Profile cache).

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
> *"Now implement ONLY docker-compose.yml. Do NOT implement Redis logic inside application yet. Do NOT modify backend source code, frontend, Prisma, or deployment. Include ONLY uninest-backend and redis (redis:7-alpine). Ensure backend and Redis communicate through Docker networking. After creating docker-compose.yml, STOP."*

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

## Session 7 — History Consolidation & Continuous Logging Rule

### 💬 User Instruction
> *"it is not everything we did starting to ending. i want you to add everything we did till now and update it each time we chat and implement new features in this project. i also want you to add what instruction i gave you and how yo performed it and response you give me to this chat also everything. and continue to update it as we move forward."*

### ⚙️ Actions Performed by AI
1. Consolidated all previous sessions into a comprehensive, single-source-of-truth document (`md_files/docker.md`).
2. Documented exact user instructions, AI actions, error diagnostics, fixes, code blocks, and responses for every phase.
3. Established a mandatory rule to append new session logs to `md_files/docker.md` as future features are implemented.
4. Committed and pushed updated `md_files/docker.md` to GitHub.

---

## Session 8 — Phase 3.5: Infrastructure Verification Test Plan

### 💬 User Instruction
> *"Phase 3.5 — Docker Compose Verification. The docker-compose.yml has been created. Now do NOT modify any application code. Your task is only to verify the Docker Compose infrastructure. Show me the exact commands to: stop my existing backend container, remove it, build using Compose, start all services, verify backend & Redis health, inspect network & volume, verify backend DNS resolution & TCP reachability to Redis. Explain every command and expected output. Do NOT implement Redis in Express yet. Wait for my approval."*

### ⚙️ Actions Performed by AI
1. Formulated a 10-step CLI infrastructure testing guide:
   - Container Teardown: `docker stop uninest-backend-app && docker rm uninest-backend-app`
   - Compose Build & Launch: `docker compose build && docker compose up -d`
   - Health Checks: `docker compose ps`, `docker exec -it uninest-redis redis-cli ping`, `curl http://localhost:8000/api/v1/health`
   - Network & Volume Inspection: `docker network inspect`, `docker volume inspect`
   - Inter-Container DNS & Socket Probing: `getent hosts uninest-redis`, `nc -zv uninest-redis 6379`
2. Verified no application code was touched.
3. Updated `md_files/docker.md` with Session 8 log and pushed to GitHub repository.

---

## Session 9 — Master Documentation Structuring

### 💬 User Instruction
> *"first fix docker.md file with more data i have puted where they belong in order"*

### ⚙️ Actions Performed by AI
1. Consolidated the entire system architecture, tech stack evaluation, Docker/Redis strategy, and all 9 chronological session logs into a clean, structured master document (`md_files/docker.md`).
2. Eliminated duplicates and aligned all sections under 3 master parts: Architecture Strategy, Chronological Session Execution Logs, and Technical Artifact References.
3. Pushed updated master document to GitHub (`origin/main`).

---

## Session 10 — Phase 4: Redis Infrastructure Integration & Terminal Log Evidence

### 💬 User Instruction
> *"these are process we done in terminal add these in docker also: docker compose build, docker compose up -d (image redis:7-alpine pulled, network created, volume created, containers healthy), docker compose ps (uninest-backend healthy on 8000, uninest-redis healthy on 6379), curl.exe http://localhost:8000/api/v1/health (Backend is running), docker exec -it uninest-redis redis-cli ping (PONG). And implement ONLY Redis infrastructure inside the backend (install ioredis, create redis.ts config module, singleton client, automatic reconnect strategy, graceful shutdown, export initRedis & closeRedis, hooks in server.ts). Do NOT implement caching yet."*

### 🧪 Terminal Execution Evidence (User Provided)
```powershell
PS> docker compose build
# ... Layer caching verified, Dockerfile build succeeded

PS> docker compose up -d
 ✔ Image redis:7-alpine                    Pulled                                                           9.1s
 ✔ Network uninest-ai-main_uninest-network Created                                                          0.1s
 ✔ Volume uninest-ai-main_redis-data       Created                                                          0.0s
 ✔ Container uninest-redis                 Healthy                                                          6.2s
 ✔ Container uninest-backend               Started                                                          6.2s

PS> docker compose ps
NAME              IMAGE                             COMMAND                  SERVICE           CREATED         STATUS                   PORTS
uninest-backend   uninest-ai-main-uninest-backend   "docker-entrypoint.s…"   uninest-backend   2 minutes ago   Up 2 minutes (healthy)   0.0.0.0:8000->8000/tcp, [::]:8000->8000/tcp
uninest-redis     redis:7-alpine                    "docker-entrypoint.s…"   redis             2 minutes ago   Up 2 minutes (healthy)   0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp

PS> curl.exe http://localhost:8000/api/v1/health
{"success":true,"message":"Backend is running ✅"}

PS> docker exec -it uninest-redis redis-cli ping
PONG
```

### ⚙️ Actions Performed by AI
1. Added `ioredis` (^5.4.1) & `@types/ioredis` to `backend/package.json`.
2. Created reusable Redis infrastructure module `backend/src/config/redis.ts`:
   - Singleton pattern using global instance caching.
   - Configured connection using `process.env.REDIS_HOST` (default `uninest-redis`) and `process.env.REDIS_PORT` (default `6379`).
   - Exponential backoff retry strategy (`retryStrategy` capping at 3000ms).
   - Event listeners for `connect`, `ready`, `error`, `reconnecting`, `end`.
   - Exported `initRedis()` startup ping handler and `closeRedis()` graceful shutdown handler.
3. Updated `backend/src/server.ts` to initialize Redis on server startup and handle `SIGINT` / `SIGTERM` graceful shutdown signals.
4. Cleaned up obsolete `version: '3.8'` line from `docker-compose.yml` per Docker Compose v2 standards.

---

# Part 3: Complete Technical Reference & Artifacts

## 3.1 Multi-Stage Dockerfile (`backend/Dockerfile`)

```dockerfile
# ==============================================================================
# STAGE 1: Builder (Compiles TypeScript & Generates Prisma Client)
# ==============================================================================
FROM node:20-alpine AS builder

# Install OpenSSL & libc compatibility package required by Prisma Query Engine on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Set working directory inside the container
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma Client and compile TypeScript to JavaScript (outDir: ./dist)
RUN npm run build

# Prune devDependencies to keep production node_modules lightweight
RUN npm prune --production

# ==============================================================================
# STAGE 2: Runner (Lightweight Production Runtime)
# ==============================================================================
FROM node:20-alpine AS runner

# Install OpenSSL & libc6-compat runtime shared libraries required by Prisma binary at runtime
RUN apk add --no-cache openssl libc6-compat

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000

# Set working directory
WORKDIR /app

# Copy package.json for runtime scripts/metadata
COPY package*.json ./

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Copy production node_modules (includes generated Prisma Client) from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema (required at runtime for Prisma Client query engine)
COPY --from=builder /app/prisma ./prisma

# Use non-root node user for container security
USER node

# Expose backend API port
EXPOSE 8000

# Command to start the compiled Express backend
CMD ["node", "dist/server.js"]
```

---

## 3.2 Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  # ============================================================================
  # 1. Redis Cache Service (In-Memory Data Store)
  # ============================================================================
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

  # ============================================================================
  # 2. UniNest Express + TypeScript Backend API Service
  # ============================================================================
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

# ==============================================================================
# Persistent Volumes Definition
# ==============================================================================
volumes:
  redis-data:
    driver: local

# ==============================================================================
# Isolated Internal Docker Network Definition
# ==============================================================================
networks:
  uninest-network:
    driver: bridge
```

---

## 3.3 Infrastructure Verification & Operations Commands

| Operational Goal | Exact CLI Command |
| :--- | :--- |
| **Stop manual container** | `docker stop uninest-backend-app && docker rm uninest-backend-app` |
| **Build images via Compose** | `docker compose build` |
| **Start stack in background** | `docker compose up -d` |
| **Rebuild & start stack** | `docker compose up --build -d` |
| **Check service health status**| `docker compose ps` |
| **Ping Redis health** | `docker exec -it uninest-redis redis-cli ping` |
| **Ping Backend API health** | `curl http://localhost:8000/api/v1/health` |
| **Inspect Docker Network** | `docker network inspect $(docker network ls -q -f name=uninest-network)` |
| **Inspect Redis Volume** | `docker volume inspect $(docker volume ls -q -f name=redis-data)` |
| **Verify Container DNS Lookup** | `docker exec -it uninest-backend getent hosts uninest-redis` |
| **Verify Redis Socket Probe** | `docker exec -it uninest-backend nc -zv uninest-redis 6379` |
| **View live unified logs** | `docker compose logs -f` |
| **Restart backend service** | `docker compose restart uninest-backend` |
| **Stop & remove stack** | `docker compose down -v` |

---

*This master document is active and will be continuously updated as new features, Redis caching modules, or architecture updates are implemented in UniNest AI.*
