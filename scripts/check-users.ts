import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        take: 10,
        select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            systemRole: true,
        },
    })

    console.log('Found users:', users.length)
    users.forEach((user: { id: string; email: string; name: string | null; passwordHash: string | null; systemRole: string }) => {
        console.log('------------------------------------------------')
        console.log(`ID: ${user.id}`)
        console.log(`Email: ${user.email}`)
        console.log(`Name: ${user.name}`)
        console.log(`Role: ${user.systemRole}`)
        console.log(
            `Password Hash: ${user.passwordHash
                ? `Present (${user.passwordHash.substring(0, 10)}...)`
                : 'MISSING'
            }`
        )
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
