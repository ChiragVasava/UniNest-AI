import * as driveApplicationRepository from "../repositories/driveApplicationRepository";
import * as driveRepository from "../repositories/driveRepository";
import * as studentRepository from "../repositories/studentRepository";
import * as companyRepository from "../repositories/companyRepository";
import * as resumeRepository from "../repositories/resumeRepository";
import { analyzeResumeForAts, buildResumePreview } from "./atsService";
import { AppError } from "../middleware/errorHandler";
import {
  ApplicationStage,
  DriveApplicationStatus,
  InterviewConfirmationStatus,
  InterviewMode,
} from "@prisma/client";
import { prisma } from "../config/database";

const stageToApplicationStatus: Partial<Record<ApplicationStage, DriveApplicationStatus>> = {
  APPLIED: DriveApplicationStatus.APPLIED,
  SHORTLISTED: DriveApplicationStatus.SHORTLISTED,
  REJECTED: DriveApplicationStatus.REJECTED,
  HIRED: DriveApplicationStatus.ACCEPTED_OFFER,
};

async function addTimelineEvent(
  applicationId: string,
  stage: ApplicationStage,
  note?: string,
  metadata?: Record<string, unknown>,
  createdByUserId?: string
) {
  return prisma.applicationTimeline.create({
    data: {
      applicationId,
      stage,
      note,
      metadata: metadata as any,
      createdByUserId,
    },
  });
}

/**
 * Apply for a drive (Student only)
 */
export const applyForDrive = async (studentUserId: string, driveId: string) => {
  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const studentId = student.id;

  // Validate drive exists
  const drive = await driveRepository.getDriveById(driveId);
  if (!drive) {
    throw new AppError(404, "Drive not found");
  }

  // Validate drive is active
  if (!drive.isActive) {
    throw new AppError(400, "This drive is not active");
  }

  // Check eligibility: CGPA cutoff
  if (student.cgpa < drive.cgpaCutoff) {
    throw new AppError(
      403,
      `Your CGPA (${student.cgpa}) is below the required cutoff (${drive.cgpaCutoff})`
    );
  }

  // Check eligibility: Department
  if (drive.eligibleDepartments.length > 0 && !drive.eligibleDepartments.includes(student.department)) {
    throw new AppError(
      403,
      `Your department (${student.department}) is not eligible for this drive`
    );
  }

  // Check eligibility: Batch
  if (drive.eligibleBatches.length > 0 && !drive.eligibleBatches.includes(student.batch)) {
    throw new AppError(
      403,
      `Your batch (${student.batch}) is not eligible for this drive`
    );
  }

  // Check if already applied
  const hasApplied = await driveApplicationRepository.hasApplied(studentId, driveId);
  if (hasApplied) {
    throw new AppError(400, "You have already applied for this drive");
  }

  const application = await driveApplicationRepository.createApplication({
    studentId,
    driveId,
  });

  await addTimelineEvent(
    application.id,
    ApplicationStage.APPLIED,
    "Candidate applied to this drive.",
    { driveId },
    studentUserId
  );

  return {
    id: application.id,
    status: application.status,
    driveTitle: (application as any).drive?.title,
    companyName: (application as any).drive?.company?.companyName,
    appliedAt: application.appliedAt,
    message: "Application submitted successfully",
  };
};

/**
 * Get application by ID
 */
export const getApplicationById = async (applicationId: string) => {
  const application = await driveApplicationRepository.getApplicationById(applicationId);
  if (!application) {
    throw new AppError(404, "Application not found");
  }

  return {
    id: application.id,
    status: application.status,
    rejectionReason: application.rejectionReason,
    student: {
      id: (application as any).student?.id,
      name: `${(application as any).student?.firstName} ${(application as any).student?.lastName}`,
      rollNumber: (application as any).student?.rollNumber,
      cgpa: (application as any).student?.cgpa,
      department: (application as any).student?.department,
    },
    drive: {
      id: (application as any).drive?.id,
      title: (application as any).drive?.title,
      company: (application as any).drive?.company?.companyName,
    },
    appliedAt: application.appliedAt,
    updatedAt: application.updatedAt,
  };
};

