'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile } from '@/types';
import { Zap, Calendar, Sparkles } from 'lucide-react';

interface CreditUsageBarProps {
  user: UserProfile | null;
  compact?: boolean;
}

export function CreditUsageBar({ user, compact = false }: CreditUsageBarProps) {
  const creditsRemaining = user?.credits ?? 0;
  const maxCredits = user?.max_credits || 5;
  const creditsUsed = Math.max(0, maxCredits - creditsRemaining);
  const percentageUsed = Math.min(100, Math.round((creditsUsed / maxCredits) * 100));

  const resetDateDisplay = user?.credits_reset_at
    ? new Date(user.credits_reset_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'In 30 days';

  if (compact) {
    return (
      <div className="rounded-xl border border-[#E8DCCB] bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#1C1917]">Credit Usage</span>
            {creditsRemaining === 0 && (
              <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded border border-[#DC2626]/20">
                Limit Exhausted
              </span>
            )}
          </div>
          <span className="font-mono tabular-nums text-[#78716C]">
            {creditsUsed} / {maxCredits} used
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EFE6D8]">
          <div
            className={`h-full transition-all duration-300 ${
              creditsRemaining === 0 ? 'bg-[#DC2626]' : 'bg-[#1C1917]'
            }`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8DCCB] pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            Monthly Allotment
          </span>
          <h3 className="text-xl font-bold tracking-tight text-[#1C1917] mt-0.5">
            Credit Consumption & Balance
          </h3>
          <p className="text-xs text-[#78716C]">
            Each text analysis consumes exactly 1 monthly credit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {creditsRemaining <= 0 || user?.subscription_status === 'cancelled' ? (
            <span className="rounded-lg bg-[#FEF2F2] border border-[#DC2626]/30 px-3 py-1.5 text-xs font-bold text-[#DC2626] uppercase tracking-wider">
              Status: Limit Exhausted
            </span>
          ) : (
            <span className="rounded-lg bg-[#F0FDF4] border border-[#16A34A]/30 px-3 py-1.5 text-xs font-semibold text-[#16A34A] uppercase tracking-wider">
              Status: Active
            </span>
          )}
          <span className="rounded-lg bg-[#FAF6F0] border border-[#E8DCCB] px-3 py-1.5 text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
            {user?.plan === 'pro_plus' ? 'Pro Plus Plan' : user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
          </span>
          <Link
            href="/dashboard/billing"
            className="rounded-lg bg-[#1C1917] px-3.5 py-1.5 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>

      {/* Progress & Stat Numbers */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold tracking-tight tabular-nums text-[#1C1917]">
            {creditsUsed}{' '}
            <span className="text-base font-normal text-[#78716C]">
              / {maxCredits} credits used
            </span>
          </span>
          <span className="text-xs font-semibold tabular-nums text-[#C26732]">
            {creditsRemaining} remaining
          </span>
        </div>

        {/* Bar */}
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#EFE6D8]">
          <div
            className={`h-full transition-all duration-500 ${
              creditsRemaining === 0 ? 'bg-[#DC2626]' : 'bg-[#1C1917]'
            }`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
      </div>

      {/* Stat Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E8DCCB] pt-6 sm:grid-cols-4 text-xs">
        <div>
          <span className="text-[#78716C]">Current Plan</span>
          <p className="mt-1 font-semibold text-[#1C1917] uppercase">
            {user?.plan === 'pro_plus' ? 'Pro Plus' : user?.plan === 'pro' ? 'Pro' : 'Free'}
          </p>
        </div>
        <div>
          <span className="text-[#78716C]">Monthly Limit</span>
          <p className="mt-1 font-semibold tabular-nums text-[#1C1917]">
            {maxCredits} analyses
          </p>
        </div>
        <div>
          <span className="text-[#78716C]">Credits Used</span>
          <p className="mt-1 font-semibold tabular-nums text-[#1C1917]">
            {creditsUsed}
          </p>
        </div>
        <div>
          <span className="text-[#78716C] flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Next Reset Date
          </span>
          <p className="mt-1 font-semibold text-[#1C1917]">
            {resetDateDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}
