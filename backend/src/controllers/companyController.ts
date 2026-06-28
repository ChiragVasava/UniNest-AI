import { Request, Response, NextFunction } from "express";
import * as companyService from "../services/companyService";
import { AppError } from "../middleware/errorHandler";

/**
 * Company Controller - Request handlers for company endpoints
 * Handles: receiving requests, parsing input, calling service, sending response
 */

/**
 * POST /api/v1/companies
 * Create new company profile
 */
export const createCompanyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please log in.");
    }

    const { companyName, registrationId, sector, website, contactPerson, contactEmail, contactPhone, address } = req.body;

    const result = await companyService.createCompanyProfile(userId, {
      companyName,
      registrationId,
      sector,
      website,
      contactPerson,
      contactEmail,
      contactPhone,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Company profile created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/companies/:id
 * Get company profile by ID
 */
export const getCompanyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "Company ID is required");
    }

    const result = await companyService.getCompanyProfile(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/companies/me/profile
 * Get current user's company profile
 */
export const getMyCompanyProfile = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (_req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found");
    }

    const result = await companyService.getCompanyProfileByUserId(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/companies/:id
 * Update company profile
 */
export const updateCompanyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "Company ID is required");
    }

    const payload = req.body;

    const result = await companyService.updateCompanyProfile(id, payload);

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/companies
 * Get all companies with filters
 */
export const getAllCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sector, isApproved, limit, offset } = req.query;

    const filters = {
      sector: sector as string,
      isApproved: isApproved === "true",
      limit: limit ? parseInt(limit as string) : 10,
      offset: offset ? parseInt(offset as string) : 0,
    };

    const result = await companyService.getAllCompanies(filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/companies/:id
 * Delete company profile
 */
export const deleteCompanyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "Company ID is required");
    }

    const result = await companyService.deleteCompanyProfile(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/companies/statistics
 * Get company statistics
 */
export const getCompanyStatistics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await companyService.getCompanyStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/companies/me/statistics
 * Get authenticated company's dashboard statistics
 */
export const getMyCompanyStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found");
    }

    const sortBy = req.query.sortBy as "name" | "joinedAt" | "role" | "salary" | "department" | undefined;
    const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined;

    const stats = await companyService.getMyCompanyStatistics(userId, {
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/companies/by-sector/:sector
 * Get companies by sector
 */
export const getCompaniesBySector = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sector } = req.params;

    if (!sector) {
      throw new AppError(400, "Sector is required");
    }

    const result = await companyService.getCompaniesBySector(sector);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
