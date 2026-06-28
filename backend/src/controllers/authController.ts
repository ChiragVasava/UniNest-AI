import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";
import { AppError } from "../middleware/errorHandler";
import { UserRole } from "@prisma/client";

/**
 * Auth Controller - Request handlers for auth endpoints
 * Handles: receiving requests, parsing input, calling service, sending response
 */

/**
 * POST /api/v1/auth/register
 * Register new user (Student, Company, or Admin)
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, confirmPassword, role } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword || !role) {
      throw new AppError(400, "All fields are required");
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      throw new AppError(400, "Invalid role");
    }

    // Call service
    const result = await authService.register({
      email,
      password,
      confirmPassword,
      role,
    });

    // Send response
    res.status(201).json({
      success: true,
      data: result,
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Login user and get JWT token
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError(400, "Email and password are required");
    }

    // Call service
    const result = await authService.login({ email, password });

    // Send response
    res.status(200).json({
      success: true,
      data: result,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Get current user from token
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.userId is set by authMiddleware
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const user = await authService.getUserFromToken(userId);

    res.status(200).json({
      success: true,
      data: { id: user.id, email: user.email, role: user.role },
      message: "User fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
