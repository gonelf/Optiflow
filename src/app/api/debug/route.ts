import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    logger.info('Debug endpoint requested', {
      headers: Object.fromEntries(request.headers.entries()),
    })

    // Check environment variables
    const envCheck = {
      hasDatabase: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
    }

    logger.info('Environment check completed', envCheck)

    return NextResponse.json({
      status: 'ok',
      message: 'Reoptimize API is running',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      logging: {
        enabled: true,
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      },
    })
  } catch (error: any) {
    logger.error('Debug endpoint error', error)

    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
