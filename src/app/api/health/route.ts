import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  logger.info('Health check requested', {
    headers: Object.fromEntries(request.headers.entries()),
  })

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'OptiFlow API is running'
  })
}
