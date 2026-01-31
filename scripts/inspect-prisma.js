const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const page = await prisma.page.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                elements: {
                    take: 10,
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
        if (page.elements.length === 0) {
            console.log('No elements found for this page.');
        }
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
