// lib/bot-detection.ts
// Bot detection and filtering for middleware

const KNOWN_BOTS = [
    // Search engine bots
    'googlebot',
    'bingbot',
    'slurp', // Yahoo
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'sogou',
    'exabot',
    'facebot',
    'ia_archiver',

    // Social media bots
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'pinterestbot',
    'whatsapp',
    'telegrambot',
    'slackbot',
    'discordbot',

    // Monitoring/Security bots
    'uptimerobot',
    'pingdom',
    'statuscake',
    'site24x7',
    'newrelic',
    'datadog',
    'checkly',

    // Generic crawlers
    'crawler',
    'spider',
    'scraper',
    'bot',
    'headlesschrome',
    'phantomjs',
    'selenium',
    'webdriver',
    'curl',
    'wget',
    'python-requests',
    'axios',
    'node-fetch',
]

const SUSPICIOUS_PATTERNS = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /headless/i,
    /phantom/i,
    /selenium/i,
    /webdriver/i,
]

export function isBot(userAgent: string | null): boolean {
    if (!userAgent) return true // No user agent = likely bot

    const lowerUA = userAgent.toLowerCase()

    // Check against known bot list
    if (KNOWN_BOTS.some(bot => lowerUA.includes(bot))) {
        return true
    }

    // Check against suspicious patterns
    if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(userAgent))) {
        return true
    }

    return false
}

export function shouldBlockBot(userAgent: string | null, pathname: string): boolean {
    if (!isBot(userAgent)) return false

    // Allow bots to access certain paths
    const allowedPaths = [
        '/',
        '/api/health',
        '/robots.txt',
        '/sitemap.xml',
    ]

    // Allow bots on public workspace pages (for SEO)
    if (pathname.startsWith('/w/')) {
        return false
    }

    // Block bots from sensitive areas
    if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api/workspaces') ||
        pathname.startsWith('/api/ai') ||
        pathname.startsWith('/api/analytics')
    ) {
        return true
    }

    return false
}

export function getBotInfo(userAgent: string | null): {
    isBot: boolean
    botType?: 'search' | 'social' | 'monitoring' | 'suspicious' | 'unknown'
    botName?: string
} {
    if (!userAgent) {
        return { isBot: true, botType: 'suspicious', botName: 'No User Agent' }
    }

    const lowerUA = userAgent.toLowerCase()

    // Search engine bots
    const searchBots = ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot']
    for (const bot of searchBots) {
        if (lowerUA.includes(bot)) {
            return { isBot: true, botType: 'search', botName: bot }
        }
    }

    // Social media bots
    const socialBots = ['facebookexternalhit', 'twitterbot', 'linkedinbot', 'pinterestbot']
    for (const bot of socialBots) {
        if (lowerUA.includes(bot)) {
            return { isBot: true, botType: 'social', botName: bot }
        }
    }

    // Monitoring bots
    const monitoringBots = ['uptimerobot', 'pingdom', 'statuscake', 'site24x7', 'newrelic', 'datadog', 'checkly']
    for (const bot of monitoringBots) {
        if (lowerUA.includes(bot)) {
            return { isBot: true, botType: 'monitoring', botName: bot }
        }
    }

    // Suspicious patterns
    if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(userAgent))) {
        return { isBot: true, botType: 'suspicious', botName: 'Pattern Match' }
    }

    return { isBot: false }
}
