'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/supabase/provider';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { PricingCardsSection } from '@/components/pricing/PricingCardsSection';
import { PricingResetTimeline } from '@/components/pricing/PricingResetTimeline';
import {
  CreditCard,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  AlertTriangle,
  ArrowDown
} from 'lucide-react';

export default function BillingPage() {
  const { user } = useAuth();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [portalNotice, setPortalNotice] = useState<string | null>(null);

  const isPaidUser = user?.plan === 'pro' || user?.plan === 'pro_plus';
  const isOutOfCredits = (user?.credits ?? 0) <= 0;

  const handleOpenStripePortal = async () => {
    setIsOpeningPortal(true);
    setPortalNotice(null);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user?.stripe_customer_id,
        }),
      });

      const data = await res.json();
      if (data.url) {
        if (data.simulated) {
          setPortalNotice(
            'Stripe Customer Portal simulated. In production, configure STRIPE_SECRET_KEY to redirect directly to Stripe.'
          );
        } else {
          window.location.assign(data.url);
        }
      } else {
        throw new Error(data.error || 'Failed to open portal');
      }
    } catch {
      setPortalNotice('Stripe portal is available in live production with STRIPE_SECRET_KEY.');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  return (
    <div className="flex-1">
      <DashboardHeader
        title="Billing & Subscription"
        subtitle="Manage your active plan, Stripe checkout, payment methods, and invoices."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Out of Credits Alert with Downgrade Warning for this email */}
        {isOutOfCredits && user && (
          <div className="rounded-3xl border border-[#DC2626]/20 bg-[#FEF2F2] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#DC2626] text-white">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#991B1B]">
                    Credit Limit Exhausted for {user.email}
                  </h3>
                  <p className="mt-1 text-xs text-[#B91C1C] leading-relaxed">
                    Your account has used all available credits for the {user.plan.toUpperCase()} plan (0 credits remaining).
                    <strong className="block mt-1">
                      Important: Downgrading to a lower plan will NOT reset or restore your credits. Your account limit will remain expired until you upgrade to a higher tier plan below.
                    </strong>
                  </p>
                </div>
              </div>

              <a
                href="#plans-section"
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#B91C1C] transition-all"
              >
                <span>Upgrade Plan Now</span>
                <ArrowDown className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="rounded-3xl border border-[#E8DCCB] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8DCCB] pb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Active Subscription
              </span>
              <div className="mt-1 flex items-center gap-3">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#1C1917]">
                  {user?.plan === 'pro_plus'
                    ? 'Pro Plus Plan'
                    : user?.plan === 'pro'
                    ? 'Pro Plan'
                    : 'Free Plan'}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    user?.subscription_status === 'active'
                      ? 'bg-[#DCFCE7] text-[#166534]'
                      : user?.subscription_status === 'cancelled'
                      ? 'bg-[#FEF2F2] text-[#991B1B]'
                      : 'bg-[#FEF3C7] text-[#92400E]'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="capitalize">{user?.subscription_status || 'Active'}</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-[#78716C]">
                Account Email: <strong className="text-[#1C1917]">{user?.email}</strong> ·{' '}
                {user?.plan === 'pro_plus'
                  ? '$4.00 billed monthly · 15 credits quota'
                  : user?.plan === 'pro'
                  ? '$2.00 billed monthly · 10 credits quota'
                  : '$0.00 / month · 5 free analyses quota'}
              </p>
            </div>

            {/* Manage Subscription Button */}
            {isPaidUser && (
              <button
                onClick={handleOpenStripePortal}
                disabled={isOpeningPortal}
                className="inline-flex items-center gap-2 rounded-xl border border-[#1C1917] bg-white px-4 py-2.5 text-xs font-semibold text-[#1C1917] shadow-xs hover:bg-[#FAF6F0] transition-colors"
              >
                {isOpeningPortal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 text-[#C26732]" />
                )}
                <span>Manage Subscription</span>
                <ExternalLink className="h-3 w-3 text-[#78716C]" />
              </button>
            )}
          </div>

          {portalNotice && (
            <div className="mt-4 rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] p-3 text-xs text-[#57534E]">
              {portalNotice}
            </div>
          )}

          {/* Plan Limits & Information */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-[#FAF6F0] p-4">
              <span className="text-[#78716C]">Monthly Plan Quota</span>
              <p className="mt-1 text-lg font-bold tabular-nums text-[#1C1917]">
                {user?.max_credits ?? 5} Credits
              </p>
              <span className="text-[11px] text-[#A8A29E]">1 credit = 1 full analysis</span>
            </div>

            <div className="rounded-xl bg-[#FAF6F0] p-4">
              <span className="text-[#78716C]">Credits Available Now</span>
              <p className={`mt-1 text-lg font-bold tabular-nums ${isOutOfCredits ? 'text-[#DC2626]' : 'text-[#C26732]'}`}>
                {user?.credits ?? 0} Credits
              </p>
              <span className="text-[11px] text-[#A8A29E]">
                {isOutOfCredits ? 'Limit exhausted — Upgrade required' : 'Ready to analyze'}
              </span>
            </div>

            <div className="rounded-xl bg-[#FAF6F0] p-4">
              <span className="text-[#78716C]">Next Billing & Credit Reset</span>
              <p className="mt-1 text-sm font-semibold text-[#1C1917]">
                {user?.credits_reset_at
                  ? new Date(user.credits_reset_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '30 days'}
              </p>
              <span className="text-[11px] text-[#A8A29E]">Automated rollover</span>
            </div>
          </div>
        </div>

        {/* Change / Upgrade Plan Section */}
        <div id="plans-section" className="scroll-mt-20">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#1C1917]">
              Pricing Plans
            </h3>
            <p className="text-xs text-[#78716C]">
              Upgrade your tier to replenish credits immediately. Note: Downgrading will not reset or restore exhausted credits.
            </p>
          </div>

          <PricingCardsSection currentPlan={user?.plan || 'free'} inDashboard={true} />

          {/* Pricing & Credit Reset Timeline */}
          <PricingResetTimeline />
        </div>

        {/* Billing Features & Invoices Preview */}
        <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1C1917]">
                Invoices & Receipts
              </h3>
              <p className="text-xs text-[#78716C]">
                Official PDF invoices and tax receipts via Stripe.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#16A34A] font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Stripe Secure Payments</span>
            </div>
          </div>

          <div className="mt-4 divide-y divide-[#E8DCCB]/60 text-xs">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-[#1C1917]">
                  {user?.plan === 'pro_plus'
                    ? 'Cirolink Pro Plus Monthly ($4.00)'
                    : user?.plan === 'pro'
                    ? 'Cirolink Pro Monthly ($2.00)'
                    : 'Cirolink Free Tier ($0.00)'}
                </p>
                <span className="text-[11px] text-[#78716C]">
                  Account: {user?.email} · Current Billing Cycle
                </span>
              </div>
              <span className="font-mono text-[#16A34A] font-semibold">
                Paid / Current
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
