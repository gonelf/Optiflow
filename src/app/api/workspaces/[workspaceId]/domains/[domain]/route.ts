import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WorkspaceService } from '@/services/workspace.service'
import { VercelDomainsService } from '@/services/vercel-domains.service'
import { prisma } from '@/lib/prisma'

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string; domain: string } }
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

    const customDomain = await prisma.customDomain.findFirst({
      where: {
        domain: params.domain,
        workspaceId: params.workspaceId,
      },
    })
    if (!customDomain) {
      return NextResponse.json({ message: 'Domain not found' }, { status: 404 })
    }

    // Refresh verification status from Vercel
    try {
      const vercelDomain = await VercelDomainsService.getDomain(params.domain)
      if (vercelDomain.verified && customDomain.status !== 'ACTIVE') {
        const updated = await prisma.customDomain.update({
          where: { id: customDomain.id },
          data: {
            status: 'ACTIVE',
            verifiedAt: new Date(),
          },
        })
        return NextResponse.json({ domain: updated })
      }
    } catch {
      // Vercel API unavailable — return cached status
    }

    return NextResponse.json({ domain: customDomain })
  } catch (error) {
    console.error('Get domain error:', error)
    return NextResponse.json({ message: 'Failed to fetch domain' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string; domain: string } }
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

    // Verify domain belongs to this workspace
    const customDomain = await prisma.customDomain.findFirst({
      where: {
        domain: params.domain,
        workspaceId: params.workspaceId,
      },
    })
    if (!customDomain) {
      return NextResponse.json({ message: 'Domain not found' }, { status: 404 })
    }

    // Remove from Vercel first
    await VercelDomainsService.removeDomain(params.domain)

    // Then remove from our database
    await prisma.customDomain.delete({ where: { id: customDomain.id } })

    return NextResponse.json({ message: 'Domain removed successfully' })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error('Remove domain error:', error)
    return NextResponse.json({ message: 'Failed to remove domain' }, { status: 500 })
  }
}
