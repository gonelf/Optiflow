import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '@/components/page-renderer';
import { publishedPageCache, getOrFetch } from '@/lib/server-cache';

// Make this route fully dynamic to avoid build-time database calls
export const dynamic = 'force-dynamic';

// ISR: Revalidate every hour
export const revalidate = 3600;

// Fetch full page data with caching - single query for both metadata and render
async function getPublishedPage(slug: string) {
  return getOrFetch(
    publishedPageCache,
    `page:${slug}`,
    async () => {
      return prisma.page.findFirst({
        where: {
          slug,
          status: 'PUBLISHED',
        },
        include: {
          components: {
            where: {
              variantId: null,
            },
            orderBy: {
              order: 'asc',
            },
          },
          elements: {
            where: {
              variantId: null,
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
    },
    5 * 60 * 1000 // 5 minute TTL
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const page = await getPublishedPage(params.slug);

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
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Page',
    };
  }
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
  // Fetch page with components - uses cache from getPublishedPage
  const page = await getPublishedPage(params.slug);

  if (!page) {
    notFound();
  }

  // Determine which variant to show
  let components = page.components;
  let elements = page.elements;
  let variantId: string | null = null;

  if (page.abTests.length > 0 && searchParams.variant) {
    const activeTest = page.abTests[0];
    const variant = activeTest.variants.find((v: { id: string }) => v.id === searchParams.variant);
    if (variant) {
      components = variant.components as any;
      elements = variant.elements as any;
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
      <PageRenderer
        components={JSON.parse(JSON.stringify(components))}
        elements={JSON.parse(JSON.stringify(elements))}
        pageId={page.id}
        variantId={variantId}
      />
    </>
  );
}
