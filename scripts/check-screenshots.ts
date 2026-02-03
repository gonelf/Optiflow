import { prisma } from '../src/lib/prisma';

async function main() {
    const pages = await prisma.page.findMany({
        select: {
            id: true,
            title: true,
            screenshotUrl: true,
        },
        take: 10,
        orderBy: { updatedAt: 'desc' }
    });

    console.log('Recent Pages:');
    pages.forEach((p: { id: string; title: string; screenshotUrl: string | null }) => {
        console.log(`- ${p.title} (${p.id}): Screenshot length: ${p.screenshotUrl ? p.screenshotUrl.length : 'NULL'}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
