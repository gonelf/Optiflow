-- OptiFlow Database Migration
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AUTH & WORKSPACE MANAGEMENT
-- ============================================================================

CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "domain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkspaceMember_userId_workspaceId_key" UNIQUE ("userId", "workspaceId")
);

-- ============================================================================
-- PAGE BUILDER & COMPONENTS
-- ============================================================================

CREATE TYPE "ComponentType" AS ENUM (
    'HERO', 'CTA', 'PRICING', 'FEATURES', 'TESTIMONIALS',
    'FAQ', 'FORM', 'NEWSLETTER', 'HEADER', 'FOOTER', 'CUSTOM'
);

CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "favicon" TEXT,
    "customHead" TEXT,
    "workspaceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "publishedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Page_workspaceId_slug_key" UNIQUE ("workspaceId", "slug")
);

CREATE TABLE "Component" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "variantId" TEXT,
    "type" "ComponentType" NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "styles" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "aiPrompt" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TYPE "TemplateCategory" AS ENUM (
    'HERO', 'LANDING_PAGE', 'PRICING', 'DEMO', 'FUNNEL', 'WAITLIST', 'COMING_SOON'
);

CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "TemplateCategory" NOT NULL,
    "thumbnail" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "structure" JSONB NOT NULL,
    "workspaceId" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================================================
-- A/B TESTING
-- ============================================================================

CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'ARCHIVED');

CREATE TABLE "ABTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pageId" TEXT NOT NULL,
    "status" "TestStatus" NOT NULL DEFAULT 'DRAFT',
    "trafficSplit" JSONB NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "primaryGoal" TEXT NOT NULL,
    "conversionEvent" TEXT NOT NULL,
    "minimumSampleSize" INTEGER NOT NULL DEFAULT 1000,
    "confidenceLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "winningVariantId" TEXT,
    "declaredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "PageVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isControl" BOOLEAN NOT NULL DEFAULT false,
    "abTestId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================================================
-- ANALYTICS & TRACKING
-- ============================================================================

CREATE TYPE "EventType" AS ENUM (
    'PAGE_VIEW', 'CLICK', 'FORM_SUBMIT', 'SCROLL', 'TIME_ON_PAGE', 'CONVERSION', 'CUSTOM'
);

CREATE TABLE "AnalyticsSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL UNIQUE,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "pageId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "variantId" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "country" TEXT,
    "city" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER
);

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" "EventType" NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventData" JSONB,
    "sessionId" TEXT NOT NULL,
    "variantId" TEXT,
    "elementId" TEXT,
    "elementType" TEXT,
    "elementText" TEXT,
    "xPosition" INTEGER,
    "yPosition" INTEGER,
    "scrollDepth" INTEGER,
    "isConversion" BOOLEAN NOT NULL DEFAULT false,
    "conversionValue" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AI & PERSONALIZATION
-- ============================================================================

CREATE TYPE "OptimizationType" AS ENUM (
    'VARIANT_GENERATION', 'SEO_OPTIMIZATION', 'CONTENT_PERSONALIZATION',
    'HEADLINE_SUGGESTIONS', 'CTA_OPTIMIZATION'
);

CREATE TABLE "AIOptimization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" "OptimizationType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "context" JSONB,
    "suggestions" JSONB NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE "PersonalizationAction" AS ENUM (
    'SWAP_COMPONENT', 'CHANGE_TEXT', 'CHANGE_IMAGE', 'REDIRECT', 'SHOW_BANNER'
);

CREATE TABLE "PersonalizationRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "segment" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "action" "PersonalizationAction" NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

CREATE TYPE "IntegrationType" AS ENUM (
    'STRIPE', 'HUBSPOT', 'SALESFORCE', 'MAILCHIMP', 'ZAPIER',
    'WEBHOOK', 'GOOGLE_ANALYTICS', 'FACEBOOK_PIXEL'
);

CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================================================
-- SYSTEM
-- ============================================================================

CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Page" ADD CONSTRAINT "Page_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Page" ADD CONSTRAINT "Page_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Component" ADD CONSTRAINT "Component_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Component" ADD CONSTRAINT "Component_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "PageVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Template" ADD CONSTRAINT "Template_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ABTest" ADD CONSTRAINT "ABTest_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ABTest" ADD CONSTRAINT "ABTest_winningVariantId_fkey"
    FOREIGN KEY ("winningVariantId") REFERENCES "PageVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PageVariant" ADD CONSTRAINT "PageVariant_abTestId_fkey"
    FOREIGN KEY ("abTestId") REFERENCES "ABTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PageVariant" ADD CONSTRAINT "PageVariant_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnalyticsSession" ADD CONSTRAINT "AnalyticsSession_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnalyticsSession" ADD CONSTRAINT "AnalyticsSession_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnalyticsSession" ADD CONSTRAINT "AnalyticsSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "PageVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Integration" ADD CONSTRAINT "Integration_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Workspace_slug_idx" ON "Workspace"("slug");
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");
CREATE INDEX "Page_workspaceId_idx" ON "Page"("workspaceId");
CREATE INDEX "Page_authorId_idx" ON "Page"("authorId");
CREATE INDEX "Page_status_idx" ON "Page"("status");
CREATE INDEX "Component_pageId_idx" ON "Component"("pageId");
CREATE INDEX "Component_variantId_idx" ON "Component"("variantId");
CREATE INDEX "Component_type_idx" ON "Component"("type");
CREATE INDEX "Template_category_idx" ON "Template"("category");
CREATE INDEX "Template_workspaceId_idx" ON "Template"("workspaceId");
CREATE INDEX "ABTest_pageId_idx" ON "ABTest"("pageId");
CREATE INDEX "ABTest_status_idx" ON "ABTest"("status");
CREATE INDEX "PageVariant_abTestId_idx" ON "PageVariant"("abTestId");
CREATE INDEX "PageVariant_pageId_idx" ON "PageVariant"("pageId");
CREATE INDEX "AnalyticsSession_sessionId_idx" ON "AnalyticsSession"("sessionId");
CREATE INDEX "AnalyticsSession_visitorId_idx" ON "AnalyticsSession"("visitorId");
CREATE INDEX "AnalyticsSession_pageId_idx" ON "AnalyticsSession"("pageId");
CREATE INDEX "AnalyticsSession_workspaceId_idx" ON "AnalyticsSession"("workspaceId");
CREATE INDEX "AnalyticsSession_startedAt_idx" ON "AnalyticsSession"("startedAt");
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");
CREATE INDEX "AnalyticsEvent_isConversion_idx" ON "AnalyticsEvent"("isConversion");
CREATE INDEX "AIOptimization_type_idx" ON "AIOptimization"("type");
CREATE INDEX "AIOptimization_createdAt_idx" ON "AIOptimization"("createdAt");
CREATE INDEX "PersonalizationRule_isActive_idx" ON "PersonalizationRule"("isActive");
CREATE INDEX "Integration_workspaceId_idx" ON "Integration"("workspaceId");
CREATE INDEX "Integration_type_idx" ON "Integration"("type");
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");
CREATE INDEX "Session_token_idx" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Page" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Component" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ABTest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PageVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnalyticsSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnalyticsEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIOptimization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PersonalizationRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Integration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
