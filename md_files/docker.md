# 🐳 UniNest AI — Complete Docker & Containerization Guide

> **Project**: UniNest AI - Campus Recruitment Portal  
> **Documentation Target**: Docker setup, multi-stage build, OpenSSL fix, and Docker Compose orchestration.

---

## 📌 Table of Contents
1. [Overview & Architecture Strategy](#1-overview--architecture-strategy)
2. [Phase 1: Multi-Stage Backend Dockerfile](#2-phase-1-multi-stage-backend-dockerfile)
3. [Phase 2: Troubleshooting — Prisma OpenSSL Alpine Bug](#3-phase-2-troubleshooting--prisma-openssl-alpine-bug)
4. [Phase 3: Docker Compose Implementation](#4-phase-3-docker-compose-implementation)
5. [Docker Concepts & Deep Technical Explanations](#5-docker-concepts--deep-technical-explanations)
6. [Commands Reference Guide](#6-commands-reference-guide)

---

## 1. Overview & Architecture Strategy

### Containerization Rules:
- **Backend (Express + TypeScript)**: Containerized into an optimized, multi-stage Docker image.
- **Cache (Redis 7)**: Containerized using official `redis:7-alpine` image with volume persistence.
- **Database (PostgreSQL)**: Maintained as an external cloud service (Neon DB / AWS RDS) for production reliability and automated backups.

```
                           LOCAL / EC2 DOCKER ECOSYSTEM
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐  │
│  │   uninest-frontend    │   │    uninest-backend    │   │      uninest-redis       │  │
│  │   Next.js (Port 3000) │──▶│   Express (Port 8000) │──▶│  Redis v7 (Port 6379)    │  │
│  └───────────────────────┘   └───────────┬───────────┘   └──────────────────────────┘  │
│                                          │                                             │
│                                          │ (PostgreSQL Connection over TLS)            │
│                                          ▼                                             │
│                              ┌───────────────────────┐                                 │
│                              │   Neon DB / AWS RDS   │ (External Managed Database)     │
│                              └───────────────────────┘                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Multi-Stage Backend Dockerfile

### Created File: `backend/Dockerfile`

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

## 3. Phase 2: Troubleshooting — Prisma OpenSSL Alpine Bug

### ❌ The Error Encountered
During initial execution, the Docker container built successfully but **exited immediately at runtime** with the following error log:

```text
PrismaClientInitializationError: Unable to require(`.../libquery_engine-linux-musl.so.node`).
Error: libssl.so.1.1: cannot open shared object file: No such file or directory
```

### 🔍 Root Cause Analysis
1. **Alpine C-Library (`musl`)**: Alpine Linux uses lightweight `musl` libc instead of standard GNU `glibc`.
2. **Prisma Native Engine**: Prisma ORM executes a native compiled Rust query engine under the hood to perform PostgreSQL queries.
3. **Missing Shared Libraries**: Prisma's native engine dynamically binds to system OpenSSL shared libraries (`libssl.so`). The default `node:20-alpine` image omits non-essential OS libraries. Without `openssl` and `libc6-compat`, Prisma Client cannot bind to network sockets at runtime and crashes instantly.

### ✅ How We Solved It
We added the OS-level installation step to **both builder and runner stages** in `backend/Dockerfile`:

```dockerfile
RUN apk add --no-cache openssl libc6-compat
```

- **Builder Stage**: Allows `prisma generate` to detect Alpine's environment and compile the `linux-musl-openssl-3.0.x` native binary.
- **Runner Stage**: Equips the final production runtime container with runtime dynamic libraries (`libssl.so`), preventing `PrismaClientInitializationError`.

---

## 4. Phase 3: Docker Compose Implementation

### Created File: `docker-compose.yml` (Workspace Root)

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

## 5. Docker Concepts & Deep Technical Explanations

### A. Why Use Docker Compose Over `docker run`?
- **Declarative Stack**: Saves container definitions in `docker-compose.yml` instead of typing 10+ command-line flags per container.
- **Service Discovery**: Docker Compose automatically configures an internal DNS server. The backend discovers Redis using host name `uninest-redis` instead of dynamic IP addresses.
- **Health-Aware Dependency**: `depends_on` with `condition: service_healthy` delays launching `uninest-backend` until `redis` responds with `PONG` to its health check.

### B. Core Docker Definitions
- **Image**: Immutable read-only template containing application code, libraries, and runtime binaries. *(Analogy: A Class)*.
- **Container**: A running, isolated instance of an Image. *(Analogy: An Object)*.
- **Service**: Configuration of a container inside Docker Compose (ports, volumes, network links, restart policy).
- **Volume**: Host-managed persistent directory (`redis-data:/data`) allowing cached data to survive container teardowns.

---

## 6. Commands Reference Guide

| Goal | Command |
| :--- | :--- |
| **Build backend image manually** | `docker build -t uninest-backend:latest ./backend` |
| **Run backend container manually** | `docker run -d --name uninest-backend-app -p 8000:8000 --env-file ./backend/.env uninest-backend:latest` |
| **Start full stack with Docker Compose** | `docker compose up -d` |
| **Rebuild containers with code changes** | `docker compose up --build -d` |
| **View live logs of all services** | `docker compose logs -f` |
| **View backend logs only** | `docker compose logs -f uninest-backend` |
| **Check running container status & health** | `docker compose ps` |
| **Restart backend service only** | `docker compose restart uninest-backend` |
| **Restart Redis service only** | `docker compose restart redis` |
| **Stop all services** | `docker compose stop` |
| **Tear down containers, networks, & volumes** | `docker compose down -v` |
| **Verify API Health Check** | `curl http://localhost:8000/api/v1/health` |
