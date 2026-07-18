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

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();

// Allowed origins — local dev + all Vercel deployments
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  "https://uninest-mu.vercel.app",
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
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

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}/api/v1`);
});
