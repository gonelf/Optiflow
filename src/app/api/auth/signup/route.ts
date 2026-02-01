import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  inviteCode: z.string().min(1, 'Invite code is required'),
})

export async function POST(req: NextRequest) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.error('[Signup] DATABASE_URL not configured')
      return NextResponse.json(
        { message: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await req.json()
    console.log('[Signup] Received signup request for email:', body.email)

    // Validate input
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Verify Invite Code (Bypass for Admin)
    const isAdminEmail = validatedData.email === 'gonelf@gmail.com'
    let invite = null

    if (!isAdminEmail) {
      invite = await prisma.inviteCode.findUnique({
        where: { code: validatedData.inviteCode },
      })

      if (!invite || !invite.isActive) {
        return NextResponse.json(
          { message: 'Invalid or inactive invite code' },
          { status: 400 }
        )
      }

      if (invite.expiryDate && invite.expiryDate < new Date()) {
        return NextResponse.json(
          { message: 'Invite code has expired' },
          { status: 400 }
        )
      }

      if (invite.usedCount >= invite.maxUses) {
        return NextResponse.json(
          { message: 'Invite code usage limit reached' },
          { status: 400 }
        )
      }
    }

    // Assign Admin Role if email matches specific user
    const sysRole = isAdminEmail ? 'ADMIN' : 'USER'

    // Create user and update invite code in transaction
    console.log('[Signup] Creating new user:', validatedData.email)

    const transaction: any[] = [
      prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: validatedData.name,
          email: validatedData.email,
          systemRole: sysRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })
    ]

    if (invite) {
      transaction.push(
        prisma.inviteCode.update({
          where: { id: invite.id },
          data: { usedCount: { increment: 1 } },
        })
      )
      // Also update waitlist status if they were on it
      transaction.push(
        prisma.waitlistUser.updateMany({
          where: { email: validatedData.email },
          data: { status: 'REGISTERED' }
        })
      )
    }

    const [user] = await prisma.$transaction(transaction as any)

    // Update waitlist position for others? (Not strictly required for registrants unless we want to remove them from the line)

    console.log('[Signup] User created successfully:', user.id)

    return NextResponse.json(
      { user, message: 'Account created successfully' },
      { status: 201 }
    )
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('[Signup] Validation error:', error.errors)
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('[Signup] Prisma error:', error.code, error.message)

      // Handle unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json(
          { message: 'User already exists with this email' },
          { status: 400 }
        )
      }

      // Handle connection errors
      if (error.code === 'P1001' || error.code === 'P1002') {
        return NextResponse.json(
          { message: 'Database connection error. Please try again.' },
          { status: 503 }
        )
      }
    }

    // Handle Prisma initialization errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('[Signup] Prisma initialization error:', error.message)
      return NextResponse.json(
        { message: 'Database not available. Please try again later.' },
        { status: 503 }
      )
    }

    console.error('[Signup] Unexpected error:', error)

    // Return more detailed error in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          message: 'Failed to create account',
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create account. Please try again later.' },
      { status: 500 }
    )
  }
}
