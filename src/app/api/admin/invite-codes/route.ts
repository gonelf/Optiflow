import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function generateCode(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// Generate a unique invite code with collision handling
async function generateUniqueInviteCode(maxAttempts = 10): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = generateCode(10)

        // Check if code already exists
        const existingCode = await prisma.inviteCode.findUnique({
            where: { code }
        })

        if (!existingCode) {
            return code
        }

        // If this is the last attempt, throw an error
        if (attempt === maxAttempts - 1) {
            throw new Error('Failed to generate unique invite code after multiple attempts')
        }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error('Failed to generate unique invite code')
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (session?.user?.systemRole !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { count = 1, maxUses = 1, expiryDate } = await req.json()

    const codes = []
    for (let i = 0; i < count; i++) {
        const uniqueCode = await generateUniqueInviteCode()
        codes.push({
            id: crypto.randomUUID(),
            code: uniqueCode,
            maxUses,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            createdBy: session.user.id,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    // Bulk create
    await prisma.inviteCode.createMany({
        data: codes
    })

    return NextResponse.json({ message: 'Codes generated', count })
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (session?.user?.systemRole !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const codes = await prisma.inviteCode.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(codes)
}
