import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { UserRole, VerificationStatus } from "@prisma/client";
import { hashPassword } from "../utils/encryption";
import { sendEmail } from "../utils/notification";
import crypto from "crypto";

/**
 * Helper to fetch the universityId for the logged-in user (University, Faculty Admin, or Global Admin)
 */
const getUniversityId = async (userId: string, role: string, reqUniId?: string): Promise<string> => {
  if (role === UserRole.ADMIN && reqUniId) {
    return reqUniId; // Global admin can specify a university id
  }
  
  if (role === UserRole.UNIVERSITY) {
    const uni = await prisma.university.findUnique({ where: { userId } });
    if (!uni) throw new AppError(404, "University profile not found");
    return uni.id;
  }

  // Check if Faculty Admin
  const faculty = await prisma.facultyAdmin.findUnique({ where: { userId } });
  if (faculty) {
    return faculty.universityId;
  }

  throw new AppError(403, "Access denied: Only University or Faculty Admins can perform this action");
};

/**
 * POST /api/v1/universities/students/manual
 * Onboard a single student manually
 */
export const manualOnboardStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    
    const uniId = await getUniversityId(userId, role, req.body.universityId);
    const { email, rollNumber, phone, firstName, lastName, department, batch, cgpa, classId } = req.body;

    if (!email || !rollNumber || !firstName || !lastName || !department || !batch) {
      throw new AppError(400, "Missing required onboarding fields");
    }

    // Check if email or roll number already exists
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      throw new AppError(400, "Student email is already registered");
    }

    const rollExists = await prisma.student.findUnique({ where: { rollNumber } });
    if (rollExists) {
      throw new AppError(400, "Roll number already exists");
    }

    // Default password for onboarding
    const defaultPassword = `Student@${rollNumber}`;
    const hashedPassword = await hashPassword(defaultPassword);

    // Create user and student profile in transaction
    const studentUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.STUDENT,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          rollNumber,
          phone,
          department,
          batch: parseInt(batch.toString()),
          cgpa: parseFloat(cgpa?.toString() || "0"),
          universityId: uniId,
          classId: classId || null,
          verificationStatus: VerificationStatus.PENDING,
        },
      });

      return { user, student };
    });

    // Send Onboarding Email
    await sendEmail(
      email,
      "You have been added to UniNest AI Portal",
      `Hello ${firstName},\n\nYou have been added by your University to the UniNest Placement Portal.\n\nYour Temporary Login Credentials:\nEmail: ${email}\nPassword: ${defaultPassword}\n\nPlease login, verify your account using OTP, and complete your profile.`,
      `<h3>Hello ${firstName},</h3><p>You have been added by your University to the UniNest Placement Portal.</p><p><strong>Your Temporary Login Credentials:</strong><br/>Email: <code>${email}</code><br/>Password: <code>${defaultPassword}</code></p><p>Please login, verify your account using OTP, and complete your profile.</p>`
    );

    res.status(201).json({
      success: true,
      data: studentUser.student,
      message: "Student onboarded successfully and login credentials emailed",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/universities/students/bulk
 * Onboard students in bulk via CSV parsing
 */
export const bulkOnboardStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role, req.body.universityId);

    if (!req.file) {
      throw new AppError(400, "Please upload a CSV file");
    }

    const csvData = req.file.buffer.toString("utf8");
    const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== "");
    
    if (lines.length <= 1) {
      throw new AppError(400, "CSV file is empty or only contains headers");
    }

    // Expected format: First Name, Last Name, Email, Roll Number, Phone, Department, Batch, CGPA
    const studentsAdded = [];
    const errors = [];

    // Simple loop to parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      
      const firstName = cols[0];
      const lastName = cols[1];
      const email = cols[2];
      const rollNumber = cols[3];
      const phone = cols[4];
      const department = cols[5];
      const batchStr = cols[6];
      const cgpaStr = cols[7];

      if (!email || !rollNumber || !firstName || !lastName || !department || !batchStr) {
        errors.push({ row: i + 1, error: "Missing required values" });
        continue;
      }

      try {
        const emailExists = await prisma.user.findUnique({ where: { email } });
        const rollExists = await prisma.student.findUnique({ where: { rollNumber } });

        if (emailExists || rollExists) {
          errors.push({ row: i + 1, error: "Email or Roll Number already registered" });
          continue;
        }

        const defaultPassword = `Student@${rollNumber}`;
        const hashedPassword = await hashPassword(defaultPassword);

        const student = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              password: hashedPassword,
              role: UserRole.STUDENT,
            },
          });

          return tx.student.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
              rollNumber,
              phone,
              department,
              batch: parseInt(batchStr),
              cgpa: parseFloat(cgpaStr || "0"),
              universityId: uniId,
              verificationStatus: VerificationStatus.PENDING,
            },
          });
        });

        // Send Email
        await sendEmail(
          email,
          "You have been added to UniNest AI Portal",
          `Hello ${firstName},\n\nYou have been added by your University in bulk to UniNest.\n\nTemporary Login Credentials:\nEmail: ${email}\nPassword: ${defaultPassword}`
        );

        studentsAdded.push(student);
      } catch (err: any) {
        errors.push({ row: i + 1, error: err.message || "Failed to parse/create row" });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalProcessed: lines.length - 1,
        successCount: studentsAdded.length,
        failedCount: errors.length,
        errors,
      },
      message: `Bulk onboarding complete: ${studentsAdded.length} students added, ${errors.length} skipped.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/universities/students/pending
 * List all students in the university awaiting verification
 */
export const getPendingStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role);

    const students = await prisma.student.findMany({
      where: {
        universityId: uniId,
        verificationStatus: VerificationStatus.PENDING,
      },
      include: {
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

/**
 * POST /api/v1/universities/students/:id/verify
 * Approve a student's profile verification
 */
export const verifyStudentProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role);

    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: { id, universityId: uniId },
    });

    if (!student) {
      throw new AppError(404, "Student not found in your university");
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        isProfileVerified: true,
        rejectionReason: null,
      },
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: "Student profile verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/universities/students/:id/reject
 * Reject a student's profile/resume verification with comments
 */
export const rejectStudentProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role);

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new AppError(400, "Rejection reason is required");
    }

    const student = await prisma.student.findFirst({
      where: { id, universityId: uniId },
    });

    if (!student) {
      throw new AppError(404, "Student not found in your university");
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        isProfileVerified: false,
        rejectionReason: reason,
      },
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: "Student verification request rejected with comments",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/universities/students/:id/lock
 * Lock or unlock student profile updates
 */
export const toggleStudentLock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role);

    const { id } = req.params;
    const { lock } = req.body; // boolean

    const student = await prisma.student.findFirst({
      where: { id, universityId: uniId },
    });

    if (!student) {
      throw new AppError(404, "Student not found in your university");
    }

    const updated = await prisma.student.update({
      where: { id },
      data: { isProfileLocked: lock === true },
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: `Student profile ${lock ? "locked" : "unlocked"} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// HIERARCHY MANAGEMENT (Departments, Classes)
// ============================================

