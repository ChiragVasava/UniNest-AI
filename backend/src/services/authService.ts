import * as userRepo from "../repositories/userRepository";
import * as studentRepo from "../repositories/studentRepository";
import * as companyRepo from "../repositories/companyRepository";
import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { isValidEmail, isValidPassword } from "../utils/validators";
import { generateStudentRollNumber } from "../utils/rollNumber";
import { AppError } from "../middleware/errorHandler";
import { User, UserRole } from "@prisma/client";

/**
 * Auth Service - Business logic for authentication
 * Handles: user registration, login, token generation
 */

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  universityName?: string;
  universityCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: { id: string; email: string; role: UserRole };
  token: string;
}

/**
 * Register new user
 * Validates email, password, checks for duplicates
 */
export const register = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  const { email, password, confirmPassword, role, universityName, universityCode } = payload;

  // Validation
  if (!isValidEmail(email)) {
    throw new AppError(400, "Invalid email format");
  }

  if (!isValidPassword(password)) {
    throw new AppError(
      400,
      "Password must be 6+ characters with uppercase, lowercase, and number"
    );
  }

  if (password !== confirmPassword) {
    throw new AppError(400, "Passwords do not match");
  }

  // Check if email already exists
  const emailAlreadyExists = await userRepo.emailExists(email);
  if (emailAlreadyExists) {
    throw new AppError(400, "Email already registered");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await userRepo.createUser(email, hashedPassword, role);

  // Create linked profile row depending on role so other APIs can rely on it.
  try {
    if (role === UserRole.STUDENT) {
      const rollNumber = generateStudentRollNumber(user.id);
      await studentRepo.createStudent(user.id, {
        firstName: "",
        lastName: "",
        rollNumber,
        phone: "",
        department: "CSE",
        batch: new Date().getFullYear(),
        cgpa: 0,
      });
    }

    if (role === UserRole.COMPANY) {
      const registrationId = `REG-${Date.now()}-${user.id.slice(0,6)}`;
      const companyName = `Company-${user.email.split("@")[0]}`;
      await companyRepo.createCompany(user.id, {
        companyName,
        registrationId,
        sector: "Other",
        website: "",
      });
    }

    if (role === UserRole.UNIVERSITY) {
      const name = universityName || `University-${user.email.split("@")[0]}`;
      const code = universityCode || `UNI-${Date.now().toString().slice(-4)}`;
      await prisma.university.create({
        data: {
          userId: user.id,
          name,
          code,
        },
      });
    }
  } catch (err) {
    // If profile creation fails, remove the created user to avoid orphaned users
    try {
      await prisma.user.delete({ where: { id: user.id } });
    } catch (delErr) {
      // swallow - we'll throw original error below
    }
    throw new AppError(500, "Failed to create user profile");
  }

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  return {
    user: { id: user.id, email: user.email, role: user.role },
    token,
  };
};

/**
 * Login user
 * Validates credentials and generates token
 */
export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { email, password } = payload;

  // Find user
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  // Verify password
  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  return {
    user: { id: user.id, email: user.email, role: user.role },
    token,
  };
};

/**
 * Get user from token
 */
export const getUserFromToken = async (userId: string): Promise<User> => {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
};
