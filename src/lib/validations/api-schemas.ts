/**
 * Comprehensive Zod validation schemas for all API routes
 * Ensures input validation and prevents injection attacks
 */

import { z } from 'zod';

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z.string().min(1).max(100).optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// PAGE SCHEMAS
// ============================================================================

export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  workspaceId: z.string().cuid(),
  isTemplate: z.boolean().optional(),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  ogImage: z.string().url().optional(),
  favicon: z.string().url().optional(),
  customHead: z.string().max(10000).optional(),
});

export const publishPageSchema = z.object({
  pageId: z.string().cuid(),
});

// ============================================================================
// COMPONENT SCHEMAS
// ============================================================================

export const createComponentSchema = z.object({
  pageId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  type: z.enum([
    'HERO',
    'CTA',
    'PRICING',
    'FEATURES',
    'TESTIMONIALS',
    'FAQ',
    'FORM',
    'NEWSLETTER',
    'HEADER',
    'FOOTER',
    'CUSTOM',
  ]),
  name: z.string().min(1).max(100),
  order: z.number().int().min(0),
  config: z.record(z.any()),
  styles: z.record(z.any()),
  content: z.record(z.any()),
});

export const updateComponentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
  config: z.record(z.any()).optional(),
  styles: z.record(z.any()).optional(),
  content: z.record(z.any()).optional(),
});

// ============================================================================
// A/B TESTING SCHEMAS
// ============================================================================

export const createABTestSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  pageId: z.string().cuid(),
  primaryGoal: z.string().min(1).max(100),
  conversionEvent: z.string().min(1).max(100),
  trafficSplit: z.record(z.number().min(0).max(100)),
  minimumSampleSize: z.number().int().min(100).max(1000000).optional(),
  confidenceLevel: z.number().min(0.8).max(0.99).optional(),
});

export const updateABTestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
  trafficSplit: z.record(z.number().min(0).max(100)).optional(),
  winningVariantId: z.string().cuid().optional(),
});

export const createVariantSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  abTestId: z.string().cuid(),
  pageId: z.string().cuid(),
  isControl: z.boolean().optional(),
});

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

export const trackEventSchema = z.object({
  pageId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  eventType: z.enum(['PAGE_VIEW', 'CLICK', 'FORM_SUBMIT', 'SCROLL', 'TIME_ON_PAGE', 'CONVERSION', 'CUSTOM']),
  eventName: z.string().max(100).optional(),
  eventData: z.record(z.any()).optional(),
  elementId: z.string().max(100).optional(),
  elementType: z.string().max(50).optional(),
  elementText: z.string().max(500).optional(),
  xPosition: z.number().int().min(0).optional(),
  yPosition: z.number().int().min(0).optional(),
  scrollDepth: z.number().int().min(0).max(100).optional(),
  isConversion: z.boolean().optional(),
  conversionValue: z.number().min(0).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  referrer: z.string().max(500).optional(),
});

export const getAnalyticsSchema = z.object({
  workspaceId: z.string().cuid(),
  pageId: z.string().cuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  eventType: z.enum(['PAGE_VIEW', 'CLICK', 'FORM_SUBMIT', 'SCROLL', 'TIME_ON_PAGE', 'CONVERSION', 'CUSTOM']).optional(),
});

// ============================================================================
// AI SCHEMAS
// ============================================================================

export const generatePageSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  pageType: z.enum(['landing', 'pricing', 'about', 'contact', 'blog', 'product']).optional(),
  industry: z.string().max(100).optional(),
  targetAudience: z.string().max(200).optional(),
  brandVoice: z.string().max(200).optional(),
  workspaceId: z.string().cuid(),
  streaming: z.boolean().optional(),
});

export const optimizeContentSchema = z.object({
  type: z.enum(['headline', 'cta', 'description', 'seo']),
  content: z.string().min(1).max(2000),
  goal: z.string().max(500).optional(),
  workspaceId: z.string().cuid(),
});

export const suggestVariantsSchema = z.object({
  type: z.enum(['headline', 'cta', 'seo']),
  current: z.string().min(1).max(500),
  count: z.number().int().min(3).max(10).optional(),
  workspaceId: z.string().cuid(),
});

// ============================================================================
// INTEGRATION SCHEMAS
// ============================================================================

export const createIntegrationSchema = z.object({
  workspaceId: z.string().cuid(),
  type: z.enum([
    'STRIPE',
    'HUBSPOT',
    'SALESFORCE',
    'MAILCHIMP',
    'ZAPIER',
    'WEBHOOK',
    'GOOGLE_ANALYTICS',
    'FACEBOOK_PIXEL',
  ]),
  name: z.string().min(1).max(100),
  config: z.record(z.any()),
});

export const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// WEBHOOK SCHEMAS
// ============================================================================

export const createWebhookSchema = z.object({
  workspaceId: z.string().cuid(),
  url: z.string().url('Invalid webhook URL'),
  events: z
    .array(
      z.enum([
        'page.published',
        'page.unpublished',
        'conversion.created',
        'ab_test.started',
        'ab_test.completed',
        'ab_test.winner_declared',
        'form.submitted',
        'payment.succeeded',
        'payment.failed',
      ])
    )
    .min(1, 'At least one event is required'),
  secret: z.string().min(16).max(100).optional(),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z
    .array(
      z.enum([
        'page.published',
        'page.unpublished',
        'conversion.created',
        'ab_test.started',
        'ab_test.completed',
        'ab_test.winner_declared',
        'form.submitted',
        'payment.succeeded',
        'payment.failed',
      ])
    )
    .optional(),
  active: z.boolean().optional(),
  secret: z.string().min(16).max(100).optional(),
});

// ============================================================================
// WORKSPACE SCHEMAS
// ============================================================================

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  domain: z.string().max(253).optional(),
});

export const inviteMemberSchema = z.object({
  workspaceId: z.string().cuid(),
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

// ============================================================================
// TEMPLATE SCHEMAS
// ============================================================================

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  category: z.enum(['HERO', 'LANDING_PAGE', 'PRICING', 'DEMO', 'FUNNEL', 'WAITLIST', 'COMING_SOON']),
  thumbnail: z.string().url().optional(),
  structure: z.record(z.any()),
  workspaceId: z.string().cuid().optional(),
  isPremium: z.boolean().optional(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
}

/**
 * Validate and parse JSON safely
 */
export function safeJsonParse(json: string): any {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Validate pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
