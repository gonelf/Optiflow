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

export const SYSTEM_PROMPTS = {
  PAGE_GENERATOR: 'You are an expert landing page designer who creates high-converting pages using proven design patterns and compelling copy.',
  COPY_OPTIMIZER: 'You are a conversion copywriting expert who optimizes headlines, CTAs, and body copy for maximum engagement.',
  SEO_SPECIALIST: 'You are an SEO expert who creates optimized meta tags and content structure for better search rankings.',
  UX_DESIGNER: 'You are a UX expert who designs intuitive, user-friendly interfaces that guide visitors toward conversion goals.',
};
