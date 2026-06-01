-- AlterTable
ALTER TABLE "students" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
