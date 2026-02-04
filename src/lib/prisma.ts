import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL
  if (!url) return undefined

  // Add connection pooling parameters for better performance
  const params: string[] = []

  // Enable PgBouncer compatibility
  if (!url.includes('pgbouncer=true')) {
    params.push('pgbouncer=true')
  }

  // Connection pool settings for serverless environments
  if (!url.includes('connection_limit')) {
    params.push('connection_limit=10')
  }

  // Pool timeout to prevent connection exhaustion
  if (!url.includes('pool_timeout')) {
    params.push('pool_timeout=20')
  }

  if (params.length > 0) {
    url += url.includes('?') ? '&' : '?'
    url += params.join('&')
  }

  return url
}

// Create Prisma client with optimized settings
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Only log errors in production for performance
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})

// Store in global to prevent multiple instances in development/serverless
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
