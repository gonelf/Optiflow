import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { domainCache, getOrFetch } from '@/lib/server-cache'

// Internal endpoint called by middleware to resolve a custom domain to a
// workspace slug.  Not meant to be called by clients — it runs in Node.js
// runtime so it can use Prisma, while the middleware itself runs on Edge.
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')
  if (!domain) {
    return NextResponse.json({ workspaceSlug: null })
  }

  try {
    // Use cache to avoid hitting database on every request
    const workspaceSlug = await getOrFetch(
      domainCache,
      `domain:${domain}`,
      async () => {
        const customDomain = await prisma.customDomain.findUnique({
          where: { domain },
          select: {
            workspace: { select: { slug: true } },
          },
        })
        return customDomain?.workspace.slug || null
      },
      5 * 60 * 1000 // 5 minute TTL
    )

    return NextResponse.json({
      workspaceSlug,
    })
  } catch {
    return NextResponse.json({ workspaceSlug: null })
  }
}
