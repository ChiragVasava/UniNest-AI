import { Router } from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

/**
 * Auth Routes
 * POST /api/v1/auth/register - Register new user
 * POST /api/v1/auth/login - Login user
 * GET /api/v1/auth/me - Get current user (protected)
 */

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/me", authMiddleware, authController.getMe);
router.post("/send-otp", authMiddleware, authController.sendOtp);
router.post("/verify-otp", authMiddleware, authController.verifyOtp);

export default router;
