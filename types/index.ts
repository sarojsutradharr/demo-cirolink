export type PlanType = 'free' | 'pro' | 'pro_plus';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete' | 'limit_exhausted';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  plan: PlanType;
  credits: number;
  max_credits: number;
  subscription_status: SubscriptionStatus;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  credits_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface WordFrequencyItem {
  word: string;
  count: number;
  percentage: number;
}

export interface TextAnalysisStats {
  // Basic Statistics
  words: number;
  characters: number;
  charactersNoSpaces: number;
  letters: number;
  numbers: number;
  spaces: number;
  punctuation: number;
  sentences: number;
  paragraphs: number;
  lines: number;

  // Additional Statistics
  avgWordLength: number;
  avgSentenceLength: number;
  longestWord: string;
  shortestWord: string;
  uniqueWords: number;
  repeatedWords: number;
  readingTimeMinutes: number;
  readingTimeDisplay: string;
  speakingTimeMinutes: number;
  speakingTimeDisplay: string;

  // Frequency
  frequency: WordFrequencyItem[];
}

export interface AnalysisRecord {
  id: string;
  user_id: string;
  title: string;
  text_preview: string;
  word_count: number;
  character_count: number;
  character_count_no_spaces: number;
  letter_count: number;
  number_count: number;
  space_count: number;
  punctuation_count: number;
  sentence_count: number;
  paragraph_count: number;
  line_count: number;
  unique_word_count: number;
  average_word_length: number;
  average_sentence_length: number;
  longest_word: string;
  shortest_word: string;
  reading_time: string;
  speaking_time: string;
  created_at: string;
  top_words?: WordFrequencyItem[];
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'signup_bonus' | 'analysis_usage' | 'subscription_renewal' | 'plan_upgrade' | 'plan_downgrade';
  description: string;
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  id: PlanType;
  name: string;
  price: number;
  priceDisplay: string;
  billingPeriod: string;
  credits: number;
  headline: string;
  description: string;
  features: string[];
  stripePriceId?: string;
  popular?: boolean;
  ctaText: string;
}
