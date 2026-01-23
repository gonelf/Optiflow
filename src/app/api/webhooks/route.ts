import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WebhookService } from '@/services/integrations/webhook.service';
import { z } from 'zod';

const createWebhookSchema = z.object({
  workspaceId: z.string(),
  url: z.string().url(),
  events: z.array(z.string()),
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

    const webhook = await WebhookService.createWebhook(validatedData);

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
