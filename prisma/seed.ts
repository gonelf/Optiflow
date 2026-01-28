import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started...');

    // 1. Create a Default Workspace
    const workspace = await prisma.workspace.upsert({
        where: { slug: 'default-workspace' },
        update: {},
        create: {
            name: 'Default Workspace',
            slug: 'default-workspace',
        },
    });

    // 2. Create a Design System for the workspace
    await prisma.designSystem.upsert({
        where: { workspaceId: workspace.id },
        update: {},
        create: {
            workspaceId: workspace.id,
            name: 'OptiFlow Standard',
            colors: {
                primary: '#3b82f6',
                secondary: '#64748b',
                accent: '#8b5cf6',
                background: '#ffffff',
                foreground: '#0f172a',
            },
            spacing: {
                xs: '4px',
                sm: '8px',
                md: '16px',
                lg: '24px',
                xl: '32px',
            },
            typography: {
                fonts: {
                    sans: 'Inter, system-ui, sans-serif',
                    mono: 'JetBrains Mono, monospace',
                },
            },
            borderRadius: {
                none: '0',
                sm: '2px',
                md: '4px',
                lg: '8px',
                full: '9999px',
            },
            shadows: {
                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
            breakpoints: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
            },
        },
    });

    // 3. Create a Default User (Author)
    const user = await prisma.user.upsert({
        where: { email: 'admin@optiflow.com' },
        update: {},
        create: {
            email: 'admin@optiflow.com',
            name: 'Admin User',
        },
    });

    // 4. Create a Sample Page
    const pageData = {
        title: 'Sample Landing Page',
        slug: 'sample-page',
        description: 'A sample page demonstrating Phase 8 elements',
        workspaceId: workspace.id,
        authorId: user.id,
    };

    const page = await prisma.page.upsert({
        where: {
            workspaceId_slug: {
                workspaceId: workspace.id,
                slug: 'sample-page',
            },
        },
        update: pageData,
        create: pageData,
    });

    // 5. Create Sample Elements (Check if they already exist to be idempotent)
    const existingElements = await prisma.element.findMany({
        where: { pageId: page.id },
    });

    if (existingElements.length === 0) {
        // Container
        const container = await prisma.element.create({
            data: {
                pageId: page.id,
                type: 'CONTAINER',
                name: 'Main Container',
                order: 0,
                depth: 0,
                path: '',
                content: {},
                styles: {
                    base: {
                        padding: '40px',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px',
                    },
                },
            },
        });

        // Hero Text inside container
        await prisma.element.create({
            data: {
                pageId: page.id,
                parentId: container.id,
                type: 'TEXT',
                name: 'Hero Headline',
                order: 0,
                depth: 1,
                path: container.id,
                content: {
                    text: 'Build faster with Primitives',
                    tag: 'h1',
                },
                styles: {
                    base: {
                        fontSize: '48px',
                        fontWeight: '800',
                        color: '#1e293b',
                        textAlign: 'center',
                    },
                },
            },
        });

        // Button inside container
        await prisma.element.create({
            data: {
                pageId: page.id,
                parentId: container.id,
                type: 'BUTTON',
                name: 'CTA Button',
                order: 1,
                depth: 1,
                path: container.id,
                content: {
                    text: 'Get Started',
                    variant: 'primary',
                },
                styles: {
                    base: {
                        padding: '12px 24px',
                        borderRadius: '8px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        fontWeight: '600',
                    },
                },
            },
        });
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
