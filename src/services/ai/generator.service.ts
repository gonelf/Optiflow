/**
 * AI Generator Service
 * Handles AI-powered page and component generation with multi-model fallback
 */

import { getMultiModelService } from './multi-model.service';
import { generatePagePrompt, generateComponentPrompt, generateOptimizationPrompt } from '@/lib/ai/prompts';

export interface GeneratePageInput {
  description: string;
  industry?: string;
  targetAudience?: string;
  brandVoice?: string;
  pageType?: 'landing' | 'pricing' | 'about' | 'contact' | 'blog' | 'product';
}

export interface GeneratedComponent {
  type: string;
  props: Record<string, any>;
  content?: any;
}

export interface GeneratedPage {
  title: string;
  description: string;
  components: GeneratedComponent[];
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
    const providers = multiModel.getAvailableProviders();

    const available: string[] = [];
    const failed: string[] = [];

    for (const provider of providers) {
      const isHealthy = await multiModel.checkProviderHealth(provider);
      if (isHealthy) {
        available.push(provider);
      } else {
        failed.push(provider);
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
