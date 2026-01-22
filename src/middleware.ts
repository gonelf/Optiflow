import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
    return NextResponse.next()
  }

  // Protected routes (dashboard and workspace APIs)
  if (
    pathname.startsWith('/dashboard') ||
    pathname.match(/^\/[^\/]+\/(settings|pages|templates)/) ||
    pathname.startsWith('/api/workspaces')
  ) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      // If auth check fails (e.g., NEXTAUTH_SECRET not set), allow through for now
      console.error('Auth middleware error:', error)
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
