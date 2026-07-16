import * as resumeRepository from "../repositories/resumeRepository";
import * as studentRepository from "../repositories/studentRepository";
import { AppError } from "../middleware/errorHandler";
import fs from "fs";
import path from "path";

const getLocalUploadAbsolutePath = (filePath: string): string | null => {
  if (!filePath) return null;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return null;
  }

  const normalized = filePath.replace(/\\/g, "/");

  if (normalized.startsWith("/uploads/") || normalized.startsWith("uploads/")) {
    const relativePath = normalized.startsWith("/")
      ? normalized.slice(1)
      : normalized;
    return path.join(process.cwd(), relativePath);
  }

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return null;
};

const deleteLocalFileIfExists = async (filePath: string): Promise<void> => {
  const absolutePath = getLocalUploadAbsolutePath(filePath);
  if (!absolutePath) return;

  try {
    await fs.promises.unlink(absolutePath);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
};

/**
 * Upload resume (Student only)
 */
export const uploadResume = async (
  userId: string,
  payload: {
    fileName: string;
    filePath: string;
    fileSize: number;
    extractedText?: string;
  }
) => {
  // Validate student exists
  const student = await studentRepository.getStudentByUserId(userId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  // Validate file name
  if (!payload.fileName || payload.fileName.trim().length === 0) {
    throw new AppError(400, "File name is required");
  }

  // Validate file path
  if (!payload.filePath || payload.filePath.trim().length === 0) {
    throw new AppError(400, "File path is required");
  }

  // Validate file size
  if (payload.fileSize <= 0) {
    throw new AppError(400, "Invalid file size");
  }

  // Validate file size limit (5MB max)
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  if (payload.fileSize > maxSizeBytes) {
    throw new AppError(400, `File size exceeds maximum limit of 5MB`);
  }

  // Validate file extension (PDF only)
  const fileName = payload.fileName.toLowerCase();
  if (!fileName.endsWith(".pdf")) {
    throw new AppError(400, "Only PDF files are allowed");
  }

  const resume = await resumeRepository.createResume({
    studentId: student.id,
    fileName: payload.fileName,
    filePath: payload.filePath,
    fileSize: payload.fileSize,
    extractedText: payload.extractedText,
  });

  return {
    id: resume.id,
    fileName: resume.fileName,
    filePath: resume.filePath,
    fileSize: resume.fileSize,
    isVerified: resume.isVerified,
    createdAt: resume.createdAt,
    message: "Resume uploaded successfully",
  };
};

/**
 * Get resume by ID
 */
export const getResumeById = async (resumeId: string) => {
  const resume = await resumeRepository.getResumeById(resumeId);
  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  return {
    id: resume.id,
    fileName: resume.fileName,
    filePath: resume.filePath,
    fileSize: resume.fileSize,
    extractedText: resume.extractedText,
    isVerified: resume.isVerified,
    verifyComment: resume.verifyComment,
    student: {
      id: (resume as any).student?.id,
      name: `${(resume as any).student?.firstName} ${(resume as any).student?.lastName}`,
      rollNumber: (resume as any).student?.rollNumber,
    },
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
    verifiedAt: resume.verifiedAt,
  };
};

/**
 * Get my resumes (Student only)
 */
export const getMyResumes = async (
  userId: string,
  filters?: { limit?: number; offset?: number }
) => {
  const student = await studentRepository.getStudentByUserId(userId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const resumes = await resumeRepository.getStudentResumes(student.id, filters);

  return {
    count: resumes.length,
    resumes: resumes.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      fileSize: r.fileSize,
      isVerified: r.isVerified,
      verifyComment: r.verifyComment,
      createdAt: r.createdAt,
      verifiedAt: r.verifiedAt,
    })),
  };
};

/**
 * Get all resumes (Admin/verification)
 */
export const getAllResumes = async (filters?: {
  limit?: number;
  offset?: number;
  isVerified?: boolean;
}) => {
  const result = await resumeRepository.getAllResumes(filters);

  return {
    total: result.count,
    resumes: result.resumes.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      fileSize: r.fileSize,
      isVerified: r.isVerified,
      verifyComment: r.verifyComment,
      student: {
        id: (r as any).student?.id,
        name: `${(r as any).student?.firstName} ${(r as any).student?.lastName}`,
        rollNumber: (r as any).student?.rollNumber,
      },
      createdAt: r.createdAt,
      verifiedAt: r.verifiedAt,
    })),
  };
};

/**
 * Update resume (Student only - re-upload)
 */
