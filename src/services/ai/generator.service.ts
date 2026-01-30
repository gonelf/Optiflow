/**
 * AI Generator Service
 * Handles AI-powered page and component generation with multi-model fallback
 */

import { getMultiModelService } from './multi-model.service';
import { generatePagePrompt, generateComponentPrompt, generateOptimizationPrompt } from '@/lib/ai/prompts';

export interface GeneratePageInput {
  productName?: string;
  description: string;
  industry?: string;
  targetAudience?: string;
  brandVoice?: string;
  keyBenefits?: string;
  pageGoal?: string;
  pageType?: 'landing' | 'pricing' | 'about' | 'contact' | 'blog' | 'product';
}

export interface GeneratedComponent {
  type: string;
  props: Record<string, any>;
  content?: any;
}

export interface GeneratedElement {
  type: string;
  tagName?: string;
  styles?: Record<string, string>;
  attributes?: Record<string, string>;
  content?: string;
  children?: GeneratedElement[];
}

export interface GeneratedPage {
  title: string;
  description: string;
  components?: GeneratedComponent[]; // Kept for backward compatibility
  elements?: GeneratedElement[];     // New recursive structure
  seoTitle?: string;
  seoDescription?: string;
  generatedBy?: string; // Which AI provider was used
}

export interface OptimizationSuggestion {
  type: 'headline' | 'cta' | 'copy' | 'layout' | 'seo';
  current: string;
  suggestions: string[];
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
}

export class AIGeneratorService {
  /**
   * Generate a complete page based on user input
   */
  static async generatePage(input: GeneratePageInput): Promise<GeneratedPage> {
    const multiModel = getMultiModelService();

    const systemPrompt = generatePagePrompt(input);
    const userPrompt = `Generate a ${input.pageType || 'landing'} page with the following description: ${input.description}`;

    const result = await multiModel.generateContent(userPrompt, {
      systemInstruction: systemPrompt,
      temperature: 0.8,
      maxTokens: 3000,
    });

    try {
      const generatedPage = JSON.parse(result.content);
      const validatedPage = this.validateAndFormatPage(generatedPage);

      // Add metadata about which provider was used
      return {
        ...validatedPage,
        generatedBy: result.provider,
      };
    } catch (error) {
      throw new Error('Failed to parse generated page JSON');
    }
  }

  /**
   * Generate a page with design context from existing pages
   */
  static async generatePageWithContext(input: {
    pagePurpose: string;
    existingPages?: Array<{
      title: string;
      components: any[];
    }>;
    designStyle?: string;
  }): Promise<GeneratedPage> {
    const multiModel = getMultiModelService();

    // Import the prompt function
    const { generatePageWithContextPrompt } = await import('@/lib/ai/prompts');

    const systemPrompt = generatePageWithContextPrompt(input);
    const userPrompt = `Generate a page for: ${input.pagePurpose}`;

    const result = await multiModel.generateContent(userPrompt, {
      systemInstruction: systemPrompt,
      temperature: 0.8,
      maxTokens: 30000,
    });

    try {
      // Import cheerio dynamically
      const cheerio = await import('cheerio');
      const $ = cheerio.load(result.content);

      // Extract SEO metadata
      const $seo = $('#seo-metadata');
      const title = $seo.attr('data-title') || 'Untitled Page';
      const description = $seo.attr('data-description') || '';
      const seoTitle = $seo.attr('data-seo-title') || title;
      const seoDescription = $seo.attr('data-seo-description') || description;

      // Helper to parse style string to object
      const parseStyle = (styleString: string | undefined): Record<string, string> => {
        if (!styleString) return {};
        const styles: Record<string, string> = {};
        styleString.split(';').forEach(style => {
          const [key, value] = style.split(':');
          if (key && value) {
            // Convert kebab-case to camelCase
            const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            styles[camelKey] = value.trim();
          }
        });
        return styles;
      };

      // Recursive function to convert DOM to Element tree
      const elements: any[] = [];
      $('body').children().each((_, el) => {
        if (el.attribs.id !== 'seo-metadata') {
          const element = this.convertToElement(el, $);
          if (element) elements.push(element);
        }
      });

      return {
        title,
        description,
        seoTitle,
        seoDescription,
        elements,
        generatedBy: result.provider,
      };

    } catch (error) {
      console.error('Failed to parse AI HTML response:', result.content);
      // Fallback or re-throw
      throw new Error('Failed to parse generated page HTML');
    }
  }


  /**
   * Generate page with streaming response
   */
  static async generatePageStreaming(
    input: GeneratePageInput,
    onChunk: (chunk: string) => void
  ): Promise<{ provider: string }> {
    const multiModel = getMultiModelService();

    const systemPrompt = generatePagePrompt(input);
    const userPrompt = `Generate a ${input.pageType || 'landing'} page with the following description: ${input.description}`;

    const result = await multiModel.generateStreaming(
      userPrompt,
      onChunk,
      {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        maxTokens: 3000,
      }
    );

    return { provider: result.provider };
  }

