'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/provider';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { CreditUsageBar } from '@/components/dashboard/CreditUsageBar';
import { Calendar, ArrowUpRight, ArrowDownLeft, Zap, Sparkles } from 'lucide-react';

export default function UsagePage() {
  const { user, transactions, analyses } = useAuth();

  return (
    <div className="flex-1">
      <DashboardHeader
        title="Credit Usage & Ledger"
        subtitle="Track your monthly quota consumption, reset schedules, and audit log."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Main Credit Usage Bar (Section 18) */}
        <CreditUsageBar user={user} />

        {/* Credit Transaction Ledger */}
        <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
          <div className="border-b border-[#E8DCCB] pb-4">
            <h3 className="text-base font-bold text-[#1C1917]">
              Credit Activity Ledger
            </h3>
            <p className="text-xs text-[#78716C]">
              Every credit allotment and consumption event is recorded securely.
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#78716C]">
                No credit transactions recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8DCCB] text-[#78716C]">
                    <th className="py-2.5 font-semibold">Date & Time</th>
                    <th className="py-2.5 font-semibold">Event Description</th>
                    <th className="py-2.5 font-semibold">Transaction Type</th>
                    <th className="py-2.5 text-right font-semibold">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCCB]/60">
                  {transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    const formattedDate = new Date(tx.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={tx.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                        <td className="py-3 text-[#78716C] whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3 font-medium text-[#1C1917]">
                          {tx.description}
                        </td>
                        <td className="py-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#57534E] bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#E8DCCB]">
                            {tx.transaction_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold tabular-nums">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                            )}
                            {isPositive ? `+${tx.amount}` : tx.amount}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
