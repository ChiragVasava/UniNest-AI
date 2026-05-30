import * as studentRepository from "../repositories/studentRepository";
import {
  isValidPhone,
  isValidRollNumber,
  isValidCGPA,
  isValidBatch,
} from "../utils/validators";
import { AppError } from "../middleware/errorHandler";

/**
 * Student Service - Contains business logic for student operations
 * Validates input and calls repository layer
 */

/**
 * Create new student profile
 * @param userId - User ID from auth
 * @param payload - Student profile data
 * @returns Created student with user info
 */
export const createStudentProfile = async (
  userId: string,
  payload: {
    firstName: string;
    lastName: string;
    rollNumber: string;
    phone: string;
    department: string;
    batch: number;
    cgpa: number;
    college?: string;
  }
) => {
  // Validation
  if (!payload.firstName || !payload.firstName.trim()) {
    throw new AppError(400, "First name is required");
  }

  if (!payload.lastName || !payload.lastName.trim()) {
    throw new AppError(400, "Last name is required");
  }

  if (!payload.rollNumber || !payload.rollNumber.trim()) {
    throw new AppError(400, "Roll number is required");
  }

  if (!isValidRollNumber(payload.rollNumber)) {
    throw new AppError(
      400,
      "Invalid roll number format. Expected: BT20CSE001 or 20CSE001"
    );
  }

  if (!payload.phone || !payload.phone.trim()) {
    throw new AppError(400, "Phone number is required");
  }

  if (!isValidPhone(payload.phone)) {
    throw new AppError(400, "Phone number must be 10 digits");
  }

  if (!payload.department || !payload.department.trim()) {
    throw new AppError(400, "Department is required");
  }

  if (!payload.batch || typeof payload.batch !== "number") {
    throw new AppError(400, "Valid batch year is required");
  }

  if (!isValidBatch(payload.batch)) {
    throw new AppError(400, "Batch year must be between 2020 and future years");
  }

  if (typeof payload.cgpa !== "number") {
    throw new AppError(400, "CGPA must be a number");
  }

  if (!isValidCGPA(payload.cgpa)) {
    throw new AppError(400, "CGPA must be between 0 and 10");
  }

  // Check if roll number already exists
  const rollNumberExists = await studentRepository.rollNumberExists(
    payload.rollNumber
  );
  if (rollNumberExists) {
    throw new AppError(400, "Roll number already registered");
  }

  // Check if student profile already exists for this user
  const existingStudent = await studentRepository.getStudentByUserId(userId);
  if (existingStudent) {
    throw new AppError(400, "Student profile already exists for this user");
  }

  // Create student profile
  const student = await studentRepository.createStudent(userId, payload);

  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    rollNumber: student.rollNumber,

    phone: student.phone,
    department: student.department,
    batch: student.batch,
    cgpa: student.cgpa,
    verificationStatus: student.verificationStatus,
    college: student.college,
    createdAt: student.createdAt,
  };
};

/**
 * Get student profile by ID
 * @param studentId - Student ID
 * @returns Student profile data
 */
export const getStudentProfile = async (studentId: string) => {
  const student = await studentRepository.getStudentById(studentId);

  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    rollNumber: student.rollNumber,
    phone: student.phone,
    department: student.department,
    batch: student.batch,
    cgpa: student.cgpa,
    college: student.college,
    profilePhoto: student.profilePhoto,
    verificationStatus: student.verificationStatus,
    isProfileVerified: student.isProfileVerified,
    rejectionReason: student.rejectionReason,
    isProfileLocked: student.isProfileLocked,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
};

/**
 * Get student profile by User ID (for authenticated users)
 * @param userId - User ID from auth token
 * @returns Student profile data
 */
export const getStudentProfileByUserId = async (userId: string) => {
  const student = await studentRepository.getStudentByUserId(userId);

  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    rollNumber: student.rollNumber,
    phone: student.phone,
    department: student.department,
    batch: student.batch,
    cgpa: student.cgpa,
    college: student.college,
    profilePhoto: student.profilePhoto,
    verificationStatus: student.verificationStatus,
    isProfileVerified: student.isProfileVerified,
    rejectionReason: student.rejectionReason,
    isProfileLocked: student.isProfileLocked,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
};

