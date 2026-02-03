/**
 * Examples Search Service
 * Provides real-world UI examples and inspirations for AI page generation
 *
 * This service implements the "Advanced Approach" for AI page generation by:
 * 1. Providing curated examples from well-known, high-converting websites
 * 2. Supporting external web search integration (when API keys are available)
 * 3. Randomizing inspirations to avoid repetitive designs
 */

export type PageType = 'landing' | 'pricing' | 'about' | 'contact' | 'blog' | 'product' | 'dashboard' | 'portfolio';
export type DesignStyle = 'minimal' | 'bold' | 'corporate' | 'playful' | 'neobrutalist' | 'glassmorphism' | 'dark' | 'gradient';

export interface UIExample {
  name: string;
  description: string;
  keyFeatures: string[];
  designPatterns: string[];
  colorScheme?: string;
  source?: string;
}

export interface PageTypeExamples {
  pageType: PageType;
  examples: UIExample[];
  layoutPatterns: string[];
  conversionTips: string[];
  sectionOrder: string[];
}

export interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
  designElements?: string[];
}

/**
 * Curated database of real-world UI examples
 * These are based on well-known, high-converting websites
 */
const CURATED_EXAMPLES: Record<PageType, PageTypeExamples> = {
  landing: {
    pageType: 'landing',
    examples: [
      {
        name: 'Stripe',
        description: 'Clean, professional fintech landing with animated gradients and clear value proposition',
        keyFeatures: [
          'Animated gradient hero background',
          'Split hero with product preview',
          'Floating UI elements and cards',
          'Clear pricing CTAs',
          'Trust badges and client logos',
        ],
        designPatterns: ['gradient-hero', 'floating-cards', 'split-layout', 'animated-backgrounds'],
        colorScheme: 'Purple/blue gradients with white backgrounds',
      },
      {
        name: 'Linear',
        description: 'Dark theme, sleek software product page with smooth animations',
        keyFeatures: [
          'Dark theme with accent colors',
          'Product screenshots with glow effects',
          'Feature grid with icons',
          'Keyboard shortcut hints',
          'Minimalist footer',
        ],
        designPatterns: ['dark-mode', 'glow-effects', 'feature-grid', 'minimal-ui'],
        colorScheme: 'Dark background with purple/blue accents',
      },
      {
        name: 'Vercel',
        description: 'Developer-focused, modern tech landing with code examples',
        keyFeatures: [
          'Code snippet previews',
          'Terminal-style animations',
          'Framework logos grid',
          'Performance metrics display',
          'Dark/light mode support',
        ],
        designPatterns: ['code-preview', 'terminal-ui', 'metrics-display', 'logo-grid'],
        colorScheme: 'Black and white with subtle gradients',
      },
      {
        name: 'Notion',
        description: 'Clean, minimal SaaS landing with product demonstration',
        keyFeatures: [
          'Animated product demo in hero',
          'Use case tabs/sections',
          'Team collaboration visuals',
          'Template gallery showcase',
          'Simple, clear CTAs',
        ],
        designPatterns: ['product-demo', 'use-case-tabs', 'template-gallery', 'simple-ctas'],
        colorScheme: 'White background with black text and accent colors',
      },
      {
        name: 'Airbnb',
        description: 'Immersive travel landing with search-focused hero',
        keyFeatures: [
          'Full-width hero image',
          'Prominent search bar',
          'Location cards carousel',
          'Experience categories',
          'Host testimonials',
        ],
        designPatterns: ['full-hero-image', 'search-focused', 'card-carousel', 'categories-grid'],
        colorScheme: 'White with coral/pink accents',
      },
    ],
    layoutPatterns: [
      'Hero with centered headline and two CTAs',
      'Split hero with text left, image/product right',
      'Full-width hero with gradient overlay',
      'Video background hero',
      'Interactive product showcase hero',
    ],
    conversionTips: [
      'Place primary CTA above the fold',
      'Use social proof near CTAs',
      'Limit form fields to essential only',
      'Show pricing early for transparent positioning',
      'Include trust badges and security indicators',
    ],
    sectionOrder: ['Hero', 'Social Proof/Logos', 'Features', 'How It Works', 'Testimonials', 'Pricing', 'FAQ', 'Final CTA', 'Footer'],
  },

  pricing: {
    pageType: 'pricing',
    examples: [
      {
        name: 'Notion Pricing',
        description: 'Simple 3-tier pricing with highlighted recommended plan',
        keyFeatures: [
          'Three-column tier layout',
          'Popular plan badge',
          'Feature comparison checkmarks',
          'Monthly/yearly toggle',
          'FAQ below pricing cards',
        ],
        designPatterns: ['three-tier', 'highlighted-plan', 'toggle-billing', 'feature-checkmarks'],
        colorScheme: 'White cards with blue accents',
      },
      {
        name: 'Slack Pricing',
        description: 'Enterprise-focused pricing with detailed feature breakdown',
        keyFeatures: [
          'Clear tier differentiation',
          'Per-user pricing display',
          'Full feature comparison table',
          'Enterprise contact CTA',
          'Success stories sidebar',
        ],
        designPatterns: ['per-user-pricing', 'comparison-table', 'enterprise-focus', 'contact-sales'],
        colorScheme: 'Purple gradient headers with white backgrounds',
      },
      {
        name: 'Zoom Pricing',
        description: 'Comprehensive comparison table with multiple tiers',
        keyFeatures: [
          'Horizontal comparison table',
          'Feature grouping by category',
          'Participant limits highlighted',
          'Add-on options',
          'Free tier prominent',
        ],
        designPatterns: ['comparison-table', 'feature-categories', 'free-tier', 'add-ons'],
        colorScheme: 'Blue headers with white/gray alternating rows',
      },
    ],
    layoutPatterns: [
      'Three-column card layout with center highlighted',
      'Horizontal comparison table',
      'Vertical accordion with expandable features',
      'Two-tier simple layout (Free vs Pro)',
      'Calculator-style interactive pricing',
    ],
    conversionTips: [
      'Highlight the most popular or recommended plan',
      'Use annual billing toggle to show savings',
      'Include money-back guarantee badge',
      'Show per-month price even for annual plans',
      'Add FAQ section addressing pricing concerns',
    ],
    sectionOrder: ['Header with Toggle', 'Pricing Cards', 'Feature Comparison', 'FAQ', 'Enterprise CTA', 'Footer'],
  },

  about: {
    pageType: 'about',
    examples: [
      {
        name: 'Stripe About',
        description: 'Mission-driven company page with global impact visuals',
        keyFeatures: [
          'Mission statement hero',
          'Timeline/history section',
          'Global office locations map',
          'Team leadership grid',
          'Company values icons',
        ],
        designPatterns: ['mission-hero', 'timeline', 'world-map', 'team-grid', 'values-section'],
        colorScheme: 'Clean white with brand accent colors',
      },
      {
        name: 'Figma About',
        description: 'Creative, design-focused team page',
        keyFeatures: [
          'Large team photo hero',
          'Design philosophy section',
          'Community highlights',
          'Open positions teaser',
          'Press/media kit links',
        ],
        designPatterns: ['photo-hero', 'philosophy-section', 'community-focus', 'careers-cta'],
        colorScheme: 'White with colorful accents',
      },
    ],
    layoutPatterns: [
      'Hero with company photo/video',
      'Story timeline with milestones',
      'Values grid with icons',
      'Team cards with photos and roles',
      'Statistics/impact numbers row',
    ],
    conversionTips: [
      'Lead with mission and values',
      'Include founder story for authenticity',
      'Show real team photos, not stock',
      'Add social proof (awards, press mentions)',
      'Include clear contact/careers CTAs',
    ],
    sectionOrder: ['Mission Hero', 'Our Story', 'Values', 'Team', 'Statistics', 'Careers CTA', 'Footer'],
  },

  contact: {
    pageType: 'contact',
    examples: [
      {
        name: 'Intercom Contact',
        description: 'Multi-channel contact page with chat widget',
        keyFeatures: [
          'Contact form with department selector',
          'Live chat widget',
          'Office addresses with maps',
          'Support resources links',
          'Response time indicators',
        ],
        designPatterns: ['multi-channel', 'chat-widget', 'office-maps', 'response-times'],
        colorScheme: 'White with blue accents',
      },
      {
        name: 'HubSpot Contact',
        description: 'Sales-focused contact with meeting scheduler',
        keyFeatures: [
          'Meeting scheduler embed',
          'Phone and email options',
          'Regional offices',
          'Support portal link',
          'Social media links',
        ],
        designPatterns: ['meeting-scheduler', 'multi-contact', 'regional-offices', 'social-links'],
        colorScheme: 'Orange accents with white background',
      },
    ],
    layoutPatterns: [
      'Split layout: form left, contact info right',
      'Full-width form with map below',
      'Tab-based (Sales, Support, General)',
      'Card-based contact methods',
      'Chatbot-first with fallback form',
    ],
    conversionTips: [
      'Minimize form fields (name, email, message)',
      'Show expected response time',
      'Offer multiple contact methods',
      'Include timezone information',
      'Add FAQ link to reduce submissions',
    ],
    sectionOrder: ['Header', 'Contact Form/Methods', 'Office Locations', 'FAQ', 'Footer'],
  },

  blog: {
    pageType: 'blog',
    examples: [
      {
        name: 'Stripe Blog',
        description: 'Clean, professional tech blog with categories',
        keyFeatures: [
          'Featured article hero',
          'Category filters',
          'Card grid layout',
          'Read time indicators',
          'Author attribution',
        ],
        designPatterns: ['featured-hero', 'category-filters', 'card-grid', 'read-time', 'author-cards'],
        colorScheme: 'White with subtle gradients',
      },
      {
        name: 'Medium',
        description: 'Reading-focused blog with clean typography',
        keyFeatures: [
          'Large typography',
          'Minimal distractions',
          'Clap/like interactions',
          'Related articles sidebar',
          'Newsletter signup',
        ],
        designPatterns: ['large-type', 'minimal-ui', 'related-sidebar', 'newsletter-cta'],
        colorScheme: 'Black text on white, green accents',
      },
    ],
    layoutPatterns: [
      'Featured post hero + grid below',
      'Sidebar with categories and popular posts',
      'Masonry grid layout',
      'List view with thumbnails',
      'Magazine-style mixed layouts',
    ],
    conversionTips: [
      'Highlight featured/latest content prominently',
      'Include newsletter signup in multiple places',
      'Show reading time estimates',
      'Add category/tag filtering',
      'Include social sharing buttons',
    ],
    sectionOrder: ['Featured Post', 'Category Filter', 'Post Grid', 'Newsletter Signup', 'Footer'],
  },

  product: {
    pageType: 'product',
    examples: [
      {
        name: 'Apple Product Page',
        description: 'Immersive product showcase with scroll animations',
        keyFeatures: [
          'Full-screen product hero',
          'Scroll-triggered animations',
          'Specs comparison',
          'Gallery/360 view',
          'Buy now sticky CTA',
        ],
        designPatterns: ['immersive-hero', 'scroll-animations', 'specs-table', 'gallery-360', 'sticky-cta'],
        colorScheme: 'White/black with product colors',
      },
      {
        name: 'Shopify Product',
        description: 'E-commerce focused with variants and reviews',
        keyFeatures: [
          'Image gallery with zoom',
          'Variant selector (size, color)',
          'Add to cart button',
          'Customer reviews section',
          'Related products carousel',
        ],
        designPatterns: ['image-gallery', 'variant-selector', 'reviews-section', 'related-products'],
        colorScheme: 'Clean white with brand accents',
      },
    ],
    layoutPatterns: [
      'Split layout: images left, details right',
      'Full-width hero with scrolling features',
      'Tab-based (Overview, Specs, Reviews)',
      'Single column with sections',
      'Comparison with competitors',
    ],
    conversionTips: [
      'Show price prominently',
      'Include high-quality images/videos',
      'Add social proof near buy button',
      'Show stock/availability status',
      'Include shipping/return info',
    ],
    sectionOrder: ['Product Hero', 'Features', 'Specifications', 'Reviews', 'Related Products', 'Footer'],
  },

  dashboard: {
    pageType: 'dashboard',
    examples: [
      {
        name: 'Google Analytics',
        description: 'Data-rich dashboard with charts and metrics',
        keyFeatures: [
          'KPI cards at top',
          'Interactive charts',
          'Date range picker',
          'Data tables with filters',
          'Export functionality',
        ],
        designPatterns: ['kpi-cards', 'interactive-charts', 'date-picker', 'data-tables', 'export-actions'],
        colorScheme: 'White background with blue/green data viz colors',
      },
      {
        name: 'Shopify Dashboard',
        description: 'E-commerce metrics with quick actions',
        keyFeatures: [
          'Revenue overview cards',
          'Order status summary',
          'Quick action buttons',
          'Recent orders list',
          'Inventory alerts',
        ],
        designPatterns: ['metric-cards', 'status-summary', 'quick-actions', 'recent-list', 'alerts'],
        colorScheme: 'Light gray background with green/blue accents',
      },
    ],
    layoutPatterns: [
      'Sidebar navigation + main content area',
      'Top stats row + charts grid below',
      'Tab-based sections (Overview, Sales, Users)',
      'Full-width with collapsible panels',
      'Card-based modular layout',
    ],
    conversionTips: [
      'Show most important metrics first',
      'Use color coding for status (green=good, red=alert)',
      'Include date/time context for all data',
      'Provide quick actions for common tasks',
      'Add loading states for real data',
    ],
    sectionOrder: ['Header/Navigation', 'KPI Cards', 'Main Charts', 'Data Tables', 'Recent Activity'],
  },

  portfolio: {
    pageType: 'portfolio',
    examples: [
      {
        name: 'Behance Portfolio',
        description: 'Visual-first portfolio with project showcases',
        keyFeatures: [
          'Hero with personal branding',
          'Project grid/masonry',
          'Case study deep dives',
          'Skills/tools section',
          'Contact CTA',
        ],
        designPatterns: ['hero-branding', 'project-grid', 'case-studies', 'skills-section', 'contact-cta'],
        colorScheme: 'Depends on personal brand, often minimal',
      },
      {
        name: 'Dribbble Profile',
        description: 'Shot-based portfolio with interactions',
        keyFeatures: [
          'Profile header with stats',
          'Work samples grid',
          'Like/save interactions',
          'Availability status',
          'Social links',
        ],
        designPatterns: ['profile-header', 'shots-grid', 'interactions', 'availability', 'social-links'],
        colorScheme: 'Pink accents with white background',
      },
    ],
    layoutPatterns: [
      'Full-width hero + project grid',
      'Split intro: photo left, bio right',
      'Single column case study flow',
      'Masonry grid with filters',
      'Horizontal scroll galleries',
    ],
    conversionTips: [
      'Lead with your best work',
      'Include clear contact/hire CTA',
      'Show project process, not just results',
      'Add testimonials from clients',
      'Keep navigation simple',
    ],
    sectionOrder: ['Hero/Intro', 'Selected Work', 'About', 'Skills', 'Testimonials', 'Contact', 'Footer'],
  },
};

