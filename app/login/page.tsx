'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/provider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Check, Zap, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, signInWithGoogle, resetPassword } = useAuth();

  const [email, setEmail] = useState('writer@cirolink.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success) {
        // If top redirect is occurring, the page will navigate;
        // if inside popup, onAuthStateChange or postMessage will detect session
        setTimeout(() => {
          setIsGoogleLoading(false);
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Google authentication failed');
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google login failed');
      setIsGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    await resetPassword(resetEmail);
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="rounded-3xl border border-[#E8DCCB] bg-white p-7 sm:p-9 shadow-xs">
            <div className="text-center">
              <Link href="/" className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Cirolink<span className="text-[#C26732]">.</span>
              </Link>
              <h1 className="mt-3 text-xl font-bold tracking-tight text-[#1C1917]">
                Sign in to your account
              </h1>
              <p className="mt-1 text-xs text-[#78716C]">
                Select your preferred sign-in method to access your dashboard.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* OPTION 1: FAST GOOGLE AUTHENTICATION (PRIMARY) */}
            <div className="mt-6 rounded-2xl border-2 border-[#C26732]/30 bg-gradient-to-b from-[#FAF6F0] via-[#FAF6F0] to-white p-4 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C26732]">
                  <Zap className="h-3.5 w-3.5 fill-[#C26732]" />
                  <span>Option 1: Fast Google Auth</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#16A34A]/10 px-2 py-0.5 text-[10px] font-semibold text-[#166534]">
                  Instant • 1-Click
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full relative flex items-center justify-center gap-3 rounded-xl border border-[#E8DCCB] bg-white py-3 px-4 text-xs font-semibold text-[#1C1917] shadow-xs hover:bg-[#FAF6F0] hover:border-[#C26732]/50 active:scale-[0.99] transition-all cursor-pointer"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#C26732]" />
                ) : (
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Fast Sign In with Google</span>
              </button>
              <p className="mt-2 text-center text-[11px] text-[#78716C]">
                Sign in with your Gmail or Google Workspace account without a password.
              </p>
            </div>

            {/* DIVIDER */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8DCCB]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-[10px] font-semibold tracking-wider text-[#A8A29E]">
                  Or Option 2: Email & Password
                </span>
              </div>
            </div>

            {/* OPTION 2: EMAIL & PASSWORD */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917]">Option 2: Email & Password</span>
                <span className="text-[11px] text-[#78716C]">Traditional login</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#1C1917]">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setShowResetModal(true);
                      }}
                      className="text-[11px] text-[#78716C] hover:text-[#C26732] cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#A8A29E]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] py-2.5 pl-9 pr-3 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] active:scale-[0.99] transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#F7F1E8]" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In with Email</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E8DCCB]/60 text-center text-xs text-[#78716C]">
              Don&apos;t have an account yet?{' '}
              <Link href="/signup" className="font-semibold text-[#C26732] hover:underline">
                Create Free Account (5 Credits)
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#E8DCCB] bg-white p-6 shadow-xl">
            <h3 className="text-sm font-bold text-[#1C1917]">Reset Password</h3>
            <p className="mt-1 text-xs text-[#78716C]">
              Enter your email to receive recovery instructions.
            </p>

            {resetSent ? (
              <div className="mt-4 rounded-xl bg-[#DCFCE7] p-3 text-xs text-[#166534] flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>Reset link sent to {resetEmail}.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] py-2 px-3 text-xs text-[#1C1917]"
                  placeholder="name@example.com"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#1C1917] py-2 text-xs font-semibold text-[#F7F1E8] cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setShowResetModal(false);
                setResetSent(false);
              }}
              className="mt-4 w-full text-center text-xs text-[#78716C] hover:text-[#1C1917] cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
