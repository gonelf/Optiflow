import { NextRequest, NextResponse } from 'next/server';
import { getStripeService } from '@/services/integrations/stripe.service';
import Stripe from 'stripe';

/**
 * POST /api/integrations/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const body = await req.text();
    const stripeService = getStripeService();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripeService.verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await stripeService.handlePaymentSuccess(event);
        break;

      case 'payment_intent.succeeded':
        console.log('PaymentIntent succeeded:', event.data.object);
        // Additional handling for direct payment intents if needed
        break;

      case 'payment_intent.payment_failed':
        console.log('PaymentIntent failed:', event.data.object);
        // Handle failed payment
        break;

      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object);
        // Handle new subscription
        break;

      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object);
        // Handle subscription update
        break;

      case 'customer.subscription.deleted':
        console.log('Subscription cancelled:', event.data.object);
        // Handle subscription cancellation
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
