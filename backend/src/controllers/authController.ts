import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";
import { AppError } from "../middleware/errorHandler";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/database";

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
    const { email, password, confirmPassword, role, universityName, universityCode } = req.body;

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
      universityName,
      universityCode,
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

/**
 * POST /api/v1/auth/send-otp
 * Generate and send email & SMS OTPs
 */
export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const { phone } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || user.role !== UserRole.STUDENT || !user.student) {
      throw new AppError(400, "Only student accounts require OTP verification");
    }

    // Save phone number if provided
    let targetPhone = user.student.phone;
    if (phone) {
      await prisma.student.update({
        where: { id: user.student.id },
        data: { phone },
      });
      targetPhone = phone;
    }

    if (!targetPhone) {
      throw new AppError(400, "Phone number is required to send verification OTP");
    }

    // Generate random 6-digit OTPs
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save or update OTPVerification record
    await prisma.oTPVerification.upsert({
      where: { userId },
      update: { emailOtp, phoneOtp, expiresAt, emailVerified: false, phoneVerified: false },
      create: { userId, emailOtp, phoneOtp, expiresAt },
    });

    // Import email and SMS helpers dynamically or statically
    const { sendEmail, sendSMS } = require("../utils/notification");

    // Send notifications
    await sendEmail(
      user.email,
      "UniNest Account Verification OTP",
      `Your email verification OTP is: ${emailOtp}. It is valid for 10 minutes.`
    );

    await sendSMS(
      targetPhone,
      `Your UniNest mobile verification OTP is: ${phoneOtp}. Valid for 10 mins.`
    );

    res.status(200).json({
      success: true,
      message: "Verification OTPs sent successfully to your email and phone",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/verify-otp
 * Verify the OTPs and activate the student account
 */
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const { emailOtp, phoneOtp } = req.body;
    if (!emailOtp || !phoneOtp) {
      throw new AppError(400, "Both email and phone OTPs are required");
    }

    const otpRecord = await prisma.oTPVerification.findUnique({
      where: { userId },
    });

    if (!otpRecord) {
      throw new AppError(400, "No pending OTP verification record found. Please request OTP first.");
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new AppError(400, "OTPs have expired. Please request new ones.");
    }

    if (otpRecord.emailOtp !== emailOtp || otpRecord.phoneOtp !== phoneOtp) {
      throw new AppError(400, "Invalid email or phone OTP. Please try again.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      throw new AppError(404, "Student profile not found");
    }

    // OTP matched! Mark student as verified
    await prisma.student.update({
      where: { id: user.student.id },
      data: {
        isProfileVerified: true,
        verificationStatus: "VERIFIED",
      },
    });

    // Delete the OTP record since it's verified
    await prisma.oTPVerification.delete({
      where: { userId },
    });

    const { sendEmail } = require("../utils/notification");
    // Send welcome mail
    await sendEmail(
      user.email,
      "Welcome to UniNest-AI!",
      `Congratulations! Your account is verified. You can now build your profile, JD matching, and apply to recruitment drives.`
    );

    res.status(200).json({
      success: true,
      message: "Account verified successfully! Onboarding email sent.",
    });
  } catch (error) {
    next(error);
  }
};
