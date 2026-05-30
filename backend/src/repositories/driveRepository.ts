import { prisma } from "../config/database";
import { Drive } from "@prisma/client";

/**
 * Create a new drive
 */
export const createDrive = async (data: {
  companyId: string;
  title: string;
  description?: string;
  jobDescription?: string;
  salary?: number;
  cgpaCutoff?: number;
  eligibleDepartments?: string[];
  eligibleBatches?: number[];
  requiredSkills?: string[];
  interviewFormat?: string;
}): Promise<Drive> => {
  return await prisma.drive.create({
    data: {
      companyId: data.companyId,
      title: data.title,
      description: data.description,
      jobDescription: data.jobDescription,
      salary: data.salary,
      cgpaCutoff: data.cgpaCutoff || 0,
      eligibleDepartments: data.eligibleDepartments || [],
      eligibleBatches: data.eligibleBatches || [],
      requiredSkills: data.requiredSkills || [],
      interviewFormat: data.interviewFormat || "Online",
      isActive: true,
    },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  });
};

/**
 * Get drive by ID
 */
export const getDriveById = async (driveId: string): Promise<Drive | null> => {
  return await prisma.drive.findUnique({
    where: { id: driveId },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          website: true,
          contactEmail: true,
        },
      },
      applications: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Get drives by company ID
 */
export const getDrivesByCompanyId = async (
  companyId: string,
  filters?: { limit?: number; offset?: number }
): Promise<Drive[]> => {
  return await prisma.drive.findMany({
    where: { companyId },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        select: {
          companyName: true,
        },
      },
      applications: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Get all active drives
 */
export const getAllActiveDrives = async (filters?: {
  limit?: number;
  offset?: number;
}): Promise<{ count: number; drives: Drive[] }> => {
  const drives = await prisma.drive.findMany({
    where: { isActive: true },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          sector: true,
          website: true,
        },
      },
      applications: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return {
    count: await prisma.drive.count({ where: { isActive: true } }),
    drives,
  };
};

/**
 * Get eligible drives for a student
 */
export const getEligibleDrivesForStudent = async (
  department: string,
  batch: number,
  cgpa: number,
  filters?: { limit?: number; offset?: number }
): Promise<Drive[]> => {
  return await prisma.drive.findMany({
    where: {
      isActive: true,
      cgpaCutoff: { lte: cgpa },
      eligibleDepartments: { has: department },
      eligibleBatches: { has: batch },
    },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          sector: true,
          website: true,
        },
      },
    },
  });
};

/**
 * Update drive
 */
export const updateDrive = async (
  driveId: string,
  data: Partial<{
    title: string;
    description: string;
    jobDescription: string;
    salary: number;
    cgpaCutoff: number;
    eligibleDepartments: string[];
    eligibleBatches: number[];
    requiredSkills: string[];
    interviewFormat: string;
    isActive: boolean;
  }>
): Promise<Drive> => {
  return await prisma.drive.update({
    where: { id: driveId },
    data,
    include: {
      company: {
        select: {
          companyName: true,
        },
      },
    },
  });
};

/**
 * Delete drive
 */
export const deleteDrive = async (driveId: string): Promise<Drive> => {
  return await prisma.drive.delete({
    where: { id: driveId },
  });
};

/**
 * Get drive count by company
 */
export const getDriveCountByCompany = async (companyId: string): Promise<number> => {
  return await prisma.drive.count({
    where: { companyId },
  });
};

/**
 * Get active drive count
 */
export const getActiveDriveCount = async (): Promise<number> => {
  return await prisma.drive.count({
    where: { isActive: true },
  });
};

/**
 * Get total applications count for a drive
 */
export const getDriveApplicationCount = async (driveId: string): Promise<number> => {
  return await prisma.driveApplication.count({
    where: { driveId },
  });
};

/**
 * Check if drive exists
 */
export const driveExists = async (driveId: string): Promise<boolean> => {
  const drive = await prisma.drive.findUnique({
    where: { id: driveId },
    select: { id: true },
  });
  return !!drive;
};

/**
 * Get drives with application stats
 */
export const getDrivesWithStats = async (filters?: {
  limit?: number;
  offset?: number;
}): Promise<
  Array<
    Drive & {
      _count: { applications: number };
    }
  >
> => {
  return await prisma.drive.findMany({
    where: { isActive: true },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    include: {
      company: {
        select: {
          companyName: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
