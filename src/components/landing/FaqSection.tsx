import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does ResearchFlow AI prevent AI hallucinations?',
    a: 'Every single claim, feature comparison, or pricing observation is strictly backed by an extracted verbatim snippet from the competitor’s live webpage. The system computes a SHA-256 cryptographic provenance hash, records the character offset, and links the source URL. If a claim cannot be verified from the extracted text, the system rejects it.',
  },
  {
    q: 'How is this different from tools like ChatGPT, Perplexity, or Claude?',
    a: 'General LLMs lack persistent competitor tracking, cannot browse complex dynamic SPAs consistently, and frequently invent pricing tiers or nonexistent features. ResearchFlow AI is an end-to-end competitive intelligence architecture: it crawls live URLs, resolves cross-source contradictions, structures claims into battlecards, and generates executable GTM campaigns and Kanban tasks.',
  },
  {
    q: 'How often does the autonomous radar check my competitors?',
    a: 'Depending on your tier, ResearchFlow continuously monitors your configured competitor domains daily or weekly. When a competitor changes a pricing table, modifies an SLA guarantee, or edits their positioning headline, you receive an instant synthesized delta report.',
  },
  {
    q: 'Can I export battlecards and campaigns to our existing tools?',
    a: 'Yes. Battlecards can be exported to PDF and copied into sales enablement tools. Campaign tasks automatically integrate into your workspace Kanban board and can be exported directly to Jira, Linear, or CSV.',
  },
  {
    q: 'Is our competitive intelligence data private and secure?',
    a: 'Absolutely. Every workspace is completely isolated in Neon PostgreSQL using tenant-scoped schemas. Your competitor URLs, proprietary positioning strategies, and generated campaigns are never shared across tenants or used for third-party AI training.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-10 md:px-12 max-w-4xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[#F5D77F] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <HelpCircle className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>Frequently Asked Questions</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-stylish-heading italic font-normal text-white tracking-normal leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Everything you need{' '}
          <span className="text-gold-gradient block sm:inline">to know.</span>
        </h2>

        <p className="text-base text-white/80 font-editorial leading-relaxed drop-shadow-sm">
          Have questions regarding our zero-hallucination evidence engine or autonomous radar? We have answers.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'border-amber-400/40 bg-black/80 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
                  : 'border-amber-400/20 bg-black/40 hover:border-amber-400/35'
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#F5D77F] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-white/75 font-editorial leading-relaxed border-t border-amber-400/15 mt-1">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
