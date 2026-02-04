import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/lib/providers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Reoptimize - No-Code SaaS Marketing Site Builder',
  description:
    'Build, test, and optimize marketing pages without code. Integrated A/B testing and real-time analytics.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'Reoptimize - No-Code SaaS Marketing Site Builder',
    description:
      'Build, test, and optimize marketing pages without code. Integrated A/B testing and real-time analytics.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Reoptimize - The Webflow Killer for Marketing Teams',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reoptimize - No-Code SaaS Marketing Site Builder',
    description:
      'Build, test, and optimize marketing pages without code. Integrated A/B testing and real-time analytics.',
    images: ['/og-image.png'],
  },
}

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
