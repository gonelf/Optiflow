import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Unauthorized. Please log in.' },
                { status: 401 }
            )
        }

        const body = await req.json()

        // Validate request body
        const validatedData = changePasswordSchema.parse(body)

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        // Check if user has a password (OAuth-only users cannot change password)
        if (!user.passwordHash) {
            return NextResponse.json(
                {
                    message:
                        'This account uses social login only. Password changes are not available for OAuth accounts.',
                },
                { status: 400 }
            )
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
            validatedData.currentPassword,
            user.passwordHash
        )

        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { message: 'Current password is incorrect' },
                { status: 400 }
            )
        }

        // Check that new password is different from current password
        const isSamePassword = await bcrypt.compare(
            validatedData.newPassword,
            user.passwordHash
        )

        if (isSamePassword) {
            return NextResponse.json(
                { message: 'New password must be different from current password' },
                { status: 400 }
            )
        }

        // Hash the new password
        const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 10)

        // Update user's password
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash },
        })

        return NextResponse.json(
            { message: 'Password changed successfully' },
            { status: 200 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Password change error:', error)
        return NextResponse.json(
            { message: 'An error occurred. Please try again later.' },
            { status: 500 }
        )
    }
}
