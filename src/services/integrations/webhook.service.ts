/**
 * Webhook Service
 * Handles custom webhook creation, triggering, and retry logic
 */

import { prisma } from '@/lib/prisma';

export type WebhookEvent =
  | 'page.published'
  | 'page.unpublished'
  | 'conversion.created'
  | 'ab_test.started'
  | 'ab_test.completed'
  | 'ab_test.winner_declared'
  | 'form.submitted'
  | 'payment.succeeded'
  | 'payment.failed';

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  active: boolean;
  workspaceId: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  lastAttemptAt?: Date;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
}

export class WebhookService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 5000, 15000]; // ms

  /**
   * Create a new webhook
   */
  static async createWebhook(params: {
    workspaceId: string;
    url: string;
    events: WebhookEvent[];
    secret?: string;
  }): Promise<Webhook> {
    // Validate URL
    try {
      new URL(params.url);
    } catch (error) {
      throw new Error('Invalid webhook URL');
    }

    const webhook = await prisma.webhook.create({
      data: {
        workspaceId: params.workspaceId,
        url: params.url,
        events: params.events,
        secret: params.secret,
        active: true,
      },
    });

    return webhook as any;
  }

  /**
   * Get all webhooks for a workspace
   */
  static async listWebhooks(workspaceId: string): Promise<Webhook[]> {
    const webhooks = await prisma.webhook.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return webhooks as any[];
  }

  /**
   * Update a webhook
   */
  static async updateWebhook(
    webhookId: string,
    params: {
      url?: string;
      events?: WebhookEvent[];
      active?: boolean;
    }
  ): Promise<Webhook> {
    const webhook = await prisma.webhook.update({
      where: { id: webhookId },
      data: params,
    });

    return webhook as any;
  }

  /**
   * Delete a webhook
   */
  static async deleteWebhook(webhookId: string): Promise<void> {
    await prisma.webhook.delete({
      where: { id: webhookId },
    });
  }

  /**
   * Trigger webhooks for an event
   */
  static async triggerEvent(
    workspaceId: string,
    event: WebhookEvent,
    payload: any
  ): Promise<void> {
    // Find all active webhooks listening for this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        workspaceId,
        active: true,
        events: {
          has: event,
        },
      },
    });

    // Trigger each webhook
    const deliveryPromises = webhooks.map((webhook: any) =>
      this.deliverWebhook(webhook, event, payload)
    );

    await Promise.allSettled(deliveryPromises);
  }

  /**
   * Deliver a webhook with retry logic
   */
  private static async deliverWebhook(
    webhook: any,
    event: WebhookEvent,
    payload: any
  ): Promise<void> {
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        payload,
        status: 'pending',
        attempts: 0,
      },
    });

    await this.attemptDelivery(webhook, delivery as any, payload);
  }

  /**
   * Attempt to deliver a webhook
   */
  private static async attemptDelivery(
    webhook: any,
    delivery: any,
    payload: any
  ): Promise<void> {
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'OptiFlow-Webhook/1.0',
          'X-OptiFlow-Event': delivery.event,
          'X-OptiFlow-Delivery': delivery.id,
        };

        // Add signature if secret is set
        if (webhook.secret) {
          const signature = await this.generateSignature(
            JSON.stringify(payload),
            webhook.secret
          );
          headers['X-OptiFlow-Signature'] = signature;
        }

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            event: delivery.event,
            timestamp: new Date().toISOString(),
            data: payload,
          }),
        });

        const responseBody = await response.text();

        // Update delivery status
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: response.ok ? 'success' : 'failed',
            attempts: attempt + 1,
            lastAttemptAt: new Date(),
            responseStatus: response.status,
            responseBody: responseBody.substring(0, 1000), // Limit size
          },
        });

        if (response.ok) {
          return; // Success!
        }

        // If not successful and not last attempt, wait before retry
        if (attempt < this.MAX_RETRIES - 1) {
          await this.sleep(this.RETRY_DELAYS[attempt]);
        }
      } catch (error) {
        // Update delivery with error
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'failed',
            attempts: attempt + 1,
            lastAttemptAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        // If not last attempt, wait before retry
        if (attempt < this.MAX_RETRIES - 1) {
          await this.sleep(this.RETRY_DELAYS[attempt]);
        }
      }
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private static async generateSignature(
    payload: string,
    secret: string
  ): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, data);
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Get webhook deliveries
   */
  static async getDeliveries(
    webhookId: string,
    limit: number = 50
  ): Promise<WebhookDelivery[]> {
    const deliveries = await prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return deliveries as any[];
  }

  /**
   * Retry a failed delivery
   */
  static async retryDelivery(deliveryId: string): Promise<void> {
    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true },
    });

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    await this.attemptDelivery(
      delivery.webhook,
      delivery,
      delivery.payload
    );
  }

  /**
   * Helper function to sleep
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
