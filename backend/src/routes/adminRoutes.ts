import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// University tenant controls
router.post("/universities", authMiddleware, adminController.createUniversityTenant);
router.get("/universities", authMiddleware, adminController.getUniversities);
router.post("/universities/:id/approve", authMiddleware, adminController.approveUniversity);
router.post("/universities/:id/suspend", authMiddleware, adminController.suspendUniversity);
router.post("/universities/:id/billing", authMiddleware, adminController.updateBillingPlan);

// Global statistics dashboard
router.get("/dashboard/metrics", authMiddleware, adminController.getAdminMetrics);

// Global student search/oversight
router.get("/students", authMiddleware, adminController.globalSearchStudents);

export default router;
