import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { validateEmail } from '@/lib/security/sanitizer'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + 60 * 60 * 1000 }) // 1 hour
    return true
  }

  if (limit.count >= 3) {
    return false
  }

  limit.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    const validatedData = forgotPasswordSchema.parse(body)

    // Additional email validation
    if (!validateEmail(validatedData.email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if user exists (don't reveal if they don't for security)
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      select: { id: true, email: true, name: true, passwordHash: true },
    })

    // Always return success to prevent email enumeration
    // But only send email if user exists and has a password (not OAuth-only users)
    if (user && user.passwordHash) {
      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

      // Token expires in 1 hour
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      // Delete any existing tokens for this user
      await prisma.verificationToken.deleteMany({
        where: { identifier: user.email },
      })

      // Store hashed token in database
      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: hashedToken,
          expires: expiresAt,
        },
      })

      // Send password reset email
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        userName: user.name || undefined,
      })
    }

    // Always return success message (security best practice)
    return NextResponse.json(
      {
        message:
          'If an account with that email exists, we have sent a password reset link.',
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Password reset request error:', error)
    return NextResponse.json(
      { message: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
