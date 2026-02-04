import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WorkspaceService } from '@/services/workspace.service';
import { AIGeneratorService } from '@/services/ai/generator.service';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const onboardSchema = z.object({
    workspaceName: z.string().min(1),
    productName: z.string().min(1),
    businessDescription: z.string().min(10),
    targetAudience: z.string().min(1),
    keyBenefits: z.string().min(1),
    pageGoal: z.string(),
    brandVoice: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();
        const {
            workspaceName,
            productName,
            businessDescription,
            targetAudience,
            keyBenefits,
            pageGoal,
            brandVoice
        } = onboardSchema.parse(body);

        logger.info('Starting AI Onboarding flow', { userId, workspaceName });

        // 1. Create Workspace
        const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Check for collision and append random if needed
        let finalSlug = slug;
        const existing = await prisma.workspace.findUnique({ where: { slug: finalSlug } });
        if (existing) {
            finalSlug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
        }

        const workspace = await WorkspaceService.create({
            name: workspaceName,
            slug: finalSlug,
            userId,
        });

        // 2. Generate Page Content via AI
        logger.info('Generating AI page for onboarding', { workspaceId: workspace.id });

        // Build a detailed description for the AI
        const pagePurpose = `
Create a landing page for ${productName}.

Business Description: ${businessDescription}
Target Audience: ${targetAudience}
Key Benefits: ${keyBenefits}
Page Goal: ${pageGoal}
Brand Voice: ${brandVoice}

Create a compelling landing page with a hero section, key features, benefits, social proof, and strong call-to-action.
`;

        const generatedContent = await AIGeneratorService.generatePageWithContext({
            pagePurpose,
            pageType: 'landing',
            designStyle: brandVoice,
        });

        // 3. Persist Page & Elements
        const page = await prisma.page.create({
            data: {
                title: generatedContent.title,
                slug: 'index',
                description: generatedContent.description,
                workspaceId: workspace.id,
                authorId: userId,
                status: 'DRAFT',
                seoTitle: generatedContent.seoTitle,
                seoDescription: generatedContent.seoDescription,
            },
        });

        // 4. Create elements from the hierarchical tree structure
        if (generatedContent.elements && generatedContent.elements.length > 0) {
            await AIGeneratorService.createElementsFromTree(
                generatedContent.elements,
                page.id,
                prisma
            );
        }

        logger.info('AI Onboarding completed successfully', {
            workspaceId: workspace.id,
            pageId: page.id
        });

        return NextResponse.json({ workspace, page }, { status: 201 });

    } catch (error: any) {
        logger.error('AI Onboarding error', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Invalid input data' }, { status: 400 });
        }

        return NextResponse.json(
            { message: error.message || 'Failed to complete onboarding' },
            { status: 500 }
        );
    }
}
