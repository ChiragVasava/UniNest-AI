import { prisma } from "../config/database";
import { Company } from "@prisma/client";

/**
 * Company Repository - Handles all database operations for companies
 * Follows Repository Pattern for clean data access layer
 */

/**
 * Create a new company profile
 */
export const createCompany = async (
  userId: string,
  payload: {
    companyName: string;
    registrationId: string;
    sector: string;
    website?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  }
): Promise<Company> => {
  return await prisma.company.create({
    data: {
      userId,
      companyName: payload.companyName,
      registrationId: payload.registrationId,
      sector: payload.sector,
      website: payload.website || "",
      contactPerson: payload.contactPerson,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone,
      address: payload.address,
    },
  });
};

/**
 * Get company by ID
 */
export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  return await prisma.company.findUnique({
    where: { id: companyId },
  });
};

/**
 * Get company by User ID
 */
export const getCompanyByUserId = async (userId: string): Promise<Company | null> => {
  return await prisma.company.findFirst({
    where: { userId },
  });
};

/**
 * Get company by User ID with drives included
 */
export const getCompanyByUserIdWithDrives = async (userId: string) => {
  return await prisma.company.findFirst({
    where: { userId },
    include: {
      drives: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

/**
 * Get all companies with filtering and pagination
 */
export const getAllCompanies = async (filters?: {
  sector?: string;
  isApproved?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Company[]> => {
  const limit = filters?.limit || 10;
  const offset = filters?.offset || 0;

  return await prisma.company.findMany({
    where: {
      ...(filters?.sector && { sector: filters.sector }),
      ...(filters?.isApproved !== undefined && { isApproved: filters.isApproved }),
    },
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Update company profile
 */
export const updateCompany = async (
  companyId: string,
  payload: Partial<{
    companyName: string;
    sector: string;
    website: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    logo: string;
    isProfileComplete: boolean;
  }>
): Promise<Company> => {
  return await prisma.company.update({
    where: { id: companyId },
    data: payload,
  });
};

/**
 * Delete company profile
 */
export const deleteCompany = async (companyId: string): Promise<Company> => {
  return await prisma.company.delete({
    where: { id: companyId },
  });
};

/**
 * Check if company name already exists
 */
export const companyNameExists = async (companyName: string): Promise<boolean> => {
  const company = await prisma.company.findFirst({
    where: { companyName: { equals: companyName, mode: "insensitive" } },
  });
  return !!company;
};

/**
 * Check if registration ID already exists
 */
export const registrationIdExists = async (registrationId: string): Promise<boolean> => {
  const company = await prisma.company.findFirst({
    where: { registrationId: { equals: registrationId, mode: "insensitive" } },
  });
  return !!company;
};

/**
 * Get companies by sector
 */
export const getCompaniesBySector = async (sector: string): Promise<Company[]> => {
  return await prisma.company.findMany({
    where: { sector: { equals: sector, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get approved companies count
 */
export const getApprovedCompaniesCount = async (): Promise<number> => {
  return await prisma.company.count({
    where: { isApproved: true },
  });
};
