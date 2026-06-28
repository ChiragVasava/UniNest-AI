import { Request, Response, NextFunction } from "express";
import * as studentService from "../services/studentService";
import { AppError } from "../middleware/errorHandler";

/**
 * Student Controller - Handles HTTP requests for student endpoints
 * Calls service layer for business logic
 */

/**
 * POST /api/v1/students
 * Create new student profile
 */
export const createStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId; // From authMiddleware

    if (!userId) {
      throw new AppError(401, "User ID not found. Please log in.");
    }

    const {
      firstName,
      lastName,
      rollNumber,
      phone,
      department,
      batch,
      cgpa,
      college,
    } = req.body;

    const student = await studentService.createStudentProfile(userId, {
      firstName,
      lastName,
      rollNumber,
      phone,
      department,
      batch,
      cgpa,
      college,
    });

    res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/students/:id
 * Get student profile by ID
 */
export const getStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "Student ID is required");
    }

    const student = await studentService.getStudentProfile(id);

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/students/me/profile
 * Get current user's student profile
 */
export const getMyStudentProfile = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (_req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found");
    }

    // Get student by user ID
    const student = await studentService.getStudentProfileByUserId(userId);

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/students/:id
 * Update student profile
 */
export const updateStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "Student ID is required");
    }

    const updatedStudent = await studentService.updateStudentProfile(id, req.body);

    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/students
 * Get all students with optional filters
 */
export const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { department, batch, cgpaMin, cgpaMax, isVerified, limit, offset } =
      req.query;

    const filters = {
      department: department as string | undefined,
      batch: batch ? parseInt(batch as string) : undefined,
      cgpaMin: cgpaMin ? parseFloat(cgpaMin as string) : undefined,
      cgpaMax: cgpaMax ? parseFloat(cgpaMax as string) : undefined,
      isVerified: isVerified === "true" ? true : undefined,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) =>
      filters[key as keyof typeof filters] === undefined &&
      delete filters[key as keyof typeof filters]
    );

    const result = await studentService.getAllStudents(filters);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/students/:id
 * Delete student profile
 */
export const deleteStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "Student ID is required");
    }

    const result = await studentService.deleteStudentProfile(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/students/statistics
 * Get student statistics by department
 */
export const getStudentStatistics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await studentService.getStudentStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/students/eligible/:department
 * Get eligible students for a specific drive
 */
export const getEligibleStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { department } = req.params;
    const { cgpaMin } = req.query;

    if (!department) {
      throw new AppError(400, "Department is required");
    }

    if (!cgpaMin) {
      throw new AppError(400, "Minimum CGPA is required in query");
    }

    const result = await studentService.getEligibleStudentsForDrive(
      department,
      parseFloat(cgpaMin as string)
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
