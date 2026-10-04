'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/supabase/provider';
import {
  LayoutDashboard,
  FileText,
  History,
  Activity,
  CreditCard,
  Settings,
  LogOut,
  Home,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function DashboardSidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Word Counter', href: '/dashboard/word-counter', icon: FileText },
    { label: 'History', href: '/dashboard/history', icon: History },
    { label: 'Usage', href: '/dashboard/usage', icon: Activity },
    { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const content = (
    <div className="flex h-full flex-col justify-between bg-[#FAF6F0] border-r border-[#E8DCCB] p-4 text-[#1C1917]">
      <div>
        {/* Brand header */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-[#E8DCCB]/60">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-[#1C1917]">
            Cirolink<span className="text-[#C26732]">.</span>
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C] bg-[#EFE6D8] px-2 py-0.5 rounded">
            SaaS
          </span>
        </div>

        {/* Exit to Website / Exit to Dashboard Button */}
        <div className="mt-3 px-1">
          <Link
            href="/"
            prefetch={false}
            onClick={onCloseMobile}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E8DCCB] bg-white px-3 py-2 text-xs font-medium text-[#57534E] shadow-2xs hover:bg-[#FAF6F0] hover:text-[#1C1917] transition-all"
            title="Exit dashboard and return to public website"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#C26732]" />
            <span>Exit to Website</span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="mt-5 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1C1917] text-[#F7F1E8] shadow-sm'
                    : 'text-[#57534E] hover:bg-[#EFE6D8] hover:text-[#1C1917]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#C26732]' : 'text-[#78716C]'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Credit status card */}
        <div className="mt-6 rounded-xl border border-[#E8DCCB] bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1C1917]">Monthly Credits</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C26732] bg-[#FAF2EB] px-2 py-0.5 rounded">
              {user?.plan === 'pro_plus' ? 'Pro Plus' : user?.plan === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight tabular-nums text-[#1C1917]">
              {user?.credits ?? 0}
            </span>
            <span className="text-xs text-[#78716C] tabular-nums">
              / {user?.max_credits ?? 5} credits
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EFE6D8]">
            <div
              className={`h-full transition-all duration-300 ${
                (user?.credits ?? 0) === 0 ? 'bg-[#DC2626]' : 'bg-[#1C1917]'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, (((user?.credits ?? 0) / (user?.max_credits || 5)) * 100))
                )}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#78716C]">
            <span>1 credit = 1 analysis</span>
            <Link
              href="/dashboard/billing"
              className="font-medium text-[#C26732] hover:underline"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </div>

      {/* User profile & Logout */}
      <div className="border-t border-[#E8DCCB] pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1C1917] text-xs font-semibold text-[#F7F1E8]">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden text-left">
              <p className="truncate text-xs font-semibold text-[#1C1917]">
                {user?.full_name || 'Cirolink User'}
              </p>
              <p className="truncate text-[11px] text-[#78716C]">{user?.email}</p>
            </div>
          </div>
          <Link
            href="/logout"
            className="rounded p-1.5 text-[#78716C] hover:bg-[#EFE6D8] hover:text-[#DC2626] transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-30">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
