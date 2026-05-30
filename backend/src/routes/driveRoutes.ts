import { Router } from "express";
import * as driveController from "../controllers/driveController";
import { authMiddleware } from "../middleware/authMiddleware";

/**
 * Drive Routes
 * Base path: /api/v1/drives
 */

const router = Router();

/**
 * Public Routes (no auth required)
 */

/**
 * GET /api/v1/drives
 * Get all active drives (paginated and filterable)
 * Query params: limit, offset
 */
router.get("/", driveController.getAllActiveDrives);

/**
 * GET /api/v1/drives/statistics
 * Get drive statistics
 */
router.get("/statistics", driveController.getDriveStatistics);

/**
 * GET /api/v1/drives/:id
 * Get drive by ID
 */
router.get("/:id", driveController.getDriveById);

/**
 * Protected Routes (auth required)
 */

/**
 * POST /api/v1/drives
 * Create a new drive (Company only)
 * Body: title, description?, jobDescription?, salary?, cgpaCutoff?, eligibleDepartments[], eligibleBatches[], requiredSkills[], interviewFormat?
 */
router.post("/", authMiddleware, driveController.createDrive);

/**
 * GET /api/v1/drives/me/company
 * Get my company's drives (Protected - Company only)
 * Must come BEFORE /:id route
 */
router.get("/me/company", authMiddleware, driveController.getMyCompanyDrives);

/**
 * GET /api/v1/drives/eligible/list
 * Get eligible drives for student (Protected - Student only)
 * Filters by department, batch, CGPA
 * Must come BEFORE /:id route
 */
router.get(
  "/eligible/list",
  authMiddleware,
  driveController.getEligibleDrivesForStudent
);

/**
 * PUT /api/v1/drives/:id
 * Update drive (Company only)
 * Body: title?, description?, salary?, cgpaCutoff?, isActive?, ...
 */
router.put("/:id", authMiddleware, driveController.updateDrive);

/**
 * DELETE /api/v1/drives/:id
 * Delete drive (Company only)
 */
router.delete("/:id", authMiddleware, driveController.deleteDrive);

export default router;
