import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (session?.user?.systemRole !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            systemRole: true,
            createdAt: true,
            updatedAt: true,
            onboarded: true,
            _count: {
                select: {
                    workspaces: true,
                    pages: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (session?.user?.systemRole !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { userId, systemRole } = body

        if (!userId || !systemRole) {
            return NextResponse.json({ message: 'userId and systemRole are required' }, { status: 400 })
        }

        if (systemRole !== 'USER' && systemRole !== 'ADMIN') {
            return NextResponse.json({ message: 'Invalid systemRole' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { systemRole },
            select: {
                id: true,
                email: true,
                name: true,
                systemRole: true,
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ message: 'Failed to update user' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (session?.user?.systemRole !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')

    if (!userId) {
        return NextResponse.json({ message: 'userId is required' }, { status: 400 })
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
        return NextResponse.json({ message: 'Cannot delete your own account' }, { status: 400 })
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 })
    }
}
