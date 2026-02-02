import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { geminiGenerate } from '@/lib/ai/gemini';
import { generateABWinnerSuggestionPrompt } from '@/lib/ai/prompts';
import { testMultipleVariants } from '@/lib/statistics/significance';

/**
 * POST /api/ab-tests/[testId]/ai-suggest
 * Analyses test results and uses Gemini to suggest a winning variant.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = params;

    // Fetch the test with variants
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: {
        page: {
          select: {
            workspace: {
              include: {
                members: {
                  where: { user: { email: session.user.email } },
                },
              },
            },
          },
        },
        variants: true,
      },
    });

    if (!test || test.page.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const variants = test.variants as Array<{
      id: string;
      name: string;
      isControl: boolean;
      impressions: number;
      conversions: number;
      conversionRate: number;
    }>;

    if (variants.length < 2) {
      return NextResponse.json(
        { error: 'Test needs at least 2 variants to analyse' },
        { status: 400 }
      );
    }

    // Compute statistical significance
    const controlVariant = variants.find((v) => v.isControl);
    const testVariants = variants.filter((v) => !v.isControl);

    let hasSignificance = false;
    let pValue = 1;

    if (controlVariant && testVariants.length > 0) {
      const result = testMultipleVariants(
        {
          id: controlVariant.id,
          conversions: controlVariant.conversions,
          impressions: controlVariant.impressions,
        },
        testVariants.map((v) => ({
          id: v.id,
          conversions: v.conversions,
          impressions: v.impressions,
        })),
        {
          confidenceLevel: test.confidenceLevel,
          minimumSampleSize: test.minimumSampleSize,
        }
      );
      hasSignificance = result.hasSignificance;
      if (result.comparisons.length > 0) {
        pValue = Math.min(...result.comparisons.map((c) => c.vsControl.pValue));
      }
    }

    // Build prompt input
    const prompt = generateABWinnerSuggestionPrompt({
      testName: test.name,
      testDescription: test.description || '',
      primaryGoal: test.primaryGoal,
      conversionEvent: test.conversionEvent,
      confidenceLevel: test.confidenceLevel,
      variants: variants.map((v) => ({
        name: v.name,
        isControl: v.isControl,
        impressions: v.impressions,
        conversions: v.conversions,
        conversionRate: v.conversionRate,
      })),
      hasStatisticalSignificance: hasSignificance,
      pValue,
      minimumSampleSize: test.minimumSampleSize,
    });

    const raw = await geminiGenerate(prompt);

    // Extract JSON object from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI returned an unparseable response' },
        { status: 500 }
      );
    }

    const suggestion = JSON.parse(jsonMatch[0]);

    if (!suggestion.recommendedVariant || !suggestion.confidence || !suggestion.reasoning) {
      return NextResponse.json(
        { error: 'AI returned an incomplete suggestion' },
        { status: 500 }
      );
    }

    // Resolve the recommended variant name to an ID
    const recommendedVariant = variants.find(
      (v) => v.name === suggestion.recommendedVariant
    );

    return NextResponse.json({
      recommendedVariantId: recommendedVariant?.id ?? null,
      recommendedVariantName: suggestion.recommendedVariant,
      confidence: suggestion.confidence,
      reasoning: suggestion.reasoning,
      caveats: suggestion.caveats || '',
    });
  } catch (error) {
    console.error('AI winner suggestion failed:', error);

    if (error instanceof Error && error.message.includes('GOOGLE_AI_API_KEY')) {
      return NextResponse.json(
        { error: 'Google AI API key is not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get AI suggestion' },
      { status: 500 }
    );
  }
}
