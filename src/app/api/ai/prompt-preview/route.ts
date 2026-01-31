import { NextRequest, NextResponse } from 'next/server';
import { generatePagePrompt } from '@/lib/ai/prompts';
import { GeneratePageInput } from '@/services/ai/generator.service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Construct the input object safely
        const input: GeneratePageInput = {
            description: body.description || '',
            industry: body.industry,
            targetAudience: body.targetAudience,
            brandVoice: body.brandVoice,
            pageType: body.pageType || 'landing',
        };

        const prompt = generatePagePrompt(input);

        return NextResponse.json({ prompt });
    } catch (error) {
        console.error('Error generating prompt preview:', error);
        return NextResponse.json(
            { error: 'Failed to generate prompt preview' },
            { status: 500 }
        );
    }
}
