/**
 * Stripe Integration Service
 * Handles Stripe payment processing, webhooks, and revenue tracking
 */

import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export interface StripeConfig {
  apiKey: string;
  webhookSecret?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  private stripe: Stripe;
  private webhookSecret?: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2025-02-24.acacia',
    });
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Create a payment link for a product/service
   * Note: Uses checkout sessions as payment links require pre-created prices in newer API versions
   */
  async createPaymentLink(params: {
    amount: number; // in cents
    currency: string;
    description: string;
    metadata?: Record<string, string>;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: params.currency,
            product_data: {
              name: params.description,
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      metadata: params.metadata,
      success_url: params.successUrl || 'https://example.com/success',
      cancel_url: params.cancelUrl || 'https://example.com/cancel',
    });

    return session.url || '';
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(params: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCustomer> {
    const customer = await this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    });

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      metadata: customer.metadata,
    };
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    description: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }): Promise<{ sessionId: string; url: string }> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: params.currency,
            product_data: {
              name: params.description,
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: params.metadata,
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }

  /**
   * Verify webhook signature and construct event
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    if (!this.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );
  }

  /**
   * Handle payment success webhook
   */
  async handlePaymentSuccess(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;

    // Get payment details
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );

    // Track conversion in analytics
    if (session.metadata?.workspaceId && session.metadata?.pageId) {
      await this.trackPaymentConversion({
        workspaceId: session.metadata.workspaceId,
        pageId: session.metadata.pageId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId: session.customer as string,
        sessionId: session.id,
      });
    }
  }

  /**
   * Track payment as conversion in analytics
   */
  private async trackPaymentConversion(params: {
    workspaceId: string;
    pageId: string;
    amount: number;
    currency: string;
    customerId: string;
    sessionId: string;
  }): Promise<void> {
    try {
      // Create or find analytics session
      const analyticsSession = await prisma.analyticsSession.findFirst({
        where: {
          workspaceId: params.workspaceId,
          pageId: params.pageId,
          // Find recent session (within last hour)
          startedAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000),
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
      });

      if (analyticsSession) {
        // Create conversion event
        await prisma.analyticsEvent.create({
          data: {
            sessionId: analyticsSession.id,
            eventType: 'CONVERSION',
            isConversion: true,
            conversionValue: params.amount / 100, // Convert cents to dollars
            metadata: {
              stripeCustomerId: params.customerId,
              stripeSessionId: params.sessionId,
              currency: params.currency,
            },
            timestamp: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Failed to track payment conversion:', error);
    }
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(workspaceId: string, startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    currency: string;
  }> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    // Get all conversion events with values
    const conversions = await prisma.analyticsEvent.findMany({
      where: {
        session: {
          workspaceId,
          startedAt: {
            gte: defaultStartDate,
            lte: defaultEndDate,
          },
        },
        isConversion: true,
        conversionValue: {
          not: null,
        },
      },
      select: {
        conversionValue: true,
      },
    });

    const totalRevenue = conversions.reduce(
      (sum: number, event: any) => sum + (event.conversionValue || 0),
      0
    );
    const totalTransactions = conversions.length;
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalTransactions,
      averageOrderValue,
      currency: 'USD', // TODO: Make this configurable
    };
  }

  /**
   * List recent payments
   */
  async listRecentPayments(limit: number = 10): Promise<PaymentIntent[]> {
    const paymentIntents = await this.stripe.paymentIntents.list({
      limit,
    });

    return paymentIntents.data.map((pi) => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      customerId: pi.customer as string | undefined,
      metadata: pi.metadata,
    }));
  }

  /**
   * Create a subscription
   */
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata,
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.cancel(subscriptionId);
  }
}

/**
 * Get Stripe service instance
 */
export function getStripeService(): StripeService {
  return new StripeService({
    apiKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  });
}
