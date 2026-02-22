import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Simple in-memory rate limiting for health checks
const healthCheckCache = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // max requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = healthCheckCache.get(ip)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    healthCheckCache.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return false
  }

  if (record.count >= RATE_LIMIT) {
    return true
  }

  record.count++
  return false
}

export async function GET(request: Request) {
  // Get client IP for rate limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

  // Rate limit health checks to prevent abuse
  if (isRateLimited(ip)) {
    logger.warn('Health check rate limited', { ip })
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Optional: Require authentication token for detailed health info
  const authToken = request.headers.get('authorization')
  const expectedToken = process.env.HEALTH_CHECK_TOKEN
  const isAuthenticated = expectedToken && authToken === `Bearer ${expectedToken}`

  logger.debug('Health check requested', {
    ip,
    authenticated: isAuthenticated,
  })

  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Reoptimize API is running',
    checks: {
      api: 'healthy'
    }
  }

  // Only run database check if authenticated or no token is set
  if (!expectedToken || isAuthenticated) {
    try {
      await prisma.$queryRaw`SELECT 1`
      health.checks.database = 'connected'
    } catch (error) {
      health.status = 'degraded'
      health.checks.database = 'disconnected'
      health.error = error instanceof Error ? error.message : 'Database error'
      logger.error('Database health check failed', { error })
    }
  } else {
    // Return minimal health info without auth
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is running'
    }, { status: 200 })
  }

  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503
  })
}
