/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,


  // Redirects for legacy routes
  async redirects() {
    return [
      {
        source: '/:workspaceSlug/ai-pages/:pageId',
        destination: '/:workspaceSlug/pages/:pageId',
        permanent: true,
      },
    ];
  },

  // Enable instrumentation for startup logging
  experimental: {
    instrumentationHook: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize package imports for tree-shaking and smaller bundles
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-accordion',
      'date-fns',
      'lodash',
      'recharts',
      'framer-motion',
    ],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Compression
  compress: true,

  // Security headers and performance optimizations
  async headers() {
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.openai.com https://api.stripe.com https://api.supabase.co;
      frame-src 'self' https://js.stripe.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy
          },
        ],
      },
      {
        source: '/p/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Workspace subdomain pages (served via /w/[workspaceSlug] route)
        source: '/w/:workspaceSlug/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Static assets (images, fonts, etc.)
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2|ttf|eot|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          },
        ],
      },
    ]
  },

  // Skip type checking during build (use npm run type-check separately)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Production optimizations
  swcMinify: true,
  poweredByHeader: false,

  webpack: (config, { isServer, webpack }) => {
    // Handle Prisma client gracefully during build
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      })
    }

    // Optimize bundle size and code splitting
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate vendor chunks for better caching
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Separate UI components
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 20,
          },
        },
      },
    }

    return config
  },
}

module.exports = nextConfig
