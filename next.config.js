/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable instrumentation for startup logging
  experimental: {
    instrumentationHook: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Skip type checking during build (use npm run type-check separately)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    // Handle Prisma client gracefully during build
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      })
    }
    return config
  },
}

module.exports = nextConfig
