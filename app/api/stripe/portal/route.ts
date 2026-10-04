import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId } = body as { customerId?: string };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.nextUrl.origin;

    if (isStripeConfigured && customerId) {
      const stripe = getStripeClient();
      if (!stripe) {
        throw new Error('Stripe client initialization failed');
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/dashboard/billing`,
      });

      return NextResponse.json({ url: portalSession.url });
    }

    // In demo/test mode:
    return NextResponse.json({
      url: `${baseUrl}/dashboard/billing?portal_notice=simulated`,
      simulated: true,
      message: 'Stripe Customer Portal requires a live Stripe customer ID and STRIPE_SECRET_KEY in production.',
    });
  } catch (error: any) {
    console.error('Stripe Portal Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to open customer billing portal' },
      { status: 500 }
    );
  }
}
