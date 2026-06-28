import { Router } from "express";
import * as offerController from "../controllers/offerController";
import { authMiddleware } from "../middleware/authMiddleware";

/**
 * Offer Routes
 * Base path: /api/v1/offers
 */

const router = Router();

/**
 * Public Routes (no auth required)
 */

/**
 * GET /api/v1/offers/statistics
 * Get offer statistics
 */
router.get("/statistics", offerController.getOfferStatistics);

/**
 * GET /api/v1/offers/accepted
 * Get accepted offers (Admin view)
 * Query params: limit, offset
 */
router.get("/accepted", offerController.getAcceptedOffers);

/**
 * GET /api/v1/offers
 * Get all offers (Admin view)
 * Query params: limit, offset
 */
router.get("/", offerController.getAllOffers);

/**
 * GET /api/v1/offers/:id
 * Get offer by ID
 */
router.get("/:id", offerController.getOfferById);

/**
 * Protected Routes (auth required)
 */

/**
 * POST /api/v1/offers
 * Create offer (Company only)
 * Body: studentId, driveId, salary, joinDate?, offerDetails?
 */
router.post("/", authMiddleware, offerController.createOffer);

/**
 * GET /api/v1/offers/me/list
 * Get my offers (Student only)
 * Query params: limit, offset
 * Must come BEFORE /:id and /:id/* routes
 */
router.get("/me/list", authMiddleware, offerController.getMyOffers);

/**
 * GET /api/v1/offers/me/accepted
 * Check if student has accepted offer (Student only)
 * Must come BEFORE /:id route
 */
router.get("/me/accepted", authMiddleware, offerController.checkAcceptedOffer);

/**
 * GET /api/v1/offers/drive/:driveId
 * Get offers for a drive (Company only)
 * Query params: limit, offset
 * Must come BEFORE /:id route
 */
router.get("/drive/:driveId", authMiddleware, offerController.getOffersForDrive);

/**
 * POST /api/v1/offers/:id/accept
 * Accept offer (Student only)
 */
router.post("/:id/accept", authMiddleware, offerController.acceptOffer);

/**
 * POST /api/v1/offers/:id/reject
 * Reject offer (Student only)
 */
router.post("/:id/reject", authMiddleware, offerController.rejectOffer);

/**
 * POST /api/v1/offers/:id/counter
 * Counter offer (Student only)
 * Body: counterOfferText
 */
router.post("/:id/counter", authMiddleware, offerController.counterOffer);

/**
 * POST /api/v1/offers/:id/counter/respond
 * Company responds to counter offer
 * Body: decision(ACCEPT|REJECT), note?
 */
router.post(
	"/:id/counter/respond",
	authMiddleware,
	offerController.respondToCounterOffer
);

/**
 * GET /api/v1/offers/:id/audit
 * Get offer audit trail (Company/Student access controlled)
 */
router.get("/:id/audit", authMiddleware, offerController.getOfferAuditTrail);

export default router;
