import fs from 'fs';
import path from 'path';
import { PlanType, SubscriptionStatus, UserProfile, AnalysisRecord, CreditTransaction, TextAnalysisStats } from '@/types';
import { createClient } from '@supabase/supabase-js';

export const PLAN_RANK: Record<PlanType, number> = {
  free: 0,
  pro: 1,
  pro_plus: 2,
};

export const PLAN_LIMITS: Record<PlanType, number> = {
  free: 5,
  pro: 10,
  pro_plus: 15,
};

interface DbSchema {
  users: Record<string, UserProfile>;
  analyses: Record<string, AnalysisRecord[]>;
  transactions: Record<string, CreditTransaction[]>;
}

const DB_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'cirolink_db.json');

function ensureDbFile(): DbSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: DbSchema = { users: {}, analyses: {}, transactions: {} };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DbSchema;
  } catch (err) {
    console.error('Error reading persistent DB file, falling back to memory/tmp:', err);
    return { users: {}, analyses: {}, transactions: {} };
  }
}

function writeDbFile(db: DbSchema) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing persistent DB file:', err);
  }
}

// Optional Supabase sync helper
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')) {
    return createClient(supabaseUrl, supabaseKey);
  }
  return null;
}

/**
 * Retrieve user profile, evaluating legitimate 30-day reset period & locked state.
 */
export async function getServerUser(userId: string, fallbackProfile?: Partial<UserProfile>): Promise<UserProfile> {
  const db = ensureDbFile();
  let user = db.users[userId];

  // If not found in local JSON, check Supabase
  const supabase = getSupabaseAdmin();
  if (!user && supabase) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      user = profile as UserProfile;
    }
  }

  // If still not found, create new user record
  if (!user) {
    const plan: PlanType = fallbackProfile?.plan || 'free';
    const maxCredits = PLAN_LIMITS[plan] || 5;
    user = {
      id: userId,
      email: fallbackProfile?.email || `user_${userId.slice(0, 8)}@cirolink.com`,
      full_name: fallbackProfile?.full_name || 'Cirolink User',
      plan,
      credits: fallbackProfile?.credits !== undefined ? fallbackProfile.credits : maxCredits,
      max_credits: maxCredits,
      subscription_status: (fallbackProfile?.subscription_status as SubscriptionStatus) || (fallbackProfile?.credits === 0 ? 'limit_exhausted' : 'active'),
      credits_reset_at: fallbackProfile?.credits_reset_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: fallbackProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users[userId] = user;
    writeDbFile(db);
  }

  // 1. Check if the legitimate credit-reset period has arrived
  const now = Date.now();
  const resetTime = new Date(user.credits_reset_at).getTime();

  if (now >= resetTime) {
    // Legitimate renewal: restore plan quota and reset status to active
    const planCredits = PLAN_LIMITS[user.plan] || 5;
    user.credits = planCredits;
    user.max_credits = planCredits;
    user.subscription_status = 'active';
    user.credits_reset_at = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
    user.updated_at = new Date().toISOString();

    const renewalTx: CreditTransaction = {
      id: `tx_renewal_${now}`,
      user_id: user.id,
      amount: planCredits,
      transaction_type: 'subscription_renewal',
      description: `Legitimate monthly credit reset for ${user.plan.toUpperCase()} plan (+${planCredits} credits)`,
      created_at: new Date().toISOString(),
    };

    if (!db.transactions[user.id]) db.transactions[user.id] = [];
    db.transactions[user.id].unshift(renewalTx);
    db.users[user.id] = user;
    writeDbFile(db);

    if (supabase) {
      await supabase.from('profiles').update(user).eq('id', user.id);
      await supabase.from('credit_transactions').insert([renewalTx]);
    }
  } else {
    // 2. Persistent status enforcement: If credits <= 0, ensure status is strictly 'limit_exhausted'
    if (user.credits <= 0 && user.subscription_status !== 'limit_exhausted') {
      user.credits = 0;
      user.subscription_status = 'limit_exhausted';
      user.updated_at = new Date().toISOString();
      db.users[user.id] = user;
      writeDbFile(db);
      if (supabase) {
        await supabase.from('profiles').update({ subscription_status: 'limit_exhausted', credits: 0 }).eq('id', user.id);
      }
    }
  }

  return user;
}

