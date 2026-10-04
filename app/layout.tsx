import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from '@/lib/supabase/provider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://cirolink.com'),
  title: 'Cirolink Word Counter — Free Online Word & Character Counter',
  description: "Count words, characters, sentences, paragraphs, reading time and more with Cirolink's fast and accurate online Word Counter.",
  keywords: [
    'word counter',
    'character counter',
    'text analyzer',
    'reading time calculator',
    'speaking time calculator',
    'word frequency',
    'sentence counter',
    'Cirolink'
  ],
  authors: [{ name: 'Cirolink' }],
  creator: 'Cirolink',
  publisher: 'Cirolink.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cirolink.com',
    title: 'Cirolink Word Counter — Free Online Word & Character Counter',
    description: "Count words, characters, sentences, paragraphs, reading time and more with Cirolink's fast and accurate online Word Counter.",
    siteName: 'Cirolink',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cirolink Word Counter — Free Online Word & Character Counter',
    description: "Count words, characters, sentences, paragraphs, reading time and more with Cirolink's fast and accurate online Word Counter.",
    creator: '@cirolink',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Cirolink Word Counter',
  url: 'https://cirolink.com',
  description: "Count words, characters, sentences, paragraphs, reading time and more with Cirolink's fast and accurate online Word Counter.",
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'All',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      name: 'Free Plan',
      description: '5 analyses per month'
    },
    {
      '@type': 'Offer',
      price: '2',
      priceCurrency: 'USD',
      name: 'Pro Plan',
      description: '10 analyses per month'
    },
    {
      '@type': 'Offer',
      price: '4',
      priceCurrency: 'USD',
      name: 'Pro Plus Plan',
      description: '15 analyses per month'
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#F7F1E8] text-[#1C1917] antialiased selection:bg-[#E8DCCB] selection:text-[#1C1917] font-sans">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
