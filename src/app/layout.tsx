import type { Metadata } from 'next'
import './globals.css'
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
}

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
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
