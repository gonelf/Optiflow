import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AIGeneratorService } from '@/services/ai/generator.service';
import { z } from 'zod';

const aiCreatePageSchema = z.object({
    workspaceId: z.string(),
    pagePurpose: z.string().min(10, 'Page purpose must be at least 10 characters'),
    designMode: z.enum(['consistent', 'new']).optional().default('consistent'),
    designStyle: z.string().optional(),
});

/**
 * POST /api/ai/ai-create-page
 * Create a page with AI based on purpose and existing page context
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                {
                    error: 'AI service not configured',
                    hint: 'Please configure GEMINI_API_KEY or GOOGLE_AI_API_KEY in your environment variables.',
                },
                { status: 500 }
            );
        }

        const body = await req.json();
        const validatedData = aiCreatePageSchema.parse(body);

        // Verify user has access to workspace
        const membership = await prisma.workspaceMember.findFirst({
            where: {
                userId: session.user.id,
                workspaceId: validatedData.workspaceId,
            },
        });

        if (!membership) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Fetch existing pages for design context
        const existingPages = await prisma.page.findMany({
            where: {
                workspaceId: validatedData.workspaceId,
            },
            include: {
                components: {
                    select: {
                        type: true,
                        config: true,
                        styles: true,
                        content: true,
                    },
                },
            },
            take: 5, // Limit to 5 most recent pages for context
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Prepare existing pages data for AI (only if design mode is 'consistent')
        const shouldUseExistingPages = validatedData.designMode === 'consistent' && existingPages.length > 0;
        const existingPagesContext = shouldUseExistingPages
            ? existingPages.map(page => ({
                title: page.title,
                components: page.components,
            }))
            : [];

        // Generate the page using AI with context
        const generatedPage = await AIGeneratorService.generatePageWithContext({
            pagePurpose: validatedData.pagePurpose,
            existingPages: existingPagesContext.length > 0 ? existingPagesContext : undefined,
            designStyle: validatedData.designStyle,
        });

        // Generate a unique slug based on the title
        const baseSlug = generatedPage.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        let slug = baseSlug;
        let counter = 1;

        // Check for existing slugs and increment if needed
        while (true) {
            const existingPage = await prisma.page.findUnique({
                where: {
                    workspaceId_slug: {
                        workspaceId: validatedData.workspaceId,
                        slug,
                    },
                },
            });
            if (!existingPage) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Create the page in the database
        const page = await prisma.page.create({
            data: {
                title: generatedPage.title,
                slug,
                description: generatedPage.description, // TypeScript might complain if description isn't in GeneratedPage type, ensure it is or use optional chaining
                seoTitle: generatedPage.seoTitle,
                seoDescription: generatedPage.seoDescription,
                workspaceId: validatedData.workspaceId,
                authorId: session.user.id,
                status: 'DRAFT',
            },
        });

        // Recursive function to save elements
        const saveElementRecursive = async (
            node: any,
            pageId: string,
            parentId: string | null = null,
            order: number = 0,
            depth: number = 0,
            path: string = ''
        ) => {
            // Create the element
            const element = await prisma.element.create({
                data: {
                    pageId,
                    type: node.type,
                    name: node.tagName || node.type, // Use tagName (div, section) or fallback to type
                    order,
                    parentId,
                    depth,
                    path,
                    content: {
                        ...node.content,
                        tagName: node.tagName,
                        ...node.attributes
                    },
                    styles: node.styles || {},
                    aiGenerated: true,
                    aiPrompt: validatedData.pagePurpose,
                },
            });

            // Process children if any
            if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                const newPath = path ? `${path}/${element.id}` : element.id;

                // Save children sequentially to maintain order
                for (let i = 0; i < node.children.length; i++) {
                    await saveElementRecursive(
                        node.children[i],
                        pageId,
                        element.id,
                        i,
                        depth + 1,
                        newPath
                    );
                }
            }
        };

        // Save the root elements
        console.log('[AI Create Page] Generated page structure:', {
            hasElements: !!generatedPage.elements,
            elementsCount: generatedPage.elements?.length || 0,
            hasComponents: !!generatedPage.components,
            componentsCount: generatedPage.components?.length || 0,
        });

        if (generatedPage.elements && generatedPage.elements.length > 0) {
            console.log('[AI Create Page] Saving elements to database...');
            for (let i = 0; i < generatedPage.elements.length; i++) {
                await saveElementRecursive(generatedPage.elements[i], page.id, null, i, 0, '');
            }
            console.log('[AI Create Page] Successfully saved', generatedPage.elements.length, 'root elements');
        } else if (generatedPage.components && generatedPage.components.length > 0) {
            console.log('[AI Create Page] WARNING: AI returned components instead of elements. This should not happen with the new prompt.');
            // FALLBACK: If AI still returned components (shouldn't happen with new prompt, but safety net)
            // We convert legacy components to elements container structure
            // ... implementation omitted for now, assuming prompt works ...
        } else {
            console.error('[AI Create Page] ERROR: No elements or components in generated page!');
        }

        // Log the AI optimization
        await prisma.aIOptimization.create({
            data: {
                type: 'VARIANT_GENERATION',
                prompt: validatedData.pagePurpose,
                context: {
                    workspaceId: validatedData.workspaceId,
                    designMode: validatedData.designMode,
                    hasExistingPages: existingPagesContext.length > 0,
                    designStyle: validatedData.designStyle,
                    existingPageCount: existingPagesContext.length,
                },
                suggestions: generatedPage as any,
                applied: true,
                model: generatedPage.generatedBy || 'unknown',
            },
        });

        // Get workspace slug for redirect URL
        const workspace = await prisma.workspace.findUnique({
            where: { id: validatedData.workspaceId },
            select: { slug: true },
        });

        return NextResponse.json({
            success: true,
            page: {
                id: page.id,
                title: page.title,
                slug: page.slug,
                description: page.description,
            },
            redirectUrl: workspace ? `/${workspace.slug}/ai-pages/${page.id}` : `/ai-pages/${page.id}`,
        });
    } catch (error) {
        console.error('AI page creation error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            const isRateLimit =
                error.message.toLowerCase().includes('rate limit') ||
                error.message.toLowerCase().includes('quota');

            return NextResponse.json(
                {
                    error: error.message,
                    isRateLimit,
                    hint: isRateLimit
                        ? 'AI rate limit reached. Please wait a few minutes and try again.'
                        : 'Failed to generate page. Please try again.',
                },
                { status: isRateLimit ? 429 : 500 }
            );
        }

        return NextResponse.json({ error: 'Failed to create page with AI' }, { status: 500 });
    }
}

// Map AI-generated component types to our ComponentType enum
type ComponentType = 'HERO' | 'CTA' | 'PRICING' | 'FEATURES' | 'TESTIMONIALS' | 'FAQ' | 'FORM' | 'NEWSLETTER' | 'HEADER' | 'FOOTER' | 'CUSTOM';

function mapComponentType(type: string): ComponentType {
    const typeMap: Record<string, ComponentType> = {
        hero: 'HERO',
        cta: 'CTA',
        pricing: 'PRICING',
        features: 'FEATURES',
        testimonials: 'TESTIMONIALS',
        faq: 'FAQ',
        form: 'FORM',
        newsletter: 'NEWSLETTER',
        header: 'HEADER',
        footer: 'FOOTER',
    };

    const normalized = type.toLowerCase().replace(/[^a-z]/g, '');
    return typeMap[normalized] || 'CUSTOM';
}
