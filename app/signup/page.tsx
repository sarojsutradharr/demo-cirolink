'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/provider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup(email, password, fullName);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setErrorMsg(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success) {
        router.push('/dashboard');
      } else {
        setErrorMsg(res.error || 'Google registration failed');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google registration failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-[#E8DCCB] bg-white p-8 sm:p-9 shadow-xs">
            <div className="text-center">
              <Link href="/" className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Cirolink<span className="text-[#C26732]">.</span>
              </Link>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-[#1C1917]">
                Create your Free Account
              </h2>
              <p className="mt-1 text-xs text-[#78716C]">
                Get started immediately with 5 free monthly analysis credits.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Signup Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || isLoading}
                className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] py-2.5 px-4 text-xs font-semibold text-[#1C1917] shadow-2xs hover:bg-[#EFE6D8] transition-colors"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#1C1917]" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Sign up with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8DCCB]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[11px] font-medium text-[#78716C]">
                  Or register with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917]">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[#A8A29E]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] py-2.5 pl-9 pr-3 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917]">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#A8A29E]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] py-2.5 pl-9 pr-3 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917]">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#A8A29E]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] py-2.5 pl-9 pr-3 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] p-3 text-xs text-[#57534E] space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                  <span>Free Plan automatically provisioned</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                  <span>5 monthly credits included</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#F7F1E8]" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#78716C]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#1C1917] hover:text-[#C26732]">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
