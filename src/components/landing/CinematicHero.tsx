import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Sparkles, Shield, Globe, AlertTriangle, FileText, CheckCircle2, Copy, Check, Zap } from 'lucide-react';
import { Typewriter } from './Typewriter';
import { HeadlineEntrance } from '../common/HeadlineEntrance';

interface CinematicHeroProps {
  onGetStarted: () => void;
  onExploreClick?: () => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({ onGetStarted, onExploreClick }) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'evidence' | 'battlecard' | 'campaign'>('radar');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToNext = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const problem = document.getElementById('problem');
      problem?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-[clamp(6.5rem,13vh,8.5rem)] pb-12 px-5 sm:px-10 md:px-12 max-w-6xl mx-auto w-full">
      {/* Top spacer for navigation alignment */}
      <div />

      {/* Hero Narrative Core */}
      <div className="max-w-4xl space-y-6 sm:space-y-8">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-amber-400/35 bg-black/60 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:border-amber-400/60 transition-all cursor-pointer group" onClick={scrollToNext}>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-white/90 font-medium">
            Autonomous Radar 2.0 Live &bull; <span className="text-[#F5D77F] font-bold group-hover:underline">Zero-Hallucination Evidence Engine &rarr;</span>
          </span>
        </div>

        {/* Master Headline with Modern Trending Luxury Typography & Dynamic Typewriter */}
        <HeadlineEntrance
          as="h1"
          className="text-[clamp(2.85rem,7.2vw,5.5rem)] font-stylish-heading italic font-normal tracking-normal text-white leading-[1.08] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]"
        >
          <span className="block text-white">Know your market.</span>
          <span className="block text-gold-gradient drop-shadow-[0_2px_28px_rgba(212,175,55,0.45)] min-h-[1.15em] mt-1 sm:mt-2">
            <Typewriter
              words={[
                'Before it moves.',
                'Before competitors adapt.',
                'Before pricing shifts.',
                'Before features launch.',
                'With verified evidence.',
              ]}
              typingSpeed={50}
              deletingSpeed={25}
              pauseDuration={2400}
              className="inline-flex items-baseline"
              textClassName="text-gold-gradient"
              cursorClassName="h-[0.82em] w-1 sm:w-1.5 ml-2 bg-gradient-to-b from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] rounded-full shadow-[0_0_12px_#D4AF37]"
            />
          </span>
        </HeadlineEntrance>

        {/* High-Impact Value Proposition */}
        <div className="space-y-3 max-w-2xl">
          <p className="text-lg sm:text-xl font-editorial text-white/90 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Stop drowning in competitor tabs, stale spreadsheets, and AI hallucinations. ResearchFlow autonomously crawls, extracts verbatim evidence, detects positioning conflicts, and generates executable GTM campaigns in minutes.
          </p>
          <p className="text-xs sm:text-sm font-subheading tracking-wider text-[#F5D77F]/90 uppercase font-semibold drop-shadow-sm">
            Autonomous Crawl &middot; Verbatim Grounding &middot; Conflict Radar &middot; Instant Execution
          </p>
        </div>

        {/* Primary Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 max-w-sm sm:max-w-none">
          <button
            onClick={onGetStarted}
            className="group h-12 px-8 rounded-full bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 hover:shadow-[0_0_35px_rgba(245,215,127,0.8)] hover:scale-[1.03] active:scale-[0.98] transition-all min-h-[48px] shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={scrollToNext}
            className="h-12 px-6 rounded-full bg-black/50 border border-amber-400/35 text-white hover:text-[#F5D77F] hover:border-[#F5D77F] text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-all min-h-[48px] shadow-[0_0_15px_rgba(212,175,55,0.15)] drop-shadow-sm"
          >
            <span>Explore live platform</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>

        {/* Micro Trust Pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 font-mono pt-1">
          <span className="flex items-center gap-1.5 text-white/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            No credit card required
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 text-white/80">
            <Zap className="w-3.5 h-3.5 text-[#F5D77F]" />
            14-day free trial
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 text-white/80">
            <Shield className="w-3.5 h-3.5 text-[#F5D77F]" />
            100% Verifiable evidence
          </span>
        </div>

        {/* Social Proof Trust Bar / Logo Cloud */}
        <div className="pt-4 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#F5D77F]/80 font-semibold">
            Trusted by founders, growth leaders, and PMMs at forward-thinking companies
          </div>
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-white/40 text-xs font-mono font-bold tracking-widest">
            <span className="hover:text-white/80 transition-colors">SYNTHETIX</span>
            <span className="hover:text-white/80 transition-colors">NEXUS LABS</span>
            <span className="hover:text-white/80 transition-colors">HYPERSCALE</span>
            <span className="hover:text-white/80 transition-colors">VELOCE AI</span>
            <span className="hover:text-white/80 transition-colors">OMNICLOUD</span>
            <span className="hover:text-white/80 transition-colors">ACROBATIX</span>
          </div>
        </div>
      </div>

