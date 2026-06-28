import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash password using bcryptjs
 * @param password - Plain password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain password with hashed password
 * @param password - Plain password
 * @param hashedPassword - Hashed password
 * @returns true if password matches, false otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
