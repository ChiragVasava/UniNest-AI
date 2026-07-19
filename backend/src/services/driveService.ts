import * as driveRepository from "../repositories/driveRepository";
import * as companyRepository from "../repositories/companyRepository";
import * as studentRepository from "../repositories/studentRepository";
import { AppError } from "../middleware/errorHandler";

/**
 * Create drive (Company only)
 */
export const createDrive = async (
  userId: string,
  payload: {
    title: string;
    description?: string;
    jobDescription?: string;
    salary?: number;
    cgpaCutoff?: number;
    eligibleDepartments?: string[];
    eligibleBatches?: number[];
    requiredSkills?: string[];
    interviewFormat?: string;
    universityId?: string;   // optional — links drive to a university for approval
  }
) => {
  // Validate company exists for this user
  const company = await companyRepository.getCompanyByUserId(userId);
  if (!company) {
    throw new AppError(403, "Company profile not found. Please register as a company.");
  }

  const companyId = company.id;

  // Validate required fields
  if (!payload.title || payload.title.trim().length === 0) {
    throw new AppError(400, "Job title is required");
  }

  if (payload.title.length < 3) {
    throw new AppError(400, "Job title must be at least 3 characters");
  }

  // Validate salary if provided
  if (payload.salary !== undefined && payload.salary <= 0) {
    throw new AppError(400, "Salary must be greater than 0");
  }

  // Validate CGPA cutoff
  if (payload.cgpaCutoff !== undefined) {
    if (payload.cgpaCutoff < 0 || payload.cgpaCutoff > 10) {
      throw new AppError(400, "CGPA cutoff must be between 0 and 10");
    }
  }

  // Validate eligible batches (year >= 2020)
  if (payload.eligibleBatches && payload.eligibleBatches.length > 0) {
    const currentYear = new Date().getFullYear();
    payload.eligibleBatches.forEach((batch) => {
      if (batch < 2020 || batch > currentYear + 5) {
        throw new AppError(400, `Invalid batch year: ${batch}`);
      }
    });
  }

  // Validate interview format
  const validFormats = ["Online", "Offline", "Hybrid"];
  if (
    payload.interviewFormat &&
    !validFormats.includes(payload.interviewFormat)
  ) {
    throw new AppError(400, "Interview format must be Online, Offline, or Hybrid");
  }

  const drive = await driveRepository.createDrive({
    companyId,
    universityId: payload.universityId,
    title: payload.title,
    description: payload.description,
    jobDescription: payload.jobDescription,
    salary: payload.salary,
    cgpaCutoff: payload.cgpaCutoff || 0,
    eligibleDepartments: payload.eligibleDepartments || [],
    eligibleBatches: payload.eligibleBatches || [],
    requiredSkills: payload.requiredSkills || [],
    interviewFormat: payload.interviewFormat || "Online",
  });

  return {
    id: drive.id,
    title: drive.title,
    description: drive.description,
    jobDescription: drive.jobDescription,
    salary: drive.salary,
    cgpaCutoff: drive.cgpaCutoff,
    eligibleDepartments: drive.eligibleDepartments,
    eligibleBatches: drive.eligibleBatches,
    requiredSkills: drive.requiredSkills,
    interviewFormat: drive.interviewFormat,
    isActive: drive.isActive,
    companyName: (drive as any).company?.companyName,
    createdAt: drive.createdAt,
  };
};

/**
 * Get drive by ID
 */
export const getDriveById = async (driveId: string) => {
  const drive = await driveRepository.getDriveById(driveId);
  if (!drive) {
    throw new AppError(404, "Drive not found");
  }

  return {
    id: drive.id,
    title: drive.title,
    description: drive.description,
    jobDescription: drive.jobDescription,
    salary: drive.salary,
    cgpaCutoff: drive.cgpaCutoff,
    eligibleDepartments: drive.eligibleDepartments,
    eligibleBatches: drive.eligibleBatches,
    requiredSkills: drive.requiredSkills,
    interviewFormat: drive.interviewFormat,
    isActive: drive.isActive,
    company: {
      id: (drive as any).company?.id,
      companyName: (drive as any).company?.companyName,
      website: (drive as any).company?.website,
      contactEmail: (drive as any).company?.contactEmail,
    },
    totalApplications: ((drive as any).applications || []).length,
    createdAt: drive.createdAt,
    updatedAt: drive.updatedAt,
  };
};

/**
 * Get my company's drives (Protected)
 */
export const getMyCompanyDrives = async (userId: string) => {
  const company = await companyRepository.getCompanyByUserId(userId);
  if (!company) {
    throw new AppError(403, "Company profile not found. Please register as a company.");
  }

  const companyId = company.id;

  const drives = await driveRepository.getDrivesByCompanyId(companyId, {
    limit: 1000,
  });

  return {
    count: drives.length,
    drives: drives.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      salary: d.salary,
      cgpaCutoff: d.cgpaCutoff,
      isActive: d.isActive,
      totalApplications: ((d as any).applications || []).length,
      createdAt: d.createdAt,
    })),
  };
};

/**
 * Get all active drives
 */
