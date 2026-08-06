import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import companyRoutes from "./routes/companyRoutes";
import driveRoutes from "./routes/driveRoutes";
import driveApplicationRoutes from "./routes/driveApplicationRoutes";
import resumeRoutes from "./routes/resumeRoutes";
import offerRoutes from "./routes/offerRoutes";
import universityRoutes from "./routes/universityRoutes";
import adminRoutes from "./routes/adminRoutes";

import { initRedis, closeRedis } from "./config/redis";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();

// Allowed origins — local dev + Vercel previews + custom domain
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,             // override via .env if needed
  "https://uninest-mu.vercel.app",      // old Vercel URL (keep for safety)
  "https://uninest.chiragvasava.me",    // ← new custom domain (frontend)
  "https://chiragvasava.me",            // ← root domain
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const allowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||        // Vercel preview deployments
      origin.endsWith(".chiragvasava.me");     // any subdomain of your domain

    if (allowed) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check endpoint
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Backend is running ✅" });
});

// Auth routes
app.use("/api/v1/auth", authRoutes);

// Student routes
app.use("/api/v1/students", studentRoutes);

// Company routes
app.use("/api/v1/companies", companyRoutes);

// Drive routes
app.use("/api/v1/drives", driveRoutes);

// Drive Application routes
app.use("/api/v1/applications", driveApplicationRoutes);

// Resume routes
app.use("/api/v1/resumes", resumeRoutes);

// Offer routes
app.use("/api/v1/offers", offerRoutes);

// University routes
app.use("/api/v1/universities", universityRoutes);

// Admin routes
app.use("/api/v1/admin", adminRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}/api/v1`);
  // Initialize Redis Infrastructure Connection
  await initRedis();
});

// Graceful Shutdown Handlers
const handleShutdown = async (signal: string) => {
  console.log(`\n[Server] ${signal} received. Initiating graceful shutdown...`);
  server.close(async () => {
    console.log("[Server] Express HTTP server closed.");
    await closeRedis();
    process.exit(0);
  });
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

