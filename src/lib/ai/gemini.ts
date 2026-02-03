import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_MODEL = 'gemini-2.0-flash';

function getModels(): string[] {
  const configured = process.env.GEMINI_MODELS;
  if (configured) {
    return configured.split(',').map((m) => m.trim()).filter(Boolean);
  }
  return [FALLBACK_MODEL];
}

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Calls Gemini with the given prompt, trying each configured model in order.
 * Returns the text response on the first successful call.
 */
export async function geminiGenerate(prompt: string): Promise<string> {
  const client = getClient();
  const models = getModels();
  let lastError: Error | undefined;

  for (const modelName of models) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  throw lastError ?? new Error('All Gemini models failed');
}
