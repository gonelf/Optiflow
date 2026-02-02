import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { geminiGenerate } from '@/lib/ai/gemini';
import { generateABVariantsPrompt } from '@/lib/ai/prompts';

const VALID_TEXT_TYPES = ['headline', 'cta', 'body', 'subheadline', 'description'] as const;
type TextType = (typeof VALID_TEXT_TYPES)[number];

/**
 * POST /api/ab-tests/ai-variants
 * Generates text variations for A/B test variants using Google Gemini.
 *
 * Body:
 *   testName        string
 *   testDescription string
 *   primaryGoal     string
 *   originalText    string  – the text to create variations of
 *   textType        TextType
 *   count?          number  – how many variations (default 3, max 5)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { testName, testDescription, primaryGoal, originalText, textType, count = 3 } = body;

    if (!testName || !originalText || !textType) {
      return NextResponse.json(
        { error: 'testName, originalText, and textType are required' },
        { status: 400 }
      );
    }

    if (!VALID_TEXT_TYPES.includes(textType as TextType)) {
      return NextResponse.json(
        { error: `textType must be one of: ${VALID_TEXT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const safeCount = Math.min(Math.max(Number(count) || 3, 1), 5);

    const prompt = generateABVariantsPrompt({
      testName,
      testDescription: testDescription || '',
      primaryGoal: primaryGoal || 'conversion',
      originalText,
      textType: textType as TextType,
      count: safeCount,
    });

    const raw = await geminiGenerate(prompt);

    // Extract JSON array from the response (strip any markdown fencing)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI returned an unparseable response' },
        { status: 500 }
      );
    }

    const variations: string[] = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(variations) || variations.some((v) => typeof v !== 'string')) {
      return NextResponse.json(
        { error: 'AI returned an invalid format' },
        { status: 500 }
      );
    }

    return NextResponse.json({ variations });
  } catch (error) {
    console.error('AI variant generation failed:', error);

    if (error instanceof Error && error.message.includes('GOOGLE_AI_API_KEY')) {
      return NextResponse.json(
        { error: 'Google AI API key is not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate AI variants' },
      { status: 500 }
    );
  }
}
