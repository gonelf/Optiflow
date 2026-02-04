import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WorkspaceService } from '@/services/workspace.service'
import { VercelDomainsService } from '@/services/vercel-domains.service'
import { prisma } from '@/lib/prisma'
import { domainCache } from '@/lib/server-cache'
import { z } from 'zod'

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

const addDomainSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(253)
    .regex(
      /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,}$/,
      'Invalid domain format. Use something like example.com or www.example.com'
    ),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const role = await WorkspaceService.getUserRole(params.workspaceId, session.user.id)
    if (!role) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    const domains = await prisma.customDomain.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ domains })
  } catch (error) {
    console.error('List domains error:', error)
    return NextResponse.json({ message: 'Failed to fetch domains' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await WorkspaceService.hasPermission(
      params.workspaceId,
      session.user.id,
      'ADMIN' as Role
    )
    if (!hasPermission) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    const { domain } = addDomainSchema.parse(body)
    const normalizedDomain = domain.toLowerCase()

    // Check if domain is already registered for any workspace
    const existing = await prisma.customDomain.findUnique({
      where: { domain: normalizedDomain },
    })
    if (existing) {
      return NextResponse.json(
        { message: 'This domain is already in use' },
        { status: 409 }
      )
    }

    // Add the domain to the Vercel project
    const vercelDomain = await VercelDomainsService.addDomain(normalizedDomain)

    // Persist in our database
    const customDomain = await prisma.customDomain.create({
      data: {
        workspaceId: params.workspaceId,
        domain: normalizedDomain,
        status: vercelDomain.verified ? 'ACTIVE' : 'PENDING',
        dnsRecords: vercelDomain.verification
          ? JSON.parse(JSON.stringify(vercelDomain.verification))
          : undefined,
        verifiedAt: vercelDomain.verified ? new Date() : null,
      },
    })

    // Invalidate domain cache
    domainCache.delete(`domain:${normalizedDomain}`)

    return NextResponse.json({ domain: customDomain }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error('Add domain error:', error)
    return NextResponse.json({ message: 'Failed to add domain' }, { status: 500 })
  }
}
