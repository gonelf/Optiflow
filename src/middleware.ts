import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes - be very permissive for now
  const publicPaths = [
    '/',
    '/api/health',
    '/api/debug',
    '/api/auth',
    '/login',
    '/signup',
    '/_next',
    '/favicon',
    '/robots.txt',
  ]

  // Check if path starts with any public path
  const isPublic = publicPaths.some(path => pathname.startsWith(path))

  if (isPublic) {
    return NextResponse.next()
  }

  // For protected routes, check auth but don't crash if it fails
  if (
    pathname.startsWith('/dashboard') ||
    pathname.match(/^\/[^\/]+\/(settings|pages|templates)/) ||
    pathname.startsWith('/api/workspaces')
  ) {
    try {
      // Only import and check token if we really need to
      const { getToken } = await import('next-auth/jwt')
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      // If auth check fails, log but allow through for now
      console.error('Auth middleware error:', error)
      // Allow through instead of blocking
      return NextResponse.next()
    }
  }

  // Default: allow through
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}
