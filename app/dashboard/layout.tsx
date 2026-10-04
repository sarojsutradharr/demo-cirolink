'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/provider';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Loader2, Lock, ArrowRight, UserPlus } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#C26732]" />
        <p className="mt-3 text-xs font-semibold text-[#78716C]">
          Authenticating your session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-[#E8DCCB] bg-white p-8 sm:p-10 shadow-xs text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-[#1C1917]">
            Sign in to access tools
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#78716C] leading-relaxed">
            The Word Counter and text analytics tools are available exclusively to registered users.
            Sign in or create a free account to receive 5 free credits.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              prefetch={false}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-5 py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
            >
              <span>Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/signup"
              prefetch={false}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8DCCB] bg-white px-5 py-2.5 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF6F0] transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5 text-[#78716C]" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      {/* Sidebar */}
      <DashboardSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {children}
      </div>
    </div>
  );
}