  /**
   * Generate a single component
   */
  static async generateComponent(
    componentType: string,
    context: string
  ): Promise<GeneratedComponent> {
    const multiModel = getMultiModelService();

    const systemPrompt = generateComponentPrompt(componentType);
    const userPrompt = `Generate a ${componentType} component with this context: ${context}`;

    const result = await multiModel.generateContent(userPrompt, {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    });

    try {
      return JSON.parse(result.content);
    } catch (error) {
      throw new Error('Failed to parse generated component JSON');
    }
  }

  /**
   * Generate optimization suggestions for existing content
   */
  static async generateOptimizations(
    currentContent: {
      type: string;
      content: string;
    },
    goal: string
  ): Promise<OptimizationSuggestion[]> {
    const multiModel = getMultiModelService();

    const systemPrompt = generateOptimizationPrompt();
    const userPrompt = `Optimize this ${currentContent.type}: "${currentContent.content}". Goal: ${goal}`;

    const result = await multiModel.generateContent(userPrompt, {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    try {
      const suggestions = JSON.parse(result.content);
      return Array.isArray(suggestions) ? suggestions : [suggestions];
    } catch (error) {
      throw new Error('Failed to parse optimization suggestions');
    }
  }

  /**
   * Generate headline variations for A/B testing
   */
  static async generateHeadlineVariants(
    originalHeadline: string,
    count: number = 5
  ): Promise<string[]> {
    const multiModel = getMultiModelService();

    const systemPrompt = 'You are an expert copywriter who creates compelling, conversion-focused headlines. Generate variations that are clear, benefit-driven, and action-oriented.';
    const userPrompt = `Generate ${count} headline variations for A/B testing. Original headline: "${originalHeadline}". Return only a JSON array of strings.`;

    const result = await multiModel.generateContent(userPrompt, {
      systemInstruction: systemPrompt,
      temperature: 0.9,
      maxTokens: 500,
    });

    try {
      return JSON.parse(result.content);
    } catch (error) {
      throw new Error('Failed to parse headline variants');
    }
  }

  /**
   * Generate SEO metadata
   */
  static async generateSEOMetadata(
    pageContent: string,
    keywords?: string[]
  ): Promise<{
    title: string;
    description: string;
    keywords: string[];
  }> {
    const multiModel = getMultiModelService();

    const systemPrompt = 'You are an SEO expert. Generate optimized meta tags for maximum search visibility.';
    const userPrompt = `Generate SEO metadata for this content: ${pageContent}${keywords ? `. Target keywords: ${keywords.join(', ')}` : ''}. Return JSON with title (60 chars max), description (160 chars max), and keywords array.`;

    const result = await multiModel.generateContent(userPrompt, {
      systemInstruction: systemPrompt,
      temperature: 0.5,
      maxTokens: 300,
    });

    try {
      return JSON.parse(result.content);
    } catch (error) {
      throw new Error('Failed to parse SEO metadata');
    }
  }

  /**
   * Edit an element based on user prompt using HTML strategy
   */
  static async editElement(
    element: any,
    prompt: string
  ): Promise<any> {
    const multiModel = getMultiModelService();

    // 1. Convert element to HTML string for context
    const elementHtml = this.elementToHTML(element);

    const systemPrompt = `You are an expert web developer and UI designer. 
    Your task is to modify a specific HTML element based on the user's request.
    
    Rules:
    1. Return ONLY the complete, valid HTML of the modified element.
    2. Maintain the existing structure unless asked to change it.
    3. Use inline styles (style="...") for styling. Do NOT use classes unless they were already present.
    4. Ensure the HTML is valid and parseable.
    5. If the request is impossible or unclear, return the original HTML.
    `;

    const userPrompt = `
    Current Element HTML:
    ${elementHtml}

    User Request: "${prompt}"

    Return the modified HTML:
    `;

    const result = await multiModel.generateContent(userPrompt, {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    try {
      // 2. Parse the returned HTML back to JSON
      // Import cheerio dynamically if not already imported at top level (it is in other methods)
      const cheerio = await import('cheerio');
      const $ = cheerio.load(result.content);

      // The snippet might be wrapped in <html><body>...</body></html> by cheerio if we just load it
      // So we target the body content's first child
      const modifiedNode = $('body').children().first()[0];

      if (!modifiedNode) {
        throw new Error('AI returned empty or invalid HTML');
      }

      const modifiedElement = this.convertToElement(modifiedNode, $);

      if (!modifiedElement) {
        throw new Error('Failed to convert AI HTML back to element');
      }

      // 3. Merge with original to ensure we don't lose key metadata
      return {
        ...element,
        ...modifiedElement,
        // Preserve critical identification fields
        id: element.id,
        pageId: element.pageId,
        parentId: element.parentId,
        order: element.order,
      };
    } catch (error) {
      console.error('Failed to process AI edited element:', error);
      // Fallback: return original if fails
      throw new Error('Failed to parse AI response for element edit');
    }
  }

  /**
   * Helper: Convert JSON element to HTML string
   */
  private static elementToHTML(element: any): string {
    const tagName = element.tagName || (element.type === 'image' ? 'img' : element.type === 'button' ? 'button' : 'div');

    // Build styles string
    let styleString = '';
    if (element.styles) {
      styleString = Object.entries(element.styles)
        .map(([k, v]) => {
          // camelCase to kebab-case
          const key = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
          return `${key}: ${v}`;
        })
        .join('; ');
    }

    // Build attributes
    let attributesString = '';
    if (element.attributes) {
      attributesString = Object.entries(element.attributes)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
    }

    // Specific handling for images
    if (element.type === 'image' && element.content) {
      if (element.content.src) attributesString += ` src="${element.content.src}"`;
      if (element.content.alt) attributesString += ` alt="${element.content.alt}"`;
    }

    // Handle style attribute
    if (styleString) {
      attributesString += ` style="${styleString}"`;
    }

    // Self-closing tags
    if (['img', 'br', 'hr', 'input'].includes(tagName)) {
      return `<${tagName} ${attributesString} />`;
    }

    // Children or content
    let contentHtml = '';
    if (element.content && element.content.content) {
      contentHtml = element.content.content;
    }

    if (element.children && Array.isArray(element.children)) {
      contentHtml += element.children.map((child: any) => this.elementToHTML(child)).join('');
    }

    return `<${tagName} ${attributesString}>${contentHtml}</${tagName}>`;
  }

  /**
   * Helper: Parse Cheerio node to Element JSON
   * (Extracted from generatePageWithContext to be reusable)
   */
  private static convertToElement(node: any, $: any): any {
    if (node.type === 'text') {
      if (!node.data.trim()) return null;
      return null; // Handled by parent content
    }

    const tagName = node.tagName.toLowerCase();
    const $node = $(node);

    // Determine element type
    let type = 'container';
    if (['h1', 'h2', 'h3', 'h4', 'p', 'span', 'strong'].includes(tagName)) {
      if (['h1', 'h2', 'h3', 'h4', 'p', 'span'].includes(tagName)) type = 'text';
    }
    if (tagName === 'button') type = 'button';
    if (tagName === 'a') {
      type = $node.attr('class')?.includes('btn') || $node.attr('style')?.includes('padding') ? 'button' : 'link';
    }
    if (tagName === 'img') type = 'image';
    if (tagName === 'input' || tagName === 'textarea') type = 'input';

    // Get attributes
    const attributes: Record<string, string> = {};
    if (node.attribs) {
      Object.keys(node.attribs).forEach(key => {
        if (key !== 'style' && key !== 'class') {
          attributes[key] = node.attribs[key];
        }
      });
    }

    // Helper to parse style string to object
    const parseStyle = (styleString: string | undefined): Record<string, string> => {
      if (!styleString) return {};
      const styles: Record<string, string> = {};
      styleString.split(';').forEach(style => {
        const [key, value] = style.split(':');
        if (key && value) {
          // Convert kebab-case to camelCase
          const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          styles[camelKey] = value.trim();
        }
      });
      return styles;
    };

    // Get styles
    const styles = parseStyle(node.attribs?.style);

    // Get content (if text node)
    let content = '';
    const children: any[] = [];

    node.children.forEach((child: any) => {
      if (child.type === 'text') {
        content += child.data;
      } else if (child.type === 'tag') {
        const childEl = this.convertToElement(child, $);
        if (childEl) children.push(childEl);
      }
    });

    // Construct element
    return {
      type,
      tagName,
      styles,
      attributes,
      content: {
        content: content.trim(),
        src: attributes.src,
        href: attributes.href,
        alt: attributes.alt,
        placeholder: attributes.placeholder,
        tagName // Include tag name in content for rendering
      },
      children
    };
  }

  /**
   * Validate and format generated page structure
   */
  private static validateAndFormatPage(generatedPage: any): GeneratedPage {
    if (!generatedPage.title || !Array.isArray(generatedPage.components)) {
      throw new Error('Invalid page structure from AI');
    }

    return {
      title: generatedPage.title,
      description: generatedPage.description || '',
      components: generatedPage.components.map((comp: any) => ({
        type: comp.type || 'unknown',
        props: comp.props || {},
        content: comp.content,
      })),
      seoTitle: generatedPage.seoTitle,
      seoDescription: generatedPage.seoDescription,
    };
  }

  /**
   * Get AI service health status
   */
  static async getServiceStatus(): Promise<{
    available: string[];
    failed: string[];
  }> {
    const multiModel = getMultiModelService();
    const models = multiModel.getAvailableModels();

    const available: string[] = [];
    const failed: string[] = [];

    for (const model of models) {
      const isHealthy = await multiModel.checkModelHealth(model.model);
      if (isHealthy) {
        available.push(model.model);
      } else {
        failed.push(model.model);
      }
    }

    return { available, failed };
  }

  /**
   * Get fallback history (for debugging)
   */
  static getFallbackHistory(): any[] {
    const multiModel = getMultiModelService();
    return multiModel.getFallbackHistory();
  }
}
