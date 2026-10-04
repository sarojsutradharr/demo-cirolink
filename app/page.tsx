'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DemoWordCounter } from '@/components/home/DemoWordCounter';
import { PricingCardsSection } from '@/components/pricing/PricingCardsSection';
import { FaqSection } from '@/components/home/FaqSection';
import {
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  BarChart3,
  Layers,
  UploadCloud
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#1C1917]">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DCCB] bg-[#FAF6F0] px-3.5 py-1 text-xs font-semibold text-[#1C1917] shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-[#C26732]" />
                <span>Cirolink by Saroj sutradhar · Word Counter & Text Analyzer</span>
              </div>

              {/* Headline */}
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-[#1C1917] text-balance leading-[1.12]">
                Count Words. Understand Your Text.
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base sm:text-lg text-[#57534E] leading-relaxed text-balance">
                Created by <strong className="font-semibold text-[#1C1917]">Saroj sutradhar</strong>. Instantly count words, characters, sentences, paragraphs, reading time, and more with Cirolink — a refined, distraction-free SaaS for writers, editors, and publishing teams.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#F7F1E8] shadow-sm hover:bg-[#2D231E] transition-all"
                >
                  <span>Start Counting Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/pricing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8DCCB] bg-white px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#1C1917] shadow-2xs hover:bg-[#FAF6F0] transition-colors"
                >
                  <span>View Pricing</span>
                </Link>
              </div>

              {/* Sub-hero trust bullets */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#78716C]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                  5 Free Credits / Month
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                  No Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                  Encrypted & Private
                </span>
              </div>
            </div>

            {/* Interactive Live Demo */}
            <div className="mt-14">
              <DemoWordCounter />
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="scroll-mt-20 border-t border-[#E8DCCB] bg-[#FAF6F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C26732]">
                Comprehensive Text Intelligence
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">
                Engineered for Authors, Editors & Marketers
              </h2>
              <p className="mt-3 text-sm text-[#57534E]">
                Beyond basic word counts, Cirolink breaks down formatting rhythm, cadence, and vocabulary distribution.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF6F0] text-[#1C1917]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#1C1917]">
                  Deep Character & Structure Metrics
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  Accurate tallies of words, letters, numbers, spaces, punctuation marks, sentences, lines, and paragraphs.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF6F0] text-[#1C1917]">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#1C1917]">
                  Reading & Speaking Timers
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  Calibrated to standard human reading rates (225 wpm) and spoken presentation cadences (130 wpm).
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF6F0] text-[#1C1917]">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#1C1917]">
                  Word Frequency & Repetition
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  Identify overused words instantly with interactive sorting, visual bar graphs, and stop-words exclusion.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF6F0] text-[#1C1917]">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#1C1917]">
                  Drag & Drop File Upload
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  Upload .txt, .md, and .csv files up to 5MB. Files are analyzed instantly in client memory with strict privacy.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF6F0] text-[#1C1917]">
                  <Zap className="h-5 w-5 text-[#C26732]" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#1C1917]">
                  Predictable Credit System
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  1 analysis = 1 credit. Start with 5 free credits every month. Upgrade to Pro ($2/mo) or Pro Plus ($4/mo) as you scale.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF6F0] text-[#1C1917]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#1C1917]">
                  Private Analysis Archive
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  Row Level Security (RLS) guarantees only you can view or delete your document history and billing records.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C26732]">
                Simple Three-Step Workflow
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">
                How Cirolink Works
              </h2>
              <p className="mt-3 text-sm text-[#57534E]">
                From raw draft to complete lexical breakdown in seconds.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="relative rounded-2xl border border-[#E8DCCB] bg-white p-6 sm:p-8 shadow-xs">
                <span className="font-mono text-xs font-bold text-[#C26732]">01</span>
                <h3 className="mt-3 text-base font-bold text-[#1C1917]">Paste or Upload Text</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  Type into the distraction-free editor, paste clipboard content, or drag and drop your .txt, .md, or .csv manuscript.
                </p>
              </div>

              <div className="relative rounded-2xl border border-[#E8DCCB] bg-white p-6 sm:p-8 shadow-xs">
                <span className="font-mono text-xs font-bold text-[#C26732]">02</span>
                <h3 className="mt-3 text-base font-bold text-[#1C1917]">Click Count (1 Credit)</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  Our lexical engine parses the text structure, calculates punctuation, reading pacing, and frequency distributions.
                </p>
              </div>

              <div className="relative rounded-2xl border border-[#E8DCCB] bg-white p-6 sm:p-8 shadow-xs">
                <span className="font-mono text-xs font-bold text-[#C26732]">03</span>
                <h3 className="mt-3 text-base font-bold text-[#1C1917]">Inspect, Export & Save</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  Review structural stat cards, analyze overused terms, export summary data to CSV or JSON, and archive to your history.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="scroll-mt-20 border-t border-[#E8DCCB] bg-[#FAF6F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C26732]">
                Simple & Transparent Pricing
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">
                Choose the Plan That Fits Your Writing
              </h2>
              <p className="mt-3 text-sm text-[#57534E]">
                Start on our generous Free plan. Upgrade or cancel anytime via Stripe.
              </p>
            </div>

            <PricingCardsSection currentPlan="free" inDashboard={false} />
          </div>
        </section>

        {/* FAQ SECTION */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FaqSection />
        </div>

        {/* FINAL CTA */}
        <section className="border-t border-[#E8DCCB] bg-[#1C1917] py-16 text-[#F7F1E8]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Analyze Your Next Manuscript?
            </h2>
            <p className="mt-4 text-sm text-[#D9CBBA] max-w-xl mx-auto leading-relaxed">
              Join writers, editors, students, and agencies using Cirolink for precise text analysis.
              Start now with 5 free monthly credits.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto rounded-xl bg-[#C26732] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#A85324] transition-all"
              >
                Create Free Account (5 Credits)
              </Link>
              <Link
                href="/#demo"
                className="w-full sm:w-auto rounded-xl border border-[#57534E] px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#F7F1E8] hover:bg-[#2D231E] transition-colors"
              >
                Try Online Counter
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