/**
 * Deduct a credit server-side for text analysis with persistent limit locking.
 */
export async function deductCreditOnServer(
  userId: string,
  title: string,
  rawText: string,
  stats: TextAnalysisStats,
  userFallback?: Partial<UserProfile>
): Promise<{ user: UserProfile; remainingCredits: number; recordId: string }> {
  const db = ensureDbFile();
  const user = await getServerUser(userId, userFallback);

  // STRICT SERVER-SIDE ENFORCEMENT:
  // If user's credits are exhausted or status is limit_exhausted, block execution!
  if (user.subscription_status === 'limit_exhausted' || user.credits <= 0) {
    // Ensure persisted state is locked
    user.credits = 0;
    user.subscription_status = 'limit_exhausted';
    db.users[user.id] = user;
    writeDbFile(db);

    const error: any = new Error(
      `Credit limit exhausted (${user.credits}/${user.max_credits} credits remaining on ${user.plan.toUpperCase()} plan). An upgrade is required to continue. Downgrading will not restore credits.`
    );
    error.code = 'LIMIT_EXHAUSTED';
    error.status = 403;
    error.user = user;
    throw error;
  }

  // Deduct 1 credit atomically
  const newCredits = user.credits - 1;
  user.credits = newCredits;

  // If this analysis exhausted the credits, lock the account status to 'limit_exhausted'
  if (newCredits <= 0) {
    user.credits = 0;
    user.subscription_status = 'limit_exhausted';
  } else {
    user.subscription_status = 'active';
  }
  user.updated_at = new Date().toISOString();

  // Create persistent records
  const recordId = `an_${Date.now()}`;
  const preview = rawText.slice(0, 160) + (rawText.length > 160 ? '...' : '');

  const analysisRecord: AnalysisRecord = {
    id: recordId,
    user_id: user.id,
    title: title || 'Text Analysis',
    text_preview: preview,
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

  const usageTx: CreditTransaction = {
    id: `tx_${Date.now()}`,
    user_id: user.id,
    amount: -1,
    transaction_type: 'analysis_usage',
    description: `Analysis: ${analysisRecord.title} (${stats.words} words)`,
    created_at: new Date().toISOString(),
  };

  // Save to persistent database
  db.users[user.id] = user;
  if (!db.analyses[user.id]) db.analyses[user.id] = [];
  db.analyses[user.id].unshift(analysisRecord);

  if (!db.transactions[user.id]) db.transactions[user.id] = [];
  db.transactions[user.id].unshift(usageTx);

  writeDbFile(db);

  // Sync to Supabase if available
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      await supabase.from('profiles').update({
        credits: user.credits,
        subscription_status: user.subscription_status,
        updated_at: user.updated_at,
      }).eq('id', user.id);
      await supabase.from('analyses').insert([analysisRecord]);
      await supabase.from('credit_transactions').insert([usageTx]);
    } catch (err) {
      console.error('Supabase write error:', err);
    }
  }

  return {
    user,
    remainingCredits: user.credits,
    recordId,
  };
}

/**
 * Handle persistent plan changes (Upgrade vs Downgrade).
 * SPEC: If user downgrades to a lower plan, DO NOT reset or restore their exhausted credits.
 * Keep account locked until next legitimate reset period or until upgrading again.
 */
