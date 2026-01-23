/**
 * Multi-Model AI Service
 * Implements automatic fallback between different AI providers
 * Priority: Gemini (free) -> OpenAI (paid) -> Other models
 */

import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';

export type AIProvider = 'gemini' | 'openai';

export interface AIModelConfig {
  provider: AIProvider;
  model?: string;
  apiKey?: string;
  priority: number; // Lower = higher priority
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export interface GenerationResult {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
}

export class MultiModelService {
  private providers: Map<AIProvider, any> = new Map();
  private modelConfigs: AIModelConfig[] = [];
  private fallbackHistory: { provider: AIProvider; timestamp: Date; error: string }[] = [];

  constructor(configs: AIModelConfig[]) {
    // Sort by priority
    this.modelConfigs = configs.sort((a, b) => a.priority - b.priority);

    // Initialize providers
    this.initializeProviders();
  }

  private initializeProviders(): void {
    for (const config of this.modelConfigs) {
      try {
        switch (config.provider) {
          case 'gemini':
            if (config.apiKey || process.env.GEMINI_API_KEY) {
              this.providers.set(
                'gemini',
                new GeminiService({
                  apiKey: config.apiKey || process.env.GEMINI_API_KEY || '',
                  model: config.model || 'gemini-1.5-flash',
                })
              );
            }
            break;

          case 'openai':
            if (config.apiKey || process.env.OPENAI_API_KEY) {
              this.providers.set(
                'openai',
                new OpenAIService({
                  apiKey: config.apiKey || process.env.OPENAI_API_KEY || '',
                  model: config.model || 'gpt-4-turbo-preview',
                })
              );
            }
            break;
        }
      } catch (error) {
        console.warn(`Failed to initialize ${config.provider}:`, error);
      }
    }
  }

