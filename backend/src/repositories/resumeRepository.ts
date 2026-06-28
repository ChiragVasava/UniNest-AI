import { prisma } from "../config/database";
import { Resume } from "@prisma/client";

/**
 * Create resume (upload)
 */
export const createResume = async (data: {
  studentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  extractedText?: string;
}): Promise<Resume> => {
  return await prisma.resume.create({
    data: {
      studentId: data.studentId,
      fileName: data.fileName,
      filePath: data.filePath,
      fileSize: data.fileSize,
      extractedText: data.extractedText,
      isVerified: false,
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
        },
      },
    },
  });
};

/**
 * Get resume by ID
 */
export const getResumeById = async (resumeId: string): Promise<Resume | null> => {
  return await prisma.resume.findUnique({
    where: { id: resumeId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
        },
      },
    },
  });
};

/**
 * Get student's resumes
 */
export const getStudentResumes = async (
  studentId: string,
  filters?: { limit?: number; offset?: number }
): Promise<Resume[]> => {
  return await prisma.resume.findMany({
    where: { studentId },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get the latest resume for a student
 */
export const getLatestResumeByStudentId = async (
  studentId: string
): Promise<Resume | null> => {
  return await prisma.resume.findFirst({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get all resumes (for verification/admin)
 */
export const getAllResumes = async (filters?: {
  limit?: number;
  offset?: number;
  isVerified?: boolean;
}): Promise<{ count: number; resumes: Resume[] }> => {
  const where: any = {};
  if (filters?.isVerified !== undefined) {
    where.isVerified = filters.isVerified;
  }

  const resumes = await prisma.resume.findMany({
    where,
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
        },
      },
    },
  });

  return {
    count: await prisma.resume.count({ where }),
    resumes,
  };
};

/**
 * Update resume
 */
export const updateResume = async (
  resumeId: string,
  data: Partial<{
    fileName: string;
    filePath: string;
    fileSize: number;
    extractedText: string;
  }>
): Promise<Resume> => {
  return await prisma.resume.update({
    where: { id: resumeId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Delete resume
 */
export const deleteResume = async (resumeId: string): Promise<Resume> => {
  return await prisma.resume.delete({
    where: { id: resumeId },
  });
};

/**
 * Verify resume (Admin only)
 */
export const verifyResume = async (
  resumeId: string,
  verifyComment?: string
): Promise<Resume> => {
  return await prisma.resume.update({
    where: { id: resumeId },
    data: {
      isVerified: true,
      verifiedAt: new Date(),
      verifyComment: verifyComment || null,
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Reject resume (Admin only)
 */
export const rejectResume = async (
  resumeId: string,
  verifyComment?: string
): Promise<Resume> => {
  return await prisma.resume.update({
    where: { id: resumeId },
    data: {
      isVerified: false,
      verifyComment: verifyComment || "Rejected by admin",
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Check if student has any verified resume
 */
export const hasVerifiedResume = async (studentId: string): Promise<boolean> => {
  const resume = await prisma.resume.findFirst({
    where: {
      studentId,
      isVerified: true,
    },
    select: { id: true },
  });
  return !!resume;
};

/**
 * Get resume statistics
 */
export const getResumeStatistics = async () => {
  const totalResumes = await prisma.resume.count();
  const verifiedResumes = await prisma.resume.count({ where: { isVerified: true } });
  const pendingResumes = totalResumes - verifiedResumes;
  const totalFileSize = await prisma.resume.aggregate({
    _sum: {
      fileSize: true,
    },
  });

  return {
    totalResumes,
    verifiedResumes,
    pendingResumes,
    totalFileSize: totalFileSize._sum?.fileSize || 0,
    verificationRate:
      totalResumes > 0 ? ((verifiedResumes / totalResumes) * 100).toFixed(2) + "%" : "0%",
  };
};

/**
 * Get resumes by verification status
 */
export const getResumesByVerificationStatus = async (
  isVerified: boolean,
  filters?: { limit?: number; offset?: number }
): Promise<Resume[]> => {
  return await prisma.resume.findMany({
    where: { isVerified },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          rollNumber: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Get student resume count
 */
export const getStudentResumeCount = async (studentId: string): Promise<number> => {
  return await prisma.resume.count({
    where: { studentId },
  });
};
