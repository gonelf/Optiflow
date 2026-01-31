/**
 * Google Gemini Service
 * Handles integration with Google Gemini API
 * Gemini Flash has higher free tier limits than OpenAI
 */

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiService {
  private apiKey: string;
  private model: string;
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
    this.model = config.model || 'gemini-1.5-flash';

    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }
  }

  /**
   * Generate content using Gemini
   */
  async generateContent(
    prompt: string,
    options?: {
      systemInstruction?: string;
      temperature?: number;
      maxTokens?: number;
      images?: string[]; // Array of base64 strings
    }
  ): Promise<string> {
    const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const parts: any[] = [{ text: prompt }];

    if (options?.images) {
      options.images.forEach(image => {
        // Assume image is base64 string without data prefix, or handle if it has it
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg', // Defaulting to jpeg, ideally detecting from base64 header if present
            data: base64Data
          }
        });
      });
    }

    const requestBody: any = {
      contents: [
        {
          parts: parts,
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    };

    // Add system instruction if provided
    if (options?.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Gemini API error: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini (empty candidates)');
    }

    const firstCandidate = data.candidates[0];
    if (!firstCandidate.content || !firstCandidate.content.parts || firstCandidate.content.parts.length === 0) {
      const finishReason = firstCandidate.finishReason || 'Unknown';
      throw new Error(`Gemini response missing content. Finish reason: ${finishReason}. Request might have been blocked or failed.`);
    }

    return firstCandidate.content.parts[0].text;
  }

  /**
   * Generate content with chat history
   */
  async generateContentWithHistory(
    messages: { role: 'user' | 'assistant'; content: string }[],
    options?: {
      systemInstruction?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`;

    // Convert messages to Gemini format
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const requestBody: any = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    };

    if (options?.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Gemini API error: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini (empty candidates)');
    }

    const firstCandidate = data.candidates[0];
    if (!firstCandidate.content || !firstCandidate.content.parts || firstCandidate.content.parts.length === 0) {
      const finishReason = firstCandidate.finishReason || 'Unknown';
      throw new Error(`Gemini response missing content. Finish reason: ${finishReason}. Request might have been blocked or failed.`);
    }

    return firstCandidate.content.parts[0].text;
  }

  /**
   * Generate content with streaming
   */
  async generateContentStreaming(
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: {
      systemInstruction?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<void> {
    const url = `${this.baseURL}/models/${this.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;

    const requestBody: any = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    };

    if (options?.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Gemini API error: ${error.error?.message || 'Unknown error'}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '' || !line.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(line.slice(6));
          const firstCandidate = data.candidates?.[0];
          const text = firstCandidate?.content?.parts?.[0]?.text;
          if (text) {
            onChunk(text);
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      }
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.generateContent('Hello', { maxTokens: 5 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    const url = `${this.baseURL}/models?key=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return data.models
      .filter((model: any) => model.name.includes('gemini'))
      .map((model: any) => model.name.replace('models/', ''));
  }
}

/**
 * Create a singleton instance
 */
let geminiInstance: GeminiService | null = null;

export function getGeminiService(): GeminiService {
  if (!geminiInstance) {
    geminiInstance = new GeminiService({
      apiKey: process.env.GEMINI_API_KEY || '',
    });
  }
  return geminiInstance;
}
