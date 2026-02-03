/**
 * AI Prompt Templates
 * Prompt engineering for page generation and optimization
 */

import { GeneratePageInput } from '@/services/ai/generator.service';

export function generatePagePrompt(input: GeneratePageInput): string {
  const {
    productName = 'the product',
    industry = 'general',
    targetAudience = 'general audience',
    brandVoice = 'professional and friendly',
    keyBenefits = '',
    pageGoal = 'get signups',
    pageType = 'landing',
  } = input;

  return `You are an expert landing page designer and copywriter. Generate a complete ${pageType} page structure in JSON format for a product called "${productName}".

CONTEXT:
- Product/Service: ${productName}
- Main Description: ${input.description}
- Target Audience: ${targetAudience}
- Key Benefits: ${keyBenefits}
- Primary Goal: ${pageGoal}
- Brand Voice: ${brandVoice}
- Industry: ${industry}
- Page Type: ${pageType}

AVAILABLE COMPONENTS:
1. Hero - Main header section with headline, subheadline, and CTA
2. Features - Grid of feature cards with icons, titles, and descriptions
3. Pricing - Pricing table with multiple tiers
4. Testimonials - Customer testimonials with avatars and ratings
5. CTA - Call-to-action section with button
6. FAQ - Accordion-style frequently asked questions
7. Form - Contact or signup form
8. Newsletter - Email subscription form

OUTPUT FORMAT (JSON):
{
  "title": "Page title",
  "description": "Page description",
  "seoTitle": "SEO-optimized title (60 chars max)",
  "seoDescription": "SEO-optimized description (160 chars max)",
  "components": [
    {
      "type": "Hero",
      "props": {
        "layout": "centered|split",
        "backgroundImage": "image URL or null",
        "backgroundColor": "hex color"
      },
      "content": {
        "headline": "Compelling headline",
        "subheadline": "Supporting text",
        "primaryCTA": {
          "text": "Button text",
          "style": "primary|secondary"
        },
        "secondaryCTA": {
          "text": "Button text",
          "style": "outline"
        }
      }
    },
    {
      "type": "Features",
      "props": {
        "columns": 3,
        "layout": "grid|list"
      },
      "content": {
        "heading": "Section heading",
        "subheading": "Section description",
        "features": [
          {
            "icon": "icon name",
            "title": "Feature title",
            "description": "Feature description"
          }
        ]
      }
    },
    {
      "type": "Pricing",
      "props": {
        "tiers": 3,
        "highlightTier": 1
      },
      "content": {
        "heading": "Pricing",
        "tiers": [
          {
            "name": "Tier name",
            "price": "Price",
            "interval": "month|year",
            "features": ["Feature 1", "Feature 2"],
            "cta": "Get Started"
          }
        ]
      }
    }
  ]
}

GUIDELINES:
1. Create compelling, benefit-focused copy
2. Use action-oriented CTAs
3. Include 4-6 components for a complete page
4. Match the brand voice: ${brandVoice}
5. Target the audience: ${targetAudience}
6. Optimize for conversions
7. Return ONLY valid JSON, no markdown or explanations

Generate the page now:`;
}

export function generateComponentPrompt(componentType: string): string {
  return `You are a UI/UX expert. Generate a ${componentType} component in JSON format.

Component: ${componentType}

Return JSON with this structure:
{
  "type": "${componentType}",
  "props": {
    // Component-specific properties
  },
  "content": {
    // Component content
  }
}

Guidelines:
- Make it conversion-focused
- Use clear, action-oriented copy
- Include realistic placeholder content
- Return ONLY valid JSON`;
}

export function generateOptimizationPrompt(): string {
  return `You are a conversion rate optimization expert. Analyze the provided content and suggest improvements.

Return JSON array of suggestions:
[
  {
    "type": "headline|cta|copy|layout|seo",
    "current": "Current content",
    "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
    "reasoning": "Why these changes will improve conversions",
    "impact": "high|medium|low"
  }
]

Guidelines:
- Focus on proven CRO principles
- Provide 3-5 specific suggestions
- Explain the reasoning
- Estimate impact level
- Return ONLY valid JSON`;
}