/**
 * Design style configurations for varied outputs
 */
const DESIGN_STYLES: Record<DesignStyle, {
  description: string;
  characteristics: string[];
  colorGuidelines: string;
  typographyGuidelines: string;
}> = {
  minimal: {
    description: 'Clean, whitespace-focused design with subtle interactions',
    characteristics: [
      'Generous whitespace',
      'Limited color palette (2-3 colors)',
      'Simple sans-serif typography',
      'Subtle shadows and borders',
      'Focus on content hierarchy',
    ],
    colorGuidelines: 'Use white/light gray backgrounds, one accent color, dark text',
    typographyGuidelines: 'Clean sans-serif fonts, large headings, comfortable line height',
  },
  bold: {
    description: 'High-impact design with strong visuals and contrast',
    characteristics: [
      'Large, bold typography',
      'High contrast colors',
      'Full-width sections',
      'Strong visual hierarchy',
      'Impactful imagery',
    ],
    colorGuidelines: 'Use contrasting colors, bold accent colors, dark backgrounds with light text',
    typographyGuidelines: 'Extra bold headings, impactful font sizes, tight letter spacing',
  },
  corporate: {
    description: 'Professional, trustworthy design for business audiences',
    characteristics: [
      'Conservative color palette',
      'Professional photography',
      'Clear information hierarchy',
      'Trust-building elements',
      'Structured layouts',
    ],
    colorGuidelines: 'Blue, gray, white color schemes, subtle gradients, professional feel',
    typographyGuidelines: 'Professional serif or sans-serif, moderate sizes, formal tone',
  },
  playful: {
    description: 'Fun, engaging design with personality and character',
    characteristics: [
      'Bright, vibrant colors',
      'Rounded shapes and buttons',
      'Illustrations and icons',
      'Animated interactions',
      'Casual copy tone',
    ],
    colorGuidelines: 'Use bright, cheerful colors, gradients, colorful illustrations',
    typographyGuidelines: 'Rounded or friendly fonts, varied sizes, casual tone',
  },
  neobrutalist: {
    description: 'Raw, intentionally unpolished design with bold elements',
    characteristics: [
      'Harsh shadows and borders',
      'Bold, clashing colors',
      'Asymmetric layouts',
      'Raw, unpolished feel',
      'Strong black outlines',
    ],
    colorGuidelines: 'Primary colors, black outlines, high contrast combinations',
    typographyGuidelines: 'Bold, chunky fonts, monospace elements, intentional roughness',
  },
  glassmorphism: {
    description: 'Frosted glass effects with transparency and blur',
    characteristics: [
      'Frosted glass cards',
      'Background blur effects',
      'Subtle gradients',
      'Light transparency',
      'Soft, dreamy feel',
    ],
    colorGuidelines: 'Soft gradients, white/transparent cards with blur, pastel accents',
    typographyGuidelines: 'Light fonts, white text on blurred backgrounds, elegant feel',
  },
  dark: {
    description: 'Dark theme design with accent colors and glow effects',
    characteristics: [
      'Dark backgrounds',
      'Glowing accent colors',
      'Subtle gradients',
      'High contrast text',
      'Modern, tech feel',
    ],
    colorGuidelines: 'Dark gray/black backgrounds, neon or bright accents, white text',
    typographyGuidelines: 'Clean sans-serif, good contrast ratios, subtle glow effects on headings',
  },
  gradient: {
    description: 'Rich gradient backgrounds and colorful transitions',
    characteristics: [
      'Multi-color gradients',
      'Smooth color transitions',
      'Vibrant hero sections',
      'Colorful CTAs',
      'Modern, dynamic feel',
    ],
    colorGuidelines: 'Use purple/blue/pink gradients, smooth transitions, white overlay text',
    typographyGuidelines: 'Clean fonts, white or dark text depending on background, bold headings',
  },
};

