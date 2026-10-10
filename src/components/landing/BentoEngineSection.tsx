import React, { useState } from 'react';
import { Globe, Shield, Sparkles, Check, Copy, ExternalLink, Zap, AlertCircle, FileText, Send, Kanban } from 'lucide-react';

export const BentoEngineSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'linkedin' | 'email' | 'seo'>('linkedin');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="pipeline" className="relative py-20 sm:py-28 px-5 sm:px-10 md:px-12 max-w-6xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
        <div id="evidence" className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[#F5D77F] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>The Intelligence Architecture</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-stylish-heading italic font-normal text-white tracking-normal leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Engineered for evidence.{' '}
          <span className="text-gold-gradient block sm:inline">Built for decisive execution.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/80 font-editorial leading-relaxed drop-shadow-sm">
          A multi-stage autonomous pipeline designed to turn raw, unstructured competitor websites into verified strategic opportunities and launch-ready marketing campaigns.
        </p>
      </div>

      {/* Modern Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bento 1: Autonomous Web Ingestion (Large 2-Column Span) */}
        <div className="lg:col-span-2 relative rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-6 overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-400/10 via-transparent to-transparent pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-[#F5D77F]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Autonomous Web Ingestion &amp; Scraping</h3>
                  <p className="text-xs text-[#F5D77F] font-mono">Real-Time HTML Extraction &bull; Zero Headless Delays</p>
                </div>
              </div>
              <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Ingestion
              </span>
            </div>

            <p className="text-sm text-white/80 leading-relaxed font-editorial">
              Pass any competitor URL or public documentation. Our distributed pipeline extracts raw clean text, bypasses noisy navigation scripts, and categorizes claims into structured buckets in seconds.
            </p>

            {/* Simulated Live URL Input & Extracted Claim Stream */}
            <div className="rounded-2xl border border-amber-400/20 bg-black/80 p-4 space-y-3 font-mono text-xs shadow-inner">
              <div className="flex items-center gap-2 pb-2.5 border-b border-amber-400/15 text-white/70">
                <span className="text-emerald-400 font-bold">GET</span>
                <span className="text-white/90 truncate flex-1">https://competitor.com/pricing</span>
                <span className="text-[#F5D77F] font-semibold">200 OK &bull; 142ms</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-center">
                  <span className="text-[#F5D77F] block font-bold">28 Claims</span>
                  <span className="text-white/60 text-[10px]">Pricing &amp; Limits</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-center">
                  <span className="text-[#F5D77F] block font-bold">42 Features</span>
                  <span className="text-white/60 text-[10px]">Tier Capabilities</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-center">
                  <span className="text-[#F5D77F] block font-bold">14 Guarantees</span>
                  <span className="text-white/60 text-[10px]">SLA &amp; Support</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-center">
                  <span className="text-emerald-300 block font-bold">99.8%</span>
                  <span className="text-white/60 text-[10px]">Grounding Score</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/60 font-mono pt-2 border-t border-amber-400/15">
            <span>Anti-Bot Resilient</span>
            <span className="text-[#F5D77F]">Auto-Parses Dynamic SPAs</span>
          </div>
        </div>

        {/* Bento 2: Cryptographic Verbatim Grounding */}
        <div className="relative rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-6 group hover:border-amber-400/50 transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-[#F5D77F]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Verbatim Evidence Citations</h3>
                <p className="text-xs text-[#F5D77F] font-mono">Zero Hallucinations Guarantee</p>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed font-editorial">
              No generic AI guesswork. Every extracted claim links directly to the exact verbatim snippet with character offsets and timestamped URL provenance.
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-[#F5D77F]">
                <span className="font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  SHA-256 PROVENANCE
                </span>
                <span className="text-white/60">#ev-8491</span>
              </div>
              <p className="text-white/90 italic bg-black/40 p-2 rounded-lg border border-amber-400/15">
                &ldquo;Enterprise plan requires annual commitment with mandatory $5,000 onboarding fee.&rdquo;
              </p>
              <div className="flex items-center justify-between text-[10px] text-white/60 pt-1">
                <span>Source: /pricing#enterprise</span>
                <span className="text-emerald-400 font-semibold">100% Grounded</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/60 font-mono pt-2 border-t border-amber-400/15">
            <span>Cryptographic Fingerprint</span>
            <span className="text-[#F5D77F]">Direct Traceability</span>
          </div>
        </div>

        {/* Bento 3: Cross-Source Conflict Radar */}
        <div className="relative rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-6 group hover:border-amber-400/50 transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-[#F5D77F]">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Cross-Source Conflict Radar</h3>
                <p className="text-xs text-[#F5D77F] font-mono">Discrepancy &amp; Lie Detection</p>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed font-editorial">
              Detects when a competitor’s marketing page contradicts their fine-print SLA, terms of service, or public API documentation.
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                <span className="text-[10px] text-rose-300 font-bold uppercase">Marketing Page (/home)</span>
                <p className="text-white/90 text-[11px]">&ldquo;Guaranteed 99.99% high-availability SLA&rdquo;</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                <span className="text-[10px] text-amber-300 font-bold uppercase">Terms of Service (/legal/sla)</span>
                <p className="text-white/90 text-[11px]">&ldquo;Service credits capped at 10% after 4 hours downtime&rdquo;</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/60 font-mono pt-2 border-t border-amber-400/15">
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Conflict Flagged
            </span>
            <span className="text-[#F5D77F]">Exploitable Gap</span>
          </div>
        </div>

        {/* Bento 4: Autonomous GTM Campaign Studio (Large 2-Column Span) */}
        <div className="lg:col-span-2 relative rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-6 overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-[#F5D77F]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Autonomous Multi-Channel Campaign Studio</h3>
                  <p className="text-xs text-[#F5D77F] font-mono">LinkedIn &bull; Cold Outreach &bull; SEO Playbooks</p>
                </div>
              </div>

              {/* Channel Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-amber-400/20 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('linkedin')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'linkedin'
                      ? 'bg-amber-400/20 text-[#F5D77F] font-bold border border-amber-400/30 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'email'
                      ? 'bg-amber-400/20 text-[#F5D77F] font-bold border border-amber-400/30 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Cold Email
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'seo'
                      ? 'bg-amber-400/20 text-[#F5D77F] font-bold border border-amber-400/30 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  SEO Guide
                </button>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed font-editorial">
              Converts competitive intelligence findings directly into high-converting copy. Review, refine, and copy launch-ready assets backed by cited market proof points.
            </p>

            {/* Generated Campaign Content Box */}
            <div className="p-4 rounded-2xl bg-black/80 border border-amber-400/20 text-xs font-mono space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-white/60 pb-2 border-b border-amber-400/15">
                <span className="text-[#F5D77F] font-bold">
                  {activeTab === 'linkedin' && '🎯 LinkedIn Thought Leadership & Hook'}
                  {activeTab === 'email' && '📬 3-Touch Cold Switcher Sequence'}
                  {activeTab === 'seo' && '🔍 Alternative vs Competitor Attack Matrix'}
                </span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#F5D77F] hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Asset'}</span>
                </button>
              </div>

              {activeTab === 'linkedin' && (
                <div className="space-y-2 text-white/90 text-xs leading-relaxed">
                  <p className="font-semibold text-[#F5D77F]">
                    Stop locking your team into $45,000 legacy contracts for static PDF battlecards.
                  </p>
                  <p className="text-white/80">
                    We crawled 42 SaaS vendors this morning. 64% of their pricing pages hide a mandatory onboarding fee in the footnotes. Here is the exact breakdown &darr;
                  </p>
                  <div className="p-2 rounded bg-amber-400/10 border border-amber-400/15 text-[11px] text-amber-200">
                    Evidence Link: [ev-8491: mandatory $5,000 onboarding fee on Enterprise tier]
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-2 text-white/90 text-xs leading-relaxed">
                  <p className="font-semibold text-[#F5D77F]">Subject: Question regarding your Q3 contract renewal with [Competitor]</p>
                  <p className="text-white/80">
                    Hi [Name] &mdash; noticed [Competitor] just added an unannounced 25% price increase on renewal tiers. If you are reviewing alternatives that provide zero-hallucination evidence without annual lock-in, let me know.
                  </p>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-2 text-white/90 text-xs leading-relaxed">
                  <p className="font-semibold text-[#F5D77F]">Target Keyword: &ldquo;[Competitor] Alternatives &amp; Pricing Comparison 2026&rdquo;</p>
                  <p className="text-white/80">
                    Angle: Compare true cost of ownership, hidden onboarding surcharges, and verifiable evidence grounding vs. legacy sales battlecard vendors.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/60 font-mono pt-2 border-t border-amber-400/15">
            <span>1-Click Multi-Channel Generation</span>
            <span className="text-[#F5D77F]">Evidence Backed</span>
          </div>
        </div>

        {/* Bento 5: Closed-Loop Execution Kanban */}
        <div className="relative rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-6 group hover:border-amber-400/50 transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-[#F5D77F]">
                <Kanban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Automated Kanban Handoff</h3>
                <p className="text-xs text-[#F5D77F] font-mono">From Strategy to Execution</p>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed font-editorial">
              Approving a campaign automatically populates prioritized engineering and growth tasks into a trackable board.
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/50 border border-amber-400/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white/90">Update /vs-klue comparison page</span>
                </div>
                <span className="text-[10px] text-[#F5D77F] font-bold">P1 &bull; Ready</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-amber-400/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-white/90">Launch Switcher LinkedIn Ads</span>
                </div>
                <span className="text-[10px] text-[#F5D77F] font-bold">P1 &bull; Active</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-amber-400/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-white/90">Deliver Battlecard to Sales Fleet</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">&check; Done</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/60 font-mono pt-2 border-t border-amber-400/15">
            <span>Closed-Loop Workflows</span>
            <span className="text-[#F5D77F]">Export to Jira / Linear</span>
          </div>
        </div>
      </div>
    </section>
  );
};
