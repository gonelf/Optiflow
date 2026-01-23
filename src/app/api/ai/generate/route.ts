import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIGeneratorService } from '@/services/ai/generator.service';
import { z } from 'zod';

const generatePageSchema = z.object({
  description: z.string().min(10),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  brandVoice: z.string().optional(),
  pageType: z.enum(['landing', 'pricing', 'about', 'contact', 'blog', 'product']).optional(),
  workspaceId: z.string(),
});

/**
 * POST /api/ai/generate
 * Generate a page using AI
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const validatedData = generatePageSchema.parse(body);

    // TODO: Verify user has access to workspace
    // const hasAccess = await WorkspaceService.hasAccess(
    //   validatedData.workspaceId,
    //   session.user.id
    // );
    // if (!hasAccess) {
    //   return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    // }

    const generatedPage = await AIGeneratorService.generatePage({
      description: validatedData.description,
      industry: validatedData.industry,
      targetAudience: validatedData.targetAudience,
      brandVoice: validatedData.brandVoice,
      pageType: validatedData.pageType,
    });

    return NextResponse.json({
      success: true,
      page: generatedPage,
    });
  } catch (error) {
    console.error('AI generation error:', error);

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
      { error: 'Failed to generate page' },
      { status: 500 }
    );
  }
}