export const getAllActiveDrives = async (filters?: {
  limit?: number;
  offset?: number;
}) => {
  const result = await driveRepository.getAllActiveDrives(filters);

  return {
    total: result.count,
    drives: result.drives.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      salary: d.salary,
      cgpaCutoff: d.cgpaCutoff,
      eligibleDepartments: d.eligibleDepartments,
      requiredSkills: d.requiredSkills,
      interviewFormat: d.interviewFormat,
      company: {
        id: (d as any).company?.id,
        companyName: (d as any).company?.companyName,
        sector: (d as any).company?.sector,
      },
      totalApplications: ((d as any).applications || []).length,
      createdAt: d.createdAt,
    })),
  };
};

/**
 * Get eligible drives for student
 */
export const getEligibleDrivesForStudent = async (
  studentId: string,
  filters?: { limit?: number; offset?: number }
) => {
  const student = await studentRepository.getStudentById(studentId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const drives = await driveRepository.getEligibleDrivesForStudent(
    student.department,
    student.batch,
    student.cgpa,
    filters
  );

  return {
    count: drives.length,
    drives: drives.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      salary: d.salary,
      cgpaCutoff: d.cgpaCutoff,
      eligibleDepartments: d.eligibleDepartments,
      requiredSkills: d.requiredSkills,
      interviewFormat: d.interviewFormat,
      company: {
        id: (d as any).company?.id,
        companyName: (d as any).company?.companyName,
        sector: (d as any).company?.sector,
      },
      createdAt: d.createdAt,
    })),
  };
};

/**
 * Update drive (Company only)
 */
export const updateDrive = async (
  driveId: string,
  userId: string,
  payload: Partial<{
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
) => {
  // Validate company exists for this user
  const company = await companyRepository.getCompanyByUserId(userId);
  if (!company) {
    throw new AppError(403, "Company profile not found. Please register as a company.");
  }

  const companyId = company.id;

  // Validate drive exists and belongs to company
  const drive = await driveRepository.getDriveById(driveId);
  if (!drive) {
    throw new AppError(404, "Drive not found");
  }

  if (drive.companyId !== companyId) {
    throw new AppError(403, "You can only update your own drives");
  }

  // Validate title if provided
  if (payload.title !== undefined) {
    if (payload.title.trim().length === 0) {
      throw new AppError(400, "Job title cannot be empty");
    }
    if (payload.title.length < 3) {
      throw new AppError(400, "Job title must be at least 3 characters");
    }
  }

  // Validate salary if provided
  if (payload.salary !== undefined && payload.salary <= 0) {
    throw new AppError(400, "Salary must be greater than 0");
  }

  // Validate CGPA cutoff if provided
  if (payload.cgpaCutoff !== undefined) {
    if (payload.cgpaCutoff < 0 || payload.cgpaCutoff > 10) {
      throw new AppError(400, "CGPA cutoff must be between 0 and 10");
    }
  }

  // Validate interview format if provided
  const validFormats = ["Online", "Offline", "Hybrid"];
  if (
    payload.interviewFormat &&
    !validFormats.includes(payload.interviewFormat)
  ) {
    throw new AppError(400, "Interview format must be Online, Offline, or Hybrid");
  }

  const updatedDrive = await driveRepository.updateDrive(driveId, payload);

  return {
    id: updatedDrive.id,
    title: updatedDrive.title,
    description: updatedDrive.description,
    salary: updatedDrive.salary,
    cgpaCutoff: updatedDrive.cgpaCutoff,
    isActive: updatedDrive.isActive,
    message: "Drive updated successfully",
  };
};

/**
 * Delete drive (Company only)
 */
export const deleteDrive = async (driveId: string, userId: string) => {
  // Validate company exists for this user
  const company = await companyRepository.getCompanyByUserId(userId);
  if (!company) {
    throw new AppError(403, "Company profile not found. Please register as a company.");
  }

  const companyId = company.id;

  const drive = await driveRepository.getDriveById(driveId);
  if (!drive) {
    throw new AppError(404, "Drive not found");
  }

  if (drive.companyId !== companyId) {
    throw new AppError(403, "You can only delete your own drives");
  }

  await driveRepository.deleteDrive(driveId);

  return {
    message: "Drive deleted successfully",
  };
};

/**
 * Get drive statistics
 */
export const getDriveStatistics = async () => {
  const totalDrives = await driveRepository.getActiveDriveCount();
  const drivenWithApps = await driveRepository.getDrivesWithStats({
    limit: 10000,
  });

  const totalApplications = drivenWithApps.reduce(
    (sum, drive) => sum + drive._count.applications,
    0
  );

  return {
    totalActiveDrives: totalDrives,
    totalApplications,
    averageApplicationsPerDrive: totalDrives > 0 ? totalApplications / totalDrives : 0,
    drivesWithMostApplications:
      drivenWithApps.length > 0
        ? drivenWithApps
            .sort((a, b) => b._count.applications - a._count.applications)
            .slice(0, 5)
            .map((d) => ({
              id: d.id,
              title: d.title,
              companyName: (d as any).company?.companyName,
              applications: d._count.applications,
            }))
        : [],
  };
};
