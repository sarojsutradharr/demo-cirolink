import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md rounded-3xl border border-[#E8DCCB] bg-white p-8 shadow-xs">
        <span className="text-4xl font-extrabold text-[#C26732]">404</span>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-[#1C1917]">
          Page Not Found
        </h1>
        <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            prefetch={false}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-4 py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
          >
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/"
            prefetch={false}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8DCCB] bg-white px-4 py-2.5 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF6F0] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#78716C]" />
            <span>Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
