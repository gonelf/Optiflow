import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIGeneratorService } from '@/services/ai/generator.service';
import { z } from 'zod';

const editElementSchema = z.object({
    element: z.record(z.any()), // Accepts any JSON object for the element
    prompt: z.string().min(1, 'Prompt is required'),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = editElementSchema.parse(body);

        const modifiedElement = await AIGeneratorService.editElement(
            validatedData.element,
            validatedData.prompt
        );

        return NextResponse.json({
            success: true,
            element: modifiedElement,
        });
    } catch (error) {
        console.error('AI element edit error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to edit element' },
            { status: 500 }
        );
    }
}
