import { Request, Response, NextFunction } from "express";
import * as offerService from "../services/offerService";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../config/database";

/**
 * Create offer (Company only)
 */
export const createOffer = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const { studentId, driveId, salary, joinDate, expiresAt, offerDetails } = req.body;

    if (!studentId || !driveId || !salary) {
      throw new AppError(400, "studentId, driveId, and salary are required");
    }

    const offer = await offerService.createOffer(userId, {
      studentId,
      driveId,
      salary,
      joinDate,
      expiresAt,
      offerDetails,
    });

    _res.status(201).json({
      status: "success",
      statusCode: 201,
      message: offer.message,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get offer by ID
 */
export const getOfferById = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const offer = await offerService.getOfferById(id);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my offers (Student only)
 */
export const getMyOffers = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    const offers = await offerService.getMyOffers(studentId, { limit, offset });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get offers for a drive (Company only)
 */
export const getOffersForDrive = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { driveId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    const offers = await offerService.getOffersForDrive(driveId, userId, {
      limit,
      offset,
    });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all offers (Admin only)
 */
export const getAllOffers = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    const offers = await offerService.getAllOffers({ limit, offset });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept offer (Student only)
 */
export const acceptOffer = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const offer = await offerService.acceptOffer(id, studentId);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: offer.message,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject offer (Student only)
 */
export const rejectOffer = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const offer = await offerService.rejectOffer(id, studentId);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: offer.message,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Counter offer (Student only)
 */
export const counterOffer = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const { counterOfferText, counterSalary } = req.body;

    if (!counterOfferText) {
      throw new AppError(400, "counterOfferText is required");
    }

    const parsedSalary = counterSalary !== undefined ? parseFloat(counterSalary) : undefined;

    const offer = await offerService.counterOffer(id, studentId, counterOfferText, parsedSalary);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: offer.message,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Company responds to counter offer
 */
export const respondToCounterOffer = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const decision = (req.body?.decision || "").toUpperCase() as "ACCEPT" | "REJECT";
    const note = req.body?.note as string | undefined;
    const response = await offerService.respondToCounterOffer(id, userId, decision, note);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      message: response.message,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get offer audit trail
 */
export const getOfferAuditTrail = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, "User ID not found. Please authenticate.");
    }

    const auditTrail = await offerService.getOfferAuditTrail(id, userId);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: auditTrail,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get offer statistics
 */
export const getOfferStatistics = async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const stats = await offerService.getOfferStatistics();

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get accepted offers (Admin view)
 */
export const getAcceptedOffers = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string)
      : undefined;

    const offers = await offerService.getAcceptedOffers({ limit, offset });

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if student has accepted offer (Student only)
 */
export const checkAcceptedOffer = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const studentId = (req as any).userId;

    if (!studentId) {
      throw new AppError(401, "Student ID not found. Please register as a student.");
    }

    const hasAccepted = await offerService.checkAcceptedOffer(studentId);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: {
        hasAcceptedOffer: hasAccepted,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/offers/:id/generate-email
 * Generate an AI offer email draft for the candidate
 */
export const generateEmailTemplate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        student: true,
        drive: {
          include: { company: true }
        }
      }
    });

    if (!offer) {
      throw new AppError(404, "Offer not found");
    }

    const studentName = `${offer.student.firstName || ""} ${offer.student.lastName || ""}`.trim() || "Candidate";
    const companyName = offer.drive.company.companyName;
    const roleName = offer.drive.title;
    const salary = offer.salary;

    const { generateOfferEmail } = await import("../services/atsService");
    const result = await generateOfferEmail(studentName, companyName, roleName, salary);

    _res.status(200).json({
      status: "success",
      statusCode: 200,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
