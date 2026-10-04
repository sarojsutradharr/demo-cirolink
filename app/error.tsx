'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md rounded-3xl border border-[#E8DCCB] bg-white p-8 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-[#1C1917]">
          Something went wrong
        </h1>
        <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
          An unexpected issue occurred while rendering this page. You can try reloading or return to the dashboard.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-4 py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/dashboard"
            prefetch={false}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8DCCB] bg-white px-4 py-2.5 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF6F0] transition-colors"
          >
            <Home className="h-3.5 w-3.5 text-[#78716C]" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
