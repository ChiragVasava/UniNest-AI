import { Request, Response, NextFunction } from "express";
import * as resumeService from "../services/resumeService";
import { AppError } from "../middleware/errorHandler";

/**
 * Upload resume (Student only)
 */
export const uploadResume = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const uploadedFile = req.file;
    const extractedText = req.body?.extractedText;

    const fileName = uploadedFile?.originalname || req.body?.fileName;
    const filePath = uploadedFile
      ? `/uploads/resumes/${uploadedFile.filename}`
      : req.body?.filePath;
    const fileSize = uploadedFile?.size || req.body?.fileSize;

    const missing: string[] = [];
    if (!fileName) missing.push('fileName');
    if (!filePath) missing.push('filePath');
    if (!fileSize) missing.push('fileSize');

    if (missing.length > 0) {
      throw new AppError(400, `Missing required resume fields: ${missing.join(', ')}`);
    }

    const resume = await resumeService.uploadResume(studentId, {
      fileName,
      filePath,
      fileSize,
      extractedText,
    });

    _res.status(201).json({
      status: "success",
      statusCode: 201,
      message: resume.message,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get resume by ID
 */
export const getResumeById = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const resume = await resumeService.getResumeById(id);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my resumes (Student only)
 */
export const getMyResumes = async (
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

    const resumes = await resumeService.getMyResumes(studentId, { limit, offset });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all resumes (Admin/verification)
 */
export const getAllResumes = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;
    const isVerified = req.query.isVerified
      ? req.query.isVerified === "true"
      : undefined;

    const resumes = await resumeService.getAllResumes({
      limit,
      offset,
      isVerified,
    });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update resume (Student only)
 */
export const updateResume = async (
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

    const uploadedFile = req.file;
    const extractedText = req.body?.extractedText;

    const fileName = uploadedFile?.originalname || req.body?.fileName;
    const filePath = uploadedFile
      ? `/uploads/resumes/${uploadedFile.filename}`
      : req.body?.filePath;
    const fileSize = uploadedFile?.size || req.body?.fileSize;

    const missingUpdate: string[] = [];
    if (!fileName) missingUpdate.push('fileName');
    if (!filePath) missingUpdate.push('filePath');
    if (!fileSize) missingUpdate.push('fileSize');

    if (missingUpdate.length > 0) {
      throw new AppError(400, `Missing required resume fields for update: ${missingUpdate.join(', ')}`);
    }

    const resume = await resumeService.updateResume(id, studentId, {
      fileName,
      filePath,
      fileSize,
      extractedText,
    });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: resume.message,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete resume (Student only)
 */
export const deleteResume = async (
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

    const result = await resumeService.deleteResume(id, studentId);

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
 * Verify resume (Admin only)
 */
export const verifyResume = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { verifyComment } = req.body;

    const resume = await resumeService.verifyResumeByAdmin(id, verifyComment);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: resume.message,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject resume (Admin only)
 */
export const rejectResume = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { verifyComment } = req.body;

    const resume = await resumeService.rejectResumeByAdmin(id, verifyComment);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: resume.message,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/resumes/:id/match
 * Basic AI-match endpoint (keyword-based)
 * Body: { keywords?: string[] }
 */
export const matchResume = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const keywords = Array.isArray(req.body?.keywords) ? req.body.keywords : req.body?.keywords ? [req.body.keywords] : undefined;

    const matchService = await import('../services/matchService');
    const result = await matchService.matchResumeByKeywords(id, keywords);

    _res.status(200).json({ status: 'success', statusCode: 200, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Get resume statistics
 */
export const getResumeStatistics = async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const stats = await resumeService.getResumeStatistics();

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
 * Get pending resumes for verification
 */
export const getPendingResumes = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    const resumes = await resumeService.getPendingResumes({ limit, offset });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if student has verified resume
 */
export const checkVerifiedResume = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const hasVerified = await resumeService.checkVerifiedResume(studentId);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: {
        hasVerifiedResume: hasVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};
