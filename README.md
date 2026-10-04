# Cirolink.com — SaaS Word Counter & Text Analyzer

**Cirolink.com** is a modern, production-ready SaaS web application featuring a powerful **Word Counter and Text Analyzer**. Writers, editors, journalists, and publishing teams can upload or paste text and receive instant structural, lexical, and pacing intelligence.

Designed with an elegant cream-based palette (`#F7F1E8`), distraction-free typography, and a credit-based subscription model.

---

## Features

- **Deep Text Statistics**:
  - Words, characters (with and without spaces), letters, numbers, spaces, punctuation marks, sentences, lines, and paragraphs.
  - Vocabulary metrics: average word length, average sentence length, unique words, repeated words, longest word, shortest word.
  - Reading time (calibrated to standard 225 wpm) and speaking time (calibrated to 130 wpm).
- **Word Frequency Distribution**:
  - Ranked term frequency table with percentage shares.
  - Stop-words filter toggle to isolate substantive vocabulary.
  - Visual distribution bar charts and live search.
- **File Upload Support**:
  - Drag-and-drop or select `.txt`, `.md`, and `.csv` files up to 5MB.
  - Local client-side processing for instant parsing and privacy.
- **Reliable Credit System**:
  - **1 analysis = 1 credit**.
  - New users automatically receive **5 monthly credits** on the Free tier.
  - Real-time credit deduction with zero-credit enforcement and upgrade prompts.
- **Stripe Subscription Billing**:
  - **Free**: $0/month (5 credits/month)
  - **Pro**: $2/month (10 credits/month) — *Most Popular*
  - **Pro Plus**: $4/month (15 credits/month)
  - Stripe Checkout and Customer Portal integration for self-serve cancellation and invoice downloads.
  - Secure webhook synchronization (`/api/stripe/webhook`).
- **Supabase Backend & Row Level Security (RLS)**:
  - User authentication (Email/Password, Session persistence, Password recovery).
  - PostgreSQL schema with atomic stored procedures (`deduct_credit_for_analysis`) to prevent double-spending or race conditions.
  - Private analysis archive and credit audit ledger.
- **Export Capabilities**:
  - Export document analysis to structured **CSV** or **JSON**.
  - One-click formatted summary copy for clipboard.

---

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Cream palette: `#F7F1E8`, warm cream `#FAF6F0`, dark ink `#1C1917`, accent `#C26732`)
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **Payments**: Stripe API, Stripe Checkout, Stripe Customer Portal, Stripe Webhooks
- **Icons**: Lucide React

---

## Local Development

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-org/cirolink.git
cd cirolink
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate the keys with your credentials:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"

NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID="price_..."
```

### 3. Setup Supabase Database

1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New Query**.
3. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql) and run the script.
4. This creates:
   - `profiles` table with automatic triggers on `auth.users`.
   - `analyses` table with RLS (users can only access their own records).
   - `subscriptions` & `credit_transactions` tables.
   - `deduct_credit_for_analysis` stored procedure.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Stripe Webhook Setup

Forward webhooks locally using the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

In production, register your endpoint in the Stripe Dashboard:
`https://cirolink.com/api/stripe/webhook`

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

---

## Deployment (Vercel & Custom Domain)

1. Push your repository to GitHub on branch `main`.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables in Vercel project settings (`NEXT_PUBLIC_SUPABASE_URL`, `STRIPE_SECRET_KEY`, etc.).
4. Add the custom domain **cirolink.com** in Vercel **Settings** -> **Domains**.
5. Set `NEXT_PUBLIC_APP_URL=https://cirolink.com`.

---

## License

Private SaaS application. All rights reserved &copy; Cirolink.com.
