-- ==============================================================================
-- CIROLINK - WORD COUNTER SAAS SUPABASE POSTGRESQL SCHEMA & RLS
-- Project: https://mfjuxdbpiggvebfeuwth.supabase.co
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/mfjuxdbpiggvebfeuwth
-- 2. Go to the "SQL Editor" in the left navigation sidebar
-- 3. Click "New query", paste the entire contents of this file, and click "Run"
--
-- Supported Features:
-- - User Profiles with credit limits & 30-day reset cycles
-- - Full text analysis history & statistical records
-- - Immutable credit transactions ledger
-- - Row-Level Security (RLS) policies for Email/Password & Google OAuth (Gmail)
-- - Automated 'handle_user_auth_sync' trigger for BOTH register and login
-- - Syncs full details (email, name, Google avatar) to public.profiles table
-- - Allocates 5 free credits on first signup with audit ledger entry
-- - Callable 'sync_user_profile' RPC function
-- - Atomic stored procedure 'deduct_credit_for_analysis' with concurrency lock
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE TABLE: PROFILES
-- Stores user account info, subscription tier, credits, and reset dates
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'pro_plus')),
    credits INTEGER NOT NULL DEFAULT 5 CHECK (credits >= 0),
    max_credits INTEGER NOT NULL DEFAULT 5 CHECK (max_credits >= 0),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete', 'limit_exhausted')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    credits_reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. CREATE TABLE: ANALYSES
-- Stores word count metrics, density analysis, readability scores, and previews
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.analyses (
    id TEXT PRIMARY KEY DEFAULT ('an_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Text Analysis',
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
    average_word_length NUMERIC(5,2) NOT NULL DEFAULT 0,
    average_sentence_length NUMERIC(5,2) NOT NULL DEFAULT 0,
    longest_word TEXT DEFAULT '',
    shortest_word TEXT DEFAULT '',
    reading_time TEXT DEFAULT '0 min',
    speaking_time TEXT DEFAULT '0 min',
    top_words JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. CREATE TABLE: CREDIT_TRANSACTIONS
-- Immutable audit log for credit grants, welcome bonuses, and analysis deductions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id TEXT PRIMARY KEY DEFAULT ('tx_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('signup_bonus', 'analysis_usage', 'subscription_renewal', 'plan_upgrade', 'plan_downgrade')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. PERFORMANCE INDEXES
-- Optimizes queries for dashboard history, user lookups, and transaction logs
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Fully supports Email/Password authentication & Gmail (Google OAuth)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- Analyses Policies
DROP POLICY IF EXISTS "Users can view own analyses" ON public.analyses;
CREATE POLICY "Users can view own analyses"
    ON public.analyses FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
CREATE POLICY "Users can insert own analyses"
    ON public.analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Credit Transactions Policies
DROP POLICY IF EXISTS "Users can view own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own credit transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can insert own credit transactions"
    ON public.credit_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 7. FUNCTION & TRIGGERS: handle_user_auth_sync
-- Automatically executes whenever a user REGISTERS or LOGS IN via Google or Email
-- Automatically saves and syncs user details into the 'profiles' table.
-- Grants 5 free credits on first signup with welcome transaction.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_user_auth_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_avatar_url TEXT;
    v_existing_id UUID;
BEGIN
    -- Extract full name from Google OAuth metadata, signup metadata, or email fallback
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'Cirolink Writer'
    );

    -- Extract avatar URL from Google OAuth (picture) or user metadata
    v_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
    );

    -- Check if profile entry already exists
    SELECT id INTO v_existing_id FROM public.profiles WHERE id = NEW.id;

    IF v_existing_id IS NULL THEN
        -- ON REGISTER (Email or Google OAuth):
        -- Create new profile entry and assign 5 free initial credits
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            avatar_url,
            plan,
            credits,
            max_credits,
            subscription_status,
            credits_reset_at,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            v_full_name,
            v_avatar_url,
            'free',
            5,
            5,
            'active',
            NOW() + INTERVAL '30 days',
            NOW(),
            NOW()
        );

        -- Record welcome credits bonus in credit_transactions ledger
        INSERT INTO public.credit_transactions (
            id,
            user_id,
            amount,
            transaction_type,
            description,
            created_at
        )
        VALUES (
            'tx_welcome_' || replace(NEW.id::text, '-', ''),
            NEW.id,
            5,
            'signup_bonus',
            'Free Plan welcome bonus (5 credits)',
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    ELSE
        -- ON LOGIN (Email or Google OAuth):
        -- Synchronize latest email, full name, and avatar URL from Google into profiles table
        UPDATE public.profiles
        SET 
            email = NEW.email,
            full_name = CASE 
                WHEN v_full_name IS NOT NULL AND v_full_name != '' THEN v_full_name
                ELSE public.profiles.full_name
            END,
            avatar_url = CASE 
                WHEN v_avatar_url IS NOT NULL AND v_avatar_url != '' THEN v_avatar_url
                ELSE public.profiles.avatar_url
            END,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

-- Backwards-compatible alias for handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN public.handle_user_auth_sync();
END;
$$;

-- Attach triggers on auth.users for BOTH registration (INSERT) and login (UPDATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_auth_sync();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_auth_sync();

-- ==============================================================================
-- 8. CALLABLE STORED PROCEDURE: sync_user_profile
-- Allows client apps or API routes to directly sync profile details to Supabase
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.sync_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT DEFAULT '',
    p_avatar_url TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile public.profiles%ROWTYPE;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

    IF NOT FOUND THEN
        -- Insert new profile if not found
        INSERT INTO public.profiles (
            id, email, full_name, avatar_url, plan, credits, max_credits, subscription_status, credits_reset_at
        ) VALUES (
            p_user_id, p_email, COALESCE(p_full_name, split_part(p_email, '@', 1)), COALESCE(p_avatar_url, ''),
            'free', 5, 5, 'active', NOW() + INTERVAL '30 days'
        )
        RETURNING * INTO v_profile;

        INSERT INTO public.credit_transactions (
            id, user_id, amount, transaction_type, description
        ) VALUES (
            'tx_welcome_' || replace(p_user_id::text, '-', ''),
            p_user_id, 5, 'signup_bonus', 'Free Plan welcome bonus (5 credits)'
        )
        ON CONFLICT (id) DO NOTHING;
    ELSE
        -- Update existing profile on login
        UPDATE public.profiles
        SET 
            email = p_email,
            full_name = CASE WHEN p_full_name IS NOT NULL AND p_full_name != '' THEN p_full_name ELSE public.profiles.full_name END,
            avatar_url = CASE WHEN p_avatar_url IS NOT NULL AND p_avatar_url != '' THEN p_avatar_url ELSE public.profiles.avatar_url END,
            updated_at = NOW()
        WHERE id = p_user_id
        RETURNING * INTO v_profile;
    END IF;

    RETURN to_jsonb(v_profile);
END;
$$;

-- ==============================================================================
-- 9. ATOMIC STORED PROCEDURE: deduct_credit_for_analysis
-- Ensures atomic, race-condition-safe credit deduction when analyzing text
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.deduct_credit_for_analysis(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        subscription_status = CASE WHEN credits - 1 <= 0 THEN 'limit_exhausted' ELSE subscription_status END,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO public.credit_transactions (
        id,
        user_id,
        amount,
        transaction_type,
        description,
        created_at
    )
    VALUES (
        'tx_use_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16),
        p_user_id,
        -1,
        'analysis_usage',
        'Word Counter text analysis (-1 credit)',
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'remaining_credits', v_credits - 1,
        'plan', v_plan
    );
END;
$$;
