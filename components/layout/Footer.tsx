import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#E8DCCB] bg-[#F7F1E8] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-lg font-bold tracking-tight text-[#1C1917]">
              Cirolink<span className="text-[#C26732]">.com</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-[#78716C] leading-relaxed">
              Precision word counter and text analytics engine. Measure lexical depth, reading
              pace, vocabulary repetition, and formatting metrics instantly.
            </p>
            <div className="mt-4 text-xs text-[#8C827A]">
              <span>Privacy First</span>
              <span className="mx-2">·</span>
              <span>Local Client Analysis Available</span>
              <span className="mx-2">·</span>
              <span>Encrypted Storage</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#78716C]">
              <li>
                <Link href="/#demo" className="hover:text-[#1C1917] transition-colors">
                  Word Counter
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#1C1917] transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-[#1C1917] transition-colors">
                  Metrics & Analytics
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#1C1917] transition-colors">
                  Credit System FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
              Account & Legal
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#78716C]">
              <li>
                <Link href="/login" className="hover:text-[#1C1917] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[#1C1917] transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#1C1917] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/billing" className="hover:text-[#1C1917] transition-colors">
                  Manage Billing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-[#E8DCCB] pt-8 sm:flex-row">
          <p className="text-xs text-[#8C827A]">
            &copy; {new Date().getFullYear()} Cirolink by Saroj sutradhar. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-[#8C827A] sm:mt-0">
            Powered by Next.js, Supabase PostgreSQL & Stripe.
          </p>
        </div>
      </div>
    </footer>
  );
}
