import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { logger } from './lib/logger'

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname, search } = request.nextUrl
  const method = request.method
  const fullPath = search ? `${pathname}${search}` : pathname

  // Generate request ID for tracking
  const requestId = crypto.randomUUID()

  // Log incoming request
  logger.request(method, fullPath, {
    requestId,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
  })

  try {
    // Allow public routes
    if (
      pathname === '/' ||
      pathname.startsWith('/api/health') ||
      pathname.startsWith('/api/debug') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon')
    ) {
      logger.debug(`Public route allowed: ${pathname}`, { requestId })
      const response = NextResponse.next()
      response.headers.set('x-request-id', requestId)

      const duration = Date.now() - startTime
      logger.response(method, fullPath, 200, duration, { requestId })

      return response
    }

    // Protected routes (dashboard and workspace APIs)
    if (
      pathname.startsWith('/dashboard') ||
      pathname.match(/^\/[^\/]+\/(settings|pages|templates)/) ||
      pathname.startsWith('/api/workspaces')
    ) {
      logger.debug(`Checking auth for protected route: ${pathname}`, { requestId })

      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        })

        if (!token) {
          logger.warn(`Unauthorized access attempt to ${pathname}`, {
            requestId,
            redirectTo: '/login',
          })

          const duration = Date.now() - startTime
          logger.response(method, fullPath, 401, duration, { requestId })

          return NextResponse.redirect(new URL('/login', request.url))
        }

        logger.debug(`Auth successful for user: ${token.email}`, {
          requestId,
          userId: token.sub,
        })
      } catch (error) {
        // If auth check fails (e.g., NEXTAUTH_SECRET not set), log and allow through
        logger.error('Auth middleware error', error, {
          requestId,
          pathname,
          envCheck: {
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
          },
        })

        const response = NextResponse.next()
        response.headers.set('x-request-id', requestId)
        response.headers.set('x-auth-error', 'true')

        const duration = Date.now() - startTime
        logger.response(method, fullPath, 500, duration, { requestId, authError: true })

        return response
      }
    }

    const response = NextResponse.next()
    response.headers.set('x-request-id', requestId)

    const duration = Date.now() - startTime
    logger.response(method, fullPath, 200, duration, { requestId })

    return response
  } catch (error) {
    logger.error('Middleware error', error, {
      requestId,
      method,
      pathname,
    })

    const duration = Date.now() - startTime
    logger.response(method, fullPath, 500, duration, { requestId, error: true })

    const response = NextResponse.next()
    response.headers.set('x-request-id', requestId)
    response.headers.set('x-error', 'true')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
