import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { logger } from './lib/logger'

// Helper function to extract workspace subdomain from hostname
function getWorkspaceSubdomain(hostname: string): string | null {
  // Get the root domain from environment variable or default
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'

  // Handle localhost for development
  if (hostname.includes('localhost')) {
    // For local development, subdomains would be like: workspace.localhost:3000
    const parts = hostname.split('.')
    if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      return parts[0]
    }
    return null
  }

  // Handle Vercel preview deployments (*.vercel.app)
  if (hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('.')
    // Pattern: workspace-slug.project-name.vercel.app (3+ parts means there's a subdomain)
    // Or workspace-slug--project-name.vercel.app for subdomain previews
    if (parts.length >= 3 && parts[0] !== 'www') {
      // Check if it's a subdomain pattern (contains double dash which separates workspace from project)
      if (parts[0].includes('--')) {
        return parts[0].split('--')[0]
      }
      // Otherwise it's project.vercel.app which is the main domain
      return null
    }
    return null
  }

  // Handle production domain
  // e.g., workspace.example.com -> workspace
  const rootDomainWithoutPort = rootDomain.split(':')[0]
  if (hostname.endsWith(`.${rootDomainWithoutPort}`)) {
    const subdomain = hostname.replace(`.${rootDomainWithoutPort}`, '')
    if (subdomain !== 'www' && subdomain.length > 0) {
      return subdomain
    }
  }

  // Check for direct subdomain match pattern
  const parts = hostname.split('.')
  if (parts.length >= 3) {
    const potentialSubdomain = parts[0]
    if (potentialSubdomain !== 'www') {
      return potentialSubdomain
    }
  }

  return null
}

// Returns true when the hostname belongs to the Reoptimize app itself
// (localhost, *.vercel.app preview, or the configured root domain).
// Any other hostname is a candidate for a user-configured custom domain.
function isAppDomain(hostname: string): boolean {
  const hostnameClean = hostname.split(':')[0]
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000').split(':')[0]

  return (
    hostnameClean === 'localhost' ||
    hostnameClean.endsWith('.vercel.app') ||
    hostnameClean === rootDomain
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // FAST PATH: Skip middleware entirely for static assets and images
  // This check runs before any other processing for maximum performance
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.avif') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2')
  ) {
    return NextResponse.next()
  }

  const startTime = Date.now()
  const { search } = request.nextUrl
  const method = request.method
  const fullPath = search ? `${pathname}${search}` : pathname

  // Generate request ID for tracking
  const requestId = crypto.randomUUID()

  // Get the hostname from the request
  const hostname = request.headers.get('host') || request.nextUrl.hostname

  // Log incoming request
  logger.request(method, fullPath, {
    requestId,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    hostname,
  })

  try {
    // Check for workspace subdomain
    const workspaceSlug = getWorkspaceSubdomain(hostname)

    if (workspaceSlug) {
      // This is a workspace subdomain request
      logger.debug(`Workspace subdomain detected: ${workspaceSlug}`, { requestId, hostname })

      // Allow static files and API routes
      if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/api/')
      ) {
        const response = NextResponse.next()
        response.headers.set('x-request-id', requestId)
        return response
      }

      // Rewrite to the workspace page route
      // The `/w/[workspaceSlug]/[[...pageSlug]]` route will handle the page rendering
      const pageSlug = pathname === '/' ? '' : pathname.slice(1) // Remove leading slash
      const rewriteUrl = new URL(`/w/${workspaceSlug}${pageSlug ? `/${pageSlug}` : ''}`, request.url)

      // Preserve query parameters
      rewriteUrl.search = search

      logger.debug(`Rewriting workspace subdomain request`, {
        requestId,
        from: pathname,
        to: rewriteUrl.pathname,
        workspaceSlug,
        pageSlug: pageSlug || '(root)',
      })

      const response = NextResponse.rewrite(rewriteUrl)
      response.headers.set('x-request-id', requestId)
      response.headers.set('x-workspace-slug', workspaceSlug)

      const duration = Date.now() - startTime
      logger.response(method, fullPath, 200, duration, { requestId, rewrittenTo: rewriteUrl.pathname })

      return response
    }

    // Custom domain check: only fires for hostnames that are not the app's own
    // domain (i.e. not localhost / *.vercel.app / root domain).
    if (!isAppDomain(hostname)) {
      try {
        const hostnameClean = hostname.split(':')[0]

        // Resolve domain → workspace via an internal Node.js API route.
        // Prisma cannot run on Edge, so we delegate the DB query.
        const resolveUrl = new URL('/api/domains/resolve', request.url)
        resolveUrl.searchParams.set('domain', hostnameClean)
        const resolveRes = await fetch(resolveUrl.toString())
        const resolveData = await resolveRes.json()

        if (resolveData.workspaceSlug) {
          const customWorkspaceSlug = resolveData.workspaceSlug as string

          logger.debug(`Custom domain matched`, {
            requestId,
            domain: hostnameClean,
            workspaceSlug: customWorkspaceSlug,
          })

          // Pass through static assets and API routes unchanged
          if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/favicon') ||
            pathname.startsWith('/api/')
          ) {
            const response = NextResponse.next()
            response.headers.set('x-request-id', requestId)
            return response
          }

          // Rewrite to the workspace page route (same mechanism as subdomains)
          const pageSlug = pathname === '/' ? '' : pathname.slice(1)
          const rewriteUrl = new URL(
            `/w/${customWorkspaceSlug}${pageSlug ? `/${pageSlug}` : ''}`,
            request.url
          )
          rewriteUrl.search = search

          logger.debug(`Custom domain rewrite`, {
            requestId,
            from: pathname,
            to: rewriteUrl.pathname,
            domain: hostnameClean,
            workspaceSlug: customWorkspaceSlug,
          })

          const response = NextResponse.rewrite(rewriteUrl)
          response.headers.set('x-request-id', requestId)
          response.headers.set('x-workspace-slug', customWorkspaceSlug)

          const duration = Date.now() - startTime
          logger.response(method, fullPath, 200, duration, {
            requestId,
            rewrittenTo: rewriteUrl.pathname,
          })

          return response
        }
      } catch (error) {
        // DB unavailable or query failed — fall through to normal routing
        logger.error('Custom domain lookup failed', error, { requestId, hostname })
      }
    }

    // Allow public routes (for main domain)
    if (
      pathname === '/' ||
      pathname.startsWith('/api/health') ||
      pathname.startsWith('/api/debug') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/waitlist') ||
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
      pathname.startsWith('/admin') ||
      pathname.match(/^\/[^\/]+\/(settings|pages|templates|preview|ab-tests|analytics)/) ||
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
