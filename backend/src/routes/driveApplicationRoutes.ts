import { Router } from "express";
import * as driveApplicationController from "../controllers/driveApplicationController";
import { authMiddleware } from "../middleware/authMiddleware";

/**
 * Drive Application Routes
 * Base path: /api/v1/applications
 */

const router = Router();

/**
 * Public Routes (no auth required)
 */

/**
 * GET /api/v1/applications/statistics
 * Get application statistics
 */
router.get("/statistics", driveApplicationController.getApplicationStatistics);

/**
 * GET /api/v1/applications/:id
 * Get application by ID
 */
router.get("/:id", driveApplicationController.getApplicationById);

/**
 * Protected Routes (auth required)
 */

/**
 * POST /api/v1/applications
 * Apply for a drive (Student only)
 * Body: driveId
 */
router.post("/", authMiddleware, driveApplicationController.applyForDrive);

/**
 * GET /api/v1/applications/me/list
 * Get my applications (Student only)
 * Query params: limit, offset
 * Must come BEFORE /:driveId/students
 */
router.get("/me/list", authMiddleware, driveApplicationController.getMyApplications);

/**
 * GET /api/v1/applications/drive/:driveId
 * Get applications for a drive (Company only)
 * Query params: limit, offset, status
 */
router.get(
  "/drive/:driveId",
  authMiddleware,
  driveApplicationController.getApplicationsForDrive
);

/**
 * GET /api/v1/applications/drive/:driveId/ats
 * Get applications for a drive with ATS analysis (Company only)
 */
router.get(
  "/drive/:driveId/ats",
  authMiddleware,
  driveApplicationController.getApplicationsForDriveWithAts
);

/**
 * GET /api/v1/applications/drive/:driveId/shortlisted
 * Get shortlisted students for a drive (Company only)
 */
router.get(
  "/drive/:driveId/shortlisted",
  authMiddleware,
  driveApplicationController.getShortlistedStudents
);

/**
 * PUT /api/v1/applications/:id/status
 * Update application status (Company only)
 * Body: status, rejectionReason?
 */
router.put(
  "/:id/status",
  authMiddleware,
  driveApplicationController.updateApplicationStatus
);

/**
 * POST /api/v1/applications/:id/stage
 * Move application stage and append timeline event (Company only)
 * Body: stage, note?
 */
router.post("/:id/stage", authMiddleware, driveApplicationController.moveStage);

/**
 * GET /api/v1/applications/:id/timeline
 * Fetch application timeline with interviews (Company/Student access controlled)
 */
router.get("/:id/timeline", authMiddleware, driveApplicationController.getTimeline);

/**
 * POST /api/v1/applications/:id/interviews
 * Create interview slot for an application (Company only)
 * Body: scheduledAt, mode?, meetingLink?, notes?
 */
router.post("/:id/interviews", authMiddleware, driveApplicationController.createInterviewSlot);

/**
 * PUT /api/v1/applications/interviews/:interviewId
 * Update interview slot (Company only)
 */
router.put(
  "/interviews/:interviewId",
  authMiddleware,
  driveApplicationController.updateInterviewSlot
);

/**
 * POST /api/v1/applications/interviews/:interviewId/confirm
 * Confirm interview slot (Student only)
 */
router.post(
  "/interviews/:interviewId/confirm",
  authMiddleware,
  driveApplicationController.confirmInterviewSlot
);

/**
 * POST /api/v1/applications/interviews/:interviewId/reschedule
 * Request interview reschedule (Student only)
 */
router.post(
  "/interviews/:interviewId/reschedule",
  authMiddleware,
  driveApplicationController.requestInterviewReschedule
);

/**
 * DELETE /api/v1/applications/:id
 * Withdraw application (Student only)
 */
router.delete("/:id", authMiddleware, driveApplicationController.withdrawApplication);

export default router;