  /**
   * Generate content with automatic fallback
   */
  async generateContent(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GenerationResult> {
    const errors: { provider: AIProvider; error: string }[] = [];

    for (const config of this.modelConfigs) {
      const provider = this.providers.get(config.provider);
      if (!provider) continue;

      try {
        console.log(`Attempting generation with ${config.provider}...`);

        let content: string;

        if (config.provider === 'gemini') {
          content = await provider.generateContent(prompt, {
            systemInstruction: options?.systemInstruction,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
          });
        } else if (config.provider === 'openai') {
          const messages = [];
          if (options?.systemInstruction) {
            messages.push({
              role: 'system',
              content: options.systemInstruction,
            });
          }
          messages.push({
            role: 'user',
            content: prompt,
          });

          const response = await provider.createChatCompletion(messages, {
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
          });

          content = response.choices[0]?.message?.content || '';
        } else {
          throw new Error(`Unsupported provider: ${config.provider}`);
        }

        console.log(`✓ Successfully generated with ${config.provider}`);

        return {
          content,
          provider: config.provider,
          model: config.model || 'default',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`✗ ${config.provider} failed:`, errorMessage);

        errors.push({
          provider: config.provider,
          error: errorMessage,
        });

        // Track fallback in history
        this.fallbackHistory.push({
          provider: config.provider,
          timestamp: new Date(),
          error: errorMessage,
        });

        // Check if it's a rate limit or quota error
        if (this.isRateLimitError(errorMessage)) {
          console.log(`Rate limit hit for ${config.provider}, trying next provider...`);
          continue;
        }

        // For other errors, continue to next provider
        continue;
      }
    }

    // All providers failed
    throw new Error(
      `All AI providers failed. Errors: ${errors
        .map((e) => `${e.provider}: ${e.error}`)
        .join('; ')}`
    );
  }

  /**
   * Generate content with chat history
   */
  async generateWithHistory(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    options?: GenerationOptions
  ): Promise<GenerationResult> {
    const errors: { provider: AIProvider; error: string }[] = [];

    for (const config of this.modelConfigs) {
      const provider = this.providers.get(config.provider);
      if (!provider) continue;

      try {
        console.log(`Attempting generation with ${config.provider}...`);

        let content: string;

        if (config.provider === 'gemini') {
          // Extract system instruction if present
          const systemMsg = messages.find((m) => m.role === 'system');
          const chatMessages = messages.filter((m) => m.role !== 'system');

          content = await provider.generateContentWithHistory(
            chatMessages,
            {
              systemInstruction: systemMsg?.content || options?.systemInstruction,
              temperature: options?.temperature,
              maxTokens: options?.maxTokens,
            }
          );
        } else if (config.provider === 'openai') {
          const response = await provider.createChatCompletion(messages, {
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
          });

          content = response.choices[0]?.message?.content || '';
        } else {
          throw new Error(`Unsupported provider: ${config.provider}`);
        }

        console.log(`✓ Successfully generated with ${config.provider}`);

        return {
          content,
          provider: config.provider,
          model: config.model || 'default',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`✗ ${config.provider} failed:`, errorMessage);

        errors.push({
          provider: config.provider,
          error: errorMessage,
        });

        this.fallbackHistory.push({
          provider: config.provider,
          timestamp: new Date(),
          error: errorMessage,
        });

        if (this.isRateLimitError(errorMessage)) {
          console.log(`Rate limit hit for ${config.provider}, trying next provider...`);
          continue;
        }

        continue;
      }
    }

    throw new Error(
      `All AI providers failed. Errors: ${errors
        .map((e) => `${e.provider}: ${e.error}`)
        .join('; ')}`
    );
  }

  /**
   * Generate content with streaming
   */
  async generateStreaming(
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: GenerationOptions
  ): Promise<{ provider: AIProvider; model: string }> {
    const errors: { provider: AIProvider; error: string }[] = [];

    for (const config of this.modelConfigs) {
      const provider = this.providers.get(config.provider);
      if (!provider) continue;

      try {
        console.log(`Attempting streaming with ${config.provider}...`);

        if (config.provider === 'gemini') {
          await provider.generateContentStreaming(prompt, onChunk, {
            systemInstruction: options?.systemInstruction,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
          });
        } else if (config.provider === 'openai') {
          const messages = [];
          if (options?.systemInstruction) {
            messages.push({
              role: 'system',
              content: options.systemInstruction,
            });
          }
          messages.push({
            role: 'user',
            content: prompt,
          });

          await provider.createStreamingCompletion(messages, onChunk, {
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
          });
        } else {
          throw new Error(`Unsupported provider: ${config.provider}`);
        }

        console.log(`✓ Successfully streamed with ${config.provider}`);

        return {
          provider: config.provider,
          model: config.model || 'default',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`✗ ${config.provider} streaming failed:`, errorMessage);

        errors.push({
          provider: config.provider,
          error: errorMessage,
        });

        if (this.isRateLimitError(errorMessage)) {
          console.log(`Rate limit hit for ${config.provider}, trying next provider...`);
          continue;
        }

        continue;
      }
    }

    throw new Error(
      `All AI providers failed for streaming. Errors: ${errors
        .map((e) => `${e.provider}: ${e.error}`)
        .join('; ')}`
    );
  }

  /**
   * Check if error is related to rate limiting or quota
   */
  private isRateLimitError(errorMessage: string): boolean {
    const rateLimitKeywords = [
      'rate limit',
      'quota',
      'too many requests',
      'resource exhausted',
      '429',
      'exceeded',
    ];

    return rateLimitKeywords.some((keyword) =>
      errorMessage.toLowerCase().includes(keyword)
    );
  }

  /**
   * Get fallback history
   */
  getFallbackHistory(): typeof this.fallbackHistory {
    return [...this.fallbackHistory];
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check provider health
   */
  async checkProviderHealth(provider: AIProvider): Promise<boolean> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) return false;

    try {
      await providerInstance.validateApiKey();
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Create default multi-model service with standard configuration
 */
export function createDefaultMultiModelService(): MultiModelService {
  const configs: AIModelConfig[] = [
    {
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      priority: 1, // Try Gemini first (free tier)
    },
    {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      priority: 2, // Fallback to OpenAI if Gemini fails
    },
  ];

  return new MultiModelService(configs);
}

/**
 * Singleton instance
 */
let multiModelInstance: MultiModelService | null = null;

export function getMultiModelService(): MultiModelService {
  if (!multiModelInstance) {
    multiModelInstance = createDefaultMultiModelService();
  }
  return multiModelInstance;
}
