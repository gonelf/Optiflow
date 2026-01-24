import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIGeneratorService } from '@/services/ai/generator.service';
import { z } from 'zod';

const optimizeSchema = z.object({
  type: z.string(),
  content: z.string().min(1),
  goal: z.string(),
  workspaceId: z.string(),
});

/**
 * POST /api/ai/optimize
 * Get AI-powered optimization suggestions
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
    const validatedData = optimizeSchema.parse(body);

    const suggestions = await AIGeneratorService.generateOptimizations(
      {
        type: validatedData.type,
        content: validatedData.content,
      },
      validatedData.goal
    );

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('AI optimization error:', error);

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
      { error: 'Failed to generate optimizations' },
      { status: 500 }
    );
  }
}
