import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WebhookService, type WebhookEvent } from '@/services/integrations/webhook.service';
import { z } from 'zod';

const webhookEventSchema = z.enum([
  'page.published',
  'page.unpublished',
  'conversion.created',
  'ab_test.started',
  'ab_test.completed',
  'ab_test.winner_declared',
  'form.submitted',
  'payment.succeeded',
  'payment.failed',
]);

const createWebhookSchema = z.object({
  workspaceId: z.string(),
  url: z.string().url(),
  events: z.array(webhookEventSchema),
  secret: z.string().optional(),
});

/**
 * GET /api/webhooks
 * List all webhooks for a workspace
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    const webhooks = await WebhookService.listWebhooks(workspaceId);

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('List webhooks error:', error);
    return NextResponse.json(
      { error: 'Failed to list webhooks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks
 * Create a new webhook
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createWebhookSchema.parse(body);

    const webhook = await WebhookService.createWebhook({
      workspaceId: validatedData.workspaceId,
      url: validatedData.url,
      events: validatedData.events as WebhookEvent[],
      secret: validatedData.secret,
    });

    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error) {
    console.error('Create webhook error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}
