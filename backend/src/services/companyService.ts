import * as companyRepository from "../repositories/companyRepository";
import * as offerRepository from "../repositories/offerRepository";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";

/**
 * Company Service - Contains business logic for company operations
 * Validates input and calls repository layer
 */

/**
 * Create new company profile
 */
export const createCompanyProfile = async (
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
) => {
  // Validation
  if (!payload.companyName || !payload.companyName.trim()) {
    throw new AppError(400, "Company name is required");
  }

  if (!payload.registrationId || !payload.registrationId.trim()) {
    throw new AppError(400, "Registration ID is required");
  }

  if (!payload.sector || !payload.sector.trim()) {
    throw new AppError(400, "Sector is required");
  }

  // Check if company name already exists
  const nameExists = await companyRepository.companyNameExists(payload.companyName);
  if (nameExists) {
    throw new AppError(400, "Company name already registered");
  }

  // Check if registration ID already exists
  const regIdExists = await companyRepository.registrationIdExists(payload.registrationId);
  if (regIdExists) {
    throw new AppError(400, "Registration ID already registered");
  }

  // Check if company profile already exists for this user
  const existingCompany = await companyRepository.getCompanyByUserId(userId);
  if (existingCompany) {
    throw new AppError(400, "Company profile already exists for this user");
  }

  // Create company profile
  const company = await companyRepository.createCompany(userId, payload);

  return {
    id: company.id,
    companyName: company.companyName,
    registrationId: company.registrationId,
    sector: company.sector,
    website: company.website,
    contactPerson: company.contactPerson,
    contactEmail: company.contactEmail,
    contactPhone: company.contactPhone,
    address: company.address,
    isApproved: company.isApproved,
    createdAt: company.createdAt,
  };
};

/**
 * Get company profile by ID
 */
