import * as offerRepository from "../repositories/offerRepository";
import * as driveRepository from "../repositories/driveRepository";
import * as studentRepository from "../repositories/studentRepository";
import * as companyRepository from "../repositories/companyRepository";
import { AppError } from "../middleware/errorHandler";
import { OfferAuditAction, OfferStatus } from "@prisma/client";
import { prisma } from "../config/database";

const addOfferAudit = async (
  offerId: string,
  action: OfferAuditAction,
  actorUserId?: string,
  note?: string,
  metadata?: any
) => {
  await prisma.offerAudit.create({
    data: {
      offerId,
      action,
      actorUserId,
      note,
      metadata,
    },
  });
};

const expireOfferIfNeeded = async (offerId: string) => {
  const offer = await offerRepository.getOfferById(offerId);
  if (!offer) {
    return null;
  }

  if (
    offer.status === OfferStatus.PENDING &&
    offer.expiresAt &&
    new Date(offer.expiresAt).getTime() < Date.now()
  ) {
    const expired = await offerRepository.updateOfferStatus(offerId, OfferStatus.EXPIRED);
    await addOfferAudit(
      offerId,
      OfferAuditAction.EXPIRED,
      undefined,
      "Offer automatically expired after deadline"
    );
    return expired;
  }

  return offer;
};

const sweepExpiredOffers = async () => {
  const expiredPending = await prisma.offer.findMany({
    where: {
      status: OfferStatus.PENDING,
      expiresAt: { lt: new Date() },
    },
    select: { id: true },
  });

  if (!expiredPending.length) {
    return;
  }

  await prisma.offer.updateMany({
    where: {
      id: { in: expiredPending.map((o) => o.id) },
      status: OfferStatus.PENDING,
    },
    data: { status: OfferStatus.EXPIRED },
  });

  await prisma.offerAudit.createMany({
    data: expiredPending.map((o) => ({
      offerId: o.id,
      action: OfferAuditAction.EXPIRED,
      note: "Offer automatically expired after deadline",
    })),
  });
};

/**
 * Create offer (Company only, typically done after application approval)
 */
