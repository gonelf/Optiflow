import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIGeneratorService } from '@/services/ai/generator.service';
import { getMultiModelService } from '@/services/ai/multi-model.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/status
 * Check AI service health and availability
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Gemini API key is configured
    const configured = {
      gemini: !!process.env.GEMINI_API_KEY,
    };

    // Get available models
    const multiModel = getMultiModelService();
    const models = multiModel.getAvailableModels();

    // Check service health
    const status = await AIGeneratorService.getServiceStatus();

    // Get fallback history
    const fallbackHistory = AIGeneratorService.getFallbackHistory();
    const recentFallbacks = fallbackHistory.slice(-10); // Last 10 fallbacks

    // Get model count
    const modelCount = multiModel.getProviderCount();

    return NextResponse.json({
      configured,
      models: models.map(m => ({
        name: m.name,
        model: m.model,
        provider: m.provider,
      })),
      status: {
        available: status.available,
        failed: status.failed,
        totalModels: modelCount,
      },
      recentFallbacks,
      recommendation: getRecommendation(configured, status, modelCount),
    });
  } catch (error) {
    console.error('AI status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check AI service status' },
      { status: 500 }
    );
  }
}

function getRecommendation(
  configured: { gemini: boolean },
  status: { available: string[]; failed: string[] },
  modelCount: number
): string {
  if (!configured.gemini) {
    return 'No AI service configured. Please add GEMINI_API_KEY to your environment variables. Get a free API key at https://makersuite.google.com/app/apikey';
  }

  if (modelCount === 0) {
    return 'Failed to initialize Gemini models. Please check your GEMINI_API_KEY is valid.';
  }

  if (status.available.length === 0) {
    return 'All Gemini models are currently unavailable. Please check your API key and network connection, or wait for rate limits to reset.';
  }

  if (status.available.length === 1) {
    return `Only 1 of ${modelCount} Gemini models is available. Other models may have rate limits or connectivity issues.`;
  }

  if (status.available.length < modelCount) {
    return `${status.available.length} of ${modelCount} Gemini models are available. Some models may have rate limits.`;
  }

  return `All ${modelCount} Gemini models are healthy! The system will automatically fallback between models if needed.`;
}
