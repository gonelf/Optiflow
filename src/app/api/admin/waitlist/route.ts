import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (session?.user?.systemRole !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const users = await prisma.waitlistUser.findMany({
            orderBy: { position: 'asc' }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error in GET /api/admin/waitlist:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (session?.user?.systemRole !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ message: 'ID required' }, { status: 400 })
    }

    await prisma.waitlistUser.delete({
        where: { id }
    })

    return NextResponse.json({ message: 'User removed' })
}
