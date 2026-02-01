
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'gonelf@gmail.com';
    const user = await prisma.user.update({
        where: { email },
        data: { systemRole: 'ADMIN' },
    });
    console.log('Updated user:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
