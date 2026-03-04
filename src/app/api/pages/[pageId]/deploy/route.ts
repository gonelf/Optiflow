import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageExportService } from '@/services/page-export.service';
import { GitHubDeployService } from '@/services/github-deploy.service';
import { VercelDeployService } from '@/services/vercel-deploy.service';

interface RouteContext {
  params: { pageId: string };
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = context.params;

    // Verify page ownership via workspace membership
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        workspace: { members: { some: { userId: session.user.id } } },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        elements: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            tagName: true,
            className: true,
            styles: true,
            content: true,
            parentId: true,
            order: true,
            depth: true,
            path: true,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Look up GitHub OAuth account
    const githubAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
      select: { access_token: true, scope: true },
    });

    if (!githubAccount?.access_token) {
      return NextResponse.json(
        {
          error: 'NO_GITHUB_ACCOUNT',
          message: 'Please sign in with GitHub to enable one-click deployment.',
        },
        { status: 400 }
      );
    }

    if (githubAccount.scope && !githubAccount.scope.includes('repo')) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_SCOPE',
          message:
            'Your GitHub connection needs the "repo" permission. Please sign out and sign back in with GitHub to grant access.',
        },
        { status: 400 }
      );
    }

    // Create deployment tracking record
    const deployment = await prisma.deployment.create({
      data: { pageId: page.id, userId: session.user.id, status: 'PENDING' },
    });

    // Export page to deployable files
    let files;
    try {
      files = PageExportService.buildFileTree({
        title: page.title,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        elements: page.elements as any[],
      });
    } catch {
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: 'FAILED', errorMessage: 'Failed to export page content' },
      });
      return NextResponse.json({ error: 'Failed to export page content' }, { status: 500 });
    }

    // Create GitHub repo and push code
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: 'CREATING_REPO' },
    });

    let githubResult;
    try {
      githubResult = await GitHubDeployService.createRepoAndPush(
        githubAccount.access_token,
        page.slug,
        files
      );
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'PUSHING_CODE',
          githubRepoUrl: githubResult.repoUrl,
          githubRepoName: githubResult.repoName,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'GitHub error';
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: 'FAILED', errorMessage: `GitHub: ${msg}` },
      });
      return NextResponse.json({ error: `GitHub deployment failed: ${msg}` }, { status: 500 });
    }

    // Deploy to Vercel
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: 'TRIGGERING_DEPLOY' },
    });

    let vercelResult;
    try {
      vercelResult = await VercelDeployService.deployFiles(
        `optiflow-${page.slug}`,
        files
      );
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'DEPLOYED',
          vercelProjectId: vercelResult.projectId,
          vercelDeployUrl: vercelResult.deploymentUrl,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Vercel error';
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: 'FAILED', errorMessage: `Vercel: ${msg}` },
      });
      return NextResponse.json({ error: `Vercel deployment failed: ${msg}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deploymentUrl: vercelResult.deploymentUrl,
      githubUrl: githubResult.repoUrl,
      deploymentId: deployment.id,
    });
  } catch (err) {
    console.error('[Deploy] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = context.params;

    const latest = await prisma.deployment.findFirst({
      where: { pageId, userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        vercelDeployUrl: true,
        githubRepoUrl: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ deployment: latest });
  } catch (err) {
    console.error('[Deploy GET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
