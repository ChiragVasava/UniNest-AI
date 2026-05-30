import { prisma } from "../config/database";
import { DriveApplication, DriveApplicationStatus } from "@prisma/client";

/**
 * Apply for a drive
 */
export const createApplication = async (data: {
  studentId: string;
  driveId: string;
}): Promise<DriveApplication> => {
  return await prisma.driveApplication.create({
    data: {
      studentId: data.studentId,
      driveId: data.driveId,
      status: DriveApplicationStatus.APPLIED,
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
      drive: {
        select: {
          id: true,
          title: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Get application by ID
 */
export const getApplicationById = async (
  applicationId: string
): Promise<DriveApplication | null> => {
  return await prisma.driveApplication.findUnique({
    where: { id: applicationId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          cgpa: true,
          department: true,
        },
      },
      drive: {
        select: {
          id: true,
          title: true,
          salary: true,
          company: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Get student's applications
 */
export const getStudentApplications = async (
  studentId: string,
  filters?: { limit?: number; offset?: number }
): Promise<DriveApplication[]> => {
  return await prisma.driveApplication.findMany({
    where: { studentId },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { appliedAt: "desc" },
    include: {
      drive: {
        select: {
          id: true,
          title: true,
          salary: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Get drive applications (by company)
 */
export const getDriveApplications = async (
  driveId: string,
  filters?: { status?: DriveApplicationStatus; limit?: number; offset?: number }
): Promise<{ count: number; applications: DriveApplication[] }> => {
  const where: any = { driveId };
  if (filters?.status) {
    where.status = filters.status;
  }

  const applications = await prisma.driveApplication.findMany({
    where,
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { appliedAt: "desc" },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          cgpa: true,
          department: true,
          phone: true,
        },
      },
    },
  });

  const count = await prisma.driveApplication.count({ where });

  return { count, applications };
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: DriveApplicationStatus,
  rejectionReason?: string
): Promise<DriveApplication> => {
  return await prisma.driveApplication.update({
    where: { id: applicationId },
    data: {
      status,
      rejectionReason: rejectionReason || null,
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
      drive: {
        select: {
          title: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Delete application (cancel application)
 */
export const deleteApplication = async (applicationId: string): Promise<DriveApplication> => {
  return await prisma.driveApplication.delete({
    where: { id: applicationId },
  });
};

/**
 * Check if student already applied for a drive
 */
export const hasApplied = async (studentId: string, driveId: string): Promise<boolean> => {
  const application = await prisma.driveApplication.findUnique({
    where: {
      studentId_driveId: {
        studentId,
        driveId,
      },
    },
    select: { id: true },
  });
  return !!application;
};

/**
 * Get student application count
 */
export const getStudentApplicationCount = async (studentId: string): Promise<number> => {
  return await prisma.driveApplication.count({
    where: { studentId },
  });
};

/**
 * Get applications by status
 */
export const getApplicationsByStatus = async (
  status: DriveApplicationStatus,
  filters?: { limit?: number; offset?: number }
): Promise<{ count: number; applications: DriveApplication[] }> => {
  const applications = await prisma.driveApplication.findMany({
    where: { status },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { appliedAt: "desc" },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          rollNumber: true,
        },
      },
      drive: {
        select: {
          title: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });

  const count = await prisma.driveApplication.count({ where: { status } });

  return { count, applications };
};

/**
 * Get application statistics
 */
export const getApplicationStatistics = async (): Promise<{
  totalApplications: number;
  byStatus: Record<string, number>;
}> => {
  const total = await prisma.driveApplication.count();
  const byStatus = await prisma.driveApplication.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusCounts: Record<string, number> = {};
  byStatus.forEach((item) => {
    statusCounts[item.status] = item._count;
  });

  return {
    totalApplications: total,
    byStatus: statusCounts,
  };
};

/**
 * Get student's application status for a specific drive
 */
export const getStudentDriveApplicationStatus = async (
  studentId: string,
  driveId: string
): Promise<DriveApplication | null> => {
  return await prisma.driveApplication.findUnique({
    where: {
      studentId_driveId: {
        studentId,
        driveId,
      },
    },
  });
};

/**
 * Get shortlisted students for a drive
 */
export const getShortlistedStudents = async (
  driveId: string
): Promise<DriveApplication[]> => {
  return await prisma.driveApplication.findMany({
    where: {
      driveId,
      status: DriveApplicationStatus.SHORTLISTED,
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          phone: true,
          cgpa: true,
        },
      },
    },
  });
};