export function generateHeadlinePrompt(
  originalHeadline: string,
  context: string
): string {
  return `Generate 5 headline variations for A/B testing.

Original: "${originalHeadline}"
Context: ${context}

Rules:
1. Keep under 10 words
2. Lead with benefits, not features
3. Use power words
4. Create urgency or curiosity
5. Be specific and clear

Return JSON array of strings: ["Headline 1", "Headline 2", ...]`;
}

export function generateCTAPrompt(
  currentCTA: string,
  context: string
): string {
  return `Suggest 5 improved CTA button text variations.

Current CTA: "${currentCTA}"
Context: ${context}

Guidelines:
- Use action verbs
- Create urgency
- Be specific
- Keep it short (2-4 words)
- Focus on value

Return JSON array: ["CTA 1", "CTA 2", ...]`;
}

export function generateSEOPrompt(
  pageContent: string,
  keywords: string[]
): string {
  return `Generate SEO metadata for this page.

Content: ${pageContent}
Target Keywords: ${keywords.join(', ')}

Return JSON:
{
  "title": "SEO title (60 chars max)",
  "description": "Meta description (160 chars max)",
  "keywords": ["keyword1", "keyword2"],
  "suggestions": ["SEO improvement 1", "SEO improvement 2"]
}

Guidelines:
- Include primary keyword in title
- Write compelling meta description
- Natural keyword integration
- Focus on click-through rate`;
}

export function generateFormFieldsPrompt(
  formPurpose: string
): string {
  return `Design form fields for: ${formPurpose}

Return JSON:
{
  "fields": [
    {
      "name": "field_name",
      "type": "text|email|tel|textarea|select",
      "label": "Field Label",
      "placeholder": "Placeholder text",
      "required": true|false,
      "validation": "validation rule"
    }
  ],
  "submitText": "Submit button text",
  "successMessage": "Success message"
}

Guidelines:
- Minimize fields (only ask for essential info)
- Clear labels and placeholders
- Appropriate field types
- Set required fields thoughtfully`;
}

export interface PageWithContextInput {
  pagePurpose: string;
  existingPages?: Array<{
    title: string;
    components: any[];
  }>;
  designStyle?: string;
  designSystem?: string; // Design system recommendations from UI/UX Pro Max
}