export class ExamplesSearchService {
  private static instance: ExamplesSearchService;

  private constructor() {}

  static getInstance(): ExamplesSearchService {
    if (!this.instance) {
      this.instance = new ExamplesSearchService();
    }
    return this.instance;
  }

  /**
   * Get curated examples for a specific page type
   */
  getExamplesForPageType(pageType: PageType): PageTypeExamples {
    return CURATED_EXAMPLES[pageType] || CURATED_EXAMPLES.landing;
  }

  /**
   * Get random examples to ensure variety in generations
   */
  getRandomExamples(pageType: PageType, count: number = 2): UIExample[] {
    const examples = CURATED_EXAMPLES[pageType]?.examples || CURATED_EXAMPLES.landing.examples;
    const shuffled = [...examples].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get design style configuration
   */
  getDesignStyle(style: DesignStyle): typeof DESIGN_STYLES[DesignStyle] {
    return DESIGN_STYLES[style] || DESIGN_STYLES.minimal;
  }

  /**
   * Get random design style for variety
   */
  getRandomDesignStyle(): { style: DesignStyle; config: typeof DESIGN_STYLES[DesignStyle] } {
    const styles = Object.keys(DESIGN_STYLES) as DesignStyle[];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    return {
      style: randomStyle,
      config: DESIGN_STYLES[randomStyle],
    };
  }

  /**
   * Search for external examples using web search API
   * This requires SERP_API_KEY or GOOGLE_SEARCH_API_KEY to be configured
   */
  async searchExternalExamples(pageType: PageType, query?: string): Promise<SearchResult[]> {
    const apiKey = process.env.SERP_API_KEY || process.env.GOOGLE_SEARCH_API_KEY;

    if (!apiKey) {
      // Return empty array if no API key - we'll use curated examples instead
      console.log('[ExamplesSearch] No search API key configured, using curated examples only');
      return [];
    }

    const searchQuery = query || `best Tailwind CSS ${pageType} page examples HTML design`;

    try {
      // Using SerpAPI as the default search provider
      const response = await fetch(
        `https://serpapi.com/search?q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&num=5`,
        { next: { revalidate: 3600 } } // Cache for 1 hour
      );

      if (!response.ok) {
        console.error('[ExamplesSearch] Search API error:', response.statusText);
        return [];
      }

      const data = await response.json();
      const results: SearchResult[] = (data.organic_results || []).slice(0, 5).map((result: any) => ({
        title: result.title,
        snippet: result.snippet,
        url: result.link,
      }));

      return results;
    } catch (error) {
      console.error('[ExamplesSearch] Failed to fetch external examples:', error);
      return [];
    }
  }

  /**
   * Generate comprehensive examples context for AI prompt
   */
  async generateExamplesContext(
    pageType: PageType,
    options?: {
      designStyle?: DesignStyle;
      industry?: string;
      useExternalSearch?: boolean;
    }
  ): Promise<string> {
    const pageExamples = this.getExamplesForPageType(pageType);
    const randomExamples = this.getRandomExamples(pageType, 3);

    // Get design style
    let styleConfig;
    if (options?.designStyle) {
      styleConfig = { style: options.designStyle, config: this.getDesignStyle(options.designStyle) };
    } else {
      styleConfig = this.getRandomDesignStyle();
    }

    // Optionally fetch external examples
    let externalExamples: SearchResult[] = [];
    if (options?.useExternalSearch) {
      const searchQuery = options?.industry
        ? `${options.industry} ${pageType} page design examples Tailwind`
        : undefined;
      externalExamples = await this.searchExternalExamples(pageType, searchQuery);
    }

    // Build the context string
    let context = `
REAL-WORLD DESIGN REFERENCES:
Before generating, study and adapt elements from these high-converting ${pageType} pages:

${randomExamples.map((ex, i) => `
${i + 1}. **${ex.name}** - ${ex.description}
   Key Features:
   ${ex.keyFeatures.map(f => `   - ${f}`).join('\n')}
   Design Patterns: ${ex.designPatterns.join(', ')}
   Color Scheme: ${ex.colorScheme || 'Varies'}
`).join('\n')}

RECOMMENDED SECTION ORDER:
${pageExamples.sectionOrder.map((s, i) => `${i + 1}. ${s}`).join('\n')}

LAYOUT PATTERNS TO CONSIDER:
${pageExamples.layoutPatterns.map(p => `- ${p}`).join('\n')}

CONVERSION OPTIMIZATION TIPS:
${pageExamples.conversionTips.map(t => `- ${t}`).join('\n')}

DESIGN STYLE: ${styleConfig.style.toUpperCase()}
${styleConfig.config.description}

Style Characteristics:
${styleConfig.config.characteristics.map(c => `- ${c}`).join('\n')}

Color Guidelines: ${styleConfig.config.colorGuidelines}
Typography: ${styleConfig.config.typographyGuidelines}
`;

    // Add external search results if available
    if (externalExamples.length > 0) {
      context += `

ADDITIONAL INSPIRATION FROM WEB SEARCH:
${externalExamples.map((r, i) => `${i + 1}. "${r.title}" - ${r.snippet}`).join('\n')}
`;
    }

    return context;
  }

  /**
   * Get all available page types
   */
  getAvailablePageTypes(): PageType[] {
    return Object.keys(CURATED_EXAMPLES) as PageType[];
  }

  /**
   * Get all available design styles
   */
  getAvailableDesignStyles(): DesignStyle[] {
    return Object.keys(DESIGN_STYLES) as DesignStyle[];
  }
}

// Singleton export
export function getExamplesSearchService(): ExamplesSearchService {
  return ExamplesSearchService.getInstance();
}
