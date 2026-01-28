/**
 * Page Translations API
 * GET /api/translations/[pageId] - Get all translations for a page
 * POST /api/translations/[pageId] - Create/update translation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getPageTranslations,
  upsertPageTranslation,
  getPageTranslation,
} from '@/services/i18n/translation.service';
import { z } from 'zod';

export async function GET(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pageId } = params;

    // Check if requesting specific locale
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale');

    // TODO: Verify user has access to this page

    if (locale) {
      // Get specific translation
      const translation = await getPageTranslation(pageId, locale);

      if (!translation) {
        return NextResponse.json(
          { error: 'Translation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ translation });
    }

    // Get all translations
    const translations = await getPageTranslations(pageId);

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Error fetching translations:', error);

    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

const createTranslationSchema = z.object({
  locale: z.string(),
  title: z.string(),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  components: z.any(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED']).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pageId } = params;

    // Parse request body
    const body = await req.json();
    const data = createTranslationSchema.parse(body);

    // TODO: Verify user has access to this page

    // Create/update translation
    const translation = await upsertPageTranslation(pageId, data.locale, {
      title: data.title,
      description: data.description,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      components: data.components,
      status: data.status,
      translatedBy: session.user.id,
    });

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Error creating/updating translation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create/update translation' },
      { status: 500 }
    );
  }
}
