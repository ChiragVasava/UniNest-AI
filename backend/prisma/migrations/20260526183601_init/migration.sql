-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "DriveApplicationStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED_OFFER');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "rollNumber" TEXT NOT NULL,
    "phone" TEXT,
    "profilePhoto" TEXT,
    "cgpa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "department" TEXT NOT NULL,
    "batch" INTEGER NOT NULL,
    "college" TEXT,
    "isProfileVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "isProfileLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "extractedText" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifyComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drives" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "jobDescription" TEXT,
    "salary" DOUBLE PRECISION,
    "cgpaCutoff" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "eligibleDepartments" TEXT[],
    "eligibleBatches" INTEGER[],
    "requiredSkills" TEXT[],
    "interviewFormat" TEXT NOT NULL DEFAULT 'Online',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drive_applications" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "status" "DriveApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "rejectionReason" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drive_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "joinDate" TIMESTAMP(3),
    "offerDetails" JSONB,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "counterOfferText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_rollNumber_key" ON "students"("rollNumber");

-- CreateIndex
CREATE INDEX "students_rollNumber_idx" ON "students"("rollNumber");

-- CreateIndex
CREATE INDEX "students_cgpa_idx" ON "students"("cgpa");

-- CreateIndex
CREATE INDEX "students_department_idx" ON "students"("department");

-- CreateIndex
CREATE INDEX "students_batch_idx" ON "students"("batch");

-- CreateIndex
CREATE UNIQUE INDEX "companies_userId_key" ON "companies"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_registrationId_key" ON "companies"("registrationId");

-- CreateIndex
CREATE INDEX "companies_companyName_idx" ON "companies"("companyName");

-- CreateIndex
CREATE INDEX "resumes_studentId_idx" ON "resumes"("studentId");

-- CreateIndex
CREATE INDEX "drives_companyId_idx" ON "drives"("companyId");

-- CreateIndex
CREATE INDEX "drives_isActive_idx" ON "drives"("isActive");

-- CreateIndex
CREATE INDEX "drive_applications_studentId_idx" ON "drive_applications"("studentId");

-- CreateIndex
CREATE INDEX "drive_applications_driveId_idx" ON "drive_applications"("driveId");

-- CreateIndex
CREATE INDEX "drive_applications_status_idx" ON "drive_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "drive_applications_studentId_driveId_key" ON "drive_applications"("studentId", "driveId");

-- CreateIndex
CREATE INDEX "offers_studentId_idx" ON "offers"("studentId");

-- CreateIndex
CREATE INDEX "offers_driveId_idx" ON "offers"("driveId");

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drives" ADD CONSTRAINT "drives_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_applications" ADD CONSTRAINT "drive_applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_applications" ADD CONSTRAINT "drive_applications_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
