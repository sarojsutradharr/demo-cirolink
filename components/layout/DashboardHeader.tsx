'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/supabase/provider';
import { Menu, AlertCircle, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobile?: () => void;
}

export function DashboardHeader({ title, subtitle, onOpenMobile }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const credits = user?.credits ?? 0;
  const isOutOfCredits = credits <= 0;

  const isSubPage = pathname !== '/dashboard';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#E8DCCB] bg-[#F7F1E8]/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-[#57534E] hover:bg-[#EFE6D8] md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#1C1917]">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#FAF6F0] border border-[#E8DCCB] px-2 py-0.5 text-[10px] font-medium text-[#57534E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C26732]" />
              Saroj sutradhar
            </span>
          </div>
          {subtitle && (
            <p className="hidden text-xs text-[#78716C] sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Exit Buttons, Credits, Plan, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* If on subpage (like Word Counter, Billing, etc.), allow quick Exit to Dashboard */}
        {isSubPage && (
          <Link
            href="/dashboard"
            prefetch={false}
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-white px-2.5 py-1.5 text-xs font-medium text-[#57534E] hover:bg-[#FAF6F0] hover:text-[#1C1917] transition-colors"
            title="Return to Dashboard Overview"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-[#C26732]" />
            <span>Dashboard</span>
          </Link>
        )}

        {/* Credit pill button */}
        <Link
          href="/dashboard/billing"
          prefetch={false}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
            isOutOfCredits
              ? 'border-[#DC2626]/30 bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]'
              : 'border-[#E8DCCB] bg-white text-[#1C1917] hover:border-[#D9CBBA]'
          }`}
          title={isOutOfCredits ? 'Status: Limit Exhausted. Upgrade to unlock tools.' : 'Active credit balance'}
        >
          {isOutOfCredits ? (
            <AlertCircle className="h-3.5 w-3.5 text-[#DC2626]" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
          )}
          <span className="tabular-nums">
            {isOutOfCredits ? 'Limit Exhausted' : `${credits} Credits`}
          </span>
          <span className="hidden text-[10px] text-[#78716C] md:inline">
            · {user?.plan === 'pro_plus' ? 'Pro Plus' : user?.plan === 'pro' ? 'Pro' : 'Free'}
          </span>
        </Link>

        {isOutOfCredits && (
          <Link
            href="/dashboard/billing"
            prefetch={false}
            className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-[#C26732] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#A85324] transition-colors"
          >
            Upgrade
          </Link>
        )}

        {/* User avatar */}
        <Link
          href="/dashboard/settings"
          prefetch={false}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1917] text-xs font-semibold text-[#F7F1E8] hover:opacity-90 transition-opacity"
          title="Account Settings"
        >
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
        </Link>
      </div>
    </header>
  );
}
