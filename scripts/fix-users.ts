import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        where: {
            passwordHash: null,
        },
    })

    console.log(`Found ${users.length} users ensuring password hash...`)

    // Default password for dev: "password123"
    // In a real scenario, you might just want to force a reset, but for local dev this is fine.
    const hashedPassword = await bcrypt.hash('password123', 10)

    for (const user of users) {
        console.log(`Updating user: ${user.email}`)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
            },
        })
    }

    console.log('Done! All users have been updated with password: "password123"')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
