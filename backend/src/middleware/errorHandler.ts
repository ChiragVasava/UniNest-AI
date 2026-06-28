import { Request, Response, NextFunction } from "express";

// Define custom error type
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Global Error Handler Middleware
 * Catches all errors and returns formatted response
 *
 * Usage: app.use(errorHandler) at the end of middleware stack
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("❌ Error:", err);

  // Default error response
  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Prisma errors
  else if (err.name === "PrismaClientKnownRequestError") {
    statusCode = 400;
    message = "Database error";
  }
  // Handle validation errors
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
