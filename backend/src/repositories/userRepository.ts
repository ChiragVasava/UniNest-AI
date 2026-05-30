import { prisma } from "../config/database";
import { User, UserRole } from "@prisma/client";

/**
 * User Repository - Database queries for users
 * Handles: creating users, finding users, updating users
 */

/**
 * Create new user
 */
export const createUser = async (
  email: string,
  password: string,
  role: UserRole
): Promise<User> => {
  return prisma.user.create({
    data: { email, password, role },
  });
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Find user by ID
 */
export const findUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Check if email already exists
 */
export const emailExists = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return !!user;
};