export const createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role);

    const { name, code } = req.body;
    if (!name || !code) {
      throw new AppError(400, "Department name and code are required");
    }

    const dept = await prisma.department.create({
      data: { universityId: uniId, name, code },
    });

    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role);

    const depts = await prisma.department.findMany({
      where: { universityId: uniId },
      include: { subDepartments: true },
    });

    res.status(200).json({ success: true, data: depts });
  } catch (error) {
    next(error);
  }
};

export const createSubDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: departmentId } = req.params; // Department ID
    const { name, code } = req.body;
    
    if (!name || !code) {
      throw new AppError(400, "Sub-department name and code are required");
    }

    const subDept = await prisma.subDepartment.create({
      data: { departmentId, name, code },
    });

    res.status(201).json({ success: true, data: subDept });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: subDepartmentId } = req.params; // Sub-dept ID
    const { name, batch } = req.body;
    
    if (!name || !batch) {
      throw new AppError(400, "Class name and batch year are required");
    }

    const classObj = await prisma.class.create({
      data: { subDepartmentId, name, batch: parseInt(batch.toString()) },
    });

    res.status(201).json({ success: true, data: classObj });
  } catch (error) {
    next(error);
  }
};

export const getClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: subDepartmentId } = req.params;
    
    const classes = await prisma.class.findMany({
      where: { subDepartmentId },
    });

    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
};

// ============================================
// COMPANY & DRIVE APPROVALS
// ============================================

export const inviteCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role);

    const { email, companyName } = req.body;
    if (!email || !companyName) {
      throw new AppError(400, "Company email and name are required");
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await prisma.companyInvitation.create({
      data: { universityId: uniId, email, companyName, token },
    });

    // Send Invitation Email
    await sendEmail(
      email,
      `Invitation to onboard with UniNest - ${companyName}`,
      `Hello ${companyName} team,\n\nYou have been invited by our University to onboard on UniNest Placement Portal.\n\nPlease register using this invite token: ${token}`
    );

    res.status(201).json({
      success: true,
      data: invite,
      message: "Company invitation link sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getDriveRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role);

    const drives = await prisma.drive.findMany({
      where: {
        universityId: uniId,
        isApproved: false,
      },
      include: {
        company: true,
      },
    });

    res.status(200).json({ success: true, data: drives });
  } catch (error) {
    next(error);
  }
};

export const approveDrive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const uniId = await getUniversityId(userId, role);

    const { id } = req.params;

    const drive = await prisma.drive.findFirst({
      where: { id, universityId: uniId },
    });

    if (!drive) {
      throw new AppError(404, "Drive request not found under your university");
    }

    const approved = await prisma.drive.update({
      where: { id },
      data: { isApproved: true },
    });

    res.status(200).json({
      success: true,
      data: approved,
      message: "Drive request approved successfully. It is now live for students.",
    });
  } catch (error) {
    next(error);
  }
};
