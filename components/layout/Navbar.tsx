'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/provider';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8DCCB] bg-[#F7F1E8]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark with author credit */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <span className="text-xl font-bold tracking-tight text-[#1C1917]">
            Cirolink<span className="text-[#C26732]">.</span>
          </span>
          <span className="inline-flex items-center rounded-md bg-[#FAF6F0] px-2 py-0.5 text-[10px] font-semibold text-[#78716C] border border-[#E8DCCB]">
            by Saroj sutradhar
          </span>
        </Link>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#78716C]">
          <Link href="/#demo" className="transition-colors hover:text-[#1C1917]">
            Word Counter
          </Link>
          <Link href="/#features" className="transition-colors hover:text-[#1C1917]">
            Features
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-[#1C1917]">
            How It Works
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-[#1C1917]">
            Pricing
          </Link>
          <Link href="/#faq" className="transition-colors hover:text-[#1C1917]">
            FAQ
          </Link>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              prefetch={false}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1C1917] px-4 py-2 text-xs font-semibold text-[#F7F1E8] shadow-sm transition-all hover:bg-[#2D231E]"
            >
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                prefetch={false}
                className="px-3 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:text-[#C26732]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-lg bg-[#1C1917] px-4 py-2 text-xs font-semibold text-[#F7F1E8] shadow-sm transition-all hover:bg-[#2D231E]"
              >
                Start Counting Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-[#1C1917] hover:bg-[#EFE6D8]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E8DCCB] bg-[#FAF6F0] px-4 pt-3 pb-6 md:hidden">
          <div className="flex flex-col space-y-3 text-sm font-medium">
            <Link
              href="/#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#1C1917] hover:text-[#C26732]"
            >
              Word Counter
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#1C1917] hover:text-[#C26732]"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#1C1917] hover:text-[#C26732]"
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#1C1917] hover:text-[#C26732]"
            >
              FAQ
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg bg-[#1C1917] py-2.5 text-xs font-semibold text-[#F7F1E8]"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-lg border border-[#E8DCCB] bg-white py-2 text-xs font-semibold text-[#1C1917]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-lg bg-[#1C1917] py-2.5 text-xs font-semibold text-[#F7F1E8]"
                  >
                    Start Counting Free (5 Credits)
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
