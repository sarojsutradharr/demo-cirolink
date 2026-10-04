'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/provider';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { RecentAnalysesTable } from '@/components/dashboard/RecentAnalysesTable';
import { CreditUsageBar } from '@/components/dashboard/CreditUsageBar';
import {
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  History,
  Layers,
  Activity
} from 'lucide-react';

export default function DashboardHomePage() {
  const { user, analyses } = useAuth();

  // Aggregate stats across analyses
  const totalWordsAnalyzed = analyses.reduce((acc, curr) => acc + curr.word_count, 0);

  return (
    <div className="flex-1">
      <DashboardHeader
        title="Dashboard"
        subtitle="Overview of your text analysis activity and credit balance."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Welcome & Quick Action Hero (Section 17) */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E8DCCB] bg-gradient-to-br from-[#FAF6F0] via-[#FAF6F0] to-[#EFE6D8] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C26732]">
                Cirolink Word Counter
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
                Welcome back 👋
              </h2>
              <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                Analyze your text quickly and accurately. Inspect readability metrics, frequency distributions,
                and vocabulary cadence with one click.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard/word-counter"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-6 py-3 text-xs sm:text-sm font-semibold text-[#F7F1E8] shadow-sm hover:bg-[#2D231E] transition-all"
                >
                  <Sparkles className="h-4 w-4 text-[#C26732]" />
                  <span>Start Counting</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/dashboard/history"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E8DCCB] bg-white px-4 py-3 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF6F0] transition-colors"
                >
                  <History className="h-4 w-4 text-[#78716C]" />
                  <span>View History</span>
                </Link>
              </div>
            </div>

            {/* Quick Plan & Balance Summary Card */}
            <div className="w-full md:w-72 shrink-0 rounded-2xl border border-[#E8DCCB] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#78716C]">Current Plan</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C26732] bg-[#FAF2EB] px-2 py-0.5 rounded">
                  {user?.plan === 'pro_plus' ? 'Pro Plus' : user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight tabular-nums text-[#1C1917]">
                  {user?.credits ?? 0}
                </span>
                <span className="text-xs text-[#78716C] tabular-nums">
                  / {user?.max_credits ?? 5} credits
                </span>
              </div>

              {/* Progress */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EFE6D8]">
                <div
                  className={`h-full transition-all duration-300 ${
                    (user?.credits ?? 0) === 0 ? 'bg-[#DC2626]' : 'bg-[#1C1917]'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (((user?.credits ?? 0) / (user?.max_credits || 5)) * 100))
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-4 border-t border-[#E8DCCB]/60 pt-3 flex items-center justify-between text-[11px]">
                <span className="text-[#78716C]">1 credit = 1 analysis</span>
                <Link
                  href="/dashboard/billing"
                  prefetch={false}
                  className="font-semibold text-[#C26732] hover:underline"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregate Quick Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E8DCCB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#78716C]">
              <span>Total Analyses Completed</span>
              <FileText className="h-4 w-4 text-[#78716C]" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums text-[#1C1917]">
              {analyses.length}
            </p>
            <span className="mt-1 text-[11px] text-[#A8A29E]">All-time records</span>
          </div>

          <div className="rounded-2xl border border-[#E8DCCB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#78716C]">
              <span>Total Words Inspected</span>
              <TrendingUp className="h-4 w-4 text-[#78716C]" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums text-[#1C1917]">
              {totalWordsAnalyzed.toLocaleString()}
            </p>
            <span className="mt-1 text-[11px] text-[#A8A29E]">Across archived documents</span>
          </div>

          <div className="rounded-2xl border border-[#E8DCCB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#78716C]">
              <span>Monthly Credit Status</span>
              <Activity className="h-4 w-4 text-[#C26732]" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums text-[#1C1917]">
              {user?.credits ?? 0} Remaining
            </p>
            <span className="mt-1 text-[11px] text-[#A8A29E]">
              Resets every 30 days
            </span>
          </div>
        </div>

        {/* Credit Usage Progress Bar */}
        <CreditUsageBar user={user} />

        {/* Recent Analyses Section (Section 17) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1C1917]">
                Recent Analyses
              </h3>
              <p className="text-xs text-[#78716C]">
                Your latest analyzed manuscripts and documents.
              </p>
            </div>
            {analyses.length > 5 && (
              <Link
                href="/dashboard/history"
                prefetch={false}
                className="text-xs font-semibold text-[#C26732] hover:underline"
              >
                View all ({analyses.length})
              </Link>
            )}
          </div>

          <RecentAnalysesTable analyses={analyses} limit={5} />
        </div>
      </div>
    </div>
  );
}
