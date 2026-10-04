import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe';
import { PRICING_PLANS } from '@/lib/stripe/plans';
import { PlanType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, userId, userEmail } = body as { plan: PlanType; userId: string; userEmail: string };

    if (!plan || !PRICING_PLANS[plan] || plan === 'free') {
      return NextResponse.json({ error: 'Invalid subscription plan selected' }, { status: 400 });
    }

    const selectedPlan = PRICING_PLANS[plan];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.nextUrl.origin;

    // If Stripe is configured with live/test secret key, create real Stripe Checkout session
    if (isStripeConfigured) {
      const stripe = getStripeClient();
      if (!stripe) {
        throw new Error('Stripe client initialization failed');
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Cirolink ${selectedPlan.name} Subscription`,
                description: `${selectedPlan.credits} text analyses per month on Cirolink.com`,
              },
              unit_amount: selectedPlan.price * 100, // In cents ($2 = 200, $4 = 400)
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer_email: userEmail,
        client_reference_id: userId,
        metadata: {
          userId,
          plan,
          credits: selectedPlan.credits.toString(),
        },
        success_url: `${baseUrl}/dashboard/billing?status=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/dashboard/billing?status=cancelled`,
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    // In preview / demo mode (before user adds live Stripe keys):
    // Return direct success redirect with simulated upgraded plan
    return NextResponse.json({
      url: `${baseUrl}/dashboard/billing?status=success&plan=${plan}&simulated=true`,
      simulated: true,
      message: 'Demo Stripe checkout simulated successfully. In production, configure STRIPE_SECRET_KEY in .env.local',
    });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Stripe Checkout session' },
      { status: 500 }
    );
  }
}
