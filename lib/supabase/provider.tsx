'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, AnalysisRecord, CreditTransaction, PlanType, TextAnalysisStats } from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from './client';
import { PLAN_CREDITS, PLAN_TIER_ORDER } from '../stripe/plans';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  analyses: AnalysisRecord[];
  transactions: CreditTransaction[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; url?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  consumeCreditForAnalysis: (
    stats: TextAnalysisStats,
    title: string,
    rawTextPreview: string
  ) => Promise<{ success: boolean; remainingCredits: number; error?: string; recordId?: string }>;
  deleteAnalysis: (id: string) => Promise<boolean>;
  deleteMultipleAnalyses: (ids: string[]) => Promise<boolean>;
  clearAllAnalyses: () => Promise<boolean>;
  upgradePlanMock: (targetPlan: PlanType) => Promise<{ success: boolean; isUpgrade: boolean; message: string; remainingCredits: number }>;
  resetCreditsByTimeline: () => Promise<{ success: boolean; message: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'cirolink_user_profile';
const LOCAL_STORAGE_ANALYSES_KEY = 'cirolink_user_analyses';
const LOCAL_STORAGE_TRANSACTIONS_KEY = 'cirolink_credit_transactions';

const INITIAL_DEMO_USER: UserProfile = {
  id: 'usr_cirolink_demo_01',
  email: 'writer@cirolink.com',
  full_name: 'Alex Rivera',
  avatar_url: '',
  plan: 'free',
  credits: 5,
  max_credits: 5,
  subscription_status: 'active',
  credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const INITIAL_DEMO_ANALYSES: AnalysisRecord[] = [
  {
    id: 'an_demo_01',
    user_id: 'usr_cirolink_demo_01',
    title: 'Editorial Essay on Digital Distraction',
    text_preview: 'In an era where cognitive depth has become our rarest currency, the ability to protect uninterrupted concentration is no longer a luxury...',
    word_count: 842,
    character_count: 5120,
    character_count_no_spaces: 4310,
    letter_count: 4210,
    number_count: 14,
    space_count: 810,
    punctuation_count: 86,
    sentence_count: 48,
    paragraph_count: 6,
    line_count: 24,
    unique_word_count: 360,
    average_word_length: 5.1,
    average_sentence_length: 17.5,
    longest_word: 'uninterrupted',
    shortest_word: 'in',
    reading_time: '3 min 45s',
    speaking_time: '6 min 28s',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    top_words: [
      { word: 'attention', count: 18, percentage: 2.1 },
      { word: 'digital', count: 14, percentage: 1.6 },
      { word: 'focus', count: 11, percentage: 1.3 },
      { word: 'work', count: 9, percentage: 1.1 }
    ]
  },
  {
    id: 'an_demo_02',
    user_id: 'usr_cirolink_demo_01',
    title: 'Product Launch Announcement Press Release',
    text_preview: 'Cirolink today revealed its next-generation language and density inspection platform designed specifically for demanding editorial teams...',
    word_count: 412,
    character_count: 2680,
    character_count_no_spaces: 2280,
    letter_count: 2210,
    number_count: 8,
    space_count: 400,
    punctuation_count: 62,
    sentence_count: 22,
    paragraph_count: 4,
    line_count: 16,
    unique_word_count: 215,
    average_word_length: 5.4,
    average_sentence_length: 18.7,
    longest_word: 'next-generation',
    shortest_word: 'its',
    reading_time: '1 min 50s',
    speaking_time: '3 min 10s',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    top_words: [
      { word: 'cirolink', count: 8, percentage: 1.9 },
      { word: 'platform', count: 6, percentage: 1.4 },
      { word: 'text', count: 5, percentage: 1.2 }
    ]
  }
];

const INITIAL_DEMO_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'tx_demo_01',
    user_id: 'usr_cirolink_demo_01',
    amount: 5,
    transaction_type: 'signup_bonus',
    description: 'Free Plan monthly credit allotment',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx_demo_02',
    user_id: 'usr_cirolink_demo_01',
    amount: -1,
    transaction_type: 'analysis_usage',
    description: 'Word count analysis: Editorial Essay on Digital Distraction',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx_demo_03',
    user_id: 'usr_cirolink_demo_01',
    amount: -1,
    transaction_type: 'analysis_usage',
    description: 'Word count analysis: Product Launch Announcement',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize data from Supabase or localStorage
  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function loadUserData(userId: string, userEmail?: string, userFullName?: string, userAvatarUrl?: string) {
      if (!supabase) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profile) {
          const maxCredits = PLAN_CREDITS[profile.plan as PlanType] || 5;

          // Check if Google OAuth or login provides updated/missing name or avatar details
          const nameToUpdate = userFullName && (!profile.full_name || profile.full_name === 'Cirolink Writer') ? userFullName : profile.full_name;
          const avatarToUpdate = userAvatarUrl && !profile.avatar_url ? userAvatarUrl : profile.avatar_url;
          const emailToUpdate = userEmail && profile.email !== userEmail ? userEmail : profile.email;

          if (nameToUpdate !== profile.full_name || avatarToUpdate !== profile.avatar_url || emailToUpdate !== profile.email) {
            try {
              await supabase
                .from('profiles')
                .update({
                  email: emailToUpdate,
                  full_name: nameToUpdate,
                  avatar_url: avatarToUpdate,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', userId);
              profile.email = emailToUpdate;
              profile.full_name = nameToUpdate;
              profile.avatar_url = avatarToUpdate;
            } catch (syncErr) {
              console.warn('Error syncing profile updates:', syncErr);
            }
          }

          if (isMounted) setUser({ ...profile, max_credits: maxCredits });
        } else {
          // Provision initial profile on the fly if trigger didn't run
          const newProfile: UserProfile = {
            id: userId,
            email: userEmail || 'user@cirolink.com',
            full_name: userFullName || userEmail?.split('@')[0] || 'Cirolink Writer',
            avatar_url: userAvatarUrl || '',
            plan: 'free',
            credits: 5,
            max_credits: 5,
            subscription_status: 'active',
            credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          try {
            await supabase.from('profiles').upsert([newProfile]);
            await supabase.from('credit_transactions').insert([{
              id: `tx_welcome_${userId.replace(/-/g, '').slice(0, 16)}`,
              user_id: userId,
              amount: 5,
              transaction_type: 'signup_bonus',
              description: 'Free Plan welcome bonus (5 credits)',
              created_at: new Date().toISOString(),
            }]);
          } catch {}
          if (isMounted) setUser(newProfile);
        }

        const { data: userAnalyses } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (userAnalyses && isMounted) {
          setAnalyses(userAnalyses);
        }

        const { data: userTxs } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (userTxs && isMounted) {
          setTransactions(userTxs);
        }
      } catch (err) {
        console.warn('Supabase data load error:', err);
      }
    }

    async function init() {
      setIsLoading(true);

      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const fullName = (meta.full_name || meta.name || '') as string;
            const avatarUrl = (meta.avatar_url || meta.picture || '') as string;
            await loadUserData(session.user.id, session.user.email, fullName, avatarUrl);
          } else {
            if (isMounted) setUser(null);
          }
        } catch (err) {
          console.warn('Could not connect to live Supabase, falling back to local state:', err);
        }
      } else {
        // Local preview fallback
        try {
          const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setUser(null);
          }

          const savedAnalyses = localStorage.getItem(LOCAL_STORAGE_ANALYSES_KEY);
          if (savedAnalyses) {
            setAnalyses(JSON.parse(savedAnalyses));
          } else {
            setAnalyses([]);
          }

          const savedTxs = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
          if (savedTxs) {
            setTransactions(JSON.parse(savedTxs));
          } else {
            setTransactions([]);
          }
        } catch (storageErr) {
          console.warn('Storage read error:', storageErr);
          setUser(null);
        }
      }

      if (isMounted) setIsLoading(false);
    }

    init();

    // Listen for auth state changes (sign in, sign out, token refresh)
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_IN' && session?.user) {
          const meta = session.user.user_metadata || {};
          const fullName = (meta.full_name || meta.name || '') as string;
          const avatarUrl = (meta.avatar_url || meta.picture || '') as string;
          await loadUserData(session.user.id, session.user.email, fullName, avatarUrl);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAnalyses([]);
          setTransactions([]);
          try {
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          } catch {}
        }
      });
      authListener = data;
    }

    // Also listen for popup postMessage events from /auth/callback
    const handlePopupMessage = async (event: MessageEvent) => {
      if (!isMounted || !supabase) return;
      if (event.data?.type === 'SUPABASE_AUTH_SUCCESS') {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const fullName = (meta.full_name || meta.name || '') as string;
            const avatarUrl = (meta.avatar_url || meta.picture || '') as string;
            await loadUserData(session.user.id, session.user.email, fullName, avatarUrl);
          }
        } catch (err) {
          console.warn('Session refresh from message error:', err);
        }
      }
    };

    window.addEventListener('message', handlePopupMessage);

    return () => {
      isMounted = false;
      window.removeEventListener('message', handlePopupMessage);
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Save changes to localStorage when in preview mode
  useEffect(() => {
    if (!isSupabaseConfigured && user) {
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured && analyses.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_ANALYSES_KEY, JSON.stringify(analyses));
      } catch (e) {
        console.error(e);
      }
    }
  }, [analyses]);

  useEffect(() => {
    if (!isSupabaseConfigured && transactions.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
      } catch (e) {
        console.error(e);
      }
    }
  }, [transactions]);

  const login = useCallback(async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        const { data: profile } = await supabase.from('profiles').select('*').single();
        if (profile) {
          const maxCredits = PLAN_CREDITS[profile.plan as PlanType] || 5;
          setUser({ ...profile, max_credits: maxCredits });
        }
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed';
        return { success: false, error: message };
      }
    }

    // Local authentication fallback
    const localUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: email || 'user@cirolink.com',
      full_name: email.split('@')[0] || 'Cirolink Writer',
      plan: 'free',
      credits: 5,
      max_credits: 5,
      subscription_status: 'active',
      credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(localUser);
    return { success: true };
  }, []);

  const signup = useCallback(async (email: string, password = '', fullName = ''): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Signup failed';
        return { success: false, error: message };
      }
    }

    // Local signup
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      full_name: fullName || email.split('@')[0],
      plan: 'free',
      credits: 5,
      max_credits: 5,
      subscription_status: 'active',
      credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const welcomeTx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      user_id: newUser.id,
      amount: 5,
      transaction_type: 'signup_bonus',
      description: 'Free Plan welcome credits allotment',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    setTransactions((prev) => [welcomeTx, ...prev]);
    return { success: true };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string; url?: string }> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
        const isIframe = typeof window !== 'undefined' && window.self !== window.top;

        if (isIframe) {
          // Open popup window SYNCHRONOUSLY before the async operation
          // This keeps the user click gesture active so browser popup blockers do NOT block the window!
          let popup: Window | null = null;
          try {
            popup = window.open('about:blank', 'google_oauth_popup', 'width=520,height=650,scrollbars=yes,status=no,toolbar=no');
            if (popup) {
              popup.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <title>Connecting to Google...</title>
                    <style>
                      body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAF6F0; color: #1C1917; text-align: center; }
                      .box { background: white; padding: 24px; border-radius: 16px; border: 1px solid #E8DCCB; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); max-width: 320px; }
                      .spinner { width: 28px; height: 28px; border: 3px solid #E8DCCB; border-top-color: #C26732; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px; }
                      @keyframes spin { to { transform: rotate(360deg); } }
                    </style>
                  </head>
                  <body>
                    <div class="box">
                      <div class="spinner"></div>
                      <h4 style="margin: 0 0 6px;">Opening Google Sign-In</h4>
                      <p style="margin: 0; font-size: 13px; color: #78716C;">Please select your Google account...</p>
                    </div>
                  </body>
                </html>
              `);
            }
          } catch (e) {
            console.warn('Could not open blank popup synchronously:', e);
          }

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              skipBrowserRedirect: true,
            },
          });

          if (error) {
            if (popup && !popup.closed) popup.close();
            return { success: false, error: error.message };
          }

          if (data?.url) {
            if (popup && !popup.closed) {
              popup.location.href = data.url;
              return { success: true, url: data.url };
            } else {
              // If popup was blocked or closed, try window.open directly or provide url
              try {
                window.open(data.url, '_blank');
              } catch {}
              return { success: true, url: data.url };
            }
          }
          return { success: true };
        } else {
          // Standard browser top-level flow
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
            },
          });
          if (error) return { success: false, error: error.message };
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google authentication failed';
        return { success: false, error: message };
      }
    }

    // Local authentication fallback for Google sign in
    const googleUser: UserProfile = {
      id: `usr_google_${Date.now()}`,
      email: 'alex.author@gmail.com',
      full_name: 'Alex Rivera (Google)',
      plan: 'free',
      credits: 5,
      max_credits: 5,
      subscription_status: 'active',
      credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(googleUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(googleUser));
    } catch {}
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    } catch {}
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/settings`,
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Password recovery email sent. Please check your inbox.' };
    }
    return { success: true, message: `Password reset instructions sent to ${email} (Demo Mode).` };
  }, []);

  // Atomic credit consumption and analysis recording
  const consumeCreditForAnalysis = useCallback(
    async (
      stats: TextAnalysisStats,
      title: string,
      rawTextPreview: string
    ): Promise<{ success: boolean; remainingCredits: number; error?: string; recordId?: string }> => {
      if (!user) {
        return { success: false, remainingCredits: 0, error: 'Please sign in to analyze text.' };
      }

      if (user.credits <= 0) {
        return {
          success: false,
          remainingCredits: 0,
          error: "You've used all your monthly credits. Upgrade your plan to continue analyzing text.",
        };
      }

      const supabase = getSupabaseClient();
      const newCreditBalance = user.credits - 1;

      const recordId = `an_${Date.now()}`;
      const newRecord: AnalysisRecord = {
        id: recordId,
        user_id: user.id,
        title: title || 'Text Analysis',
        text_preview: rawTextPreview.slice(0, 160) + (rawTextPreview.length > 160 ? '...' : ''),
        word_count: stats.words,
        character_count: stats.characters,
        character_count_no_spaces: stats.charactersNoSpaces,
        letter_count: stats.letters,
        number_count: stats.numbers,
        space_count: stats.spaces,
        punctuation_count: stats.punctuation,
        sentence_count: stats.sentences,
        paragraph_count: stats.paragraphs,
        line_count: stats.lines,
        unique_word_count: stats.uniqueWords,
        average_word_length: stats.avgWordLength,
        average_sentence_length: stats.avgSentenceLength,
        longest_word: stats.longestWord,
        shortest_word: stats.shortestWord,
        reading_time: stats.readingTimeDisplay,
        speaking_time: stats.speakingTimeDisplay,
        created_at: new Date().toISOString(),
        top_words: stats.frequency.slice(0, 5),
      };

      const newTx: CreditTransaction = {
        id: `tx_${Date.now()}`,
        user_id: user.id,
        amount: -1,
        transaction_type: 'analysis_usage',
        description: `Analysis: ${newRecord.title} (${stats.words} words)`,
        created_at: new Date().toISOString(),
      };

      if (supabase) {
        try {
          // Call stored procedure or direct update
          const { error: rpcErr } = await supabase.rpc('deduct_credit_for_analysis', {
            p_user_id: user.id,
          });

          if (rpcErr) {
            // Fallback to direct table query
            await supabase
              .from('profiles')
              .update({ credits: newCreditBalance })
              .eq('id', user.id);
          }

          await supabase.from('analyses').insert([newRecord]);
          await supabase.from('credit_transactions').insert([newTx]);
        } catch (dbErr) {
          console.error('Supabase write error:', dbErr);
        }
      }

      // Update state
      setUser((prev) => (prev ? { ...prev, credits: newCreditBalance } : null));
      setAnalyses((prev) => [newRecord, ...prev]);
      setTransactions((prev) => [newTx, ...prev]);

      return {
        success: true,
        remainingCredits: newCreditBalance,
        recordId,
      };
    },
    [user]
  );

  const deleteAnalysis = useCallback(
    async (id: string): Promise<boolean> => {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('analyses').delete().eq('id', id);
        } catch (err) {
          console.error('Supabase delete error:', err);
        }
      }
      setAnalyses((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        try {
          localStorage.setItem(LOCAL_STORAGE_ANALYSES_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return true;
    },
    []
  );

  const deleteMultipleAnalyses = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (!ids || ids.length === 0) return true;
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('analyses').delete().in('id', ids);
        } catch (err) {
          console.error('Supabase batch delete error:', err);
        }
      }
      setAnalyses((prev) => {
        const idSet = new Set(ids);
        const updated = prev.filter((a) => !idSet.has(a.id));
        try {
          localStorage.setItem(LOCAL_STORAGE_ANALYSES_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return true;
    },
    []
  );

  const clearAllAnalyses = useCallback(
    async (): Promise<boolean> => {
      const supabase = getSupabaseClient();
      if (supabase && user) {
        try {
          await supabase.from('analyses').delete().eq('user_id', user.id);
        } catch (err) {
          console.error('Supabase clear history error:', err);
        }
      }
      setAnalyses(() => {
        try {
          localStorage.setItem(LOCAL_STORAGE_ANALYSES_KEY, JSON.stringify([]));
        } catch {}
        return [];
      });
      return true;
    },
    [user]
  );

  const upgradePlanMock = useCallback(
    async (targetPlan: PlanType): Promise<{ success: boolean; isUpgrade: boolean; message: string; remainingCredits: number }> => {
      const currentTier = user ? (PLAN_TIER_ORDER[user.plan] ?? 0) : 0;
      const targetTier = PLAN_TIER_ORDER[targetPlan] ?? 0;
      const isUpgrade = targetTier > currentTier;
      const targetPlanMaxCredits = PLAN_CREDITS[targetPlan] || 5;

      let newCredits = targetPlanMaxCredits;
      let txDescription = '';

      if (isUpgrade) {
        // Upgrading to a higher tier adds full plan credits
        newCredits = targetPlanMaxCredits;
        txDescription = `Upgraded subscription to ${targetPlan.toUpperCase()} plan (+${targetPlanMaxCredits} credits)`;
      } else {
        // DOWNGRADE RULE: DO NOT RESET OR RESTORE THE CREDIT LIMIT!
        // When limit is exhausted (credits <= 0), it stays 0.
        // If user had leftover credits, it is capped at target plan max.
        const currentCredits = user?.credits ?? 0;
        newCredits = currentCredits <= 0 ? 0 : Math.min(currentCredits, targetPlanMaxCredits);
        txDescription = `Downgraded subscription to ${targetPlan.toUpperCase()} plan. Credit limit was not restored (${newCredits} credits remaining). Upgrade required to replenish credits.`;
      }

      const tx: CreditTransaction = {
        id: `tx_${Date.now()}`,
        user_id: user?.id || 'usr_demo',
        amount: isUpgrade ? targetPlanMaxCredits : 0,
        transaction_type: isUpgrade ? 'plan_upgrade' : 'plan_downgrade',
        description: txDescription,
        created_at: new Date().toISOString(),
      };

      const updated: UserProfile | null = user
        ? {
            ...user,
            plan: targetPlan,
            credits: newCredits,
            max_credits: targetPlanMaxCredits,
            subscription_status: 'active' as const,
            updated_at: new Date().toISOString(),
          }
        : null;

      if (updated) {
        setUser(updated);
        try {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
        } catch {}
      }

      setTransactions((prev) => [tx, ...prev]);

      const message = isUpgrade
        ? `Upgraded to ${targetPlan.toUpperCase()} plan! You received ${targetPlanMaxCredits} credits.`
        : newCredits <= 0
        ? `Switched to ${targetPlan.toUpperCase()} plan. Note: Credit limit is not restored on downgrade. Your account still has 0 credits. Please upgrade to a higher tier plan to replenish credits.`
        : `Switched to ${targetPlan.toUpperCase()} plan with ${newCredits} remaining credits.`;

      return {
        success: true,
        isUpgrade,
        message,
        remainingCredits: newCredits,
      };
    },
    [user]
  );

  const resetCreditsByTimeline = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Please sign in to view and reset credit timeline.' };
    }

    const planCredits = PLAN_CREDITS[user.plan] || 5;
    const nextReset = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const updated: UserProfile = {
      ...user,
      credits: planCredits,
      max_credits: planCredits,
      credits_reset_at: nextReset,
      updated_at: new Date().toISOString(),
    };

    const tx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      user_id: user.id,
      amount: planCredits,
      transaction_type: 'subscription_renewal',
      description: `Pricing Timeline Renewal: ${user.plan.toUpperCase()} plan credits renewed to ${planCredits}.`,
      created_at: new Date().toISOString(),
    };

    setUser(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    } catch {}
    setTransactions((prev) => [tx, ...prev]);

    return {
      success: true,
      message: `Pricing timeline reached! Your ${user.plan.toUpperCase()} plan credit limit has been renewed to ${planCredits} credits. Next reset scheduled in 30 days.`,
    };
  }, [user]);

  const refreshProfile = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase && user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        const maxCredits = PLAN_CREDITS[profile.plan as PlanType] || 5;
        setUser({ ...profile, max_credits: maxCredits });
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured: isSupabaseConfigured,
        analyses,
        transactions,
        login,
        signup,
        signInWithGoogle,
        logout,
        resetPassword,
        consumeCreditForAnalysis,
        deleteAnalysis,
        deleteMultipleAnalyses,
        clearAllAnalyses,
        upgradePlanMock,
        resetCreditsByTimeline,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseProvider');
  }
  return context;
}
