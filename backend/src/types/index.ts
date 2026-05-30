// Common TypeScript interfaces for the application

export interface UserPayload {
  id: string;
  email: string;
  role: "STUDENT" | "COMPANY" | "ADMIN";
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export enum UserRole {
  STUDENT = "STUDENT",
  COMPANY = "COMPANY",
  ADMIN = "ADMIN",
}

export enum DriveApplicationStatus {
  APPLIED = "APPLIED",
  SHORTLISTED = "SHORTLISTED",
  REJECTED = "REJECTED",
  ACCEPTED_OFFER = "ACCEPTED_OFFER",
}

export enum OfferStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  COUNTERED = "COUNTERED",
}
