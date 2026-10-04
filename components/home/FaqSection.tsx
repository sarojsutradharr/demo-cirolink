'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is a word counter?',
    answer:
      'A word counter is a digital tool that measures the length, density, and structure of text. Cirolink goes beyond basic word counts by computing total characters, characters excluding spaces, letters, sentences, paragraphs, reading and speaking durations, and full word frequency distributions.',
  },
  {
    question: 'How does the credit system work?',
    answer:
      'Our credit model is straightforward: one credit is consumed for every complete text analysis. Registered free accounts automatically receive 5 monthly credits. Pro members receive 10 credits per month ($2/mo), and Pro Plus members receive 15 credits per month ($4/mo).',
  },
  {
    question: 'Is Cirolink free to use?',
    answer:
      'Yes. Every registered user automatically starts on our Free tier with 5 monthly analysis credits. You can paste text, upload .txt/.md/.csv documents, view comprehensive metrics, and review your historical analyses with zero upfront payment.',
  },
  {
    question: 'What happens when I use all my credits?',
    answer:
      "When your credit balance reaches zero, the analysis button is temporarily paused and an upgrade notice is presented. You can either wait for your monthly automated billing reset or immediately upgrade to Pro (10 credits) or Pro Plus (15 credits) to continue analyzing without disruption.",
  },
  {
    question: 'Can I cancel my Pro subscription at any time?',
    answer:
      'Yes. All paid subscriptions are managed through the secure Stripe Customer Portal accessible directly inside your Cirolink dashboard. You can cancel with one click, update payment methods, or download official VAT/tax receipts at any time.',
  },
  {
    question: 'Is my text stored or shared?',
    answer:
      'Your privacy and data sovereignty are paramount. When you analyze text, calculations are processed in memory. Only high-level statistical summaries (word count, reading duration, timestamp) and an optional truncated preview are saved in your private account history so you can review your past activity.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C26732]">
            Frequently Asked Questions
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
            Everything you need to know about Cirolink
          </h2>
          <p className="mt-2 text-sm text-[#78716C]">
            Have questions about our credit model, subscriptions, or text analytics engine?
          </p>
        </div>

        <div className="mt-10 divide-y divide-[#E8DCCB] rounded-2xl border border-[#E8DCCB] bg-white shadow-xs">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="p-5 sm:p-6 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="flex w-full items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-sm font-semibold text-[#1C1917] pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#78716C] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#1C1917]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs leading-relaxed text-[#57534E]">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