export async function changePlanOnServer(
  userId: string,
  targetPlan: PlanType,
  userFallback?: Partial<UserProfile>
): Promise<{ user: UserProfile; action: 'upgraded' | 'downgraded' | 'unchanged'; message: string }> {
  const db = ensureDbFile();
  const user = await getServerUser(userId, userFallback);

  const currentRank = PLAN_RANK[user.plan] ?? 0;
  const targetRank = PLAN_RANK[targetPlan] ?? 0;
  const targetMaxCredits = PLAN_LIMITS[targetPlan] || 5;

  if (targetPlan === user.plan) {
    return {
      user,
      action: 'unchanged',
      message: `You are already on the ${targetPlan.toUpperCase()} plan.`,
    };
  }

  const now = new Date().toISOString();

  // CASE 1: UPGRADE (targetRank > currentRank)
  if (targetRank > currentRank) {
    user.plan = targetPlan;
    user.max_credits = targetMaxCredits;
    // When upgrading, allot the new plan's full quota and unlock the account!
    user.credits = targetMaxCredits;
    user.subscription_status = 'active';
    user.updated_at = now;

    const upgradeTx: CreditTransaction = {
      id: `tx_upgrade_${Date.now()}`,
      user_id: user.id,
      amount: targetMaxCredits,
      transaction_type: 'plan_upgrade',
      description: `Upgraded to ${targetPlan.toUpperCase()} plan (+${targetMaxCredits} credits, account unlocked)`,
      created_at: now,
    };

    if (!db.transactions[user.id]) db.transactions[user.id] = [];
    db.transactions[user.id].unshift(upgradeTx);
    db.users[user.id] = user;
    writeDbFile(db);

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from('profiles').update(user).eq('id', user.id);
      await supabase.from('credit_transactions').insert([upgradeTx]);
    }

    return {
      user,
      action: 'upgraded',
      message: `Upgraded to ${targetPlan.toUpperCase()}! You received ${targetMaxCredits} credits and your account is active.`,
    };
  }

  // CASE 2: DOWNGRADE (targetRank < currentRank)
  // SPEC REQUIREMENT:
  // "If the user later downgrades to a lower plan, do not reset or restore their exhausted credits.
  // Keep the account locked until the next legitimate credit-reset period or until the user upgrades again."
  user.plan = targetPlan;
  user.max_credits = targetMaxCredits;
  user.updated_at = now;

  // If the user's credits are already exhausted or status is limit_exhausted, DO NOT RESTORE:
  if (user.subscription_status === 'limit_exhausted' || user.credits <= 0) {
    user.credits = 0;
    user.subscription_status = 'limit_exhausted';
  } else {
    // If they had credits left, clamp to the lower plan max credits
    user.credits = Math.min(user.credits, targetMaxCredits);
  }

  const downgradeTx: CreditTransaction = {
    id: `tx_downgrade_${Date.now()}`,
    user_id: user.id,
    amount: 0,
    transaction_type: 'subscription_renewal',
    description: `Downgraded to ${targetPlan.toUpperCase()} plan. Exhausted credits not restored; account locked until next reset period (${new Date(user.credits_reset_at).toLocaleDateString()}).`,
    created_at: now,
  };

  if (!db.transactions[user.id]) db.transactions[user.id] = [];
  db.transactions[user.id].unshift(downgradeTx);
  db.users[user.id] = user;
  writeDbFile(db);

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from('profiles').update(user).eq('id', user.id);
    await supabase.from('credit_transactions').insert([downgradeTx]);
  }

  const resetFormatted = new Date(user.credits_reset_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    user,
    action: 'downgraded',
    message: user.subscription_status === 'limit_exhausted'
      ? `Downgraded to ${targetPlan.toUpperCase()} plan. Your exhausted credits were NOT restored. Account remains locked until the legitimate reset on ${resetFormatted}, or until you upgrade.`
      : `Downgraded to ${targetPlan.toUpperCase()} plan. Next quota reset on ${resetFormatted}.`,
  };
}

/**
 * Fetch analysis history and credit transactions from server store.
 */
export async function getServerUserData(userId: string) {
  const db = ensureDbFile();
  return {
    analyses: db.analyses[userId] || [],
    transactions: db.transactions[userId] || [],
  };
}
