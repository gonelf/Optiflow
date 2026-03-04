-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'CREATING_REPO', 'PUSHING_CODE', 'TRIGGERING_DEPLOY', 'DEPLOYED', 'FAILED');

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
    "githubRepoUrl" TEXT,
    "githubRepoName" TEXT,
    "vercelProjectId" TEXT,
    "vercelDeployUrl" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deployment_pageId_idx" ON "Deployment"("pageId");

-- CreateIndex
CREATE INDEX "Deployment_userId_idx" ON "Deployment"("userId");

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
