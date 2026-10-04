'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/provider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CheckCircle2, ArrowRight, LogIn, Home } from 'lucide-react';

export default function LogoutPage() {
  const { logout } = useAuth();
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  useEffect(() => {
    async function performLogout() {
      await logout();
      setHasLoggedOut(true);
    }
    performLogout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-[#E8DCCB] bg-white p-8 sm:p-10 shadow-xs text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#16A34A]">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#1C1917]">
              You have been logged out
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#78716C] leading-relaxed">
              Your Cirolink session has been safely closed. Your analyzed documents, statistics, and monthly credits remain securely stored in your account.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-5 py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In Again</span>
              </Link>

              <Link
                href="/"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8DCCB] bg-white px-5 py-2.5 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF6F0] transition-colors"
              >
                <Home className="h-3.5 w-3.5 text-[#78716C]" />
                <span>Homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
