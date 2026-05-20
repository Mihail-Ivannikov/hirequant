-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "education" JSONB,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "linkedInUrl" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "workExperience" JSONB;
