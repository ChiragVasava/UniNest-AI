import { Router } from "express";
import * as universityController from "../controllers/universityController";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

const router = Router();

// Student onboarding
router.post("/students/manual", authMiddleware, universityController.manualOnboardStudent);
router.post("/students/bulk", authMiddleware, upload.single("file"), universityController.bulkOnboardStudents);
router.get("/students/pending", authMiddleware, universityController.getPendingStudents);

// Student verification & locks
router.post("/students/:id/verify", authMiddleware, universityController.verifyStudentProfile);
router.post("/students/:id/reject", authMiddleware, universityController.rejectStudentProfile);
router.post("/students/:id/lock", authMiddleware, universityController.toggleStudentLock);

// Hierarchy management (departments)
router.post("/departments", authMiddleware, universityController.createDepartment);
router.get("/departments", authMiddleware, universityController.getDepartments);
router.post("/departments/:id/sub-departments", authMiddleware, universityController.createSubDepartment);

// Hierarchy management (classes)
router.post("/sub-departments/:id/classes", authMiddleware, universityController.createClass);
router.get("/sub-departments/:id/classes", authMiddleware, universityController.getClasses);

// Company & Drive requests routing
router.post("/companies/invite", authMiddleware, universityController.inviteCompany);
router.get("/drives/requests", authMiddleware, universityController.getDriveRequests);
router.post("/drives/:id/approve", authMiddleware, universityController.approveDrive);
router.post("/drives/:id/reject", authMiddleware, universityController.rejectDrive);

export default router;
