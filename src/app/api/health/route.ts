import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  logger.info('Health check requested', {
    headers: Object.fromEntries(request.headers.entries()),
  })

  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Reoptimize API is running',
    checks: {
      api: 'healthy'
    }
  }

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`
    health.checks.database = 'connected'
  } catch (error) {
    health.status = 'degraded'
    health.checks.database = 'disconnected'
    health.error = error instanceof Error ? error.message : 'Database error'
    logger.error('Database health check failed', { error })
  }

  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503
  })
}
