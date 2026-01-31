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

  return `You are an expert web designer and developer. Generate a high-converting ${pageType} page for "${productName}".

CONTEXT:
- Product: ${productName}
- Description: ${input.description}
- Industry: ${industry}
- Audience: ${targetAudience}
- Goal: ${pageGoal}
- Voice: ${brandVoice}
${input.designImageUrl ? '- VISUAL INSPIRATION: Use the provided image as a strict guide for color palette, layout style, and visual hierarchy.' : ''}

INSTRUCTIONS:
1. Generate a single semantic HTML5 \`<body>\` content structure.
2. Use **Tailwind CSS** for ALL styling. Do NOT use external CSS files.
3. Be visually impressive. Use gradients, shadows, rounded corners, and generous spacing.
4. Include these sections (at minimum):
   - Hero (Headline, Subhead, CTA)
   - Features/Benefits
   - Social Proof (Logos/Testimonials)
   - Pricing or FAQ (if relevant)
   - CTA / Footer
5. Include SEO metadata in a hidden div at the start:
   \`<div id="seo-metadata" data-title="Page Title" data-description="Meta description"></div>\`
6. Use image placeholders: https://via.placeholder.com/800x600

Output ONLY valid HTML code. No markdown fencing.`;
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
}

export function generatePageWithContextPrompt(input: PageWithContextInput): string {
  const { pagePurpose, existingPages, designStyle } = input;

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
    contextSection = `DESIGN STYLE:
This is the first page in the workspace. Create a modern, professional design with:
- Clean, minimalist aesthetics
- Clear visual hierarchy
- Conversion-focused layouts
- Professional color palette
- Accessible, user-friendly components`;
  }

  return `You are a WORLD-CLASS web designer creating PREMIUM, PRODUCTION-READY landing pages. Your designs must be VISUALLY STUNNING and rival the best SaaS landing pages (like Stripe, Linear, Vercel).

PAGE PURPOSE:
${pagePurpose}

${contextSection}

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
- **CRITICAL**: Use Tailwind CSS classes for ALL styling. Do NOT use inline styles unless absolutely necessary for dynamic values.
- Use images with \`src\` placeholders (e.g., https://via.placeholder.com/800x400).
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

🎨 STYLING RULES (Tailwind CSS):
- **Gradients**: \`bg-gradient-to-r from-blue-600 to-indigo-700\`
- **Typography**: \`font-sans text-6xl font-extrabold tracking-tight text-gray-900\`
- **Flexbox**: \`flex flex-col items-center gap-6\`
- **Grid**: \`grid grid-cols-1 md:grid-cols-3 gap-10\`
- **Shadows**: \`shadow-xl hover:shadow-2xl transition-shadow duration-300\`
- **Rounded**: \`rounded-xl\`
- **Buttons**: \`px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105\`

Generate the HTML string now. Return ONLY valid HTML code, no markdown fencing needed.`;
}

export const SYSTEM_PROMPTS = {
  PAGE_GENERATOR: 'You are an expert web developer who writes clean, semantic HTML structure and modern CSS styles generated as JSON.',
  COPY_OPTIMIZER: 'You are a conversion copywriting expert who optimizes headlines, CTAs, and body copy for maximum engagement.',
  SEO_SPECIALIST: 'You are an SEO expert who creates optimized meta tags and content structure for better search rankings.',
  UX_DESIGNER: 'You are a UX expert who designs intuitive, user-friendly interfaces that guide visitors toward conversion goals.',
};
