import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
  console.warn('Stripe secret key not found. Payment functionality will not work.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover' as any,
}) : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    const { amount, serviceId, serviceName, email, name } = await req.json();

    if (!amount || !serviceId) {
      return NextResponse.json(
        { error: 'Amount and service ID are required' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName || 'O-1A Readiness Assessment',
              description: 'A personalized, attorney-reviewed roadmap to your O-1A eligibility',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin') || 'http://localhost:3002'}/payment-success?session_id={CHECKOUT_SESSION_ID}&service=${serviceId}`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:3002'}/o1a-webinar?canceled=true`,
      customer_email: email || undefined,
      metadata: {
        serviceId,
        serviceName: serviceName || 'O-1A Readiness Assessment',
        source: 'o1a-webinar',
        customerName: name || '',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
