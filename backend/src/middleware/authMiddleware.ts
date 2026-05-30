import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { verifyToken } from "../utils/jwt";
import { UserPayload } from "../types";

/**
 * Middleware to verify JWT token
 * Usage: app.use("/api/v1/protected", authMiddleware);
 */
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new AppError(401, "Invalid or expired token");
    }

    // Attach user ID to request
    (req as any).userId = decoded.id;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Authentication failed");
  }
};

/**
 * Middleware to check user role
 * Usage: app.use("/api/v1/admin", authMiddleware, roleMiddleware("ADMIN"));
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user as UserPayload;

    if (!user || !allowedRoles.includes(user.role)) {
      throw new AppError(403, "You don't have permission to access this resource");
    }

    next();
  };
};