export const updateResume = async (
  resumeId: string,
  userId: string,
  payload: {
    fileName: string;
    filePath: string;
    fileSize: number;
    extractedText?: string;
  }
) => {
  const student = await studentRepository.getStudentByUserId(userId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  // Validate resume exists and belongs to student
  const resume = await resumeRepository.getResumeById(resumeId);
  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  if (resume.studentId !== student.id) {
    throw new AppError(403, "You can only update your own resumes");
  }

  // Validate file size
  if (payload.fileSize <= 0) {
    throw new AppError(400, "Invalid file size");
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  if (payload.fileSize > maxSizeBytes) {
    throw new AppError(400, "File size exceeds maximum limit of 5MB");
  }

  // Validate file extension
  const fileName = payload.fileName.toLowerCase();
  if (!fileName.endsWith(".pdf")) {
    throw new AppError(400, "Only PDF files are allowed");
  }

  const updatedResume = await resumeRepository.updateResume(resumeId, {
    fileName: payload.fileName,
    filePath: payload.filePath,
    fileSize: payload.fileSize,
    extractedText: payload.extractedText,
  });

  if (resume.filePath !== updatedResume.filePath) {
    await deleteLocalFileIfExists(resume.filePath);
  }

  return {
    id: updatedResume.id,
    fileName: updatedResume.fileName,
    fileSize: updatedResume.fileSize,
    message: "Resume updated successfully",
  };
};

/**
 * Delete resume (Student only)
 */
export const deleteResume = async (resumeId: string, userId: string) => {
  const student = await studentRepository.getStudentByUserId(userId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const resume = await resumeRepository.getResumeById(resumeId);
  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  if (resume.studentId !== student.id) {
    throw new AppError(403, "You can only delete your own resumes");
  }

  await resumeRepository.deleteResume(resumeId);
  await deleteLocalFileIfExists(resume.filePath);

  return {
    message: "Resume deleted successfully",
  };
};

/**
 * Verify resume (Admin only)
 */
export const verifyResumeByAdmin = async (resumeId: string, verifyComment?: string) => {
  const resume = await resumeRepository.getResumeById(resumeId);
  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  if (resume.isVerified) {
    throw new AppError(400, "This resume is already verified");
  }

  const verifiedResume = await resumeRepository.verifyResume(resumeId, verifyComment);

  return {
    id: verifiedResume.id,
    studentName: `${(verifiedResume as any).student?.firstName} ${(verifiedResume as any).student?.lastName}`,
    isVerified: true,
    message: "Resume verified successfully",
  };
};

/**
 * Reject resume (Admin only)
 */
export const rejectResumeByAdmin = async (resumeId: string, verifyComment?: string) => {
  const resume = await resumeRepository.getResumeById(resumeId);
  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  if (!verifyComment || verifyComment.trim().length === 0) {
    throw new AppError(400, "Rejection reason is required");
  }

  const rejectedResume = await resumeRepository.rejectResume(resumeId, verifyComment);

  return {
    id: rejectedResume.id,
    studentName: `${(rejectedResume as any).student?.firstName} ${(rejectedResume as any).student?.lastName}`,
    isVerified: false,
    rejectionReason: rejectedResume.verifyComment,
    message: "Resume rejected successfully",
  };
};

/**
 * Get resume statistics
 */
export const getResumeStatistics = async () => {
  const stats = await resumeRepository.getResumeStatistics();

  return {
    totalResumes: stats.totalResumes,
    verifiedResumes: stats.verifiedResumes,
    pendingResumes: stats.pendingResumes,
    totalFileSize: `${(stats.totalFileSize / 1024 / 1024).toFixed(2)} MB`,
    verificationRate: stats.verificationRate,
  };
};

/**
 * Get pending resumes for verification
 */
export const getPendingResumes = async (filters?: {
  limit?: number;
  offset?: number;
}) => {
  const resumes = await resumeRepository.getResumesByVerificationStatus(false, filters);

  return {
    count: resumes.length,
    resumes: resumes.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      fileSize: r.fileSize,
      student: {
        rollNumber: (r as any).student?.rollNumber,
        name: `${(r as any).student?.firstName} ${(r as any).student?.lastName}`,
      },
      createdAt: r.createdAt,
    })),
  };
};

/**
 * Check if student has verified resume
 */
export const checkVerifiedResume = async (userId: string): Promise<boolean> => {
  const student = await studentRepository.getStudentByUserId(userId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  return await resumeRepository.hasVerifiedResume(student.id);
};
