import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Internal endpoint called by middleware to resolve a custom domain to a
// workspace slug.  Not meant to be called by clients — it runs in Node.js
// runtime so it can use Prisma, while the middleware itself runs on Edge.
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')
  if (!domain) {
    return NextResponse.json({ workspaceSlug: null })
  }

  try {
    const customDomain = await prisma.customDomain.findUnique({
      where: { domain },
      select: {
        workspace: { select: { slug: true } },
      },
    })

    return NextResponse.json({
      workspaceSlug: customDomain?.workspace.slug || null,
    })
  } catch {
    return NextResponse.json({ workspaceSlug: null })
  }
}
