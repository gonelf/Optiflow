import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/signup')) {
          return true
        }

        // Require token for dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Apply middleware only to specific routes
    '/(dashboard|api/workspaces)/:path*',
    '/login',
    '/signup',
  ],
}
