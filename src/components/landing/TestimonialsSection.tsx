import React from 'react';
import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'ResearchFlow cut our weekly competitor tracking from 5+ hours of manual tab-switching to a 10-minute morning review. The verbatim evidence citations gave our sales team instant credibility against legacy vendors.',
    author: 'Sarah Lin',
    role: 'VP of Product Marketing',
    company: 'HyperScale Systems',
    avatarText: 'SL',
    metric: 'Saved 18 hrs/month',
  },
  {
    quote:
      'We caught a competitor’s unannounced 40% enterprise price increase 3 weeks before our market even noticed. We immediately launched an automated switcher email campaign that closed 14 enterprise accounts.',
    author: 'Marcus Vance',
    role: 'Head of Growth',
    company: 'Veloce Labs',
    avatarText: 'MV',
    metric: '14 Enterprise Deals Closed',
  },
  {
    quote:
      'Finally, an AI intelligence platform that does not hallucinate. Every single claim has a source link, verbatim excerpt, and character offset. It is the gold standard for honest GTM strategy.',
    author: 'Elena Rostova',
    role: 'Founder & CEO',
    company: 'Synthetix AI',
    avatarText: 'ER',
    metric: '100% Verifiable Evidence',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-10 md:px-12 max-w-6xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[#F5D77F] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <MessageSquareQuote className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>Wall of Proof</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-stylish-heading italic font-normal text-white tracking-normal leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Trusted by the fastest-moving{' '}
          <span className="text-gold-gradient block sm:inline">teams in tech.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/80 font-editorial leading-relaxed drop-shadow-sm">
          See how high-growth founders and product marketers turn market noise into decisive competitive advantage.
        </p>
      </div>

      {/* 3-Column Testimonial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className="relative rounded-3xl border border-amber-400/25 bg-black/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-6 hover:border-amber-400/45 transition-colors group"
          >
            <div className="space-y-4">
              {/* Star Rating & Verified Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#F5D77F]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F5D77F]" />
                  ))}
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified PMM
                </span>
              </div>

              {/* Quote */}
              <p className="text-sm text-white/85 font-editorial leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            {/* Author Footer */}
            <div className="pt-4 border-t border-amber-400/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center shadow-md">
                  {t.avatarText}
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-tight">{t.author}</div>
                  <div className="text-[11px] text-white/60 font-mono">{t.role} &bull; {t.company}</div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-[#F5D77F] font-bold text-right hidden sm:block">
                {t.metric}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
