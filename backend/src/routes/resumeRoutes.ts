import { Router } from "express";
import * as resumeController from "../controllers/resumeController";
import { authMiddleware } from "../middleware/authMiddleware";
import { resumeUpload } from "../middleware/resumeUpload";

/**
 * Resume Routes
 * Base path: /api/v1/resumes
 */

const router = Router();

/**
 * Public Routes (no auth required)
 */

/**
 * GET /api/v1/resumes/statistics
 * Get resume statistics
 */
router.get("/statistics", resumeController.getResumeStatistics);

/**
 * GET /api/v1/resumes/pending
 * Get pending resumes for verification (paginated)
 * Query params: limit, offset
 */
router.get("/pending", resumeController.getPendingResumes);

/**
 * GET /api/v1/resumes
 * Get all resumes (for verification dashboard)
 * Query params: limit, offset, isVerified
 */
router.get("/", resumeController.getAllResumes);

/**
 * Protected Routes (auth required)
 */

/**
 * POST /api/v1/resumes
 * Upload resume (Student only)
 * Body: fileName, filePath, fileSize, extractedText?
 */
router.post("/", authMiddleware, resumeUpload.single("resume"), resumeController.uploadResume);

/**
 * POST /api/v1/resumes/:id/match
 * Run a simple keyword-based match against a resume's extracted text
 */
router.post("/:id/match", authMiddleware, resumeController.matchResume);

/**
 * GET /api/v1/resumes/me/list
 * Get my resumes (Student only)
 * Query params: limit, offset
 * Must come BEFORE /:id route
 */
router.get("/me/list", authMiddleware, resumeController.getMyResumes);

/**
 * GET /api/v1/resumes/me/verified
 * Check if student has verified resume (Student only)
 * Must come BEFORE /:id route
 */
router.get("/me/verified", authMiddleware, resumeController.checkVerifiedResume);

/**
 * GET /api/v1/resumes/:id
 * Get resume by ID
 */
router.get("/:id", resumeController.getResumeById);

/**
 * PUT /api/v1/resumes/:id
 * Update resume (Student only - re-upload)
 * Body: fileName, filePath, fileSize, extractedText?
 */
router.put("/:id", authMiddleware, resumeUpload.single("resume"), resumeController.updateResume);

/**
 * POST /api/v1/resumes/:id/verify
 * Verify resume (Admin only)
 * Body: verifyComment?
 */
router.post("/:id/verify", authMiddleware, resumeController.verifyResume);

/**
 * POST /api/v1/resumes/:id/reject
 * Reject resume (Admin only)
 * Body: verifyComment
 */
router.post("/:id/reject", authMiddleware, resumeController.rejectResume);

/**
 * DELETE /api/v1/resumes/:id
 * Delete resume (Student only)
 */
router.delete("/:id", authMiddleware, resumeController.deleteResume);

export default router;
