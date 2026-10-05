'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        router.push('/dashboard');
        return;
      }

      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error_description') || searchParams.get('error');

        if (error) {
          if (isMounted) setErrorMsg(decodeURIComponent(error));
          return;
        }

        // 1. Handle PKCE code exchange
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('OAuth code exchange failed:', exchangeError);
            if (isMounted) setErrorMsg(exchangeError.message);
            return;
          }
        }

        // 2. Handle URL hash tokens (implicit flow)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }

        // Verify session is active
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }

        // If opened inside a popup window, notify the opener and close
        if (typeof window !== 'undefined' && window.opener) {
          try {
            window.opener.postMessage({ type: 'SUPABASE_AUTH_SUCCESS' }, '*');
            setTimeout(() => {
              window.close();
            }, 600);
            return;
          } catch (e) {
            console.warn('Could not postMessage to opener:', e);
          }
        }

        // Navigate to dashboard in main tab
        router.push('/dashboard');
      } catch (err: any) {
        if (isMounted) setErrorMsg(err?.message || 'Authentication failed');
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#E8DCCB] bg-white p-8 text-center shadow-xs">
      <div className="mb-4">
        <Link href="/" className="text-2xl font-bold tracking-tight text-[#1C1917]">
          Cirolink<span className="text-[#C26732]">.</span>
        </Link>
      </div>

      {errorMsg ? (
        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1917]">Authentication Notice</h2>
            <p className="mt-1 text-xs text-[#78716C] leading-relaxed">{errorMsg}</p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-xl bg-[#1C1917] py-2.5 text-xs font-semibold text-white hover:bg-[#2D231E] transition-colors cursor-pointer"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF6F0] text-[#C26732]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1917]">Completing Google Sign In</h2>
            <p className="mt-1 text-xs text-[#78716C] leading-relaxed">
              Verifying your credentials and preparing your dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-3xl border border-[#E8DCCB] bg-white p-8 text-center shadow-xs">
            <Loader2 className="h-6 w-6 animate-spin text-[#C26732] mx-auto mb-2" />
            <p className="text-xs text-[#78716C]">Loading authentication...</p>
          </div>
        }
      >
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
