/**
 * Multi-Model AI Service
 * Implements automatic fallback between different Gemini models
 * Models are configured via GEMINI_MODELS environment variable
 * Default: gemini-2.5-flash,gemini-flash-latest
 */

import { GeminiService } from './gemini.service';

export type AIProvider = 'gemini';

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  priority: number; // Lower = higher priority
  name?: string; // Friendly name for logging
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  images?: string[];
}

export interface GenerationResult {
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
}

interface ProviderInstance {
  config: AIModelConfig;
  service: GeminiService;
}

export class MultiModelService {
  private providers: ProviderInstance[] = [];
  private fallbackHistory: {
    provider: AIProvider;
    model: string;
    timestamp: Date;
    error: string
  }[] = [];

  constructor(configs: AIModelConfig[]) {
    // Sort by priority
    const sortedConfigs = configs.sort((a, b) => a.priority - b.priority);

    // Initialize all providers
    this.initializeProviders(sortedConfigs);
  }

  private initializeProviders(configs: AIModelConfig[]): void {
    for (const config of configs) {
      try {
        if (config.provider === 'gemini') {
          const apiKey = config.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
          if (apiKey) {
            const service = new GeminiService({
              apiKey: apiKey,
              model: config.model,
            });

            this.providers.push({
              config,
              service,
            });

            console.log(`✓ Initialized ${config.name || config.model} (Priority ${config.priority})`);
          } else {
            console.warn(`✗ No API key for ${config.model}`);
          }
        }
      } catch (error) {
        console.warn(`✗ Failed to initialize ${config.model}:`, error);
      }
    }

    if (this.providers.length === 0) {
      console.warn('⚠ No AI providers initialized. Please set GEMINI_API_KEY environment variable.');
    }
  }

  /**
   * Generate content with automatic fallback
   */
  async generateContent(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GenerationResult> {
    const errors: { model: string; error: string }[] = [];

    for (const { config, service } of this.providers) {
      try {
        const modelName = config.name || config.model;
        console.log(`→ Attempting generation with ${modelName}...`);

        const content = await service.generateContent(prompt, {
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
        });

        console.log(`✓ Successfully generated with ${modelName}`);

        return {
          content,
          provider: config.provider,
          model: config.model,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const modelName = config.name || config.model;
        console.warn(`✗ ${modelName} failed:`, errorMessage);

        errors.push({
          model: config.model,
          error: errorMessage,
        });

        // Track fallback in history
        this.fallbackHistory.push({
          provider: config.provider,
          model: config.model,
          timestamp: new Date(),
          error: errorMessage,
        });

        // Check if it's a rate limit or quota error
        if (this.isRateLimitError(errorMessage)) {
          console.log(`⚠ Rate limit hit for ${modelName}, trying next model...`);
          continue;
        }

        // For other errors, continue to next provider
        continue;
      }
    }

    // All providers failed
    throw new Error(
      `All AI models failed. Tried ${errors.length} models. Errors: ${errors
        .map((e) => `${e.model}: ${e.error}`)
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
    const errors: { model: string; error: string }[] = [];

    for (const { config, service } of this.providers) {
      try {
        const modelName = config.name || config.model;
        console.log(`→ Attempting generation with ${modelName}...`);

        // Extract system instruction if present
        const systemMsg = messages.find((m) => m.role === 'system');
        const chatMessages = messages.filter((m) => m.role !== 'system') as { role: 'user' | 'assistant'; content: string }[];

        const content = await service.generateContentWithHistory(
          chatMessages,
          {
            systemInstruction: systemMsg?.content || options?.systemInstruction,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
          }
        );

        console.log(`✓ Successfully generated with ${modelName}`);

        return {
          content,
          provider: config.provider,
          model: config.model,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const modelName = config.name || config.model;
        console.warn(`✗ ${modelName} failed:`, errorMessage);

        errors.push({
          model: config.model,
          error: errorMessage,
        });

        this.fallbackHistory.push({
          provider: config.provider,
          model: config.model,
          timestamp: new Date(),
          error: errorMessage,
        });

        if (this.isRateLimitError(errorMessage)) {
          console.log(`⚠ Rate limit hit for ${modelName}, trying next model...`);
          continue;
        }

        continue;
      }
    }

    throw new Error(
      `All AI models failed. Tried ${errors.length} models. Errors: ${errors
        .map((e) => `${e.model}: ${e.error}`)
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
    const errors: { model: string; error: string }[] = [];

    for (const { config, service } of this.providers) {
      try {
        const modelName = config.name || config.model;
        console.log(`→ Attempting streaming with ${modelName}...`);

        await service.generateContentStreaming(prompt, onChunk, {
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
        });

        console.log(`✓ Successfully streamed with ${modelName}`);

        return {
          provider: config.provider,
          model: config.model,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const modelName = config.name || config.model;
        console.warn(`✗ ${modelName} streaming failed:`, errorMessage);

        errors.push({
          model: config.model,
          error: errorMessage,
        });

        if (this.isRateLimitError(errorMessage)) {
          console.log(`⚠ Rate limit hit for ${modelName}, trying next model...`);
          continue;
        }

        continue;
      }
    }

    throw new Error(
      `All AI models failed for streaming. Tried ${errors.length} models. Errors: ${errors
        .map((e) => `${e.model}: ${e.error}`)
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
   * Get available models
   */
  getAvailableModels(): { provider: AIProvider; model: string; name?: string }[] {
    return this.providers.map(p => ({
      provider: p.config.provider,
      model: p.config.model,
      name: p.config.name,
    }));
  }

  /**
   * Check provider health
   */
  async checkModelHealth(model: string): Promise<boolean> {
    const provider = this.providers.find(p => p.config.model === model);
    if (!provider) return false;

    try {
      await provider.service.validateApiKey();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get provider count
   */
  getProviderCount(): number {
    return this.providers.length;
  }
}

/**
 * Create default multi-model service with Gemini fallback chain
 * Models are configured via GEMINI_MODELS environment variable
 * Format: comma-separated list of model names in priority order
 * Example: GEMINI_MODELS="gemini-2.5-flash,gemini-flash-latest"
 */
export function createDefaultMultiModelService(): MultiModelService {
  // Read models from environment variable or use defaults
  const modelsEnv = process.env.GEMINI_MODELS || 'gemini-2.5-flash,gemini-flash-latest';
  const modelNames = modelsEnv.split(',').map(m => m.trim()).filter(m => m.length > 0);

  // Create configs from model names
  const configs: AIModelConfig[] = modelNames.map((model, index) => ({
    provider: 'gemini',
    model,
    name: formatModelName(model),
    priority: index + 1,
  }));

  // Fallback to defaults if no valid models configured
  if (configs.length === 0) {
    console.warn('⚠ No valid models in GEMINI_MODELS, using defaults');
    configs.push(
      {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        priority: 1,
      },
      {
        provider: 'gemini',
        model: 'gemini-flash-latest',
        name: 'Gemini Flash (Latest)',
        priority: 2,
      }
    );
  }

  console.log(`🤖 Configured AI models: ${configs.map(c => c.model).join(', ')}`);

  return new MultiModelService(configs);
}

/**
 * Format model name for display
 */
function formatModelName(model: string): string {
  // Convert model name to friendly display name
  // e.g., "gemini-2.5-flash" -> "Gemini 2.5 Flash"
  return model
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
