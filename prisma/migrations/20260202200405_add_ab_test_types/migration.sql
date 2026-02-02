-- CreateEnum
CREATE TYPE "ABTestType" AS ENUM ('PAGE_REDIRECT', 'ELEMENT_TEST');

-- AlterTable
ALTER TABLE "ABTest" ADD COLUMN "testType" "ABTestType" NOT NULL DEFAULT 'ELEMENT_TEST';

-- AlterTable
ALTER TABLE "PageVariant" ADD COLUMN "redirectUrl" TEXT,
ADD COLUMN "elementChanges" JSONB;

-- CreateIndex
CREATE INDEX "ABTest_testType_idx" ON "ABTest"("testType");
