'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/provider';
import { TextAnalysisStats } from '@/types';
import { analyzeText } from '@/lib/word-counter/analyzer';
import { ResultsDashboard } from '@/components/word-counter/ResultsDashboard';
import {
  Sparkles,
  RefreshCw,
  ArrowRight,
  Lock,
  AlertTriangle,
  CreditCard,
  LogIn
} from 'lucide-react';

const SAMPLE_TEXT = `In an age where information inundates our daily lives, clarity in written expression has become the ultimate differentiator. Good writing is not merely about word count or ornate vocabulary; it is about density, precision, and respect for the reader's time.

When sentences stretch needlessly without delivering commensurate value, the reader's attention wanders. By examining structural rhythm, syllable density, and lexical repetition, writers and editorial teams can sculpt their prose into high-impact communication that commands authority and clarity.`;

export function DemoWordCounter() {
  const router = useRouter();
  const { user, consumeCreditForAnalysis } = useAuth();

  const [text, setText] = useState<string>('');
  const [stats, setStats] = useState<TextAnalysisStats | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const credits = user?.credits ?? 0;
  const isOutOfCredits = Boolean(user && credits <= 0);

  const handleAnalyze = async () => {
    setErrorMsg(null);

    // If user is not logged in, they cannot use the tool - redirect directly to sign in page!
    if (!user) {
      router.push('/login');
      return;
    }

    if (!text || text.trim().length === 0) {
      setErrorMsg('Please enter or load some text before clicking Count Text.');
      return;
    }

    if (isOutOfCredits) {
      setErrorMsg(
        `You have used all ${user.max_credits} credits for your ${user.plan.toUpperCase()} plan. Please upgrade to continue analyzing.`
      );
      return;
    }

    const calculated = analyzeText(text);

    // Consume credit from user plan
    const res = await consumeCreditForAnalysis(calculated, 'Homepage Analysis', text);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to consume credit.');
      return;
    }

    setStats(calculated);
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setText('');
    setStats(null);
    setErrorMsg(null);
  };

  return (
    <section id="demo" className="scroll-mt-20">
      <div className="rounded-3xl border border-[#E8DCCB] bg-[#FAF6F0] p-4 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E8DCCB] pb-4 mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C26732]">
              Interactive Lexical Analyzer
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917] mt-1">
              Cirolink Word Counter
            </h2>
            <p className="text-xs text-[#78716C]">
              {user
                ? `Logged in as ${user.email} (${credits} / ${user.max_credits} credits remaining on ${user.plan === 'pro_plus' ? 'Pro Plus' : user.plan === 'pro' ? 'Pro' : 'Free'} plan)`
                : 'Sign in to access text metrics, readability analysis, and vocabulary depth.'}
            </p>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E8DCCB] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] shadow-xs hover:bg-[#FAF6F0] transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#78716C]" />
              <span>Load Sample</span>
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#78716C] hover:bg-[#EFE6D8] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Unauthenticated Login Gate Notification */}
        {!user && (
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#C26732]/30 bg-[#FAF2EB] p-4 text-[#1C1917]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C26732] text-white">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1C1917]">
                  Account required to use the Word Counter tool
                </p>
                <p className="text-[11px] text-[#78716C]">
                  Please sign in or register to analyze text. Free accounts include 5 free monthly credits!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                prefetch={false}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-3.5 py-2 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                prefetch={false}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E8DCCB] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF6F0] transition-colors"
              >
                <span>Register (5 Credits)</span>
              </Link>
            </div>
          </div>
        )}

        {/* Credit Limit Over Banner with Upgrade Button */}
        {user && isOutOfCredits && (
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#DC2626]/20 bg-[#FEF2F2] p-4 text-[#991B1B]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-[#DC2626] mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Credit Limit Expired for {user.email} (0 / {user.max_credits} Credits Remaining)
                </p>
                <p className="text-[11px] text-[#B91C1C] mt-0.5 leading-relaxed">
                  Your {user.plan.toUpperCase()} plan credits are burned. Note: <strong>Downgrading will not reset or restore your credits</strong>. Credits reset according to your 30-day pricing timeline.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/pricing#credit-timeline"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-xl border border-[#DC2626]/30 bg-white px-3 py-2 text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
              >
                <span>View Timeline</span>
              </Link>
              <Link
                href="/pricing"
                prefetch={false}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#B91C1C] transition-colors"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Upgrade Plan</span>
              </Link>
            </div>
          </div>
        )}

        {/* Text Input Area */}
        <div className="rounded-2xl border border-[#E8DCCB] bg-white p-4 sm:p-6 shadow-xs">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder={
              user
                ? "Type or paste your text here, then click Count Text below..."
                : "Sign in to enter text and calculate lexical density, readability, and vocabulary distributions..."
            }
            className="min-h-[180px] w-full resize-y border-none bg-transparent text-sm leading-relaxed text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-0 font-normal"
          />

          {errorMsg && (
            <div className="mt-2 text-xs text-[#DC2626] font-medium">
              {errorMsg}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E8DCCB] pt-4 mt-3">
            <div>
              {user ? (
                <div className="text-xs text-[#78716C]">
                  <span className="font-semibold text-[#1C1917] tabular-nums">{credits}</span> of{' '}
                  <span className="tabular-nums">{user.max_credits}</span> credits remaining (
                  <span className="font-medium text-[#C26732] uppercase text-[11px]">
                    {user.plan === 'pro_plus' ? 'Pro Plus (15)' : user.plan === 'pro' ? 'Pro (10)' : 'Free (5)'}
                  </span>
                  )
                </div>
              ) : (
                <div className="text-xs text-[#78716C]">
                  Sign in required to execute text analysis
                </div>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              {user && isOutOfCredits ? (
                <Link
                  href="/pricing"
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#B91C1C] transition-all"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Upgrade to Get Credits</span>
                </Link>
              ) : user ? (
                <button
                  onClick={handleAnalyze}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-6 py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-sm hover:bg-[#2D231E] active:scale-[0.99] transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#C26732]" />
                  <span>Count Text (1 Credit)</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-6 py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-sm hover:bg-[#2D231E] active:scale-[0.99] transition-all"
                >
                  <Lock className="h-3.5 w-3.5 text-[#C26732]" />
                  <span>Sign In to Count</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Results output */}
        {stats && (
          <div className="mt-6 border-t border-[#E8DCCB] pt-6 animate-fadeIn">
            <ResultsDashboard stats={stats} textTitle="Text Analysis" rawText={text} />
          </div>
        )}
      </div>
    </section>
  );
}
