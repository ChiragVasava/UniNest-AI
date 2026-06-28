import { Request, Response, NextFunction } from "express";
import * as driveApplicationService from "../services/driveApplicationService";
import { AppError } from "../middleware/errorHandler";
import { ApplicationStage } from "@prisma/client";

/**
 * Apply for a drive (Student only)
 */
export const applyForDrive = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const { driveId } = req.body;

    if (!driveId) {
      throw new AppError(400, "Drive ID is required");
    }

    const application = await driveApplicationService.applyForDrive(studentId, driveId);

    _res.status(201).json({
      status: "success",
      statusCode: 201,
      message: application.message,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get application by ID
 */
export const getApplicationById = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const application = await driveApplicationService.getApplicationById(id);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my applications (Student only)
 */
export const getMyApplications = async (
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

    const applications = await driveApplicationService.getMyApplications(studentId, {
      limit,
      offset,
    });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get applications for a drive (Company only)
 */
export const getApplicationsForDrive = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { driveId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;
    const status = req.query.status as string | undefined;

    const applications = await driveApplicationService.getApplicationsForDrive(
      driveId,
      userId,
      { limit, offset, status }
    );

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get applications for a drive with ATS analysis
 */
export const getApplicationsForDriveWithAts = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { driveId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;
    const status = req.query.status as string | undefined;

    const applications = await driveApplicationService.getApplicationsForDriveWithAts(
      driveId,
      userId,
      { limit, offset, status }
    );

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status (Company only)
 */
export const updateApplicationStatus = async (
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

    const { status, rejectionReason } = req.body;

    if (!status) {
      throw new AppError(400, "Status is required");
    }

    const application = await driveApplicationService.updateApplicationStatus(
      id,
      userId,
      status,
      rejectionReason
    );

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: application.message,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw application (Student only)
 */
export const withdrawApplication = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const result = await driveApplicationService.withdrawApplication(id, studentId);

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
 * Get application statistics
 */
export const getApplicationStatistics = async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const stats = await driveApplicationService.getApplicationStatistics();

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get shortlisted students (Company only)
 */
export const getShortlistedStudents = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { driveId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const students = await driveApplicationService.getShortlistedStudentsForDrive(
      driveId,
      userId
    );

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

export const createInterviewSlot = async (
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

    const interview = await driveApplicationService.createInterviewSlot(id, userId, req.body || {});

    _res.status(201).json({
      status: "success",
      statusCode: 201,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterviewSlot = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { interviewId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const interview = await driveApplicationService.updateInterviewSlot(
      interviewId,
      userId,
      req.body || {}
    );

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmInterviewSlot = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { interviewId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const interview = await driveApplicationService.confirmInterviewSlot(interviewId, userId);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const requestInterviewReschedule = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { interviewId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const interview = await driveApplicationService.requestInterviewReschedule(
      interviewId,
      userId,
      req.body?.note
    );

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const getTimeline = async (
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

    const timeline = await driveApplicationService.getApplicationTimeline(id, userId);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

export const moveStage = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const stage = (req.body?.stage || "").toUpperCase() as ApplicationStage;
    const note = req.body?.note as string | undefined;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    if (!stage) {
      throw new AppError(400, "stage is required");
    }

    const result = await driveApplicationService.moveApplicationStage(id, userId, stage, note);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