/**
 * Update student profile
 * @param studentId - Student ID
 * @param payload - Data to update
 * @returns Updated student profile
 */
export const updateStudentProfile = async (
  studentId: string,
  payload: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    cgpa: number;
    department: string;
    batch: number;
    profilePhoto: string;
    college: string;
  }>
) => {
  // Validate student exists
  const student = await studentRepository.getStudentById(studentId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  // Check if profile is locked
  if (student.isProfileLocked) {
    throw new AppError(403, "Your profile is locked. Contact admin for support.");
  }

  // Validate fields if provided
  if (payload.phone && !isValidPhone(payload.phone)) {
    throw new AppError(400, "Phone number must be 10 digits");
  }

  if (payload.cgpa !== undefined && !isValidCGPA(payload.cgpa)) {
    throw new AppError(400, "CGPA must be between 0 and 10");
  }

  if (payload.batch && !isValidBatch(payload.batch)) {
    throw new AppError(400, "Batch year must be between 2020 and future years");
  }

  // Only allow fields this endpoint is meant to update.
  const updateData = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    cgpa: payload.cgpa,
    department: payload.department,
    batch: payload.batch,
    profilePhoto: payload.profilePhoto,
    college: payload.college,
  };

  // Update student
  const updatedStudent = await studentRepository.updateStudent(studentId, updateData);

  return {
    id: updatedStudent.id,
    firstName: updatedStudent.firstName,
    lastName: updatedStudent.lastName,
    rollNumber: updatedStudent.rollNumber,
    phone: updatedStudent.phone,
    department: updatedStudent.department,
    batch: updatedStudent.batch,
    cgpa: updatedStudent.cgpa,
    college: updatedStudent.college,
    profilePhoto: updatedStudent.profilePhoto,
    message: "Profile updated successfully",
  };
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
}) => {
  // Validate filters
  if (filters?.cgpaMin && !isValidCGPA(filters.cgpaMin)) {
    throw new AppError(400, "Invalid cgpaMin value (0-10)");
  }

  if (filters?.cgpaMax && !isValidCGPA(filters.cgpaMax)) {
    throw new AppError(400, "Invalid cgpaMax value (0-10)");
  }

  if (filters?.cgpaMin && filters?.cgpaMax && filters.cgpaMin > filters.cgpaMax) {
    throw new AppError(400, "cgpaMin cannot be greater than cgpaMax");
  }

  if (filters?.batch && !isValidBatch(filters.batch)) {
    throw new AppError(400, "Invalid batch year");
  }

  const students = await studentRepository.getAllStudents(filters);

  return {
    count: students.length,
    students: students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      rollNumber: s.rollNumber,
      department: s.department,
      batch: s.batch,
      cgpa: s.cgpa,
      isVerified: s.isProfileVerified,
      createdAt: s.createdAt,
    })),
  };
};

/**
 * Delete student profile
 * @param studentId - Student ID
 * @returns Success message
 */
export const deleteStudentProfile = async (studentId: string) => {
  const student = await studentRepository.getStudentById(studentId);

  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  await studentRepository.deleteStudent(studentId);

  return {
    message: "Student profile deleted successfully",
    deletedId: studentId,
  };
};

/**
 * Get student statistics by department
 * @returns Department statistics
 */
export const getStudentStatistics = async () => {
  const stats = await studentRepository.getStudentCountByDepartment();

  return {
    totalDepartments: stats.length,
    byDepartment: stats,
  };
};

/**
 * Get students for job drive (by department and CGPA)
 * @param department - Department name
 * @param cgpaMin - Minimum CGPA requirement
 * @returns Eligible students
 */
export const getEligibleStudentsForDrive = async (
  department: string,
  cgpaMin: number
) => {
  if (!isValidCGPA(cgpaMin)) {
    throw new AppError(400, "Invalid CGPA minimum value");
  }

  const students = await studentRepository.getStudentsByDepartmentAndCGPA(
    department,
    cgpaMin
  );

  return {
    count: students.length,
    department,
    cgpaMin,
    students: students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      rollNumber: s.rollNumber,
      cgpa: s.cgpa,
      phone: s.phone,
    })),
  };
};
