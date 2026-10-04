'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/provider';
import { PRICING_PLANS, PLAN_TIER_ORDER } from '@/lib/stripe/plans';
import { PlanType } from '@/types';
import { Check, Sparkles, Loader2, ArrowRight, AlertTriangle, ArrowDown } from 'lucide-react';

interface PricingCardsProps {
  currentPlan?: PlanType;
  inDashboard?: boolean;
}

export function PricingCardsSection({ currentPlan = 'free', inDashboard = false }: PricingCardsProps) {
  const router = useRouter();
  const { user, upgradePlanMock } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isErrorMessage, setIsErrorMessage] = useState<boolean>(false);

  const plansList = Object.values(PRICING_PLANS);
  const currentTier = PLAN_TIER_ORDER[currentPlan] ?? 0;
  const isUserExhausted = Boolean(user && user.credits <= 0);

  const handleSelectPlan = async (planKey: PlanType) => {
    if (planKey === currentPlan) return;

    if (!user && !inDashboard) {
      router.push(`/signup?plan=${planKey}`);
      return;
    }

    setLoadingPlan(planKey);
    setStatusMessage(null);
    setIsErrorMessage(false);

    try {
      // In preview environment or live checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          userId: user?.id,
          userEmail: user?.email,
        }),
      });

      const data = await response.json();

      if (data.url && !data.simulated) {
        window.location.assign(data.url);
        return;
      }

      // Preview simulation with downgrade rule enforcement
      const res = await upgradePlanMock(planKey);
      setStatusMessage(res.message);
      setIsErrorMessage(!res.isUpgrade && res.remainingCredits <= 0);

      if (res.isUpgrade) {
        router.push('/dashboard/billing?status=success');
      }
    } catch (err: any) {
      console.error(err);
      const res = await upgradePlanMock(planKey);
      setStatusMessage(res.message);
      setIsErrorMessage(!res.isUpgrade && res.remainingCredits <= 0);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full">
      {/* Exhausted account warning notice for current email */}
      {isUserExhausted && user && (
        <div className="mb-6 rounded-2xl border border-[#DC2626]/20 bg-[#FEF2F2] p-4 text-[#991B1B]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[#DC2626] mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#991B1B]">
                Credit Limit Expired for {user.email}
              </p>
              <p className="mt-1 text-xs text-[#B91C1C] leading-relaxed">
                Your account has <strong>0 credits remaining</strong>. Please note:{' '}
                <strong>Downgrading to a lower plan will NOT reset or restore your credits.</strong>{' '}
                Your credit limit will remain expired until you <strong>Upgrade</strong> to a higher tier plan below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status or warning notification after plan switch */}
      {statusMessage && (
        <div
          className={`mb-6 rounded-xl border p-4 text-center text-xs font-semibold ${
            isErrorMessage
              ? 'border-[#DC2626]/20 bg-[#FEF2F2] text-[#991B1B]'
              : 'border-[#16A34A]/20 bg-[#F0FDF4] text-[#166534]'
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Credit clarification callout */}
      <div className="mb-8 text-center">
        <p className="inline-block text-xs font-medium text-[#78716C] bg-[#FAF6F0] px-4 py-1.5 rounded-full border border-[#E8DCCB]">
          Clear & Simple: <strong className="text-[#1C1917]">1 credit = 1 full text analysis</strong>.
          Downgrading does not reset credits. Burned credits reset on the{' '}
          <a href="#credit-timeline" className="text-[#C26732] underline font-semibold hover:text-[#A95526]">
            Pricing Timeline &darr;
          </a>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
        {plansList.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPopular = plan.popular;
          const isLoading = loadingPlan === plan.id;
          const targetTier = PLAN_TIER_ORDER[plan.id as PlanType] ?? 0;
          const isUpgrade = targetTier > currentTier;
          const isDowngrade = targetTier < currentTier;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all ${
                isPopular
                  ? 'border-2 border-[#1C1917] bg-white shadow-md lg:-translate-y-1'
                  : 'border border-[#E8DCCB] bg-white shadow-xs hover:border-[#D9CBBA]'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1C1917] px-3 py-1 text-[11px] font-semibold text-[#F7F1E8] shadow-xs">
                    <Sparkles className="h-3 w-3 text-[#C26732]" />
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1C1917]">{plan.name}</h3>
                  {isCurrent && (
                    <span className="rounded-full bg-[#EFE6D8] px-2.5 py-0.5 text-[10px] font-semibold text-[#1C1917]">
                      Active Plan
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-[#1C1917]">
                    {plan.priceDisplay}
                  </span>
                  <span className="text-xs text-[#78716C]">{plan.billingPeriod}</span>
                </div>

                {/* Credits badge */}
                <div className="mt-3 rounded-lg bg-[#FAF6F0] border border-[#E8DCCB] px-3 py-2 text-xs">
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    {plan.credits} Credits / month
                  </span>
                  <p className="mt-0.5 text-[11px] text-[#78716C]">{plan.headline}</p>
                </div>

                <p className="mt-4 text-xs text-[#57534E] leading-relaxed">
                  {plan.description}
                </p>

                {/* Features list */}
                <div className="mt-6 border-t border-[#E8DCCB] pt-6">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                    Included Features
                  </span>
                  <ul className="mt-3 space-y-2.5 text-xs text-[#57534E]">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#1C1917]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-[#E8DCCB]/60">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] py-2.5 text-xs font-semibold text-[#78716C] cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold shadow-xs transition-all ${
                      isUpgrade
                        ? isPopular
                          ? 'bg-[#1C1917] text-[#F7F1E8] hover:bg-[#2D231E]'
                          : 'bg-[#C26732] text-white hover:bg-[#A95526]'
                        : isDowngrade
                        ? 'border border-[#DC2626]/40 bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2]'
                        : 'border border-[#1C1917] bg-white text-[#1C1917] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing Plan...</span>
                      </>
                    ) : isUpgrade ? (
                      <>
                        <span>Upgrade to {plan.name} (+{plan.credits} Credits)</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    ) : isDowngrade ? (
                      <>
                        <ArrowDown className="h-3.5 w-3.5" />
                        <span>Downgrade to {plan.name} (No Credit Reset)</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.ctaText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
