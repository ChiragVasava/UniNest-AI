import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { UserPayload } from "../types";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRE: string = process.env.JWT_EXPIRE || "7d";

/**
 * Generate JWT token for user
 * @param userId - User ID
 * @param email - User email
 * @param role - User role (STUDENT, COMPANY, ADMIN)
 * @returns JWT token
 */
export const generateToken = (
  userId: string,
  email: string,
  role: string
): string => {
  const payload = {
    id: userId,
    email,
    role,
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRE as any,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify JWT token
 * @param token - JWT token
 * @returns Decoded payload or null
 */
export const verifyToken = (token: string): UserPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

/**
 * Decode token without verification (for debugging)
 * @param token - JWT token
 * @returns Decoded payload
 */
export const decodeToken = (token: string): UserPayload | null => {
  try {
    const decoded = jwt.decode(token) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
