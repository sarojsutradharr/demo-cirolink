import { PricingPlan, PlanType } from '@/types';

export const PRICING_PLANS: Record<string, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '$0',
    billingPeriod: '/month',
    credits: 5,
    headline: 'For occasional writers & quick checks',
    description: 'Essential text analytics and statistics to elevate your writing precision.',
    ctaText: 'Get Started Free',
    features: [
      '5 text analyses per month',
      'Word, character & sentence breakdown',
      'Reading & speaking time estimates',
      'Basic word frequency list',
      'File upload (.txt, .md, .csv)',
      '30-day analysis history'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 2,
    priceDisplay: '$2',
    billingPeriod: '/month',
    credits: 10,
    headline: 'For authors, bloggers & content creators',
    description: 'Double the analysis power with advanced metrics and priority processing.',
    ctaText: 'Upgrade to Pro',
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_cirolink_pro_monthly',
    features: [
      '10 text analyses per month',
      'Everything in Free plan',
      'Complete word frequency distribution',
      'Stop-words filtering & vocabulary metrics',
      'Export results as JSON & CSV',
      'Extended analysis history & exports',
      'Stripe customer billing portal access'
    ]
  },
  pro_plus: {
    id: 'pro_plus',
    name: 'Pro Plus',
    price: 4,
    priceDisplay: '$4',
    billingPeriod: '/month',
    credits: 15,
    headline: 'For professional editors & high-volume teams',
    description: 'Maximum credit allocation for heavy editorial and publishing workflows.',
    ctaText: 'Upgrade to Pro Plus',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID || 'price_cirolink_pro_plus_monthly',
    features: [
      '15 text analyses per month',
      'Everything in Pro plan',
      'Highest priority processing',
      'Complete lexical diversity analytics',
      'Full history retention with batch export',
      'Stripe customer billing portal access',
      'Dedicated email support'
    ]
  }
};

export const PLAN_CREDITS: Record<string, number> = {
  free: 5,
  pro: 10,
  pro_plus: 15
};

export const PLAN_TIER_ORDER: Record<PlanType, number> = {
  free: 0,
  pro: 1,
  pro_plus: 2
};
