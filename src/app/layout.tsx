import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/lib/providers'
import { Toaster } from '@/components/ui/toaster'

import { generateMetadata as genMeta, getOrganizationSchema, SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'

export const metadata = genMeta({
  title: `${SITE_NAME} - No-Code SaaS Marketing Site Builder`,
  description: SITE_DESCRIPTION,
  path: '/',
  keywords: [
    'no-code builder',
    'marketing site builder',
    'A/B testing',
    'conversion optimization',
    'landing page builder',
    'SaaS marketing',
    'visual page builder',
    'analytics platform',
    'webflow alternative',
    'marketing automation',
  ],
})

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external services for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />

        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
      </head>
      <body className={`${inter.className} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