/**
 * Get my applications (Student only)
 */
export const getMyApplications = async (
  studentUserId: string,
  filters?: { limit?: number; offset?: number }
) => {
  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const studentId = student.id;

  const applications = await driveApplicationRepository.getStudentApplications(
    studentId,
    filters
  );

  const applicationIds = applications.map((app) => app.id);
  const [timelineEvents, interviews] = await Promise.all([
    prisma.applicationTimeline.findMany({
      where: { applicationId: { in: applicationIds } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.interviewSchedule.findMany({
      where: { applicationId: { in: applicationIds } },
      orderBy: { scheduledAt: "desc" },
    }),
  ]);

  const timelineByApplication = timelineEvents.reduce<Record<string, typeof timelineEvents>>(
    (acc, event) => {
      if (!acc[event.applicationId]) acc[event.applicationId] = [];
      acc[event.applicationId].push(event);
      return acc;
    },
    {}
  );

  const interviewsByApplication = interviews.reduce<Record<string, typeof interviews>>(
    (acc, interview) => {
      if (!acc[interview.applicationId]) acc[interview.applicationId] = [];
      acc[interview.applicationId].push(interview);
      return acc;
    },
    {}
  );

  return {
    count: applications.length,
    applications: applications.map((app) => ({
      id: app.id,
      status: app.status,
      drive: {
        id: (app as any).drive?.id,
        title: (app as any).drive?.title,
        salary: (app as any).drive?.salary,
        company: (app as any).drive?.company?.companyName,
      },
      timeline:
        timelineByApplication[app.id]?.map((event) => ({
          id: event.id,
          stage: event.stage,
          note: event.note,
          createdAt: event.createdAt,
        })) || [],
      interviews:
        interviewsByApplication[app.id]?.map((interview) => ({
          id: interview.id,
          scheduledAt: interview.scheduledAt,
          mode: interview.mode,
          meetingLink: interview.meetingLink,
          notes: interview.notes,
          confirmationStatus: interview.confirmationStatus,
        })) || [],
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
    })),
  };
};

/**
 * Get applications for a drive (Company only)
 */
export const getApplicationsForDrive = async (
  driveId: string,
  companyUserId: string,
  filters?: { limit?: number; offset?: number; status?: string }
) => {
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
    throw new AppError(403, "You can only view applications for your own drives");
  }

  const statusFilter = filters?.status as DriveApplicationStatus | undefined;

  const result = await driveApplicationRepository.getDriveApplications(driveId, {
    ...filters,
    status: statusFilter,
  });

  return {
    total: result.count,
    applications: result.applications.map((app) => ({
      id: app.id,
      status: app.status,
      student: {
        id: (app as any).student?.id,
        name: `${(app as any).student?.firstName} ${(app as any).student?.lastName}`,
        rollNumber: (app as any).student?.rollNumber,
        cgpa: (app as any).student?.cgpa,
        department: (app as any).student?.department,
        phone: (app as any).student?.phone,
      },
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
    })),
  };
};

/**
 * Get applications for a drive with ATS resume analysis (Company only)
 */
export const getApplicationsForDriveWithAts = async (
  driveId: string,
  companyUserId: string,
  filters?: { limit?: number; offset?: number; status?: string }
) => {
  const company = await companyRepository.getCompanyByUserId(companyUserId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const companyId = company.id;
  const drive = await driveRepository.getDriveById(driveId);
  if (!drive) {
    throw new AppError(404, "Drive not found");
  }

  if (drive.companyId !== companyId) {
    throw new AppError(403, "You can only view applications for your own drives");
  }

  const statusFilter = filters?.status as DriveApplicationStatus | undefined;
  const result = await driveApplicationRepository.getDriveApplications(driveId, {
    ...filters,
    status: statusFilter,
  });

  const applicationIds = result.applications.map((app) => app.id);
  const [timelineEvents, interviews] = await Promise.all([
    prisma.applicationTimeline.findMany({
      where: { applicationId: { in: applicationIds } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.interviewSchedule.findMany({
      where: { applicationId: { in: applicationIds } },
      orderBy: { scheduledAt: "desc" },
    }),
  ]);

  const timelineByApplication = timelineEvents.reduce<Record<string, typeof timelineEvents>>(
    (acc, event) => {
      if (!acc[event.applicationId]) acc[event.applicationId] = [];
      acc[event.applicationId].push(event);
      return acc;
    },
    {}
  );

  const interviewsByApplication = interviews.reduce<Record<string, typeof interviews>>(
    (acc, interview) => {
      if (!acc[interview.applicationId]) acc[interview.applicationId] = [];
      acc[interview.applicationId].push(interview);
      return acc;
    },
    {}
  );

  const applications = await Promise.all(
    result.applications.map(async (app) => {
      const student = (app as any).student;
      const latestResume = student?.id
        ? await resumeRepository.getLatestResumeByStudentId(student.id)
        : null;

      const resumeText =
        latestResume?.extractedText?.trim() ||
        `Resume file: ${latestResume?.fileName || "No resume uploaded"}.`;
      const resumePreview = latestResume
        ? await buildResumePreview({
            resumeText: latestResume.extractedText || undefined,
            resumeFilePath: latestResume.filePath,
          })
        : "";

      const ats = latestResume
        ? await analyzeResumeForAts({
            resumeText,
            resumeFilePath: latestResume.filePath,
            jobTitle: drive.title,
            jobDescription: drive.jobDescription || drive.description || undefined,
            requiredSkills: drive.requiredSkills,
            companyName: company.companyName,
          })
        : {
            score: 0,
            verdict: "no_match" as const,
            summary: "This applicant has not uploaded a resume yet.",
            strengths: [],
            gaps: ["Resume missing"],
            matchedKeywords: [],
            recommendation: "Ask the student to upload a resume before shortlisting.",
            source: "fallback" as const,
          };

      return {
        id: app.id,
        status: app.status,
        student: {
          id: student?.id,
          name: `${student?.firstName || ""} ${student?.lastName || ""}`.trim(),
          rollNumber: student?.rollNumber,
          cgpa: student?.cgpa,
          department: student?.department,
          phone: student?.phone,
        },
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
        resume: latestResume
          ? {
              id: latestResume.id,
              fileName: latestResume.fileName,
              filePath: latestResume.filePath,
              fileSize: latestResume.fileSize,
              isVerified: latestResume.isVerified,
              verifyComment: latestResume.verifyComment,
              createdAt: latestResume.createdAt,
              extractedText: latestResume.extractedText,
              preview: resumePreview || (latestResume.extractedText || "").trim().slice(0, 500) || null,
            }
          : null,
        ats,
        timeline:
          timelineByApplication[app.id]?.map((event) => ({
            id: event.id,
            stage: event.stage,
            note: event.note,
            metadata: event.metadata,
            createdAt: event.createdAt,
          })) || [],
        interviews:
          interviewsByApplication[app.id]?.map((interview) => ({
            id: interview.id,
            scheduledAt: interview.scheduledAt,
            mode: interview.mode,
            meetingLink: interview.meetingLink,
            notes: interview.notes,
            confirmationStatus: interview.confirmationStatus,
            updatedAt: interview.updatedAt,
          })) || [],
      };
    })
  );

  return {
    total: result.count,
    drive: {
      id: drive.id,
      title: drive.title,
      companyName: company.companyName,
    },
    applications,
  };
};

/**
 * Update application status (Company only)
 */
export const updateApplicationStatus = async (
  applicationId: string,
  companyUserId: string,
  status: string,
  rejectionReason?: string
) => {
  const company = await companyRepository.getCompanyByUserId(companyUserId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const companyId = company.id;

  // Validate application exists
  const application = await driveApplicationRepository.getApplicationById(applicationId);
  if (!application) {
    throw new AppError(404, "Application not found");
  }

  // Validate drive belongs to company
  const drive = await driveRepository.getDriveById(application.driveId);
  if (!drive || drive.companyId !== companyId) {
    throw new AppError(403, "You can only update applications for your own drives");
  }

  const normalizedStatus = status.toUpperCase();

  // Validate status
  const validStatuses = [
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "OFFER_SENT",
    "REJECTED",
    "HIRED",
    "ACCEPTED_OFFER",
  ];
  if (!validStatuses.includes(normalizedStatus)) {
    throw new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  // Validate rejection reason for REJECTED status
  if (normalizedStatus === "REJECTED" && (!rejectionReason || rejectionReason.trim().length === 0)) {
    throw new AppError(400, "Rejection reason is required when rejecting an application");
  }

  const stage: ApplicationStage =
    normalizedStatus === "ACCEPTED_OFFER"
      ? ApplicationStage.HIRED
      : (normalizedStatus as ApplicationStage);

  const mappedDbStatus = stageToApplicationStatus[stage];

  const updatedApplication = mappedDbStatus
    ? await driveApplicationRepository.updateApplicationStatus(
        applicationId,
        mappedDbStatus,
        rejectionReason
      )
    : await driveApplicationRepository.getApplicationById(applicationId);

  if (!updatedApplication) {
    throw new AppError(404, "Application not found");
  }

  await addTimelineEvent(
    applicationId,
    stage,
    rejectionReason || `Application moved to ${stage}.`,
    { requestedStatus: normalizedStatus },
    companyUserId
  );

  return {
    id: updatedApplication.id,
    status: mappedDbStatus || updatedApplication.status,
    stage,
    rejectionReason: mappedDbStatus ? updatedApplication.rejectionReason : rejectionReason,
    studentName: `${(updatedApplication as any).student?.firstName} ${(updatedApplication as any).student?.lastName}`,
    driveTitle: (updatedApplication as any).drive?.title,
    message: `Application status updated to ${stage}`,
  };
};

/**
 * Withdraw application (Student only)
 */
export const withdrawApplication = async (applicationId: string, studentUserId: string) => {
  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const studentId = student.id;

  const application = await driveApplicationRepository.getApplicationById(applicationId);
  if (!application) {
    throw new AppError(404, "Application not found");
  }

  if (application.studentId !== studentId) {
    throw new AppError(403, "You can only withdraw your own applications");
  }

  // Cannot withdraw if already shortlisted or offer accepted
  if (
    application.status === DriveApplicationStatus.SHORTLISTED ||
    application.status === DriveApplicationStatus.ACCEPTED_OFFER
  ) {
    throw new AppError(
      400,
      "Cannot withdraw application that is shortlisted or has an accepted offer"
    );
  }

  await driveApplicationRepository.deleteApplication(applicationId);

  return {
    message: "Application withdrawn successfully",
  };
};

/**
 * Get application statistics
 */
export const getApplicationStatistics = async () => {
  const stats = await driveApplicationRepository.getApplicationStatistics();

  const totalApplied = stats.byStatus.APPLIED || 0;
  const totalOffers = stats.byStatus.ACCEPTED_OFFER || 0;

  return {
    totalApplications: stats.totalApplications,
    applied: stats.byStatus.APPLIED || 0,
    shortlisted: stats.byStatus.SHORTLISTED || 0,
    rejected: stats.byStatus.REJECTED || 0,
    accepted: totalOffers,
    conversionRate:
      totalApplied > 0 ? ((totalOffers / totalApplied) * 100).toFixed(2) + "%" : "0%",
  };
};

/**
 * Get shortlisted students for drive (Company only)
 */
export const getShortlistedStudentsForDrive = async (
  driveId: string,
  companyUserId: string
) => {
  const company = await companyRepository.getCompanyByUserId(companyUserId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const companyId = company.id;

  // Validate drive belongs to company
  const drive = await driveRepository.getDriveById(driveId);
  if (!drive || drive.companyId !== companyId) {
    throw new AppError(403, "You can only view applications for your own drives");
  }

  const applications = await driveApplicationRepository.getShortlistedStudents(driveId);

  return {
    count: applications.length,
    students: applications.map((app) => ({
      id: (app as any).student?.id,
      name: `${(app as any).student?.firstName} ${(app as any).student?.lastName}`,
      rollNumber: (app as any).student?.rollNumber,
      email: (app as any).student?.email,
      phone: (app as any).student?.phone,
      cgpa: (app as any).student?.cgpa,
    })),
  };
};

export const getApplicationTimeline = async (applicationId: string, userId: string) => {
  const application = await driveApplicationRepository.getApplicationById(applicationId);
  if (!application) {
    throw new AppError(404, "Application not found");
  }

  const [student, company] = await Promise.all([
    studentRepository.getStudentByUserId(userId),
    companyRepository.getCompanyByUserId(userId),
  ]);

  if (!student && !company) {
    throw new AppError(403, "You are not authorized to access this timeline");
  }

  if (student && application.studentId !== student.id) {
    throw new AppError(403, "You can only view your own application timeline");
  }

  if (company) {
    const drive = await driveRepository.getDriveById(application.driveId);
    if (!drive || drive.companyId !== company.id) {
      throw new AppError(403, "You can only view timeline for your own drives");
    }
  }

  const [timeline, interviews] = await Promise.all([
    prisma.applicationTimeline.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.interviewSchedule.findMany({
      where: { applicationId },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  return {
    applicationId,
    currentStatus: application.status,
    timeline,
    interviews,
  };
};

export const createInterviewSlot = async (
  applicationId: string,
  companyUserId: string,
  payload: {
    scheduledAt: string;
    mode?: "ONLINE" | "OFFLINE" | "HYBRID";
    meetingLink?: string;
    notes?: string;
  }
) => {
  const company = await companyRepository.getCompanyByUserId(companyUserId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const application = await driveApplicationRepository.getApplicationById(applicationId);
  if (!application) {
    throw new AppError(404, "Application not found");
  }

  const drive = await driveRepository.getDriveById(application.driveId);
  if (!drive || drive.companyId !== company.id) {
    throw new AppError(403, "You can only schedule interviews for your own drives");
  }

  const scheduledAt = new Date(payload.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new AppError(400, "Invalid scheduledAt date");
  }

  const interview = await prisma.interviewSchedule.create({
    data: {
      applicationId,
      driveId: application.driveId,
      companyId: company.id,
      studentId: application.studentId,
      scheduledAt,
      mode: (payload.mode as InterviewMode) || InterviewMode.ONLINE,
      meetingLink: payload.meetingLink || null,
      notes: payload.notes || null,
      createdByUserId: companyUserId,
      confirmationStatus: InterviewConfirmationStatus.PENDING,
    },
  });

  await addTimelineEvent(
    applicationId,
    ApplicationStage.INTERVIEW_SCHEDULED,
    "Interview slot created.",
    {
      interviewId: interview.id,
      scheduledAt: interview.scheduledAt,
      mode: interview.mode,
    },
    companyUserId
  );

  return interview;
};

export const updateInterviewSlot = async (
  interviewId: string,
  companyUserId: string,
  payload: {
    scheduledAt?: string;
    mode?: "ONLINE" | "OFFLINE" | "HYBRID";
    meetingLink?: string;
    notes?: string;
  }
) => {
  const company = await companyRepository.getCompanyByUserId(companyUserId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const existing = await prisma.interviewSchedule.findUnique({ where: { id: interviewId } });
  if (!existing) {
    throw new AppError(404, "Interview slot not found");
  }

  if (existing.companyId !== company.id) {
    throw new AppError(403, "You can only update your own interview slots");
  }

  const scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : undefined;
  if (payload.scheduledAt && Number.isNaN(scheduledAt?.getTime())) {
    throw new AppError(400, "Invalid scheduledAt date");
  }

  const interview = await prisma.interviewSchedule.update({
    where: { id: interviewId },
    data: {
      scheduledAt: scheduledAt ?? undefined,
      mode: (payload.mode as InterviewMode) ?? undefined,
      meetingLink: payload.meetingLink ?? undefined,
      notes: payload.notes ?? undefined,
      confirmationStatus: InterviewConfirmationStatus.PENDING,
    },
  });

  await addTimelineEvent(
    interview.applicationId,
    ApplicationStage.INTERVIEW_SCHEDULED,
    "Interview slot updated.",
    {
      interviewId: interview.id,
      scheduledAt: interview.scheduledAt,
      mode: interview.mode,
    },
    companyUserId
  );

  return interview;
};

export const confirmInterviewSlot = async (interviewId: string, studentUserId: string) => {
  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const existing = await prisma.interviewSchedule.findUnique({ where: { id: interviewId } });
  if (!existing) {
    throw new AppError(404, "Interview slot not found");
  }

  if (existing.studentId !== student.id) {
    throw new AppError(403, "You can only confirm your own interview slot");
  }

  const interview = await prisma.interviewSchedule.update({
    where: { id: interviewId },
    data: {
      confirmationStatus: InterviewConfirmationStatus.CONFIRMED,
    },
  });

  await addTimelineEvent(
    interview.applicationId,
    ApplicationStage.INTERVIEW_SCHEDULED,
    "Candidate confirmed interview slot.",
    { interviewId: interview.id },
    studentUserId
  );

  return interview;
};

export const requestInterviewReschedule = async (
  interviewId: string,
  studentUserId: string,
  note?: string
) => {
  const student = await studentRepository.getStudentByUserId(studentUserId);
  if (!student) {
    throw new AppError(404, "Student profile not found");
  }

  const existing = await prisma.interviewSchedule.findUnique({ where: { id: interviewId } });
  if (!existing) {
    throw new AppError(404, "Interview slot not found");
  }

  if (existing.studentId !== student.id) {
    throw new AppError(403, "You can only request reschedule for your own interview slot");
  }

  const interview = await prisma.interviewSchedule.update({
    where: { id: interviewId },
    data: {
      confirmationStatus: InterviewConfirmationStatus.RESCHEDULE_REQUESTED,
      notes: note || existing.notes,
    },
  });

  await addTimelineEvent(
    interview.applicationId,
    ApplicationStage.INTERVIEW_SCHEDULED,
    "Candidate requested interview reschedule.",
    { interviewId: interview.id, note: note || null },
    studentUserId
  );

  return interview;
};

export const moveApplicationStage = async (
  applicationId: string,
  companyUserId: string,
  stage: ApplicationStage,
  note?: string
) => {
  const company = await companyRepository.getCompanyByUserId(companyUserId);
  if (!company) {
    throw new AppError(404, "Company profile not found");
  }

  const application = await driveApplicationRepository.getApplicationById(applicationId);
  if (!application) {
    throw new AppError(404, "Application not found");
  }

  const drive = await driveRepository.getDriveById(application.driveId);
  if (!drive || drive.companyId !== company.id) {
    throw new AppError(403, "You can only update stages for your own drives");
  }

  const mappedStatus = stageToApplicationStatus[stage];
  if (mappedStatus) {
    await driveApplicationRepository.updateApplicationStatus(
      applicationId,
      mappedStatus,
      stage === ApplicationStage.REJECTED ? note : undefined
    );
  }

  const event = await addTimelineEvent(
    applicationId,
    stage,
    note || `Application moved to ${stage}`,
    undefined,
    companyUserId
  );

  return {
    applicationId,
    stage,
    timelineEvent: event,
    mappedStatus: mappedStatus || null,
  };
};
