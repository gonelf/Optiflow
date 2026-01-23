import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ab-tests/[testId]/declare-winner
 * Declare a winning variant and complete the test
 */
export async function POST(
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
    const { winningVariantId } = body;

    if (!winningVariantId) {
      return NextResponse.json(
        { error: 'Winning variant ID is required' },
        { status: 400 }
      );
    }

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
        variants: true,
      },
    });

    if (!test || test.page.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Verify winning variant exists
    const winningVariant = test.variants.find((v: any) => v.id === winningVariantId);
    if (!winningVariant) {
      return NextResponse.json(
        { error: 'Winning variant not found' },
        { status: 404 }
      );
    }

    // Update test
    const updatedTest = await prisma.aBTest.update({
      where: { id: testId },
      data: {
        winningVariantId,
        declaredAt: new Date(),
        status: 'COMPLETED',
        endDate: test.endDate || new Date(),
      },
    });

    return NextResponse.json({ test: updatedTest });
  } catch (error) {
    console.error('Failed to declare winner:', error);
    return NextResponse.json(
      { error: 'Failed to declare winner' },
      { status: 500 }
    );
  }
}
