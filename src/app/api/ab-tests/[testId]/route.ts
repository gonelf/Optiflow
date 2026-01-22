import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { testMultipleVariants } from '@/lib/statistics/significance';

/**
 * GET /api/ab-tests/[testId]
 * Get a specific A/B test with statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = params;

    // Get test with variants
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            workspace: {
              include: {
                members: {
                  where: {
                    user: { email: session.user.email },
                  },
                },
              },
            },
          },
        },
        variants: true,
      },
    });

    if (!test || test.page.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Calculate statistics
    const controlVariant = test.variants.find((v) => v.isControl);
    const testVariants = test.variants.filter((v) => !v.isControl);

    let statistics = null;

    if (controlVariant && testVariants.length > 0) {
      const result = testMultipleVariants(
        {
          id: controlVariant.id,
          conversions: controlVariant.conversions,
          impressions: controlVariant.impressions,
        },
        testVariants.map((v) => ({
          id: v.id,
          conversions: v.conversions,
          impressions: v.impressions,
        })),
        {
          confidenceLevel: test.confidenceLevel,
          minimumSampleSize: test.minimumSampleSize,
        }
      );

      // Check if any variant has reached minimum sample size
      const sampleSizeReached = test.variants.some(
        (v) => v.impressions >= test.minimumSampleSize
      );

      statistics = {
        hasSignificance: result.hasSignificance,
        pValue:
          result.comparisons.length > 0
            ? Math.min(...result.comparisons.map((c) => c.vsControl.pValue))
            : 1,
        confidenceInterval:
          result.comparisons.length > 0
            ? result.comparisons[0].vsControl.confidenceInterval
            : [0, 0],
        recommendedWinner: result.winningVariantId,
        sampleSizeReached,
      };
    }

    const response = {
      id: test.id,
      name: test.name,
      description: test.description,
      status: test.status,
      pageId: test.pageId,
      pageName: test.page.title,
      primaryGoal: test.primaryGoal,
      conversionEvent: test.conversionEvent,
      trafficSplit: test.trafficSplit,
      startDate: test.startDate,
      endDate: test.endDate,
      minimumSampleSize: test.minimumSampleSize,
      confidenceLevel: test.confidenceLevel,
      winningVariantId: test.winningVariantId,
      declaredAt: test.declaredAt,
      variants: test.variants,
      statistics,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B test' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ab-tests/[testId]
 * Update test status or configuration
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = params;
    const body = await request.json();
    const { status, trafficSplit } = body;

    // Verify test exists and user has access
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: {
        page: {
          select: {
            workspace: {
              include: {
                members: {
                  where: {
                    user: { email: session.user.email },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!test || test.page.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;

      // Set start date when transitioning to RUNNING
      if (status === 'RUNNING' && !test.startDate) {
        updateData.startDate = new Date();
      }

      // Set end date when transitioning to COMPLETED
      if (status === 'COMPLETED' && !test.endDate) {
        updateData.endDate = new Date();
      }
    }

    if (trafficSplit) {
      updateData.trafficSplit = trafficSplit;
    }

    // Update test
    const updatedTest = await prisma.aBTest.update({
      where: { id: testId },
      data: updateData,
    });

    return NextResponse.json({ test: updatedTest });
  } catch (error) {
    console.error('Failed to update A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to update A/B test' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ab-tests/[testId]
 * Delete an A/B test
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = params;

    // Verify test exists and user has access
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: {
        page: {
          select: {
            workspace: {
              include: {
                members: {
                  where: {
                    user: { email: session.user.email },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!test || test.page.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Delete test (cascade will handle variants)
    await prisma.aBTest.delete({
      where: { id: testId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to delete A/B test' },
      { status: 500 }
    );
  }
}
