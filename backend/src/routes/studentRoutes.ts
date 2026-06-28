import { Router } from "express";
import * as studentController from "../controllers/studentController";
import { authMiddleware } from "../middleware/authMiddleware";

/**
 * Student Routes
 * Base path: /api/v1/students
 */

const router = Router();

/**
 * Public Routes (no auth required)
 */

/**
 * GET /api/v1/students
 * Get all students (paginated and filterable)
 * Query params: department, batch, cgpaMin, cgpaMax, isVerified, limit, offset
 */
router.get("/", studentController.getAllStudents);

/**
 * GET /api/v1/students/statistics
 * Get student statistics by department
 */
router.get("/statistics", studentController.getStudentStatistics);

/**
 * GET /api/v1/students/eligible/:department
 * Get eligible students for a drive
 * Query param: cgpaMin (required)
 */
router.get("/eligible/:department", studentController.getEligibleStudents);

/**
 * Protected Routes (auth required)
 */

/**
 * POST /api/v1/students
 * Create new student profile
 * Body: firstName, lastName, rollNumber, phone, department, batch, cgpa, college(optional)
 */
router.post("/", authMiddleware, studentController.createStudentProfile);

/**
 * GET /api/v1/students/me/profile
 * Get current user's student profile
 * ⚠️ Must come BEFORE /:id route to avoid being caught by generic ID matcher
 */
router.get("/me/profile", authMiddleware, studentController.getMyStudentProfile);

/**
 * GET /api/v1/students/:id
 * Get specific student profile by ID
 */
router.get("/:id", studentController.getStudentProfile);

/**
 * PUT /api/v1/students/:id
 * Update student profile
 * Body: any fields to update
 */
router.put("/:id", authMiddleware, studentController.updateStudentProfile);

/**
 * DELETE /api/v1/students/:id
 * Delete student profile
 */
router.delete("/:id", authMiddleware, studentController.deleteStudentProfile);

export default router;
