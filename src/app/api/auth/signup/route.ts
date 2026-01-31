import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
      console.log('[Signup] User already exists:', validatedData.email)
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Create user without password (OAuth-based auth)
    // Note: This app uses OAuth (Google/GitHub) for authentication
    // Passwords are not stored in the database
    console.log('[Signup] Creating new user:', validatedData.email)

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

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
