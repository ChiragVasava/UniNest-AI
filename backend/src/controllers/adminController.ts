import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { UserRole } from "@prisma/client";
import { hashPassword } from "../utils/encryption";

/**
 * Helper to ensure user is a global SaaS Admin
 */
const checkAdminRole = (role: string) => {
  if (role !== UserRole.ADMIN) {
    throw new AppError(403, "Access denied: Only UniNest Core Admins can access this resource");
  }
};

/**
 * POST /api/v1/admin/universities
 * Create a new University tenant
 */
export const createUniversityTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    checkAdminRole((req as any).userRole);

    const { email, password, name, code, address, website } = req.body;
    if (!email || !password || !name || !code) {
      throw new AppError(400, "Missing required university tenant fields");
    }

    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) throw new AppError(400, "Email is already registered");

    const codeExists = await prisma.university.findUnique({ where: { code } });
    if (codeExists) throw new AppError(400, "University code already exists");

    const hashedPassword = await hashPassword(password);

    const tenant = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.UNIVERSITY,
        },
      });

      return tx.university.create({
        data: {
          userId: user.id,
          name,
          code,
          address,
          website,
          isApproved: true, // Auto-approved when created by admin
        },
      });
    });

    res.status(201).json({
      success: true,
      data: tenant,
      message: "University tenant created successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/universities
 * List all universities
 */
export const getUniversities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    checkAdminRole((req as any).userRole);

    const universities = await prisma.university.findMany({
      include: {
        _count: {
          select: { students: true, facultyAdmins: true },
        },
      },
    });

    res.status(200).json({ success: true, data: universities });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/universities/:id/approve
 * Approve university tenant access
 */
export const approveUniversity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    checkAdminRole((req as any).userRole);

    const { id } = req.params;

    const uni = await prisma.university.update({
      where: { id },
      data: { isApproved: true },
    });

    res.status(200).json({
      success: true,
      data: uni,
      message: "University approved successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/universities/:id/suspend
 * Suspend university tenant access
 */
export const suspendUniversity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    checkAdminRole((req as any).userRole);

    const { id } = req.params;

    const uni = await prisma.university.update({
      where: { id },
      data: { isApproved: false },
    });

    res.status(200).json({
      success: true,
      data: uni,
      message: "University tenant suspended successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/universities/:id/billing
 * Update a university's subscription billing plan
 */
export const updateBillingPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    checkAdminRole((req as any).userRole);

    const { id } = req.params;
    const { plan } = req.body; // FREE, PREMIUM, ENTERPRISE

    if (!["FREE", "PREMIUM", "ENTERPRISE"].includes(plan)) {
      throw new AppError(400, "Invalid subscription plan level");
    }

    const uni = await prisma.university.update({
      where: { id },
      data: { subscriptionPlan: plan },
    });

    res.status(200).json({
      success: true,
      data: uni,
      message: "Subscription plan updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard/metrics
 * Calculate global portal statistics
 */
export const getAdminMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    checkAdminRole((req as any).userRole);

    const totalUnis = await prisma.university.count();
    const totalCompanies = await prisma.company.count();
    const totalStudents = await prisma.student.count();
    const totalDrives = await prisma.drive.count();

    // Placed count (where student drive application is ACCEPTED_OFFER)
    const placedStudents = await prisma.student.count({
      where: {
        applications: {
          some: { status: "ACCEPTED_OFFER" },
        },
      },
    });

    // Placement rate
    const placementRate = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUniversities: totalUnis,
        totalCompanies,
        totalStudents,
        totalDrives,
        placedStudentsCount: placedStudents,
        placementRate: parseFloat(placementRate.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/students
 * Global student search and filter across all universities
 */
export const globalSearchStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    checkAdminRole((req as any).userRole);

    const { search, department, minCgpa, batch, isVerified } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { firstName: { contains: String(search), mode: "insensitive" } },
        { lastName: { contains: String(search), mode: "insensitive" } },
        { rollNumber: { contains: String(search), mode: "insensitive" } },
      ];
    }

    if (department) {
      whereClause.department = String(department);
    }

    if (minCgpa) {
      whereClause.cgpa = { gte: parseFloat(String(minCgpa)) };
    }

    if (batch) {
      whereClause.batch = parseInt(String(batch));
    }

    if (isVerified) {
      whereClause.isProfileVerified = isVerified === "true";
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        university: { select: { name: true, code: true } },
        user: { select: { email: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};
