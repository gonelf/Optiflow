import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getExamplesSearchService } from '@/services/ai/examples-search.service';

/**
 * GET /api/ai/examples
 * Get available real-world examples and design styles for AI page generation
 *
 * Query params:
 * - pageType: Optional specific page type to get examples for
 *
 * Returns curated examples from high-converting websites like Stripe, Linear, Notion, etc.
 * This enables the "Advanced Approach" where AI generation is enhanced with real-world inspirations.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageType = searchParams.get('pageType') as any;

    const examplesService = getExamplesSearchService();

    // Get available page types and design styles
    const pageTypes = examplesService.getAvailablePageTypes();
    const designStyles = examplesService.getAvailableDesignStyles();

    // Get examples for specific page type if provided, otherwise return all
    let examples;
    if (pageType && pageTypes.includes(pageType)) {
      examples = {
        [pageType]: examplesService.getExamplesForPageType(pageType),
      };
    } else {
      // Return summary for all page types
      examples = pageTypes.reduce((acc, type) => {
        const pageExamples = examplesService.getExamplesForPageType(type);
        acc[type] = {
          exampleCount: pageExamples.examples.length,
          sampleExamples: pageExamples.examples.slice(0, 2).map(e => ({
            name: e.name,
            description: e.description,
          })),
          sectionOrder: pageExamples.sectionOrder,
        };
        return acc;
      }, {} as Record<string, any>);
    }

    return NextResponse.json({
      success: true,
      data: {
        pageTypes,
        designStyles,
        examples,
        // Info about external search capability
        externalSearchAvailable: !!(process.env.SERP_API_KEY || process.env.GOOGLE_SEARCH_API_KEY),
      },
    });
  } catch (error) {
    console.error('Failed to fetch AI examples:', error);
    return NextResponse.json(
      { error: 'Failed to fetch examples' },
      { status: 500 }
    );
  }
}
