import { prisma } from "../config/database";
import { Offer, OfferStatus } from "@prisma/client";

/**
 * Create offer
 */
export const createOffer = async (data: {
  studentId: string;
  driveId: string;
  salary: number;
  joinDate?: Date;
  expiresAt?: Date;
  offerDetails?: any;
}): Promise<Offer> => {
  return await prisma.offer.create({
    data: {
      studentId: data.studentId,
      driveId: data.driveId,
      salary: data.salary,
      joinDate: data.joinDate,
      expiresAt: data.expiresAt,
      offerDetails: data.offerDetails,
      status: OfferStatus.PENDING,
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
        },
      },
      drive: {
        select: {
          id: true,
          title: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Get offer by ID
 */
export const getOfferById = async (offerId: string): Promise<Offer | null> => {
  return await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          phone: true,
        },
      },
      drive: {
        select: {
          id: true,
          title: true,
          description: true,
          salary: true,
          company: {
            select: {
              id: true,
              companyName: true,
              contactEmail: true,
              contactPhone: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Get student's offers
 */
export const getStudentOffers = async (
  studentId: string,
  filters?: { limit?: number; offset?: number }
): Promise<Offer[]> => {
  return await prisma.offer.findMany({
    where: { studentId },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      drive: {
        select: {
          id: true,
          title: true,
          salary: true,
          description: true,
          jobDescription: true,
          interviewFormat: true,
          company: {
            select: {
              id: true,
              companyName: true,
              sector: true,
              website: true,
              contactPerson: true,
              contactEmail: true,
              contactPhone: true,
              address: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Get offers for a drive (by company)
 */
export const getOffersByDriveId = async (
  driveId: string,
  filters?: { limit?: number; offset?: number }
): Promise<Offer[]> => {
  return await prisma.offer.findMany({
    where: { driveId },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
        },
      },
    },
  });
};

/**
 * Get all offers
 */
export const getAllOffers = async (filters?: {
  limit?: number;
  offset?: number;
}): Promise<{ count: number; offers: Offer[] }> => {
  const offers = await prisma.offer.findMany({
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          rollNumber: true,
          firstName: true,
          lastName: true,
        },
      },
      drive: {
        select: {
          title: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });

  return {
    count: await prisma.offer.count(),
    offers,
  };
};

/**
 * Update offer status
 */
export const updateOfferStatus = async (
  offerId: string,
  status: OfferStatus,
  counterOfferText?: string,
  counterSalary?: number
): Promise<Offer> => {
  // Build update payload
  const updateData: Record<string, unknown> = { status };

  if (status === OfferStatus.COUNTERED) {
    updateData.counterOfferText = counterOfferText ?? null;
    if (counterSalary !== undefined) {
      updateData.counterSalary = counterSalary;
    }
  } else if (status === OfferStatus.ACCEPTED) {
    // When company accepts the counter, promote the counter salary to the main salary
    const existing = await prisma.offer.findUnique({
      where: { id: offerId },
      select: { counterSalary: true },
    });
    if (existing?.counterSalary) {
      updateData.salary = existing.counterSalary;
    }
    updateData.counterOfferText = null;
    updateData.counterSalary = null;
  } else {
    // PENDING (company accepted counter to re-negotiate) or REJECTED — preserve text for audit
    // but clear counter fields on REJECTED
    if (status === OfferStatus.REJECTED) {
      updateData.counterOfferText = null;
      updateData.counterSalary = null;
    }
  }

  return await prisma.offer.update({
    where: { id: offerId },
    data: updateData,
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      drive: {
        select: {
          title: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Delete offer
 */
export const deleteOffer = async (offerId: string): Promise<Offer> => {
  return await prisma.offer.delete({
    where: { id: offerId },
  });
};

/**
 * Get offers by status
 */
export const getOffersByStatus = async (
  status: OfferStatus,
  filters?: { limit?: number; offset?: number }
): Promise<{ count: number; offers: Offer[] }> => {
  const offers = await prisma.offer.findMany({
    where: { status },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          rollNumber: true,
          firstName: true,
          lastName: true,
        },
      },
      drive: {
        select: {
          title: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });

  const count = await prisma.offer.count({ where: { status } });

  return { count, offers };
};

/**
 * Get accepted offers
 */
export const getAcceptedOffers = async (filters?: {
  limit?: number;
  offset?: number;
}): Promise<Offer[]> => {
  return await prisma.offer.findMany({
    where: { status: OfferStatus.ACCEPTED },
    take: filters?.limit || 100,
    skip: filters?.offset || 0,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
        },
      },
      drive: {
        select: {
          title: true,
          description: true,
          salary: true,
          interviewFormat: true,
          company: {
            select: {
              companyName: true,
              sector: true,
              address: true,
              website: true,
              contactPerson: true,
              contactEmail: true,
              contactPhone: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Get accepted offers for a specific company
 */
export const getAcceptedOffersByCompanyId = async (companyId: string): Promise<Offer[]> => {
  return await prisma.offer.findMany({
    where: {
      status: OfferStatus.ACCEPTED,
      drive: { companyId },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          department: true,
          batch: true,
        },
      },
      drive: {
        select: {
          id: true,
          title: true,
          description: true,
          salary: true,
          interviewFormat: true,
          company: {
            select: {
              id: true,
              companyName: true,
              sector: true,
              address: true,
              website: true,
              contactPerson: true,
              contactEmail: true,
              contactPhone: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Get offer counts for a company
 */
export const getOfferCountsByCompanyId = async (companyId: string) => {
  const [totalOffers, pendingOffers, acceptedOffers, rejectedOffers, counteredOffers] =
    await Promise.all([
      prisma.offer.count({ where: { drive: { companyId } } }),
      prisma.offer.count({ where: { status: OfferStatus.PENDING, drive: { companyId } } }),
      prisma.offer.count({ where: { status: OfferStatus.ACCEPTED, drive: { companyId } } }),
      prisma.offer.count({ where: { status: OfferStatus.REJECTED, drive: { companyId } } }),
      prisma.offer.count({ where: { status: OfferStatus.COUNTERED, drive: { companyId } } }),
    ]);

  return {
    totalOffers,
    pendingOffers,
    acceptedOffers,
    rejectedOffers,
    counteredOffers,
  };
};

/**
 * Check if student has accepted offer
 */
export const hasAcceptedOffer = async (studentId: string): Promise<boolean> => {
  const offer = await prisma.offer.findFirst({
    where: {
      studentId,
      status: OfferStatus.ACCEPTED,
    },
    select: { id: true },
  });
  return !!offer;
};

/**
 * Get offer statistics
 */
export const getOfferStatistics = async () => {
  const total = await prisma.offer.count();
  const pending = await prisma.offer.count({ where: { status: OfferStatus.PENDING } });
  const accepted = await prisma.offer.count({ where: { status: OfferStatus.ACCEPTED } });
  const rejected = await prisma.offer.count({ where: { status: OfferStatus.REJECTED } });
  const countered = await prisma.offer.count({ where: { status: OfferStatus.COUNTERED } });

  return {
    totalOffers: total,
    pending,
    accepted,
    rejected,
    countered,
    acceptanceRate: total > 0 ? ((accepted / total) * 100).toFixed(2) + "%" : "0%",
  };
};

/**
 * Get student offer count
 */
export const getStudentOfferCount = async (studentId: string): Promise<number> => {
  return await prisma.offer.count({
    where: { studentId },
  });
};
