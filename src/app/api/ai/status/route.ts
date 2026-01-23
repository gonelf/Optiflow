import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIGeneratorService } from '@/services/ai/generator.service';

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

    // Check which AI services are configured
    const configured = {
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    };

    // Check service health
    const status = await AIGeneratorService.getServiceStatus();

    // Get fallback history
    const fallbackHistory = AIGeneratorService.getFallbackHistory();
    const recentFallbacks = fallbackHistory.slice(-10); // Last 10 fallbacks

    return NextResponse.json({
      configured,
      status: {
        available: status.available,
        failed: status.failed,
      },
      recentFallbacks,
      recommendation: getRecommendation(configured, status),
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
  configured: { gemini: boolean; openai: boolean },
  status: { available: string[]; failed: string[] }
): string {
  if (!configured.gemini && !configured.openai) {
    return 'No AI services configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to your environment variables.';
  }

  if (configured.gemini && !configured.openai) {
    return 'Only Gemini is configured. Consider adding OpenAI as a fallback.';
  }

  if (!configured.gemini && configured.openai) {
    return 'Only OpenAI is configured. Consider adding Gemini for free tier usage.';
  }

  if (status.available.length === 0) {
    return 'All AI services are currently unavailable. Please check your API keys and network connection.';
  }

  if (status.available.length === 1) {
    return `Only ${status.available[0]} is available. The other service may have rate limits or connectivity issues.`;
  }

  return 'All configured AI services are healthy!';
}
