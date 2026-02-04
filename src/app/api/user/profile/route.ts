import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Unauthorized. Please log in.' },
                { status: 401 }
            )
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                passwordHash: true,
                createdAt: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        // Return user profile without exposing password hash
        return NextResponse.json(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                hasPassword: !!user.passwordHash,
                createdAt: user.createdAt,
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json(
            { message: 'An error occurred. Please try again later.' },
            { status: 500 }
        )
    }
}
