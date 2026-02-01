/**
 * Next.js Instrumentation
 * Runs once when the Next.js server starts
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('./lib/logger')

    logger.info('🚀 OptiVibe Application Starting', {
      nodeEnv: process.env.NODE_ENV,
      nextRuntime: process.env.NEXT_RUNTIME,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
    })

    // Check critical environment variables
    const envCheck = {
      database: !!process.env.DATABASE_URL,
      directUrl: !!process.env.DIRECT_URL,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: !!process.env.NEXTAUTH_URL,
    }

    logger.info('Environment variables check', envCheck)

    // Warn about missing critical variables
    if (!envCheck.database) {
      logger.error('❌ DATABASE_URL is not set - database operations will fail')
    }
    if (!envCheck.nextAuthSecret) {
      logger.error('❌ NEXTAUTH_SECRET is not set - authentication will fail')
    }
    if (!envCheck.nextAuthUrl) {
      logger.warn('⚠️  NEXTAUTH_URL is not set - OAuth callbacks may fail')
    }

    // Test Prisma client
    try {
      const { prisma } = await import('./lib/prisma')
      await prisma.$connect()
      logger.info('✅ Database connection successful')
      await prisma.$disconnect()
    } catch (error) {
      logger.error('❌ Database connection failed', error)
    }

    logger.info('✅ OptiVibe Application Started Successfully')
  }
}
