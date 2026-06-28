-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_SENT', 'REJECTED', 'HIRED');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "InterviewConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RESCHEDULE_REQUESTED');

-- CreateEnum
CREATE TYPE "OfferAuditAction" AS ENUM ('SENT', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'COUNTER_RESPONSE', 'EXPIRED');

-- AlterEnum
ALTER TYPE "OfferStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "interview_schedules" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "mode" "InterviewMode" NOT NULL DEFAULT 'ONLINE',
    "meetingLink" TEXT,
    "notes" TEXT,
    "confirmationStatus" "InterviewConfirmationStatus" NOT NULL DEFAULT 'PENDING',
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_timeline" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "stage" "ApplicationStage" NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_audit" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "action" "OfferAuditAction" NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_schedules_applicationId_idx" ON "interview_schedules"("applicationId");

-- CreateIndex
CREATE INDEX "interview_schedules_driveId_idx" ON "interview_schedules"("driveId");

-- CreateIndex
CREATE INDEX "interview_schedules_studentId_idx" ON "interview_schedules"("studentId");

-- CreateIndex
CREATE INDEX "interview_schedules_companyId_idx" ON "interview_schedules"("companyId");

-- CreateIndex
CREATE INDEX "application_timeline_applicationId_idx" ON "application_timeline"("applicationId");

-- CreateIndex
CREATE INDEX "application_timeline_stage_idx" ON "application_timeline"("stage");

-- CreateIndex
CREATE INDEX "offer_audit_offerId_idx" ON "offer_audit"("offerId");

-- CreateIndex
CREATE INDEX "offer_audit_action_idx" ON "offer_audit"("action");

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "drive_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_timeline" ADD CONSTRAINT "application_timeline_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "drive_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_audit" ADD CONSTRAINT "offer_audit_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
