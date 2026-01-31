import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { message: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await req.json()

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

    // Create user without password (OAuth-based auth)
    // Note: This app uses OAuth (Google/GitHub) for authentication
    // Passwords are not stored in the database
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

    return NextResponse.json(
      { user, message: 'Account created successfully' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)

    // Return more detailed error in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          message: 'Failed to create account',
          error: error instanceof Error ? error.message : 'Unknown error',
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
