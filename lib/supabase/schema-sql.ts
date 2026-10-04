export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- CIROLINK.COM - WORD COUNTER SAAS DATABASE SCHEMA & ROW LEVEL SECURITY
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    avatar_url TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'pro_plus')),
    credits INTEGER NOT NULL DEFAULT 5 CHECK (credits >= 0),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    credits_reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create ANALYSES table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Text Analysis',
    text_preview TEXT,
    word_count INTEGER NOT NULL DEFAULT 0,
    character_count INTEGER NOT NULL DEFAULT 0,
    character_count_no_spaces INTEGER NOT NULL DEFAULT 0,
    letter_count INTEGER NOT NULL DEFAULT 0,
    number_count INTEGER NOT NULL DEFAULT 0,
    space_count INTEGER NOT NULL DEFAULT 0,
    punctuation_count INTEGER NOT NULL DEFAULT 0,
    sentence_count INTEGER NOT NULL DEFAULT 0,
    paragraph_count INTEGER NOT NULL DEFAULT 0,
    line_count INTEGER NOT NULL DEFAULT 0,
    unique_word_count INTEGER NOT NULL DEFAULT 0,
    average_word_length NUMERIC(5,2) DEFAULT 0,
    average_sentence_length NUMERIC(5,2) DEFAULT 0,
    longest_word TEXT DEFAULT '',
    shortest_word TEXT DEFAULT '',
    reading_time TEXT DEFAULT '0 min',
    speaking_time TEXT DEFAULT '0 min',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create SUBSCRIPTIONS table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'pro_plus')),
    status TEXT NOT NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create CREDIT_TRANSACTIONS table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('signup_bonus', 'analysis_usage', 'subscription_renewal', 'plan_upgrade')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own basic profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own analyses" ON public.analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON public.analyses FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, plan, credits, subscription_status, credits_reset_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'free',
        5,
        'active',
        NOW() + INTERVAL '30 days'
    );

    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
    VALUES (
        NEW.id,
        5,
        'signup_bonus',
        'Free Plan initial welcome credits (5 credits)'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ATOMIC STORED PROCEDURE
CREATE OR REPLACE FUNCTION public.deduct_credit_for_analysis(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_credits INT;
    v_plan TEXT;
BEGIN
    SELECT credits, plan INTO v_credits, v_plan
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;

    IF v_credits <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits. Upgrade to continue.');
    END IF;

    UPDATE public.profiles
    SET credits = credits - 1,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
    VALUES (
        p_user_id,
        -1,
        'analysis_usage',
        'Word Counter text analysis (-1 credit)'
    );

    RETURN jsonb_build_object(
        'success', true,
        'remaining_credits', v_credits - 1,
        'plan', v_plan
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;
