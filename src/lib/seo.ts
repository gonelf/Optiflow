import { Metadata } from 'next'

// SEO Constants
export const SITE_NAME = 'Reoptimize'
export const SITE_DESCRIPTION =
    'Build, test, and optimize marketing pages without code. Integrated A/B testing and real-time analytics for SaaS teams.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reoptimize-seven.vercel.app'
export const SITE_TWITTER = '@reoptimize'
export const SITE_AUTHOR = 'Reoptimize Team'

// Generate canonical URL
export function getCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${SITE_URL}${cleanPath}`
}

// Generate metadata with defaults
export function generateMetadata({
    title,
    description,
    path = '/',
    image,
    noIndex = false,
    keywords,
}: {
    title: string
    description?: string
    path?: string
    image?: string
    noIndex?: boolean
    keywords?: string[]
}): Metadata {
    const finalDescription = description || SITE_DESCRIPTION
    const finalImage = image || `${SITE_URL}/og-image.png`
    const canonical = getCanonicalUrl(path)
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} - ${SITE_NAME}`

    return {
        title: fullTitle,
        description: finalDescription,
        keywords: keywords?.join(', '),
        authors: [{ name: SITE_AUTHOR }],
        creator: SITE_AUTHOR,
        publisher: SITE_NAME,
        robots: noIndex
            ? {
                index: false,
                follow: false,
            }
            : {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
        alternates: {
            canonical,
        },
        openGraph: {
            title: fullTitle,
            description: finalDescription,
            url: canonical,
            siteName: SITE_NAME,
            images: [
                {
                    url: finalImage,
                    width: 1200,
                    height: 630,
                    alt: fullTitle,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: finalDescription,
            images: [finalImage],
            creator: SITE_TWITTER,
            site: SITE_TWITTER,
        },
    }
}

// Organization Schema (JSON-LD)
export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.svg`,
        description: SITE_DESCRIPTION,
        sameAs: [
            // Add your social media URLs here
            // 'https://twitter.com/reoptimize',
            // 'https://linkedin.com/company/reoptimize',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: 'support@reoptimize.com',
        },
    }
}

// Software Application Schema (JSON-LD)
export function getSoftwareApplicationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: '0',
            highPrice: '79',
            offerCount: '3',
        },
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        screenshot: `${SITE_URL}/og-image.png`,
        featureList: [
            'Visual No-Code Page Builder',
            'Native A/B Testing',
            'Integrated Analytics',
            'AI-Powered Optimizations',
            'Custom Domains',
            'Real-time Collaboration',
        ],
    }
}

// Product Schema for pricing tiers
export function getProductSchema(product: {
    name: string
    description: string
    price: string | number
    priceCurrency?: string
    features: string[]
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        brand: {
            '@type': 'Brand',
            name: SITE_NAME,
        },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.priceCurrency || 'USD',
            availability: 'https://schema.org/InStock',
            url: `${SITE_URL}/pricing`,
        },
        additionalProperty: product.features.map((feature) => ({
            '@type': 'PropertyValue',
            name: 'Feature',
            value: feature,
        })),
    }
}

// FAQ Schema
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }
}

// Breadcrumb Schema
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: getCanonicalUrl(item.url),
        })),
    }
}