      {/* Extraordinary Interactive Live Product Cockpit Sandbox */}
      <div className="relative pt-12 sm:pt-16 pb-4 w-full">
        <div className="relative rounded-2xl sm:rounded-3xl border border-amber-400/40 bg-black/85 backdrop-blur-2xl p-3 sm:p-5 shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_60px_rgba(212,175,55,0.25)] overflow-hidden">
          {/* Cockpit Window Chrome & Interactive Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-400/20 mb-3 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span className="ml-2 font-bold text-white tracking-wider">RESEARCHFLOW COCKPIT &bull; INTERACTIVE DEMO</span>
            </div>

            {/* Interactive Live Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-amber-400/20 text-xs">
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'radar'
                    ? 'bg-amber-400/20 text-[#F5D77F] font-bold border border-amber-400/35 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                1. Radar Stream
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'evidence'
                    ? 'bg-amber-400/20 text-[#F5D77F] font-bold border border-amber-400/35 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                2. Evidence Graph
              </button>
              <button
                onClick={() => setActiveTab('battlecard')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'battlecard'
                    ? 'bg-amber-400/20 text-[#F5D77F] font-bold border border-amber-400/35 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                3. GTM Battlecard
              </button>
              <button
                onClick={() => setActiveTab('campaign')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'campaign'
                    ? 'bg-amber-400/20 text-[#F5D77F] font-bold border border-amber-400/35 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                4. Generated Campaign
              </button>
            </div>
          </div>

          {/* Dynamic Cockpit Content Preview */}
          <div className="rounded-xl sm:rounded-2xl bg-black/60 border border-amber-400/20 p-4 sm:p-6 min-h-[340px] flex flex-col justify-between font-mono text-xs">
            {/* TAB 1: RADAR STREAM */}
            {activeTab === 'radar' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-white/70">
                  <span className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    AUTONOMOUS RADAR &bull; 42 MONITORED TARGETS
                  </span>
                  <span className="text-[#F5D77F]">CRAWL INTERVAL: 60 MIN</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-black/80 border border-amber-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-white">
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold">klue.com/pricing</span>
                      <span className="text-[10px] text-white/50 hidden sm:inline">&bull; 200 OK (114ms)</span>
                    </div>
                    <span className="text-[11px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      🚨 Detected unannounced $5k onboarding fee
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/80 border border-amber-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-white">
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold">crayon.co/product-tracking</span>
                      <span className="text-[10px] text-white/50 hidden sm:inline">&bull; 200 OK (89ms)</span>
                    </div>
                    <span className="text-[11px] text-[#F5D77F] font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      ⚡ Repositioned messaging from "Battlecards" to "AI Radar"
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/80 border border-amber-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-white">
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold">alpha-sense.com/enterprise</span>
                      <span className="text-[10px] text-white/50 hidden sm:inline">&bull; 200 OK (145ms)</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      &check; 142 Claims extracted &bull; 99.8% Grounding score
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EVIDENCE GRAPH */}
            {activeTab === 'evidence' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-white/70">
                  <span className="text-[#F5D77F] font-bold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    CRYPTOGRAPHIC CLAIM PROVENANCE &bull; ZERO HALLUCINATION
                  </span>
                  <span className="text-emerald-400">GROUNDING: 99.8%</span>
                </div>

                <div className="p-4 rounded-xl bg-black/80 border border-amber-400/25 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#F5D77F]">
                    <span className="font-bold">CLAIM #EV-9204: ENTERPRISE COMMITMENT CLAUSE</span>
                    <span className="text-white/60">SHA-256: 7f8a...c91e</span>
                  </div>
                  <p className="text-white/95 italic bg-amber-400/5 p-3 rounded-lg border border-amber-400/15 leading-relaxed">
                    &ldquo;All Enterprise tier agreements are subject to a minimum 12-month commitment. Cancelation prior to term expiration incurs 100% remaining balance penalty.&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-white/60 pt-1">
                    <span>Source: https://competitor.com/terms#section-4</span>
                    <span className="text-emerald-400 font-semibold">&check; Verbatim Match Verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BATTLECARD */}
            {activeTab === 'battlecard' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-white/70">
                  <span className="text-[#F5D77F] font-bold">EXECUTIVE BATTLECARD: LEGACY CI VS. RESEARCHFLOW</span>
                  <span className="text-emerald-400 font-bold">WIN RATE: +42%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                    <span className="text-[10px] text-rose-300 font-bold uppercase">Their Landmine</span>
                    <p className="text-white/90 text-xs">Locks customers into \$25k-\$45k annual contracts with mandatory onboarding fee.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-1">
                    <span className="text-[10px] text-[#F5D77F] font-bold uppercase">Our Counter-Angle</span>
                    <p className="text-white/90 text-xs">Deliver autonomous real-time evidence grounding on self-serve transparent pricing.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] text-emerald-300 font-bold uppercase">Trap Question for Reps</span>
                    <p className="text-white/90 text-xs">&ldquo;How many hours a week does your team spend manually verifying battlecards?&rdquo;</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GENERATED CAMPAIGN */}
            {activeTab === 'campaign' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-white/70">
                  <span className="text-[#F5D77F] font-bold">AUTONOMOUS GTM CAMPAIGN &bull; LINKEDIN &amp; COLD OUTREACH</span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs text-[#F5D77F] hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Brief'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-black/80 border border-amber-400/25 space-y-2 text-xs">
                  <p className="text-[#F5D77F] font-bold">Campaign Hook: &ldquo;The \$45,000 Static Battlecard Tax&rdquo;</p>
                  <p className="text-white/80 leading-relaxed">
                    Target: Enterprise PMMs &amp; Heads of Growth currently paying five figures for legacy tools. Position ResearchFlow AI as the zero-hallucination evidence engine with automated Kanban task handoff.
                  </p>
                  <div className="p-2 rounded bg-amber-400/10 border border-amber-400/15 text-[11px] text-amber-200">
                    Auto-Generated Deliverables: [1x LinkedIn Executive Hook] [3-Touch Cold Email Sequence] [1x Switcher Battlecard]
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Cockpit Action Bar */}
            <div className="pt-3 border-t border-amber-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero Hallucinations Verified &bull; Multi-Tenant Isolated</span>
              </div>
              <button
                onClick={onGetStarted}
                className="text-[#F5D77F] font-bold hover:text-white flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <span>Launch in your workspace &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
