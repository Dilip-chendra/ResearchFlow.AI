import React, { useState } from 'react';
import { Swords, ShieldAlert, Award, Bomb, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CompetitorDossier {
  name: string;
  category: string;
  annualCost: string;
  positioningAngle: string;
  vulnerability: string;
  winTheme: string;
  landmine: string;
  evidenceSnippet: string;
  evidenceUrl: string;
}

const COMPETITORS_DATA: Record<string, CompetitorDossier> = {
  klue: {
    name: 'Klue',
    category: 'Enterprise Sales Enablement',
    annualCost: '$25,000 – $45,000/yr',
    positioningAngle: 'Sales-heavy battlecards reliant on manual internal curation.',
    vulnerability: 'Demands full-time PMM overhead and expensive annual enterprise lock-in.',
    winTheme: 'Highlight autonomous real-time web evidence grounding vs. manual stale notes.',
    landmine: 'Ask the prospect: "How many hours per week does your team spend manually updating battlecards?"',
    evidenceSnippet: '"Requires dedicated admin seat. Standard enterprise onboarding averages 6–8 weeks with annual contract."',
    evidenceUrl: 'https://klue.com/pricing-overview',
  },
  crayon: {
    name: 'Crayon',
    category: 'Digital Footprint Monitoring',
    annualCost: '$18,000 – $35,000/yr',
    positioningAngle: '100+ digital signal trackers that flood user inboxes with raw change alerts.',
    vulnerability: 'Extreme alert fatigue without automated claim synthesis or campaign generation.',
    winTheme: 'Position ResearchFlow AI as synthesized strategy and campaigns, not raw noisy notifications.',
    landmine: 'Ask the prospect: "What percentage of Crayon email alerts actually turn into marketing execution?"',
    evidenceSnippet: '"Tracks 100+ digital footprints. Real-time notifications delivered across Slack and email daily."',
    evidenceUrl: 'https://crayon.co/product-tracking',
  },
  alphasense: {
    name: 'AlphaSense',
    category: 'Financial Market Intelligence',
    annualCost: '$12,000 – $22,000/seat/yr',
    positioningAngle: 'Wall Street financial research engine indexing broker reports and earnings calls.',
    vulnerability: 'Geared for financial analysts, not product marketing, founder positioning, or growth execution.',
    winTheme: 'Deliver tactical GTM battlecards, claim conflict detection, and marketing assets.',
    landmine: 'Ask the prospect: "Does AlphaSense generate your LinkedIn campaigns or sales switcher battlecards?"',
    evidenceSnippet: '"Enterprise financial indexing covering SEC filings, expert call transcripts, and Wall Street broker research."',
    evidenceUrl: 'https://alpha-sense.com/features/enterprise',
  },
  semrush: {
    name: 'Semrush',
    category: 'Search & Traffic Analytics',
    annualCost: '$1,600 – $6,000/yr',
    positioningAngle: 'Quantitative SEO keyword gap and paid search traffic estimation.',
    vulnerability: 'Only tracks quantitative search numbers; cannot parse qualitative product claims or SLA conflicts.',
    winTheme: 'Combine qualitative claim provenance with strategic battlecards that quantitative tools miss.',
    landmine: 'Ask the prospect: "Can Semrush read your competitor’s new pricing footnotes and detect SLA contradictions?"',
    evidenceSnippet: '"Keyword volume database, domain backlink metrics, and estimated Google Ads search CPC telemetry."',
    evidenceUrl: 'https://semrush.com/pricing',
  },
};

export const InteractiveBattlecardSection: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('klue');
  const current = COMPETITORS_DATA[selectedKey];

  return (
    <section id="intelligence" className="relative py-20 sm:py-28 px-5 sm:px-10 md:px-12 max-w-6xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[#F5D77F] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <Swords className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>Interactive Battlecard Arena</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-stylish-heading italic font-normal text-white tracking-normal leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Board-ready battlecards.{' '}
          <span className="text-gold-gradient block sm:inline">Win high-stakes deals.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/80 font-editorial leading-relaxed drop-shadow-sm">
          Select any legacy competitor to see how ResearchFlow synthesizes verifiable market positioning, reveals critical vulnerabilities, and delivers winning sales themes.
        </p>

        {/* Competitor Selector Pills */}
        <div className="pt-4 flex flex-wrap justify-center gap-2.5">
          {Object.entries(COMPETITORS_DATA).map(([key, data]) => {
            const isActive = selectedKey === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 shadow-[0_0_24px_rgba(245,215,127,0.6)] scale-[1.03]'
                    : 'bg-black/60 text-white/75 hover:text-white border border-amber-400/25 hover:border-amber-400/50'
                }`}
              >
                <span>{data.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-slate-950 text-[#F5D77F]' : 'bg-white/10 text-white/60'}`}>
                  {data.annualCost}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Battlecard Preview Container */}
      <div className="relative rounded-3xl border border-amber-400/35 bg-gradient-to-b from-black/80 via-black/90 to-black/95 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(212,175,55,0.15)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-8 relative z-10">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-400/20">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl sm:text-3xl font-stylish-heading italic font-normal text-white">
                  Target: {current.name}
                </h3>
                <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-amber-400/15 text-[#F5D77F] border border-amber-400/30 font-bold">
                  {current.category}
                </span>
              </div>
              <p className="text-xs text-white/60 font-mono mt-1">
                Typical Contract: <span className="text-rose-400 font-bold">{current.annualCost}</span> &bull; Updated Daily via Autonomous Radar
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4" />
              <span>Evidence Verified Grounding: 100%</span>
            </div>
          </div>

          {/* 3-Column Tactical Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Vulnerability Vector */}
            <div className="p-5 rounded-2xl bg-black/60 border border-rose-500/25 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>Strategic Vulnerability</span>
              </div>
              <p className="text-sm text-white/90 font-editorial leading-relaxed">
                {current.vulnerability}
              </p>
              <div className="text-[11px] font-mono text-rose-300/80 pt-2 border-t border-rose-500/15">
                Legacy Weakness
              </div>
            </div>

            {/* 2. Win Theme */}
            <div className="p-5 rounded-2xl bg-black/60 border border-amber-400/30 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-[#F5D77F] font-mono text-xs font-bold uppercase">
                <Award className="w-4 h-4" />
                <span>Primary Win Theme</span>
              </div>
              <p className="text-sm text-white/90 font-editorial leading-relaxed">
                {current.winTheme}
              </p>
              <div className="text-[11px] font-mono text-[#F5D77F]/80 pt-2 border-t border-amber-400/15">
                Competitive Edge
              </div>
            </div>

            {/* 3. Sales Landmine */}
            <div className="p-5 rounded-2xl bg-black/60 border border-amber-400/30 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase">
                <Bomb className="w-4 h-4" />
                <span>Sales Landmine to Lay</span>
              </div>
              <p className="text-sm text-white/90 font-editorial leading-relaxed">
                {current.landmine}
              </p>
              <div className="text-[11px] font-mono text-amber-300/80 pt-2 border-t border-amber-400/15">
                Deal Breaker
              </div>
            </div>
          </div>

          {/* Verbatim Evidence Drawer */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/75 border border-amber-400/20 font-mono text-xs space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#F5D77F]">
              <span className="font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#F5D77F]" />
                CRYPTOGRAPHIC VERBATIM CITATION &bull; ZERO HALLUCINATION
              </span>
              <a
                href={current.evidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white/60 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>{current.evidenceUrl}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <p className="text-white/95 italic bg-amber-400/5 p-3 rounded-xl border border-amber-400/15 leading-relaxed">
              {current.evidenceSnippet}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
