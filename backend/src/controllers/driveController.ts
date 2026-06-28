import { Request, Response, NextFunction } from "express";
import * as driveService from "../services/driveService";
import { AppError } from "../middleware/errorHandler";

/**
 * Create drive (Company only)
 */
export const createDrive = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const {
      title,
      description,
      jobDescription,
      salary,
      cgpaCutoff,
      eligibleDepartments,
      eligibleBatches,
      requiredSkills,
      interviewFormat,
    } = req.body;

    const drive = await driveService.createDrive(userId, {
      title,
      description,
      jobDescription,
      salary,
      cgpaCutoff,
      eligibleDepartments,
      eligibleBatches,
      requiredSkills,
      interviewFormat,
    });

    _res.status(201).json({
      status: "success",
      statusCode: 201,
      message: "Drive created successfully",
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get drive by ID
 */
export const getDriveById = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const drive = await driveService.getDriveById(id);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my company's drives (Protected)
 */
export const getMyCompanyDrives = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const drives = await driveService.getMyCompanyDrives(userId);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active drives
 */
export const getAllActiveDrives = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    const drives = await driveService.getAllActiveDrives({
      limit,
      offset,
    });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get eligible drives for student (Protected)
 */
export const getEligibleDrivesForStudent = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    const drives = await driveService.getEligibleDrivesForStudent(studentId, {
      limit,
      offset,
    });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update drive (Company only)
 */
export const updateDrive = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const payload = req.body;

    const drive = await driveService.updateDrive(id, userId, payload);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Drive updated successfully",
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete drive (Company only)
 */
export const deleteDrive = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const result = await driveService.deleteDrive(id, userId);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get drive statistics
 */
export const getDriveStatistics = async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const stats = await driveService.getDriveStatistics();

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
