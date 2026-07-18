import { prisma } from "../config/database";
import { Student, VerificationStatus } from "@prisma/client";

/**
 * Student Repository - Handles all database operations for students
 * Follows Repository Pattern for clean data access layer
 */

/**
 * Create a new student profile
 * @param userId - User ID (from auth)
 * @param data - Student profile data
 * @returns Created student record
 */
export const createStudent = async (
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    rollNumber?: string | null;
    phone: string;
    department: string;
    batch: number;
    cgpa: number;
    college?: string;
  }
): Promise<Student> => {
  return prisma.student.create({
    data: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      rollNumber: data.rollNumber || null,
      phone: data.phone,
      department: data.department,
      batch: data.batch,
      cgpa: data.cgpa,
      college: data.college || "Not Specified",
      verificationStatus: "PENDING",
    },
  });
};

/**
 * Get student by ID
 * @param studentId - Student ID
 * @returns Student record with related data
 */
export const getStudentById = async (studentId: string): Promise<Student | null> => {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: { email: true, createdAt: true },
      },
      resumes: true,
      applications: true,
      offers: true,
    },
  });
};

/**
 * Get student by roll number
 * @param rollNumber - Student roll number
 * @returns Student record
 */
export const getStudentByRollNumber = async (
  rollNumber: string
): Promise<Student | null> => {
  return prisma.student.findUnique({
    where: { rollNumber },
  });
};

/**
 * Get student by user ID
 * @param userId - User ID
 * @returns Student record
 */
export const getStudentByUserId = async (userId: string): Promise<Student | null> => {
  return prisma.student.findUnique({
    where: { userId },
    include: {
      user: {
        select: { email: true },
      },
    },
  });
};

/**
 * Get all students with optional filters
 * @param filters - Filter options
 * @returns Array of students
 */
export const getAllStudents = async (filters?: {
  department?: string;
  batch?: number;
  cgpaMin?: number;
  cgpaMax?: number;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Student[]> => {
  const where: any = {};

  if (filters?.department) {
    where.department = filters.department;
  }

  if (filters?.batch) {
    where.batch = filters.batch;
  }

  if (filters?.cgpaMin !== undefined) {
    where.cgpa = { gte: filters.cgpaMin };
  }

  if (filters?.cgpaMax !== undefined) {
    where.cgpa = { ...where.cgpa, lte: filters.cgpaMax };
  }

  if (filters?.isVerified !== undefined) {
    where.isProfileVerified = filters.isVerified;
  }

  return prisma.student.findMany({
    where,
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true },
      },
    },
  });
};

/**
 * Update student profile
 * @param studentId - Student ID
 * @param data - Data to update
 * @returns Updated student record
 */
export const updateStudent = async (
  studentId: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    rollNumber: string | null;
    phone: string;
    cgpa: number;
    department: string;
    batch: number;
    profilePhoto: string;
    college: string;
  }>
): Promise<Student> => {
  return prisma.student.update({
    where: { id: studentId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
};

/**
 * Delete student profile (with cascade)
 * @param studentId - Student ID
 * @returns Deleted student record
 */
export const deleteStudent = async (studentId: string): Promise<Student> => {
  return prisma.student.delete({
    where: { id: studentId },
  });
};

/**
 * Update verification status
 * @param studentId - Student ID
 * @param status - New verification status
 * @param rejectionReason - Reason if rejected
 * @returns Updated student record
 */
export const updateVerificationStatus = async (
  studentId: string,
  status: VerificationStatus,
  rejectionReason?: string
): Promise<Student> => {
  return prisma.student.update({
    where: { id: studentId },
    data: {
      verificationStatus: status,
      isProfileVerified: status === VerificationStatus.VERIFIED,
      rejectionReason: rejectionReason || null,
      updatedAt: new Date(),
    },
  });
};

/**
 * Get students by department with CGPA filter (for recruiting)
 * @param department - Department name
 * @param cgpaMin - Minimum CGPA
 * @returns Array of students matching criteria
 */
export const getStudentsByDepartmentAndCGPA = async (
  department: string,
  cgpaMin: number
): Promise<Student[]> => {
  return prisma.student.findMany({
    where: {
      department,
      cgpa: { gte: cgpaMin },
      isProfileVerified: true,
    },
    orderBy: { cgpa: "desc" },
  });
};

/**
 * Get student count by department
 * @returns Object with department counts
 */
export const getStudentCountByDepartment = async (): Promise<
  { department: string; count: number }[]
> => {
  const result = await prisma.student.groupBy({
    by: ["department"],
    _count: {
      id: true,
    },
  });

  return result.map((item) => ({
    department: item.department,
    count: item._count.id,
  }));
};

/**
 * Check if roll number exists
 * @param rollNumber - Roll number to check
 * @returns true if exists, false otherwise
 */
export const rollNumberExists = async (rollNumber: string): Promise<boolean> => {
  const student = await prisma.student.findUnique({
    where: { rollNumber },
  });
  return !!student;
};

/**
 * Lock student profile (admin function)
 * @param studentId - Student ID
 * @returns Updated student record
 */
export const lockStudentProfile = async (studentId: string): Promise<Student> => {
  return prisma.student.update({
    where: { id: studentId },
    data: { isProfileLocked: true },
  });
};

/**
 * Unlock student profile (admin function)
 * @param studentId - Student ID
 * @returns Updated student record
 */
export const unlockStudentProfile = async (studentId: string): Promise<Student> => {
  return prisma.student.update({
    where: { id: studentId },
    data: { isProfileLocked: false },
  });
};
