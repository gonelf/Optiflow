/**
 * AI Generator Service
 * Handles AI-powered page and component generation
 */

import { getOpenAIService, ChatMessage } from './openai.service';
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
    const openai = getOpenAIService();

    const systemPrompt = generatePagePrompt(input);
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Generate a ${input.pageType || 'landing'} page with the following description: ${input.description}`,
      },
    ];

    const response = await openai.createChatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate page content');
    }

    try {
      const generatedPage = JSON.parse(content);
      return this.validateAndFormatPage(generatedPage);
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
  ): Promise<void> {
    const openai = getOpenAIService();

    const systemPrompt = generatePagePrompt(input);
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Generate a ${input.pageType || 'landing'} page with the following description: ${input.description}`,
      },
    ];

    await openai.createStreamingCompletion(messages, onChunk, {
      temperature: 0.8,
      maxTokens: 3000,
    });
  }

  /**
   * Generate a single component
   */
  static async generateComponent(
    componentType: string,
    context: string
  ): Promise<GeneratedComponent> {
    const openai = getOpenAIService();

    const systemPrompt = generateComponentPrompt(componentType);
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Generate a ${componentType} component with this context: ${context}`,
      },
    ];

    const response = await openai.createChatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate component');
    }

    try {
      return JSON.parse(content);
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
    const openai = getOpenAIService();

    const systemPrompt = generateOptimizationPrompt();
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Optimize this ${currentContent.type}: "${currentContent.content}". Goal: ${goal}`,
      },
    ];

    const response = await openai.createChatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate optimizations');
    }

    try {
      const suggestions = JSON.parse(content);
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
    const openai = getOpenAIService();

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert copywriter who creates compelling, conversion-focused headlines. Generate variations that are clear, benefit-driven, and action-oriented.',
      },
      {
        role: 'user',
        content: `Generate ${count} headline variations for A/B testing. Original headline: "${originalHeadline}". Return only a JSON array of strings.`,
      },
    ];

    const response = await openai.createChatCompletion(messages, {
      temperature: 0.9,
      maxTokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate headlines');
    }

    try {
      return JSON.parse(content);
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
    const openai = getOpenAIService();

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an SEO expert. Generate optimized meta tags for maximum search visibility.',
      },
      {
        role: 'user',
        content: `Generate SEO metadata for this content: ${pageContent}${keywords ? `. Target keywords: ${keywords.join(', ')}` : ''}. Return JSON with title (60 chars max), description (160 chars max), and keywords array.`,
      },
    ];

    const response = await openai.createChatCompletion(messages, {
      temperature: 0.5,
      maxTokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate SEO metadata');
    }

    try {
      return JSON.parse(content);
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
}