export function generatePageWithContextPrompt(input: PageWithContextInput): string {
  const { pagePurpose, existingPages, designStyle, designSystem } = input;

  let contextSection = '';

  if (existingPages && existingPages.length > 0) {
    // Analyze existing pages for design consistency
    const componentTypes = new Set<string>();
    const componentPatterns: any[] = [];

    existingPages.forEach(page => {
      page.components?.forEach(comp => {
        componentTypes.add(comp.type);
        componentPatterns.push({
          type: comp.type,
          config: comp.config,
          styles: comp.styles,
          content: comp.content
        });
      });
    });

    contextSection = `DESIGN CONTEXT (Maintain Consistency):
You are creating a new page for a workspace that already has ${existingPages.length} page(s). 
Analyze the existing pages and maintain design consistency.

Existing Pages:
${existingPages.map((page, idx) => `
${idx + 1}. "${page.title}"
   Components: ${page.components?.map(c => c.type).join(', ') || 'none'}
`).join('\n')}

Component Patterns Found:
${Array.from(componentTypes).join(', ')}

Sample Component Structures:
${JSON.stringify(componentPatterns.slice(0, 3), null, 2)}

INSTRUCTIONS:
1. Match the component types and structures used in existing pages
2. Maintain similar styling patterns (colors, spacing, layouts)
3. Keep the same design language and visual hierarchy
4. Use similar content structures and formatting
5. Ensure the new page feels like part of the same website`;
  } else if (designStyle) {
    // Use user-specified design style
    contextSection = `DESIGN STYLE:
This is the first page in the workspace. Create a ${designStyle} design.

Style Guidelines for "${designStyle}":
- Choose appropriate color schemes and typography
- Select suitable component layouts
- Apply consistent spacing and visual hierarchy
- Create a cohesive, professional design
- Use modern, conversion-focused patterns`;
  } else {
    // Default to modern, professional style
    contextSection = `DESIGN STYLE:
This is the first page in the workspace. Create a modern, professional design with:
- Clean, minimalist aesthetics
- Clear visual hierarchy
- Conversion-focused layouts
- Professional color palette
- Accessible, user-friendly components`;
  }

  const designSystemSection = designSystem
    ? `
🎨 PROFESSIONAL DESIGN SYSTEM (FOLLOW THESE GUIDELINES):
${designSystem}

CRITICAL: Use the exact colors, typography, and patterns specified above. This design system was generated by industry-leading design intelligence to ensure optimal conversion and user experience.
`
    : '';

  return `You are a WORLD-CLASS web designer creating PREMIUM, PRODUCTION-READY landing pages. Your designs must be VISUALLY STUNNING and rival the best SaaS landing pages (like Stripe, Linear, Vercel).

PAGE PURPOSE:
${pagePurpose}

${contextSection}

${designSystemSection}

🎨 DESIGN PHILOSOPHY:
Create a page that makes users say "WOW!" at first glance. Use:
- **Rich color palettes** (gradients, vibrant accents, depth)
- **Modern aesthetics** (glassmorphism, subtle shadows, smooth transitions)
- **Professional typography** (clear hierarchy, generous spacing)
- **Visual interest** (backgrounds, patterns, illustrations)
- **Multiple sections** (Hero, Features, Social Proof, Pricing, FAQ, CTA, Footer)

HTML STRUCTURE:
Generate a single semantic HTML5 \`<body>\` content structure (do not include <head> or <html> tags).
- Use semantic tags: \`<header>\`, \`<section>\`, \`<nav>\`, \`<footer>\`, \`<article>\`
- **CRITICAL**: Apply ALL styling using inline \`style="..."\` attributes. Do NOT use classes.
- Use images with \`src\` placeholders (e.g., https://placehold.co/800x400/png).
- Include SEO metadata in a special hidden div at the start:
  \`<div id="seo-metadata" data-title="Page Title" data-description="Meta description"></div>\`

TARGET SECTIONS:
Analyze the page purpose, industry, and audience to determine the most effective sections for this specific case.
You must include at least 5-7 distinct sections to ensure a full, professional page.

Guidance for section selection:
1. **HERO SECTION** (Mandatory): High-impact header with headline, subhead, and CTAs.
2. **Core Content**: Select sections that best explain the value proposition (e.g., Features, How it Works, Benefits, Portfolio, Services).
3. **Social Proof**: Build trust (e.g., Testimonials, Logos, Stats) if relevant.
4. **Conversion**: Pricing, Contact, or Newsletter depending on the page goal.
5. **Final CTA**: Strong closing section.
6. **Footer**: Standard footer.

Ensure a logical flow that tells a story and guides the user towards the primary goal. Don't feel constrained to a specific formula if the content demands something unique.

🎨 STYLING RULES (Use inline styles):
- **Gradients**: \`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)\`
- **Typography**: \`font-family: sans-serif; font-size: 3.75rem; font-weight: 800; line-height: 1.1; color: #111827\`
- **Flexbox**: \`display: flex; flex-direction: column; align-items: center; gap: 24px\`
- **Grid**: \`display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px\`
- **Shadows**: \`box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)\`
- **Rounded**: \`border-radius: 12px\`

Generate the HTML string now. Return ONLY valid HTML code, no markdown fencing needed.`;
}

// ---------------------------------------------------------------------------
// A/B Testing: variant text generation
// ---------------------------------------------------------------------------

export interface ABVariantGenerationInput {
  testName: string;
  testDescription: string;
  primaryGoal: string;
  originalText: string;
  textType: 'headline' | 'cta' | 'body' | 'subheadline' | 'description';
  count: number;
}

