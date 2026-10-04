import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { PLAN_CREDITS } from '@/lib/stripe/plans';
import { PlanType } from '@/types';

// Disable Next.js body parser so we get raw body for Stripe signature check
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!isStripeConfigured || !webhookSecret) {
    return NextResponse.json(
      { received: true, note: 'Stripe webhook receiver active (test mode / no secret configured)' },
      { status: 200 }
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe client unavailable' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: any;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Supabase service-role client for secure server-side updates
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = (session.metadata?.plan as PlanType) || 'pro';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const newCredits = PLAN_CREDITS[plan] || 10;

        if (supabase && userId) {
          // Update profile plan, credits, and customer IDs
          await supabase
            .from('profiles')
            .update({
              plan,
              credits: newCredits,
              subscription_status: 'active',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          // Log transaction
          await supabase.from('credit_transactions').insert([
            {
              user_id: userId,
              amount: newCredits,
              transaction_type: 'plan_upgrade',
              description: `Upgraded to ${plan.toUpperCase()} via Stripe Checkout (${newCredits} credits)`,
            },
          ]);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;

        // Reset monthly credits on successful recurring renewal
        if (supabase && (subscriptionId || customerId)) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, plan')
            .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
            .single();

          if (profile) {
            const planCredits = PLAN_CREDITS[profile.plan as PlanType] || 5;
            await supabase
              .from('profiles')
              .update({
                credits: planCredits,
                subscription_status: 'active',
                credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', profile.id);

            await supabase.from('credit_transactions').insert([
              {
                user_id: profile.id,
                amount: planCredits,
                transaction_type: 'subscription_renewal',
                description: `Monthly subscription renewal: reset to ${planCredits} credits`,
              },
            ]);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        if (supabase && customerId) {
          // Downgrade user back to free plan
          await supabase
            .from('profiles')
            .update({
              plan: 'free',
              credits: 5,
              subscription_status: 'cancelled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.status; // 'active', 'past_due', etc.
        const customerId = subscription.customer as string;

        if (supabase && customerId) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: status === 'active' ? 'active' : 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (dbError: any) {
    console.error('Error handling Stripe webhook event:', dbError);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}
