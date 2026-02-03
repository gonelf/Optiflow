
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface RouteContext {
    params: {
        pageId: string;
        variantId: string;
    };
}

// GET /api/pages/[pageId]/variants/[variantId] - Get a specific variant with its elements
// This should return the base page elements but with variant overrides applied (or just the variant elements if we want to treat them separately)
// For now, let's fetch the variant's elements specifically. 
// If the variant has NO elements yet (newly created), we should probably clone the page elements? 
// Or the frontend handles the initial clone? 
// Let's assume the frontend will fetch the base page elements if variant elements are empty, OR backend clones them on first access.
// Let's go with: Backend returns variant elements. If empty, it returns empty list.
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pageId, variantId } = context.params;

        // Verify access via Page -> Workspace
        const page = await prisma.page.findUnique({
            where: { id: pageId },
            include: {
                workspace: true,
                variants: {
                    where: { id: variantId }
                }
            }
        });

        if (!page) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        // Check workspace membership
        const membership = await prisma.workspaceMember.findFirst({
            where: {
                userId: session.user.id,
                workspaceId: page.workspaceId,
            },
        });

        if (!membership) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const variant = page.variants[0];
        if (!variant) {
            return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
        }

        // Fetch elements specifically for this variant
        // We assume the schema supports linking elements to variants (variantId field on Element)
        const elements = await prisma.element.findMany({
            where: {
                pageId: pageId,
                variantId: variantId
            },
            orderBy: {
                order: 'asc',
            },
        });

        // Also fetch page components (simpler approach: just reuse page components for now, or fetch variant components if any)
        const components = await prisma.component.findMany({
            where: {
                pageId: pageId,
                variantId: variantId
            },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json({
            ...variant,
            elements,
            components,
            // Include some page metadata needed for the editor
            pageTitle: page.title,
            pageSlug: page.slug,
            workspaceSlug: page.workspace.slug,
        });

    } catch (error) {
        console.error('Error fetching variant:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/pages/[pageId]/variants/[variantId] - Update variant elements
export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pageId, variantId } = context.params;
        const body = await req.json();
        const { elements } = body;

        // Verify access
        const page = await prisma.page.findUnique({
            where: { id: pageId },
            select: { workspaceId: true }
        });

        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

        const membership = await prisma.workspaceMember.findFirst({
            where: {
                userId: session.user.id,
                workspaceId: page.workspaceId,
            },
        });

        if (!membership || membership.role === 'VIEWER') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Update Elements
        // Strategy: Delete all existing variant elements and recreate them (same as page editor)
        if (elements && Array.isArray(elements)) {
            await prisma.$transaction(async (tx) => {
                // Delete existing variant elements
                await tx.element.deleteMany({
                    where: {
                        pageId,
                        variantId
                    }
                });

                if (elements.length > 0) {
                    await tx.element.createMany({
                        data: elements.map((el: any) => ({
                            id: el.id,
                            pageId,
                            variantId, // Link to this variant
                            type: el.type,
                            name: el.name,
                            order: el.order,
                            parentId: el.parentId,
                            depth: el.depth,
                            path: el.path || '',
                            content: el.content,
                            styles: el.styles,
                            className: el.className,
                        }))
                    });
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating variant:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
