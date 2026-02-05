import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Reoptimize - No-Code SaaS Marketing Site Builder',
        short_name: 'Reoptimize',
        description: 'Build, test, and optimize marketing pages without code. Integrated A/B testing and real-time analytics.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/logo.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    }
}
