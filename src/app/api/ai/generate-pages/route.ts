import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AIGeneratorService } from '@/services/ai/generator.service'
import { z } from 'zod'

const generatePagesSchema = z.object({
    workspaceId: z.string(),
    pageType: z.enum(['landing', 'about', 'pricing', 'contact', 'blog', 'product']),
    businessDescription: z.string().min(10),
    industry: z.string(),
    targetAudience: z.string(),
    brandVoice: z.string(),
})

/**
 * POST /api/ai/generate-pages
 * Generate a page with AI and save it to the workspace
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                {
                    error: 'Gemini API key not configured',
                    hint: 'Please configure GEMINI_API_KEY in your environment variables.',
                },
                { status: 500 }
            )
        }

        const body = await req.json()
        const validatedData = generatePagesSchema.parse(body)

        // Verify user has access to workspace
        const membership = await prisma.workspaceMember.findFirst({
            where: {
                userId: session.user.id,
                workspaceId: validatedData.workspaceId,
            },
        })

        if (!membership) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // Build a detailed prompt for the page type
        const pageTypeDescriptions: Record<string, string> = {
            landing: 'A landing page with a compelling hero section, key features, social proof, and strong call-to-action',
            about: 'An about page showcasing the company story, mission, values, and team',
            pricing: 'A pricing page with clear plan comparison, features list, and signup CTAs',
            contact: 'A contact page with a contact form, location info, and support options',
            blog: 'A blog landing page with article listings and categories',
            product: 'A product/services page showcasing offerings with details and benefits',
        }

        const fullDescription = `
Business: ${validatedData.businessDescription}
Industry: ${validatedData.industry}
Target Audience: ${validatedData.targetAudience}
Brand Voice: ${validatedData.brandVoice}

Create ${pageTypeDescriptions[validatedData.pageType]}
`

        // Generate the page using AI
        const generatedPage = await AIGeneratorService.generatePage({
            description: fullDescription,
            industry: validatedData.industry,
            targetAudience: validatedData.targetAudience,
            brandVoice: validatedData.brandVoice,
            pageType: validatedData.pageType,
        })

        // Generate a unique slug for this page
        const baseSlug = validatedData.pageType
        let slug: string = baseSlug
        let counter = 1

        // Check for existing slugs and increment if needed
        while (true) {
            const existingPage = await prisma.page.findUnique({
                where: {
                    workspaceId_slug: {
                        workspaceId: validatedData.workspaceId,
                        slug,
                    },
                },
            })
            if (!existingPage) break
            slug = `${baseSlug}-${counter}`
            counter++
        }

        // Create the page in the database
        const page = await prisma.page.create({
            data: {
                title: generatedPage.title,
                slug,
                description: generatedPage.description,
                seoTitle: generatedPage.seoTitle,
                seoDescription: generatedPage.seoDescription,
                workspaceId: validatedData.workspaceId,
                authorId: session.user.id,
                status: 'DRAFT',
            },
        })

        // Create the components for this page
        if (generatedPage.components && generatedPage.components.length > 0) {
            const componentData = generatedPage.components.map((component, index) => ({
                pageId: page.id,
                type: mapComponentType(component.type),
                name: component.type || `Component ${index + 1}`,
                order: index,
                config: component.props || {},
                styles: {},
                content: component.content || {},
                aiGenerated: true,
                aiPrompt: fullDescription,
            }))

            await prisma.component.createMany({
                data: componentData,
            })
        }

        // Log the AI optimization
        await prisma.aIOptimization.create({
            data: {
                type: 'VARIANT_GENERATION',
                prompt: fullDescription,
                context: {
                    pageType: validatedData.pageType,
                    industry: validatedData.industry,
                    workspaceId: validatedData.workspaceId,
                },
                suggestions: generatedPage as any,
                applied: true,
                model: generatedPage.generatedBy || 'unknown',
            },
        })

        return NextResponse.json({
            success: true,
            page: {
                id: page.id,
                title: page.title,
                slug: page.slug,
                description: page.description,
            },
        })
    } catch (error) {
        console.error('AI page generation error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }

        if (error instanceof Error) {
            const isRateLimit =
                error.message.toLowerCase().includes('rate limit') ||
                error.message.toLowerCase().includes('quota')

            return NextResponse.json(
                {
                    error: error.message,
                    isRateLimit,
                    hint: isRateLimit
                        ? 'AI rate limit reached. Please wait a few minutes and try again.'
                        : 'Failed to generate page. Please try again.',
                },
                { status: isRateLimit ? 429 : 500 }
            )
        }

        return NextResponse.json({ error: 'Failed to generate page' }, { status: 500 })
    }
}

// Map AI-generated component types to our ComponentType enum
type ComponentType = 'HERO' | 'CTA' | 'PRICING' | 'FEATURES' | 'TESTIMONIALS' | 'FAQ' | 'FORM' | 'NEWSLETTER' | 'HEADER' | 'FOOTER' | 'CUSTOM'

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
    }

    const normalized = type.toLowerCase().replace(/[^a-z]/g, '')
    return typeMap[normalized] || 'CUSTOM'
}

