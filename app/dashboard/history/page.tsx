'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/provider';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { RecentAnalysesTable } from '@/components/dashboard/RecentAnalysesTable';
import { Search, Plus, Filter, FileText } from 'lucide-react';

export default function HistoryPage() {
  const { analyses } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnalyses = useMemo(() => {
    if (!searchTerm.trim()) return analyses;
    const term = searchTerm.toLowerCase();
    return analyses.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        (a.text_preview && a.text_preview.toLowerCase().includes(term))
    );
  }, [analyses, searchTerm]);

  return (
    <div className="flex-1">
      <DashboardHeader
        title="Analysis History"
        subtitle="Review, inspect, or manage your past text analyses."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Controls: Search & New Analysis */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#78716C]" />
            <input
              type="text"
              placeholder="Search history by document title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#E8DCCB] bg-white py-2.5 pl-9 pr-3 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#78716C]">
              {searchTerm ? (
                <>Showing <strong>{filteredAnalyses.length}</strong> of {analyses.length} records</>
              ) : (
                <>Total: <strong>{analyses.length}</strong> records</>
              )}
            </span>

            <Link
              href="/dashboard/word-counter"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-4 py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New Analysis</span>
            </Link>
          </div>
        </div>

        {/* History Table */}
        <RecentAnalysesTable analyses={filteredAnalyses} />
      </div>
    </div>
  );
}
