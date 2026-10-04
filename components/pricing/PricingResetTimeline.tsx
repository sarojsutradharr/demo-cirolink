'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { useAuth } from '@/lib/supabase/provider';
import {
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';
import Link from 'next/link';

// Cache the timestamp so getSnapshot returns the same value between subscriber notifications
let cachedClientTime = typeof window !== 'undefined' ? Date.now() : 1791100000000;

function subscribeTime(callback: () => void) {
  const interval = setInterval(() => {
    cachedClientTime = Date.now();
    callback();
  }, 30000);
  return () => clearInterval(interval);
}

function getClientTime() {
  return cachedClientTime;
}

function getServerTime() {
  return 1791100000000;
}

export function PricingResetTimeline() {
  const { user, resetCreditsByTimeline } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const currentTime = useSyncExternalStore(subscribeTime, getClientTime, getServerTime);

  const credits = user?.credits ?? 0;
  const maxCredits = user?.max_credits ?? 5;
  const isBurned = Boolean(user && credits <= 0);

  // Compute timeline cycle metrics safely
  const resetDate = user?.credits_reset_at
    ? new Date(user.credits_reset_at)
    : new Date('2026-11-04T00:00:00.000Z');

  const refTime = currentTime || resetDate.getTime() - 25 * 24 * 60 * 60 * 1000;
  const msRemaining = Math.max(0, resetDate.getTime() - refTime);
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const daysPassed = Math.max(1, Math.min(30, 30 - daysRemaining));
  const progressPercent = Math.min(100, Math.round((daysPassed / 30) * 100));

  const handleSimulateTimelineReset = async () => {
    setIsResetting(true);
    setResetFeedback(null);
    try {
      const res = await resetCreditsByTimeline();
      setResetFeedback(res.message);
    } catch {
      setResetFeedback('Failed to simulate cycle reset.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div id="credit-timeline" className="w-full mt-14 scroll-mt-20">
      <div className="rounded-3xl border border-[#E8DCCB] bg-white p-6 sm:p-10 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FAF6F0] px-3 py-1 text-xs font-semibold text-[#C26732] border border-[#E8DCCB]">
              <Calendar className="h-3.5 w-3.5" />
              <span>Credit Renewal Cycle</span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]">
              Pricing & Credit Reset Timeline
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#78716C] max-w-2xl">
              When your free or paid credits are burned, they reset strictly according to this 30-day timeline.
              Downgrading a plan will <strong>not</strong> reset your limit early.
            </p>
          </div>

          {user && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs text-[#78716C]">
                Logged in: <strong className="text-[#1C1917]">{user.email}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Feedback Alert if user simulated cycle arrival */}
        {resetFeedback && (
          <div className="mt-6 rounded-2xl border border-[#16A34A]/20 bg-[#F0FDF4] p-4 text-xs font-semibold text-[#166534] flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{resetFeedback}</span>
          </div>
        )}

        {/* User's Live Cycle Card (when logged in) */}
        {user ? (
          <div className="mt-6 rounded-2xl border border-[#E8DCCB] bg-[#FAF6F0] p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                  Your Live Pricing Timeline Status
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <h3 className="text-lg font-bold text-[#1C1917]">
                    {user.plan === 'pro_plus' ? 'Pro Plus Plan' : user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isBurned
                        ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#DC2626]/20'
                        : 'bg-[#DCFCE7] text-[#166534] border border-[#16A34A]/20'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span>{isBurned ? 'Credits Burned (0 / ' + maxCredits + ')' : `${credits} / ${maxCredits} Credits Available`}</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#57534E]">
                  Scheduled Reset Date: <strong className="text-[#1C1917]">{resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> ({daysRemaining} days remaining in cycle).
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isBurned && (
                  <a
                    href="#plans-section"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-4 py-2 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#C26732]" />
                    <span>Upgrade to Bypass Wait</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleSimulateTimelineReset}
                  disabled={isResetting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8DCCB] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#EFE6D8] transition-colors"
                  title="Simulate reaching the scheduled renewal timeline date"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-[#C26732] ${isResetting ? 'animate-spin' : ''}`} />
                  <span>Simulate Timeline Reset Date</span>
                </button>
              </div>
            </div>

            {/* Cycle progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-[#78716C] mb-1.5">
                <span>Cycle Progress: Day {daysPassed} of 30</span>
                <span>{daysRemaining} Days to Automated Reset</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#E5D9C8] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isBurned ? 'bg-[#DC2626]' : 'bg-[#C26732]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Burned warning callout */}
            {isBurned && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#DC2626] mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Credit Limit Expired:</strong> Your free credits have been burned.
                  Clicking &ldquo;Downgrade&rdquo; will <strong>never</strong> restore or reset this limit.
                  Your balance will automatically renew on <strong>{resetDate.toLocaleDateString()}</strong>, or you can <strong>Upgrade</strong> now to get instant credits.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#E8DCCB] bg-[#FAF6F0] p-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C26732] text-white">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-[#1C1917]">
                  Want to track your personalized reset timeline?
                </p>
                <p className="text-[#78716C]">
                  Sign in or register to get 5 free credits and view your automated 30-day reset schedule.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-4 py-2 font-semibold text-[#F7F1E8] hover:bg-[#2D231E] transition-all shrink-0"
            >
              <span>Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* 4-Step Interactive Timeline Diagram */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-[#1C1917] mb-4">
            How The Credit Reset Timeline Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-[#E8DCCB] bg-[#FAF6F0]/60 p-4 transition-all hover:bg-[#FAF6F0]">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1C1917] text-[11px] font-bold text-[#F7F1E8]">
                  1
                </span>
                <span className="text-xs font-bold text-[#1C1917]">Day 1: Cycle Start</span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Full plan quota is credited to your account:
              </p>
              <ul className="mt-2 text-[11px] text-[#78716C] space-y-1">
                <li>• Free: <strong>5 credits</strong></li>
                <li>• Pro: <strong>10 credits</strong></li>
                <li>• Pro Plus: <strong>15 credits</strong></li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-[#E8DCCB] bg-[#FAF6F0]/60 p-4 transition-all hover:bg-[#FAF6F0]">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C26732] text-[11px] font-bold text-white">
                  2
                </span>
                <span className="text-xs font-bold text-[#1C1917]">Days 1–29: Burn Period</span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Each document analysis uses 1 credit. All word counts, reading speeds, and lexical charts are saved.
              </p>
              <div className="mt-2 rounded-lg bg-white border border-[#E8DCCB] p-2 text-[11px] text-[#78716C]">
                1 Credit = 1 Comprehensive Document Check
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-[#DC2626]/20 bg-[#FEF2F2]/60 p-4 transition-all hover:bg-[#FEF2F2]">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DC2626] text-[11px] font-bold text-white">
                  3
                </span>
                <span className="text-xs font-bold text-[#991B1B]">Credit Burn & Lock</span>
              </div>
              <p className="text-xs text-[#B91C1C] leading-relaxed">
                When credits reach 0, analysis is paused until renewal.
              </p>
              <div className="mt-2 rounded-lg bg-white border border-[#DC2626]/20 p-2 text-[11px] text-[#991B1B] font-medium">
                <Lock className="h-3 w-3 inline mr-1 text-[#DC2626]" />
                Downgrading will <strong>NOT</strong> reset or restore credits.
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-2xl border border-[#16A34A]/20 bg-[#F0FDF4]/60 p-4 transition-all hover:bg-[#F0FDF4]">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A] text-[11px] font-bold text-white">
                  4
                </span>
                <span className="text-xs font-bold text-[#166534]">Day 30: Automated Reset</span>
              </div>
              <p className="text-xs text-[#166534] leading-relaxed">
                At 00:00 UTC on the scheduled reset date, your plan quota automatically restores back to full credits.
              </p>
              <div className="mt-2 rounded-lg bg-white border border-[#16A34A]/20 p-2 text-[11px] text-[#166534] font-medium">
                <Sparkles className="h-3 w-3 inline mr-1 text-[#16A34A]" />
                Or upgrade anytime to refill immediately!
              </div>
            </div>
          </div>
        </div>

        {/* Policy Checklist Footer */}
        <div className="mt-8 border-t border-[#E8DCCB] pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#57534E]">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#16A34A] mt-0.5" />
            <div>
              <strong className="text-[#1C1917] block">No Downgrade Exploits</strong>
              <span>Switching to Free or lower tier keeps exhausted credits at 0.</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-[#C26732] mt-0.5" />
            <div>
              <strong className="text-[#1C1917] block">Predictable 30-Day Cycles</strong>
              <span>Every user gets a fixed 30-day renewal timeline from registration.</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 shrink-0 text-[#1C1917] mt-0.5" />
            <div>
              <strong className="text-[#1C1917] block">Instant Upgrade Refill</strong>
              <span>Need credits right now? Upgrading to Pro or Pro Plus refills instantly.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
