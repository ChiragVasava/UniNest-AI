/**
 * Validation helpers for common fields
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Minimum 6 characters, at least one uppercase, one lowercase, one number
 * @param password - Password to validate
 * @returns true if valid, false otherwise
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate phone number (basic)
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

/**
 * Validate roll number format
 * @param rollNumber - Roll number to validate
 * @returns true if valid, false otherwise
 */
export const isValidRollNumber = (rollNumber: string): boolean => {
  // Example: BT20CSE001, 20CSE001, etc.
  const rollRegex = /^[A-Z]{0,2}\d{2}[A-Z]{2,3}\d{3,4}$/;
  return rollRegex.test(rollNumber.toUpperCase());
};

/**
 * Validate CGPA
 * @param cgpa - CGPA to validate
 * @returns true if valid (0-10), false otherwise
 */
export const isValidCGPA = (cgpa: number): boolean => {
  return cgpa >= 0 && cgpa <= 10;
};

/**
 * Validate batch year
 * @param batch - Batch year to validate
 * @returns true if valid, false otherwise
 */
export const isValidBatch = (batch: number): boolean => {
  const currentYear = new Date().getFullYear();
  return batch >= 2020 && batch <= currentYear + 5;
};
