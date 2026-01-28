import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '@/components/page-renderer';

// ISR: Revalidate every hour
export const revalidate = 3600;

// Dynamic params for static generation
export async function generateStaticParams() {
  // Generate static pages for the most popular published pages
  const pages = await prisma.page.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        not: null,
      },
    },
    select: {
      slug: true,
    },
    take: 100, // Pre-generate top 100 pages
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return pages.map((page: { slug: string }) => ({
    slug: page.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await prisma.page.findFirst({
    where: {
      slug: params.slug,
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
      images: page.ogImage ? [page.ogImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.description || undefined,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
  };
}

interface PublishedPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    variant?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

export default async function PublishedPage({
  params,
  searchParams,
}: PublishedPageProps) {
  // Fetch page with components
  const page = await prisma.page.findFirst({
    where: {
      slug: params.slug,
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
            },
          },
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  // Determine which variant to show
  let components = page.components;
  let variantId: string | null = null;

  if (page.abTests.length > 0 && searchParams.variant) {
    const activeTest = page.abTests[0];
    const variant = activeTest.variants.find((v: { id: string }) => v.id === searchParams.variant);
    if (variant) {
      components = variant.components as any;
      variantId = variant.id;
    }
  }

  return (
    <>
      {/* Analytics tracking script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const pageId = '${page.id}';
              const variantId = ${variantId ? `'${variantId}'` : 'null'};
              const utmSource = ${searchParams.utm_source ? `'${searchParams.utm_source}'` : 'null'};
              const utmMedium = ${searchParams.utm_medium ? `'${searchParams.utm_medium}'` : 'null'};
              const utmCampaign = ${searchParams.utm_campaign ? `'${searchParams.utm_campaign}'` : 'null'};

              // Track page view
              if (typeof window !== 'undefined') {
                fetch('/api/analytics/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    pageId,
                    variantId,
                    eventType: 'PAGE_VIEW',
                    utmSource,
                    utmMedium,
                    utmCampaign,
                  }),
                  keepalive: true,
                });
              }
            })();
          `,
        }}
      />

      {/* Custom head tags */}
      {page.customHead && (
        <div dangerouslySetInnerHTML={{ __html: page.customHead }} />
      )}

      {/* Render page components */}
      <PageRenderer components={components} pageId={page.id} variantId={variantId} />
    </>
  );
}
