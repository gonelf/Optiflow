/**
 * Translation Service
 * Manages multi-language support for pages
 */

import { prisma } from '@/lib/prisma';

export interface Translation {
  id: string;
  pageId: string;
  locale: string;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  components: any;
  status: string;
  translatedBy: string | null;
  reviewedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportedLocale {
  id: string;
  workspaceId: string;
  code: string;
  name: string;
  isDefault: boolean;
  isEnabled: boolean;
}

/**
 * Get supported locales for a workspace
 */
export async function getSupportedLocales(
  workspaceId: string
): Promise<SupportedLocale[]> {
  const locales = await prisma.supportedLocale.findMany({
    where: {
      workspaceId,
      isEnabled: true,
    },
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' },
    ],
  });

  return locales.map((locale: {
    id: string;
    workspaceId: string;
    code: string;
    name: string;
    isDefault: boolean;
    isEnabled: boolean;
  }) => ({
    id: locale.id,
    workspaceId: locale.workspaceId,
    code: locale.code,
    name: locale.name,
    isDefault: locale.isDefault,
    isEnabled: locale.isEnabled,
  }));
}

/**
 * Add a supported locale to workspace
 */
export async function addSupportedLocale(
  workspaceId: string,
  code: string,
  name: string,
  isDefault = false
): Promise<SupportedLocale> {
  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.supportedLocale.updateMany({
      where: {
        workspaceId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const locale = await prisma.supportedLocale.create({
    data: {
      workspaceId,
      code,
      name,
      isDefault,
      isEnabled: true,
    },
  });

  return {
    id: locale.id,
    workspaceId: locale.workspaceId,
    code: locale.code,
    name: locale.name,
    isDefault: locale.isDefault,
    isEnabled: locale.isEnabled,
  };
}

/**
 * Get translation for a page in a specific locale
 */
export async function getPageTranslation(
  pageId: string,
  locale: string
): Promise<Translation | null> {
  const translation = await prisma.pageTranslation.findUnique({
    where: {
      pageId_locale: {
        pageId,
        locale,
      },
    },
  });

  if (!translation) {
    return null;
  }

  return {
    id: translation.id,
    pageId: translation.pageId,
    locale: translation.locale,
    title: translation.title,
    description: translation.description,
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
    components: translation.components,
    status: translation.status,
    translatedBy: translation.translatedBy,
    reviewedBy: translation.reviewedBy,
    createdAt: translation.createdAt,
    updatedAt: translation.updatedAt,
  };
}

/**
 * Create or update a page translation
 */
export async function upsertPageTranslation(
  pageId: string,
  locale: string,
  data: {
    title: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    components: any;
    status?: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';
    translatedBy?: string;
  }
): Promise<Translation> {
  const translation = await prisma.pageTranslation.upsert({
    where: {
      pageId_locale: {
        pageId,
        locale,
      },
    },
    create: {
      pageId,
      locale,
      title: data.title,
      description: data.description,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      components: data.components,
      status: data.status || 'DRAFT',
      translatedBy: data.translatedBy,
    },
    update: {
      title: data.title,
      description: data.description,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      components: data.components,
      status: data.status,
      translatedBy: data.translatedBy,
    },
  });

  return {
    id: translation.id,
    pageId: translation.pageId,
    locale: translation.locale,
    title: translation.title,
    description: translation.description,
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
    components: translation.components,
    status: translation.status,
    translatedBy: translation.translatedBy,
    reviewedBy: translation.reviewedBy,
    createdAt: translation.createdAt,
    updatedAt: translation.updatedAt,
  };
}

/**
 * Get all translations for a page
 */
export async function getPageTranslations(
  pageId: string
): Promise<Translation[]> {
  const translations = await prisma.pageTranslation.findMany({
    where: { pageId },
    orderBy: { locale: 'asc' },
  });

  return translations.map((translation: {
    id: string;
    pageId: string;
    locale: string;
    title: string;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    components: unknown;
    status: string;
    translatedBy: string | null;
    reviewedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) => ({
    id: translation.id,
    pageId: translation.pageId,
    locale: translation.locale,
    title: translation.title,
    description: translation.description,
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
    components: translation.components,
    status: translation.status,
    translatedBy: translation.translatedBy,
    reviewedBy: translation.reviewedBy,
    createdAt: translation.createdAt,
    updatedAt: translation.updatedAt,
  }));
}

/**
 * Auto-translate page using AI
 */
export async function autoTranslatePage(
  pageId: string,
  targetLocale: string,
  userId: string
): Promise<Translation> {
  // Get the original page
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      components: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!page) {
    throw new Error('Page not found');
  }

  // TODO: Integrate with AI translation service (OpenAI, Google Translate, etc.)
  // For now, we'll create a placeholder translation

  const translatedComponents = page.components.map((comp: {
    id: string;
    content: unknown;
    [key: string]: unknown;
  }) => ({
    ...comp,
    content: {
      ...(typeof comp.content === 'object' && comp.content !== null ? comp.content as Record<string, unknown> : {}),
      // Placeholder: In production, this would be translated by AI
      _translated: true,
      _targetLocale: targetLocale,
    },
  }));

  return await upsertPageTranslation(pageId, targetLocale, {
    title: `${page.title} (${targetLocale})`,
    description: page.description || undefined,
    seoTitle: page.seoTitle || undefined,
    seoDescription: page.seoDescription || undefined,
    components: translatedComponents,
    status: 'DRAFT',
    translatedBy: 'AI',
  });
}

/**
 * Update translation status
 */
export async function updateTranslationStatus(
  pageId: string,
  locale: string,
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED',
  reviewedBy?: string
): Promise<Translation> {
  const translation = await prisma.pageTranslation.update({
    where: {
      pageId_locale: {
        pageId,
        locale,
      },
    },
    data: {
      status,
      reviewedBy,
    },
  });

  return {
    id: translation.id,
    pageId: translation.pageId,
    locale: translation.locale,
    title: translation.title,
    description: translation.description,
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
    components: translation.components,
    status: translation.status,
    translatedBy: translation.translatedBy,
    reviewedBy: translation.reviewedBy,
    createdAt: translation.createdAt,
    updatedAt: translation.updatedAt,
  };
}

/**
 * Delete a translation
 */
export async function deleteTranslation(
  pageId: string,
  locale: string
): Promise<void> {
  await prisma.pageTranslation.delete({
    where: {
      pageId_locale: {
        pageId,
        locale,
      },
    },
  });
}

/**
 * Get translation completion status for a page
 */
export async function getTranslationCompletion(
  pageId: string,
  workspaceId: string
): Promise<{
  total: number;
  translated: number;
  inReview: number;
  approved: number;
  published: number;
  completion: number;
}> {
  const [supportedLocales, translations] = await Promise.all([
    getSupportedLocales(workspaceId),
    getPageTranslations(pageId),
  ]);

  const total = supportedLocales.length;
  const translationsByStatus = {
    DRAFT: 0,
    IN_REVIEW: 0,
    APPROVED: 0,
    PUBLISHED: 0,
  };

  translations.forEach(t => {
    translationsByStatus[t.status as keyof typeof translationsByStatus]++;
  });

  const translated = translations.length;
  const completion = total > 0 ? (translated / total) * 100 : 0;

  return {
    total,
    translated,
    inReview: translationsByStatus.IN_REVIEW,
    approved: translationsByStatus.APPROVED,
    published: translationsByStatus.PUBLISHED,
    completion: Math.round(completion),
  };
}
