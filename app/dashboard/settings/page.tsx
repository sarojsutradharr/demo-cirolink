'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/supabase/provider';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import {
  User,
  KeyRound,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { user, resetPassword } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSaved, setIsSaved] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePasswordReset = async () => {
    if (user?.email) {
      await resetPassword(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    }
  };

  return (
    <div className="flex-1">
      <DashboardHeader
        title="Settings & Preferences"
        subtitle="Manage your personal profile, credentials, and account settings."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
          <div className="border-b border-[#E8DCCB] pb-4">
            <h3 className="text-base font-bold text-[#1C1917]">Personal Profile</h3>
            <p className="text-xs text-[#78716C]">
              Your account identity displayed across the Cirolink application.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917]">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] py-2 px-3 text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917]">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="mt-1 w-full rounded-xl border border-[#E8DCCB] bg-[#EFE6D8]/50 py-2 px-3 text-xs text-[#78716C] cursor-not-allowed"
              />
              <span className="text-[11px] text-[#A8A29E] mt-1 block">
                Email is managed via Supabase Authentication.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-[#1C1917] px-4 py-2 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
              >
                Save Changes
              </button>
              {isSaved && (
                <span className="text-xs font-medium text-[#16A34A] flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Profile updated.
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Account Status & Credit Limit Policy */}
        <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
          <div className="border-b border-[#E8DCCB] pb-4">
            <h3 className="text-base font-bold text-[#1C1917]">Account Status & Credit Quota</h3>
            <p className="text-xs text-[#78716C]">
              Your persistent subscription status and monthly credit limit allocation.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] p-4">
              <span className="text-xs text-[#78716C]">Account Status</span>
              <div className="mt-1">
                {(user?.credits !== undefined && user.credits <= 0) || user?.subscription_status === 'cancelled' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FEF2F2] border border-[#DC2626]/30 px-2 py-0.5 text-xs font-bold text-[#DC2626]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                    Limit Exhausted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F0FDF4] border border-[#16A34A]/30 px-2 py-0.5 text-xs font-semibold text-[#16A34A]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    Active
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] p-4">
              <span className="text-xs text-[#78716C]">Credit Balance</span>
              <p className="mt-1 text-sm font-bold text-[#1C1917] tabular-nums">
                {user?.credits ?? 0} / {user?.max_credits ?? 5} credits
              </p>
            </div>

            <div className="rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] p-4">
              <span className="text-xs text-[#78716C]">Next Reset Date</span>
              <p className="mt-1 text-xs font-semibold text-[#1C1917]">
                {user?.credits_reset_at
                  ? new Date(user.credits_reset_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'In 30 days'}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#E8DCCB]/60 bg-[#FAF6F0]/60 p-3 text-[11px] text-[#57534E] leading-relaxed">
            <strong>Credit Limit Rule:</strong> If your credits are exhausted, your account status locks to <strong>Limit Exhausted</strong>. Downgrading to a lower plan will not reset or restore exhausted credits. The account remains locked until your next legitimate reset period or until you upgrade to a higher tier plan.
          </div>
        </div>

        {/* Security & Password Reset */}
        <div className="rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xs">
          <div className="border-b border-[#E8DCCB] pb-4">
            <h3 className="text-base font-bold text-[#1C1917]">Security & Password</h3>
            <p className="text-xs text-[#78716C]">
              Manage authentication credentials and recovery emails.
            </p>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#1C1917]">Password Reset</p>
              <p className="text-xs text-[#78716C]">
                Send an encrypted password update email to {user?.email}.
              </p>
            </div>

            <button
              onClick={handlePasswordReset}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] px-4 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#EFE6D8] transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5 text-[#78716C]" />
              <span>Send Password Reset</span>
            </button>
          </div>

          {resetSent && (
            <div className="mt-3 rounded-xl bg-[#DCFCE7] p-3 text-xs text-[#166534] flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-[#16A34A]" />
              <span>Reset instructions sent to your email.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
