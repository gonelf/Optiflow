import { prisma } from '../src/lib/prisma';

async function main() {
    try {
        // Get the most recent page
        const page = await prisma.page.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                elements: {
                    take: 10, // Check first 10 elements
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
        });

        if (!page) {
            console.log('No pages found');
            return;
        }

        console.log(`Checking Page: ${page.title} (${page.id})`);
        console.log('--- Elements ---');
        page.elements.forEach(el => {
            console.log(`Type: ${el.type}, Name: ${el.name}`);
            console.log('Styles:', JSON.stringify(el.styles, null, 2));
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
