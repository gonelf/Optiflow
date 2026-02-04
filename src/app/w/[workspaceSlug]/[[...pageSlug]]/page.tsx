import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '@/components/page-renderer';
import { AnalyticsInit } from '@/components/analytics-init';

// Make this route fully dynamic to avoid build-time database calls
export const dynamic = 'force-dynamic';

// ISR: Revalidate every hour
export const revalidate = 3600;

interface WorkspacePageParams {
  workspaceSlug: string;
  pageSlug?: string[];
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: WorkspacePageParams;
}): Promise<Metadata> {
  try {
    const { workspaceSlug, pageSlug } = params;

    // Find the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
      select: {
        id: true,
        name: true,
        startingPageId: true,
      },
    });

    if (!workspace) {
      return {
        title: 'Workspace Not Found',
      };
    }

    // Determine which page to show
    let page;
    if (!pageSlug || pageSlug.length === 0) {
      // Root path - show starting page
      if (!workspace.startingPageId) {
        return {
          title: workspace.name,
        };
      }
      page = await prisma.page.findFirst({
        where: {
          id: workspace.startingPageId,
          status: 'PUBLISHED',
        },
        select: {
          seoTitle: true,
          seoDescription: true,
          ogImage: true,
          title: true,
          description: true,
        },
      });
    } else {
      // Specific page path
      const targetSlug = pageSlug.join('/');
      page = await prisma.page.findFirst({
        where: {
          workspaceId: workspace.id,
          slug: targetSlug,
          status: 'PUBLISHED',
        },
        select: {
          seoTitle: true,
          seoDescription: true,
          ogImage: true,
          title: true,
          description: true,
        },
      });
    }

    if (!page) {
      return {
        title: 'Page Not Found',
      };
    }

    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.description || undefined,
      openGraph: {
        title: page.seoTitle || page.title,
        description: page.seoDescription || page.description || undefined,
        images: [page.ogImage || '/og-image.png'],
      },
      twitter: {
        card: 'summary_large_image',
        title: page.seoTitle || page.title,
        description: page.seoDescription || page.description || undefined,
        images: [page.ogImage || '/og-image.png'],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Page',
    };
  }
}

interface WorkspacePageProps {
  params: WorkspacePageParams;
  searchParams: {
    variant?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

export default async function WorkspacePage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const { workspaceSlug, pageSlug } = params;

  // Find the workspace
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: {
      id: true,
      name: true,
      startingPageId: true,
    },
  });

  if (!workspace) {
    notFound();
  }

  // Determine which page to show
  let page;
  if (!pageSlug || pageSlug.length === 0) {
    // Root path - show starting page
    if (!workspace.startingPageId) {
      // No starting page configured - show a default message or 404
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to {workspace.name}
            </h1>
            <p className="mt-2 text-gray-600">
              No starting page has been configured for this workspace.
            </p>
          </div>
        </div>
      );
    }

    // Fetch the starting page with all its components
    page = await prisma.page.findFirst({
      where: {
        id: workspace.startingPageId,
        status: 'PUBLISHED',
      },
      include: {
        components: {
          where: {
            variantId: null, // Get base components
          },
          orderBy: {
            order: 'asc',
          },
        },
        elements: {
          where: {
            variantId: null, // Get base elements
          },
          orderBy: {
            order: 'asc',
          },
        },
        abTests: {
          where: {
            status: 'RUNNING',
          },
          include: {
            variants: {
              include: {
                components: {
                  orderBy: {
                    order: 'asc',
                  },
                },
                elements: {
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });
  } else {
    // Specific page path - find the page by slug in this workspace
    const targetSlug = pageSlug.join('/');
    page = await prisma.page.findFirst({
      where: {
        workspaceId: workspace.id,
        slug: targetSlug,
        status: 'PUBLISHED',
      },
      include: {
        components: {
          where: {
            variantId: null, // Get base components
          },
          orderBy: {
            order: 'asc',
          },
        },
        elements: {
          where: {
            variantId: null, // Get base elements
          },
          orderBy: {
            order: 'asc',
          },
        },
        abTests: {
          where: {
            status: 'RUNNING',
          },
          include: {
            variants: {
              include: {
                components: {
                  orderBy: {
                    order: 'asc',
                  },
                },
                elements: {
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  if (!page) {
    notFound();
  }

  // Determine which variant to show
  let components = page.components;
  let elements = page.elements;
  let variantId: string | null = null;

  if (page.abTests.length > 0 && searchParams.variant) {
    const activeTest = page.abTests[0];
    const variant = activeTest.variants.find((v) => v.id === searchParams.variant);
    if (variant) {
      components = variant.components as any;
      elements = variant.elements as any;
      variantId = variant.id;
    }
  }

  return (
    <>
      {/* Initialize analytics tracker */}
      <AnalyticsInit
        pageId={page.id}
        workspaceSlug={workspaceSlug}
        variantId={variantId}
        utmParams={{
          source: searchParams.utm_source,
          medium: searchParams.utm_medium,
          campaign: searchParams.utm_campaign,
        }}
      />

      {/* Custom head tags */}
      {page.customHead && (
        <div dangerouslySetInnerHTML={{ __html: page.customHead }} />
      )}

      {/* Render page components */}
      <PageRenderer
        components={JSON.parse(JSON.stringify(components))}
        elements={JSON.parse(JSON.stringify(elements))}
        pageId={page.id}
        variantId={variantId}
      />
    </>
  );
}
