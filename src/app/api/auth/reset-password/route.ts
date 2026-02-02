import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import prisma from '@/lib/prisma'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    const validatedData = resetPasswordSchema.parse(body)

    // Hash the token to match what's stored in the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(validatedData.token)
      .digest('hex')

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    })

    // Check if token exists and is not expired
    if (!verificationToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token: hashedToken },
      })

      return NextResponse.json(
        { message: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Find the user by email (identifier in verification token)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has a password (OAuth-only users shouldn't be able to reset)
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          message:
            'This account uses social login only. Please sign in with your social account.',
        },
        { status: 400 }
      )
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(validatedData.password, 10)

    // Update user's password and delete the verification token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.verificationToken.delete({
        where: { token: hashedToken },
      }),
    ])

    return NextResponse.json(
      { message: 'Password has been reset successfully. You can now log in with your new password.' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