export function generateABVariantsPrompt(input: ABVariantGenerationInput): string {
  const { testName, testDescription, primaryGoal, originalText, textType, count } = input;

  const guidelines: Record<string, string> = {
    headline: 'Keep each headline under 12 words. Lead with benefits or curiosity. Use power words.',
    cta: 'Keep each CTA 2\u20134 words. Use action verbs. Create urgency or clarity.',
    body: 'Keep body copy concise (1\u20133 sentences). Match the tone of the original. Focus on value.',
    subheadline: 'Keep under 15 words. Expand on the headline without repeating it.',
    description: 'Write 1\u20132 sentences. Clarify the value proposition clearly.',
  };

  return `You are a conversion rate optimization (CRO) expert. Generate exactly ${count} distinct text variations for an A/B test.

TEST CONTEXT:
- Test Name: ${testName}
- Test Description: ${testDescription}
- Primary Goal: ${primaryGoal}
- Text Type: ${textType}
- Original Text: "${originalText}"

GUIDELINES:
${guidelines[textType] || 'Write clear, compelling copy.'}
- Every variation must be meaningfully different from the others and from the original.
- Optimise each variation for the stated primary goal.
- Do NOT number the variations or add labels.

Return a JSON array of exactly ${count} strings. Example: ["Variation 1", "Variation 2"]
Return ONLY the JSON array, nothing else.`;
}

// ---------------------------------------------------------------------------
// A/B Testing: AI winner suggestion
// ---------------------------------------------------------------------------

export interface ABWinnerSuggestionInput {
  testName: string;
  testDescription: string;
  primaryGoal: string;
  conversionEvent: string;
  confidenceLevel: number;
  variants: Array<{
    name: string;
    isControl: boolean;
    impressions: number;
    conversions: number;
    conversionRate: number;
  }>;
  hasStatisticalSignificance: boolean;
  pValue: number;
  minimumSampleSize: number;
}

export function generateABWinnerSuggestionPrompt(input: ABWinnerSuggestionInput): string {
  const variantRows = input.variants
    .map(
      (v) =>
        `- "${v.name}"${v.isControl ? ' (Control)' : ''}: ${v.impressions} impressions, ${v.conversions} conversions, ${(v.conversionRate * 100).toFixed(2)}% conversion rate`
    )
    .join('\n');

  return `You are a data-driven A/B testing analyst. Analyse the following test results and recommend a winning variant.

TEST DETAILS:
- Name: ${input.testName}
- Description: ${input.testDescription}
- Primary Goal: ${input.primaryGoal}
- Conversion Event: ${input.conversionEvent}
- Confidence Level Target: ${(input.confidenceLevel * 100).toFixed(0)}%
- Minimum Sample Size: ${input.minimumSampleSize} per variant
- Statistical Significance Reached: ${input.hasStatisticalSignificance ? 'Yes' : 'No'}
- P-Value: ${input.pValue.toFixed(4)}

VARIANT RESULTS:
${variantRows}

ANALYSIS INSTRUCTIONS:
1. Identify the variant with the best conversion rate.
2. Assess whether the data is statistically reliable (sufficient sample sizes, p-value vs confidence target).
3. If significance has NOT been reached, flag that the recommendation is preliminary.
4. Explain WHY you recommend this variant in 2\u20133 sentences.
5. Note any risks or caveats (e.g., small sample, borderline significance).

Return ONLY a valid JSON object with this exact shape:
{
  "recommendedVariant": "<name of the variant you recommend>",
  "confidence": "high" | "medium" | "low",
  "reasoning": "<2-3 sentence explanation>",
  "caveats": "<any risks or caveats, or empty string if none>"
}`;
}

export const SYSTEM_PROMPTS = {
  PAGE_GENERATOR: 'You are an expert web developer who writes clean, semantic HTML structure and modern CSS styles generated as JSON.',
  COPY_OPTIMIZER: 'You are a conversion copywriting expert who optimizes headlines, CTAs, and body copy for maximum engagement.',
  SEO_SPECIALIST: 'You are an SEO expert who creates optimized meta tags and content structure for better search rankings.',
  UX_DESIGNER: 'You are a UX expert who designs intuitive, user-friendly interfaces that guide visitors toward conversion goals.',
};
