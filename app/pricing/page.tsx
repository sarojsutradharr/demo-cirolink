import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingCardsSection } from '@/components/pricing/PricingCardsSection';
import { PricingResetTimeline } from '@/components/pricing/PricingResetTimeline';
import { FaqSection } from '@/components/home/FaqSection';
import { Check, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing Plans — Cirolink Word Counter',
  description: 'Simple, transparent subscription plans for Cirolink Word Counter. Free $0/mo (5 credits), Pro $2/mo (10 credits), and Pro Plus $4/mo (15 credits).',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#1C1917]">
      <Navbar />

      <main className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C26732]">
              Transparent Pricing
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1C1917]">
              Simple Plans for Every Writer
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#57534E]">
              1 credit = 1 full document analysis. Upgrade or cancel anytime via Stripe billing.
            </p>
          </div>

          {/* Pricing cards */}
          <PricingCardsSection currentPlan="free" inDashboard={false} />

          {/* Pricing & Credit Reset Timeline */}
          <PricingResetTimeline />

          {/* Plan Comparison Matrix */}
          <div className="mt-20 rounded-3xl border border-[#E8DCCB] bg-white p-6 sm:p-10 shadow-xs">
            <h2 className="text-xl font-bold tracking-tight text-[#1C1917] mb-6">
              Compare Plan Features
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8DCCB] text-[#78716C]">
                    <th className="py-3 px-4 font-semibold">Feature</th>
                    <th className="py-3 px-4 text-center font-semibold">Free ($0)</th>
                    <th className="py-3 px-4 text-center font-semibold text-[#C26732]">Pro ($2)</th>
                    <th className="py-3 px-4 text-center font-semibold">Pro Plus ($4)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCCB]/60">
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1C1917]">Monthly Analyses (Credits)</td>
                    <td className="py-3 px-4 text-center font-semibold">5 / month</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#C26732]">10 / month</td>
                    <td className="py-3 px-4 text-center font-semibold">15 / month</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1C1917]">Word, Character & Sentence Counts</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1C1917]">Reading & Speaking Time Estimates</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1C1917]">Drag & Drop File Upload (.txt, .md, .csv)</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1C1917]">Word Frequency Distribution</td>
                    <td className="py-3 px-4 text-center text-[#78716C]">Top 10</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#16A34A]">Full Table</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#16A34A]">Full Table</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1C1917]">Export to CSV & JSON</td>
                    <td className="py-3 px-4 text-center text-[#A8A29E]">—</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1C1917]">Stripe Billing Portal Management</td>
                    <td className="py-3 px-4 text-center text-[#A8A29E]">—</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 mx-auto text-[#16A34A]" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1C1917]">Priority Processing Queue</td>
                    <td className="py-3 px-4 text-center text-[#A8A29E]">—</td>
                    <td className="py-3 px-4 text-center text-[#78716C]">Standard</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#16A34A]">Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <FaqSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
