import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Get a user
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log('No users found')
        return
    }
    console.log(`Testing with user: ${user.email} (${user.id})`)

    // 2. Test findUserWorkspaces (Logic from WorkspaceService.findUserWorkspaces)
    try {
        console.log('Testing findUserWorkspaces...')
        const memberships = await prisma.workspaceMember.findMany({
            where: { userId: user.id },
            include: {
                workspace: {
                    include: {
                        _count: {
                            select: { members: true, pages: true },
                        },
                    },
                },
            },
            orderBy: {
                joinedAt: 'desc',
            },
        })
        console.log(`Found ${memberships.length} memberships`)
        // console.log(JSON.stringify(memberships, null, 2))
    } catch (error) {
        console.error('Error in findUserWorkspaces:', error)
    }

    // 3. Test findBySlug (if any workspace exists)
    const workspace = await prisma.workspace.findFirst()
    if (workspace) {
        console.log(`Testing findBySlug with slug: ${workspace.slug}`)
        try {
            const w = await prisma.workspace.findUnique({
                where: { slug: workspace.slug },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                    startingPage: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            status: true,
                        },
                    },
                },
            })
            console.log('Workspace found successfully')
        } catch (error) {
            console.error('Error in findBySlug:', error)
        }
    } else {
        console.log('No workspaces found to test findBySlug')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
