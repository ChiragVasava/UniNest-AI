/**
 * TypeScript Types and Interfaces for UniNest Frontend
 */

// Auth Types
export type UserRole = 'STUDENT' | 'COMPANY' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Student Types
export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  department: string;
  cgpa: number;
  phone: string;
  batch: number;
  skills: string[];
  bio?: string;
  createdAt: string;
}

// Company Types
export interface Company {
  id: string;
  userId: string;
  companyName: string;
  registrationId: string;
  sector: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website?: string;
  description?: string;
  createdAt: string;
}

// Drive Types
export type InterviewFormat = 'Online' | 'Offline' | 'Hybrid';

export interface Drive {
  id: string;
  companyId: string;
  title: string;
  description: string;
  salary: number;
  cgpaCutoff: number;
  interviewFormat: InterviewFormat;
  departments: string[];
  batchEligible: number[];
  numberOfOpenings: number;
  applicationDeadline: string;
  isActive: boolean;
  createdAt: string;
  company: {
    id: string;
    companyName: string;
  };
  applicationCount?: number;
  acceptedCount?: number;
}

// Application Types
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED_OFFER';

export interface DriveApplication {
  id: string;
  studentId: string;
  driveId: string;
  status: ApplicationStatus;
  appliedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    cgpa?: number;
    department?: string;
  };
  drive?: {
    title: string;
    company?: {
      companyName: string;
    };
  };
}

// Resume Types
export interface Resume {
  id: string;
  studentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  description?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifyComment?: string;
  uploadedAt: string;
}

// Offer Types
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';

export interface Offer {
  id: string;
  studentId: string;
  driveId: string;
  salary: number;
  joinDate?: string;
  offerDetails?: string;
  status: OfferStatus;
  counterOfferText?: string;
  createdAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
  };
  drive?: {
    title: string;
    company?: {
      companyName: string;
    };
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}
