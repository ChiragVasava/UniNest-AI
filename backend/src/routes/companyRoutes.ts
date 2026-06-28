import { Router } from "express";
import * as companyController from "../controllers/companyController";
import { authMiddleware } from "../middleware/authMiddleware";

/**
 * Company Routes
 * Base path: /api/v1/companies
 */

const router = Router();

/**
 * Public Routes (no auth required)
 */

/**
 * GET /api/v1/companies
 * Get all companies (paginated and filterable)
 * Query params: industry, location, isVerified, limit, offset
 */
router.get("/", companyController.getAllCompanies);

/**
 * GET /api/v1/companies/statistics
 * Get company statistics
 */
router.get("/statistics", companyController.getCompanyStatistics);

/**
 * GET /api/v1/companies/by-sector/:sector
 * Get companies by sector
 */
router.get("/by-sector/:sector", companyController.getCompaniesBySector);

/**
 * GET /api/v1/companies/:id
 * Get specific company profile by ID
 */
router.get("/:id", companyController.getCompanyProfile);

/**
 * Protected Routes (auth required)
 */

/**
 * POST /api/v1/companies
 * Create new company profile
 * Body: companyName, industry, location, phone, website(optional), description(optional)
 */
router.post("/", authMiddleware, companyController.createCompanyProfile);

/**
 * GET /api/v1/companies/me/statistics
 * Get authenticated company's dashboard statistics
 */
router.get("/me/statistics", authMiddleware, companyController.getMyCompanyStatistics);

/**
 * GET /api/v1/companies/me/profile
 * Get current user's company profile
 * ⚠️ Must come BEFORE /:id route to avoid being caught by generic ID matcher
 */
router.get("/me/profile", authMiddleware, companyController.getMyCompanyProfile);

/**
 * PUT /api/v1/companies/:id
 * Update company profile
 * Body: any fields to update
 */
router.put("/:id", authMiddleware, companyController.updateCompanyProfile);

/**
 * DELETE /api/v1/companies/:id
 * Delete company profile
 */
router.delete("/:id", authMiddleware, companyController.deleteCompanyProfile);

export default router;