export const createOffer = async (
  companyUserId: string,
  payload: {
    studentId: string;
    driveId: string;
    salary: number;
    joinDate?: string;
    expiresAt?: string;
    offerDetails?: any;
  }
) => {
  const company = await companyRepository.getCompanyByUserId(companyUserId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const companyId = company.id;

  // Validate student exists
  const student = await studentRepository.getStudentById(payload.studentId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  // Validate drive exists and belongs to company
  const drive = await driveRepository.getDriveById(payload.driveId);
  if (!drive) {
    throw new AppError(404, "Drive not found");
  }

  if (drive.companyId !== companyId) {
    throw new AppError(403, "You can only create offers for your own drives");
  }

  // Validate salary
  if (!payload.salary || payload.salary <= 0) {
    throw new AppError(400, "Salary must be greater than 0");
  }

  // Validate join date if provided
  let joinDate = undefined;
  if (payload.joinDate) {
    joinDate = new Date(payload.joinDate);
    if (isNaN(joinDate.getTime())) {
      throw new AppError(400, "Invalid date format for joinDate");
    }
    // Join date should be in future
    if (joinDate < new Date()) {
      throw new AppError(400, "Join date must be in the future");
    }
  }

  let expiresAt = undefined;
  if (payload.expiresAt) {
    expiresAt = new Date(payload.expiresAt);
    if (isNaN(expiresAt.getTime())) {
      throw new AppError(400, "Invalid date format for expiresAt");
    }
    if (expiresAt < new Date()) {
      throw new AppError(400, "Offer expiry must be in the future");
    }
  }

  const offer = await offerRepository.createOffer({
    studentId: payload.studentId,
    driveId: payload.driveId,
    salary: payload.salary,
    joinDate,
    expiresAt,
    offerDetails: payload.offerDetails,
  });

  await addOfferAudit(
    offer.id,
    OfferAuditAction.SENT,
    companyUserId,
    "Offer sent to candidate",
    {
      salary: offer.salary,
      joinDate: offer.joinDate,
      expiresAt: offer.expiresAt,
    }
  );

  return {
    id: offer.id,
    status: offer.status,
    salary: offer.salary,
    joinDate: offer.joinDate,
    expiresAt: offer.expiresAt,
    offerDetails: offer.offerDetails,
    studentName: `${(offer as any).student?.firstName} ${(offer as any).student?.lastName}`,
    driveTitle: (offer as any).drive?.title,
    companyName: (offer as any).drive?.company?.companyName,
    createdAt: offer.createdAt,
    message: "Offer created successfully",
  };
};

/**
 * Get offer by ID
 */
export const getOfferById = async (offerId: string) => {
  const expiredOffer = await expireOfferIfNeeded(offerId);
  const offer = expiredOffer || (await offerRepository.getOfferById(offerId));
  if (!offer) {
    throw new AppError(404, "Offer not found");
  }

  const auditTrail = await prisma.offerAudit.findMany({
    where: { offerId },
    orderBy: { createdAt: "asc" },
  });

  return {
    id: offer.id,
    status: offer.status,
    salary: offer.salary,
    joinDate: offer.joinDate,
    expiresAt: offer.expiresAt,
    counterOfferText: offer.counterOfferText,
    offerDetails: offer.offerDetails,
    student: {
      id: (offer as any).student?.id,
      name: `${(offer as any).student?.firstName} ${(offer as any).student?.lastName}`,
      rollNumber: (offer as any).student?.rollNumber,
      phone: (offer as any).student?.phone,
    },
    drive: {
      id: (offer as any).drive?.id,
      title: (offer as any).drive?.title,
      description: (offer as any).drive?.description,
      salary: (offer as any).drive?.salary,
      interviewFormat: (offer as any).drive?.interviewFormat,
      company: {
        id: (offer as any).drive?.company?.id,
        name: (offer as any).drive?.company?.companyName,
        sector: (offer as any).drive?.company?.sector,
        email: (offer as any).drive?.company?.contactEmail,
        phone: (offer as any).drive?.company?.contactPhone,
        address: (offer as any).drive?.company?.address,
      },
    },
    auditTrail,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
  };
};

/**
 * Get my offers (Student only)
 */
export const getMyOffers = async (
  studentUserId: string,
  filters?: { limit?: number; offset?: number }
) => {
  await sweepExpiredOffers();

  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const studentId = student.id;

  const offers = await offerRepository.getStudentOffers(studentId, filters);

  return {
    count: offers.length,
    offers: offers.map((o) => ({
      id: o.id,
      status: o.status,
      salary: o.salary,
      joinDate: o.joinDate,
      expiresAt: o.expiresAt,
      counterOfferText: o.counterOfferText,
      offerDetails: o.offerDetails,
      drive: {
        id: (o as any).drive?.id,
        title: (o as any).drive?.title,
        description: (o as any).drive?.description,
        jobDescription: (o as any).drive?.jobDescription,
        company: (o as any).drive?.company?.companyName,
        companyAddress: (o as any).drive?.company?.address,
      },
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
  };
};

/**
 * Get offers for a drive (Company only)
 */
export const getOffersForDrive = async (
  driveId: string,
  companyUserId: string,
  filters?: { limit?: number; offset?: number }
) => {
  await sweepExpiredOffers();

  const company = await companyRepository.getCompanyByUserId(companyUserId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const companyId = company.id;

  // Validate drive exists and belongs to company
  const drive = await driveRepository.getDriveById(driveId);
  if (!drive) {
    throw new AppError(404, "Drive not found");
  }

  if (drive.companyId !== companyId) {
    throw new AppError(403, "You can only view offers for your own drives");
  }

  const offers = await offerRepository.getOffersByDriveId(driveId, filters);

  return {
    count: offers.length,
    offers: offers.map((o) => ({
      id: o.id,
      status: o.status,
      salary: o.salary,
      joinDate: o.joinDate,
      expiresAt: o.expiresAt,
      counterOfferText: o.counterOfferText,
      offerDetails: o.offerDetails,
      student: {
        id: (o as any).student?.id,
        name: `${(o as any).student?.firstName} ${(o as any).student?.lastName}`,
        rollNumber: (o as any).student?.rollNumber,
      },
      createdAt: o.createdAt,
    })),
  };
};

/**
 * Get all offers (Admin view)
 */
export const getAllOffers = async (filters?: {
  limit?: number;
  offset?: number;
}) => {
  const result = await offerRepository.getAllOffers(filters);

  return {
    total: result.count,
    offers: result.offers.map((o) => ({
      id: o.id,
      status: o.status,
      salary: o.salary,
      student: {
        rollNumber: (o as any).student?.rollNumber,
        name: `${(o as any).student?.firstName} ${(o as any).student?.lastName}`,
      },
      drive: {
        title: (o as any).drive?.title,
        company: (o as any).drive?.company?.companyName,
      },
      createdAt: o.createdAt,
    })),
  };
};

/**
 * Accept offer (Student only)
 */
export const acceptOffer = async (offerId: string, studentUserId: string) => {
  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const studentId = student.id;

  const offer = await expireOfferIfNeeded(offerId);
  if (!offer) {
    throw new AppError(404, "Offer not found");
  }

  if (offer.studentId !== studentId) {
    throw new AppError(403, "You can only accept your own offers");
  }

  if (offer.status === OfferStatus.REJECTED) {
    throw new AppError(400, "Cannot accept a rejected offer");
  }

  if (offer.status === OfferStatus.ACCEPTED) {
    throw new AppError(400, "This offer is already accepted");
  }

  if (offer.status === OfferStatus.EXPIRED) {
    throw new AppError(400, "Cannot accept an expired offer");
  }

  const updatedOffer = await offerRepository.updateOfferStatus(offerId, OfferStatus.ACCEPTED);
  await addOfferAudit(offerId, OfferAuditAction.ACCEPTED, studentUserId, "Offer accepted");

  return {
    id: updatedOffer.id,
    status: updatedOffer.status,
    studentName: `${(updatedOffer as any).student?.firstName} ${(updatedOffer as any).student?.lastName}`,
    driveTitle: (updatedOffer as any).drive?.title,
    companyName: (updatedOffer as any).drive?.company?.companyName,
    message: "Offer accepted successfully",
  };
};

/**
 * Reject offer (Student only)
 */
export const rejectOffer = async (offerId: string, studentUserId: string) => {
  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const studentId = student.id;

  const offer = await expireOfferIfNeeded(offerId);
  if (!offer) {
    throw new AppError(404, "Offer not found");
  }

  if (offer.studentId !== studentId) {
    throw new AppError(403, "You can only reject your own offers");
  }

  if (offer.status === OfferStatus.ACCEPTED) {
    throw new AppError(400, "Cannot reject an accepted offer");
  }

  if (offer.status === OfferStatus.EXPIRED) {
    throw new AppError(400, "Cannot reject an expired offer");
  }

  const updatedOffer = await offerRepository.updateOfferStatus(offerId, OfferStatus.REJECTED);
  await addOfferAudit(offerId, OfferAuditAction.REJECTED, studentUserId, "Offer rejected");

  return {
    id: updatedOffer.id,
    status: updatedOffer.status,
    message: "Offer rejected successfully",
  };
};

/**
 * Counter offer (Student only)
 */
export const counterOffer = async (
  offerId: string,
  studentUserId: string,
  counterOfferText: string
) => {
  if (!counterOfferText || counterOfferText.trim().length === 0) {
    throw new AppError(400, "Counter offer text is required");
  }

  if (counterOfferText.length > 500) {
    throw new AppError(400, "Counter offer text cannot exceed 500 characters");
  }

  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const studentId = student.id;

  const offer = await expireOfferIfNeeded(offerId);
  if (!offer) {
    throw new AppError(404, "Offer not found");
  }

  if (offer.studentId !== studentId) {
    throw new AppError(403, "You can only counter your own offers");
  }

  if (offer.status !== OfferStatus.PENDING) {
    throw new AppError(400, "Can only counter pending offers");
  }

  const updatedOffer = await offerRepository.updateOfferStatus(
    offerId,
    OfferStatus.COUNTERED,
    counterOfferText
  );

  await addOfferAudit(
    offerId,
    OfferAuditAction.COUNTERED,
    studentUserId,
    "Candidate submitted counter offer",
    { counterOfferText }
  );

  return {
    id: updatedOffer.id,
    status: updatedOffer.status,
    counterOfferText: updatedOffer.counterOfferText,
    message: "Counter offer submitted successfully",
  };
};

/**
 * Company response to counter offer (accept/reject)
 */
export const respondToCounterOffer = async (
  offerId: string,
  companyUserId: string,
  decision: "ACCEPT" | "REJECT",
  note?: string
) => {
  const company = await companyRepository.getCompanyByUserId(companyUserId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const offer = await expireOfferIfNeeded(offerId);
  if (!offer) {
    throw new AppError(404, "Offer not found");
  }

  const drive = await driveRepository.getDriveById(offer.driveId);
  if (!drive || drive.companyId !== company.id) {
    throw new AppError(403, "You can only respond to counters for your own drives");
  }

  if (offer.status !== OfferStatus.COUNTERED) {
    throw new AppError(400, "Offer is not in COUNTERED state");
  }

  const normalized = decision.toUpperCase();
  if (normalized !== "ACCEPT" && normalized !== "REJECT") {
    throw new AppError(400, "decision must be ACCEPT or REJECT");
  }

  const nextStatus = normalized === "ACCEPT" ? OfferStatus.PENDING : OfferStatus.REJECTED;
  const updated = await offerRepository.updateOfferStatus(offerId, nextStatus);

  await addOfferAudit(
    offerId,
    OfferAuditAction.COUNTER_RESPONSE,
    companyUserId,
    normalized === "ACCEPT"
      ? "Company accepted counter proposal and reverted offer to pending"
      : "Company rejected counter proposal",
    {
      decision: normalized,
      note: note || null,
    }
  );

  return {
    id: updated.id,
    status: updated.status,
    message:
      normalized === "ACCEPT"
        ? "Counter offer accepted. Waiting for student final decision."
        : "Counter offer rejected.",
  };
};

export const getOfferAuditTrail = async (offerId: string, userId: string) => {
  const offer = await offerRepository.getOfferById(offerId);
  if (!offer) {
    throw new AppError(404, "Offer not found");
  }

  const [student, company] = await Promise.all([
    studentRepository.getStudentByUserId(userId),
    companyRepository.getCompanyByUserId(userId),
  ]);

  if (student && offer.studentId !== student.id) {
    throw new AppError(403, "You can only view your own offer audit trail");
  }

  if (company) {
    const drive = await driveRepository.getDriveById(offer.driveId);
    if (!drive || drive.companyId !== company.id) {
      throw new AppError(403, "You can only view audit trail for your own offers");
    }
  }

  if (!student && !company) {
    throw new AppError(403, "You are not authorized to view this audit trail");
  }

  return await prisma.offerAudit.findMany({
    where: { offerId },
    orderBy: { createdAt: "asc" },
  });
};

/**
 * Get offer statistics
 */
export const getOfferStatistics = async () => {
  const stats = await offerRepository.getOfferStatistics();

  return {
    totalOffers: stats.totalOffers,
    pending: stats.pending,
    accepted: stats.accepted,
    rejected: stats.rejected,
    countered: stats.countered,
    acceptanceRate: stats.acceptanceRate,
  };
};

/**
 * Get accepted offers (Admin view)
 */
export const getAcceptedOffers = async (filters?: {
  limit?: number;
  offset?: number;
}) => {
  const offers = await offerRepository.getAcceptedOffers(filters);

  return {
    count: offers.length,
    offers: offers.map((o) => ({
      id: o.id,
      student: {
        id: (o as any).student?.id,
        name: `${(o as any).student?.firstName} ${(o as any).student?.lastName}`,
        rollNumber: (o as any).student?.rollNumber,
      },
      drive: {
        title: (o as any).drive?.title,
        company: (o as any).drive?.company?.companyName,
      },
      salary: o.salary,
      joinDate: o.joinDate,
      createdAt: o.createdAt,
    })),
  };
};

/**
 * Check if student has accepted offer
 */
export const checkAcceptedOffer = async (studentUserId: string): Promise<boolean> => {
  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const studentId = student.id;

  return await offerRepository.hasAcceptedOffer(studentId);
};
