import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Helper for generating referral codes
function generateCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

const waitlistSchema = z.object({
    email: z.string().email(),
    referredBy: z.string().optional(),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, referredBy } = waitlistSchema.parse(body)

        // Check if already registered
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { message: 'You are already registered!' },
                { status: 400 }
            )
        }

        // Check if already in waitlist
        let waitlistUser = await prisma.waitlistUser.findUnique({
            where: { email },
        })

        if (waitlistUser) {
            return NextResponse.json(
                { user: waitlistUser, message: 'You are already on the waitlist' },
                { status: 200 }
            )
        }

        // New Waitlist User
        // Calculate new position
        const lastUser = await prisma.waitlistUser.findFirst({
            orderBy: { position: 'desc' },
        })

        const startPosition = 3629
        const newPosition = lastUser ? lastUser.position + 1 : startPosition

        // Handle Referral
        let referrer = null
        if (referredBy) {
            referrer = await prisma.waitlistUser.findUnique({
                where: { referralCode: referredBy },
            })
        }

        // Create User
        waitlistUser = await prisma.waitlistUser.create({
            data: {
                email,
                referralCode: generateCode(8), // Unique 8-char code
                referredBy: referrer ? referrer.referralCode : null,
                position: newPosition,
            },
        })

        // Update Referrer (Drop 1 spot)
        if (referrer) {
            // Logic: Swap with the person ahead
            const distinctPositions = await prisma.waitlistUser.findMany({
                where: {
                    position: { lt: referrer.position }
                },
                orderBy: { position: 'desc' },
                take: 1
            })

            if (distinctPositions.length > 0) {
                const personAhead = distinctPositions[0]

                // Swap positions
                await prisma.$transaction([
                    prisma.waitlistUser.update({
                        where: { id: referrer.id },
                        data: {
                            position: personAhead.position,
                            referralCount: { increment: 1 }
                        },
                    }),
                    prisma.waitlistUser.update({
                        where: { id: personAhead.id },
                        data: { position: referrer.position },
                    })
                ])
            } else {
                // Already at top, just increment count
                await prisma.waitlistUser.update({
                    where: { id: referrer.id },
                    data: { referralCount: { increment: 1 } },
                })
            }
        }

        return NextResponse.json(
            { user: waitlistUser, message: 'Joined waitlist successfully' },
            { status: 201 }
        )

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
        }
        console.error('Waitlist Error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
        return NextResponse.json({ message: 'Email required' }, { status: 400 })
    }

    const user = await prisma.waitlistUser.findUnique({
        where: { email },
    })

    if (!user) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    // Calculate people ahead
    const aheadCount = await prisma.waitlistUser.count({
        where: { position: { lt: user.position }, status: 'PENDING' }
    })

    return NextResponse.json({ user, aheadCount })
}
