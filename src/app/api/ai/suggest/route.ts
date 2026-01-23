import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIGeneratorService } from '@/services/ai/generator.service';
import { z } from 'zod';

const suggestSchema = z.object({
  type: z.enum(['headline', 'cta', 'seo']),
  content: z.string().min(1),
  context: z.string().optional(),
  count: z.number().min(1).max(10).optional(),
  workspaceId: z.string(),
});

/**
 * POST /api/ai/suggest
 * Get AI-powered suggestions for headlines, CTAs, etc.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const validatedData = suggestSchema.parse(body);

    let suggestions;

    switch (validatedData.type) {
      case 'headline':
        suggestions = await AIGeneratorService.generateHeadlineVariants(
          validatedData.content,
          validatedData.count || 5
        );
        break;

      case 'cta':
        // For CTAs, we can reuse headline generation with different context
        suggestions = await AIGeneratorService.generateHeadlineVariants(
          validatedData.content,
          validatedData.count || 5
        );
        break;

      case 'seo':
        const seoData = await AIGeneratorService.generateSEOMetadata(
          validatedData.content
        );
        suggestions = {
          title: seoData.title,
          description: seoData.description,
          keywords: seoData.keywords,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid suggestion type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type: validatedData.type,
      suggestions,
    });
  } catch (error) {
    console.error('AI suggestion error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