export const getCompanyProfile = async (companyId: string) => {
  const company = await companyRepository.getCompanyById(companyId);

  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  return {
    id: company.id,
    companyName: company.companyName,
    registrationId: company.registrationId,
    sector: company.sector,
    website: company.website,
    logo: company.logo,
    contactPerson: company.contactPerson,
    contactEmail: company.contactEmail,
    contactPhone: company.contactPhone,
    address: company.address,
    isProfileComplete: company.isProfileComplete,
    isApproved: company.isApproved,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
};

/**
 * Get company profile by User ID (for authenticated users)
 */
export const getCompanyProfileByUserId = async (userId: string) => {
  const company = await companyRepository.getCompanyByUserId(userId);

  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  return {
    id: company.id,
    companyName: company.companyName,
    registrationId: company.registrationId,
    sector: company.sector,
    website: company.website,
    logo: company.logo,
    contactPerson: company.contactPerson,
    contactEmail: company.contactEmail,
    contactPhone: company.contactPhone,
    address: company.address,
    isProfileComplete: company.isProfileComplete,
    isApproved: company.isApproved,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
};

/**
 * Update company profile
 */
export const updateCompanyProfile = async (
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
) => {
  // Validate company exists
  const company = await companyRepository.getCompanyById(companyId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  if (payload.companyName) {
    // Check if new name already exists
    const nameExists = await companyRepository.companyNameExists(payload.companyName);
    if (nameExists && payload.companyName !== company.companyName) {
      throw new AppError(400, "Company name already registered");
    }
  }

  // Update company
  const updatedCompany = await companyRepository.updateCompany(companyId, payload);

  return {
    id: updatedCompany.id,
    companyName: updatedCompany.companyName,
    registrationId: updatedCompany.registrationId,
    sector: updatedCompany.sector,
    website: updatedCompany.website,
    logo: updatedCompany.logo,
    contactPerson: updatedCompany.contactPerson,
    contactEmail: updatedCompany.contactEmail,
    contactPhone: updatedCompany.contactPhone,
    address: updatedCompany.address,
    isProfileComplete: updatedCompany.isProfileComplete,
    isApproved: updatedCompany.isApproved,
    updatedAt: updatedCompany.updatedAt,
  };
};

/**
 * Get all companies with filters
 */
export const getAllCompanies = async (filters?: {
  sector?: string;
  isApproved?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const companies = await companyRepository.getAllCompanies(filters);

  return {
    count: companies.length,
    companies: companies.map((c) => ({
      id: c.id,
      companyName: c.companyName,
      sector: c.sector,
      website: c.website,
      contactPerson: c.contactPerson,
      isApproved: c.isApproved,
      createdAt: c.createdAt,
    })),
  };
};

/**
 * Delete company profile
 */
export const deleteCompanyProfile = async (companyId: string) => {
  const company = await companyRepository.getCompanyById(companyId);

  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  await companyRepository.deleteCompany(companyId);

  return { message: "Company profile deleted successfully" };
};

/**
 * Get company statistics
 */
export const getCompanyStatistics = async () => {
  const approvedCount = await companyRepository.getApprovedCompaniesCount();
  const allCompanies = await companyRepository.getAllCompanies({ limit: 10000 });
  const totalCount = allCompanies.length;

  return {
    totalCompanies: totalCount,
    approvedCompanies: approvedCount,
    pendingCompanies: totalCount - approvedCount,
  };
};

type CompanyStatsSortBy = "name" | "joinedAt" | "role" | "salary" | "department";
type SortOrder = "asc" | "desc";

function getOfferDetailValue(details: unknown, keys: string[]): string {
  if (!details || typeof details !== "object") return "";
  const record = details as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function sortEmployees(
  employees: Array<Record<string, any>>,
  sortBy: CompanyStatsSortBy,
  sortOrder: SortOrder
) {
  const direction = sortOrder === "desc" ? -1 : 1;
  return [...employees].sort((left, right) => {
    let leftValue: string | number = "";
    let rightValue: string | number = "";

    switch (sortBy) {
      case "joinedAt":
        leftValue = left.joinedAt ? new Date(left.joinedAt).getTime() : 0;
        rightValue = right.joinedAt ? new Date(right.joinedAt).getTime() : 0;
        break;
      case "salary":
        leftValue = left.salary ?? 0;
        rightValue = right.salary ?? 0;
        break;
      case "role":
        leftValue = (left.role || "").toLowerCase();
        rightValue = (right.role || "").toLowerCase();
        break;
      case "department":
        leftValue = (left.department || "").toLowerCase();
        rightValue = (right.department || "").toLowerCase();
        break;
      case "name":
      default:
        leftValue = (left.name || "").toLowerCase();
        rightValue = (right.name || "").toLowerCase();
        break;
    }

    if (leftValue < rightValue) return -1 * direction;
    if (leftValue > rightValue) return 1 * direction;
    return 0;
  });
}

/**
 * Get authenticated company's dashboard statistics
 */
export const getMyCompanyStatistics = async (
  userId: string,
  options?: { sortBy?: CompanyStatsSortBy; sortOrder?: SortOrder }
) => {
  const company = await companyRepository.getCompanyByUserIdWithDrives(userId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const [acceptedOffers, totalApplications, totalOffersByCompany] = await Promise.all([
    offerRepository.getAcceptedOffersByCompanyId(company.id),
    prisma.driveApplication.count({ where: { drive: { companyId: company.id } } }),
    offerRepository.getOfferCountsByCompanyId(company.id),
  ]);

  const now = Date.now();
  const employees = acceptedOffers.map((offer) => {
    const richOffer = offer as any;
    const joinedAt = richOffer.joinDate ? richOffer.joinDate.toISOString() : richOffer.createdAt.toISOString();
    const tenureDays = Math.max(0, Math.floor((now - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24)));
    const offerDetails = richOffer.offerDetails as Record<string, unknown> | null;

    const name = `${richOffer.student?.firstName || ""} ${richOffer.student?.lastName || ""}`.trim() || richOffer.student?.rollNumber || "Unknown";
    const role = getOfferDetailValue(offerDetails, ["role", "position", "jobTitle", "title"]) || richOffer.drive?.title || "Employee";
    const department = getOfferDetailValue(offerDetails, ["department", "team", "division"]) || richOffer.student?.department || "Unknown";
    const location = getOfferDetailValue(offerDetails, ["location", "workLocation", "officeLocation"]) || richOffer.drive?.company?.address || "Remote";

    const status: 'newly_hired' | 'working' = tenureDays <= 30 ? 'newly_hired' : 'working';

    return {
      id: offer.id,
      name,
      rollNumber: richOffer.student?.rollNumber || "",
      role,
      department,
      location,
      salary: offer.salary,
      joinDate: joinedAt,
      joinedAt,
      tenureDays,
      status,
      driveTitle: richOffer.drive?.title || "",
      description: getOfferDetailValue(offerDetails, ["description", "notes", "project"] ) || richOffer.drive?.description || "",
      offerDetails: richOffer.offerDetails,
    };
  });

  const sortedEmployees = sortEmployees(
    employees,
    options?.sortBy || "name",
    options?.sortOrder || "asc"
  );

  const roleBreakdown = sortedEmployees.reduce<Record<string, number>>((accumulator, employee) => {
    accumulator[employee.role] = (accumulator[employee.role] || 0) + 1;
    return accumulator;
  }, {});

  const departmentBreakdown = sortedEmployees.reduce<Record<string, number>>((accumulator, employee) => {
    accumulator[employee.department] = (accumulator[employee.department] || 0) + 1;
    return accumulator;
  }, {});

  const projects = company.drives.map((drive) => ({
    id: drive.id,
    title: drive.title,
    description: drive.description,
    salary: drive.salary,
    interviewFormat: drive.interviewFormat,
    isActive: drive.isActive,
    createdAt: drive.createdAt,
  }));

  const newHires = sortedEmployees.filter((employee) => employee.status === "newly_hired").length;

  return {
    company: {
      id: company.id,
      companyName: company.companyName,
      registrationId: company.registrationId,
      sector: company.sector,
      website: company.website,
      logo: company.logo,
      contactPerson: company.contactPerson,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      address: company.address,
      isProfileComplete: company.isProfileComplete,
      isApproved: company.isApproved,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    },
    summary: {
      totalProjects: company.drives.length,
      activeProjects: company.drives.filter((drive) => drive.isActive).length,
      totalApplications,
      totalOffers: totalOffersByCompany.totalOffers,
      pendingOffers: totalOffersByCompany.pendingOffers,
      acceptedOffers: totalOffersByCompany.acceptedOffers,
      rejectedOffers: totalOffersByCompany.rejectedOffers,
      counteredOffers: totalOffersByCompany.counteredOffers,
      employeeStrength: sortedEmployees.length,
      newHires,
      workingEmployees: sortedEmployees.length - newHires,
    },
    roleBreakdown: Object.entries(roleBreakdown)
      .map(([role, count]) => ({ role, count }))
      .sort((left, right) => right.count - left.count || left.role.localeCompare(right.role)),
    departmentBreakdown: Object.entries(departmentBreakdown)
      .map(([department, count]) => ({ department, count }))
      .sort((left, right) => right.count - left.count || left.department.localeCompare(right.department)),
    projects,
    employees: sortedEmployees,
  };
};

/**
 * Get companies by sector
 */
export const getCompaniesBySector = async (sector: string) => {
  if (!sector || !sector.trim()) {
    throw new AppError(400, "Sector is required");
  }

  const companies = await companyRepository.getCompaniesBySector(sector);

  return {
    count: companies.length,
    sector,
    companies: companies.map((c) => ({
      id: c.id,
      companyName: c.companyName,
      website: c.website,
      contactPerson: c.contactPerson,
      isApproved: c.isApproved,
    })),
  };
};
