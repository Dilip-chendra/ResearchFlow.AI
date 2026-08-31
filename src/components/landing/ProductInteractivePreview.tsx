import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Layers,
  AlertTriangle,
  Megaphone,
  ListTodo,
  ArrowRight,
  Copy,
  ExternalLink,
  ChevronRight,
  Play
} from 'lucide-react';

export const ProductInteractivePreview: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    { id: 1, title: '1. Mission & Crawl', label: 'Sources' },
    { id: 2, title: '2. Grounded Evidence', label: 'Evidence' },
    { id: 3, title: '3. Strategic Intelligence', label: 'Intelligence' },
    { id: 4, title: '4. Campaign Brief & Ads', label: 'Campaign' },
    { id: 5, title: '5. Actionable Tasks', label: 'Execution' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-zinc-800 bg-[#0C0E17] shadow-2xl shadow-black/80 overflow-hidden text-xs">
      {/* Window Title Bar */}
      <div className="px-5 py-3.5 bg-[#090A0F] border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-zinc-400 text-[11px]">
            researchflow.ai/workspace/nextgen-resume-ai
          </span>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                activeStep === s.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Window Content */}
      <div className="p-6 sm:p-8 bg-[#0C0E17] min-h-[380px] flex flex-col justify-between">
        {/* STEP 1: CRAWL & RESEARCH SOURCES */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                  Target Competitor Footprint
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  NextGen Resume AI — Competitive Research Pipeline
                </h4>
                <p className="text-zinc-400 text-xs">
                  Objective: Fall Campus Recruiting — Acquire 1,000 university seniors and junior software engineers.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3/3 Sources Crawled</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Novoresume</span>
                  <span className="text-[10px] font-mono text-emerald-400">HTTP 200</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Extracted pricing table: $19/mo annual commitment vs $29/mo monthly flex rate.
                </p>
                <div className="text-[10px] text-zinc-500 font-mono">1,840 words parsed</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Kickresume</span>
                  <span className="text-[10px] font-mono text-emerald-400">HTTP 200</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Identified feature lock: AI bullet rewriting and auto-matching locked behind Pro tier.
                </p>
                <div className="text-[10px] text-zinc-500 font-mono">2,110 words parsed</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Teal ATS Guide</span>
                  <span className="text-[10px] font-mono text-emerald-400">HTTP 200</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Competitor messaging focuses on visual template styling rather than ATS keyword screening.
                </p>
                <div className="text-[10px] text-zinc-500 font-mono">3,450 words parsed</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EVIDENCE EXTRACTION & CONFLICT DETECTION */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                  Verbatim Claim Graph
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  Evidence Isolation & Cross-Source Conflict Flagging
                </h4>
              </div>
              <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>1 Conflict Flagged</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">
                    FACT · HIGH CONFIDENCE
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Category: Pricing</span>
                </div>
                <p className="font-semibold text-white text-xs">
                  "Novoresume charges $19/mo when billed annually, but jumps to $29/mo for monthly plans."
                </p>
                <p className="text-[11px] text-zinc-400 italic bg-black/40 p-2 rounded border border-zinc-800">
                  Supporting citation: "Save 30% on annual billing... $19 billed every 12 months."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                    FLAGGED CONFLICT · UNRESOLVED
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Pricing Discrepancy</span>
                </div>
                <p className="font-semibold text-amber-200 text-xs">
                  Review portal claimed $19 flat rate, while official pricing requires full upfront annual billing.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-400">Operator Action: Human Verified</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Passed to Brief</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: STRATEGIC INTELLIGENCE */}
        {activeStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">
                  Synthesis Engine
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  Positioning Gaps & High-Impact Market Opportunities
                </h4>
              </div>
              <span className="text-[11px] font-mono text-indigo-400">Evidence Citing: 9 Claims</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  1. Competitive Positioning Gap
                </span>
                <h5 className="font-bold text-white text-xs">
                  Template Vanity vs. Technical ATS Benchmark Calibration
                </h5>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Competitors heavily advertise visual styling templates. CS and engineering graduates care exclusively about passing automated recruiter ATS screening.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  2. Pricing Transparency Angle
                </span>
                <h5 className="font-bold text-white text-xs">
                  Eliminate Confusing 30% Annual Commitment Traps
                </h5>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Students only need resume software for 1–2 recruitment months. Highlighting month-to-month parity creates an immediate acquisition wedge.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CAMPAIGN BRIEF & CHANNEL DRAFTS */}
        {activeStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
                  GTM Strategy Hub
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  Evidence-Backed Campaign Strategy Brief
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                STATUS: AWAITING OPERATOR APPROVAL
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lead Campaign Angle</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  "Stop Paying 30% Surplus for Unused Templates — NextGen Resume AI Aligns Candidates Directly with Real Hiring Benchmarks."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
                <div className="p-2.5 bg-black/40 rounded-lg border border-zinc-800">
                  <span className="text-[10px] font-bold text-blue-400 block">LinkedIn Teardown Post</span>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 mt-1">
                    "Still paying $29/mo for generic resume tools? Here's what engineering recruiters actually test for in 2026..."
                  </p>
                </div>
                <div className="p-2.5 bg-black/40 rounded-lg border border-zinc-800">
                  <span className="text-[10px] font-bold text-indigo-400 block">Cold Outreach Sequence</span>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 mt-1">
                    "Subject: Quick question about your technical resume formatting ahead of Fall career fair..."
                  </p>
                </div>
                <div className="p-2.5 bg-black/40 rounded-lg border border-zinc-800">
                  <span className="text-[10px] font-bold text-emerald-400 block">High-Intent SEO Guide</span>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 mt-1">
                    "Novoresume vs NextGen Resume AI: Side-by-Side ATS Benchmark Parity and Cost Breakdown"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: EXECUTION KANBAN TASKS */}
        {activeStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                  Execution Layer
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  Automated Task Generation Upon Operator Approval
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                STATUS: APPROVED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded">
                    URGENT · POSITIONING
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">PENDING</span>
                </div>
                <h6 className="font-bold text-white text-xs">Update Landing Page Hero</h6>
                <p className="text-[11px] text-zinc-400">
                  Align hero copy with verified ATS benchmark proposition.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
                    HIGH · DISTRIBUTION
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">IN PROGRESS</span>
                </div>
                <h6 className="font-bold text-white text-xs">Schedule LinkedIn Breakdown</h6>
                <p className="text-[11px] text-zinc-400">
                  Insert recruiter verification quote and schedule for Tuesday 9am.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                    MEDIUM · OUTREACH
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">COMPLETED</span>
                </div>
                <h6 className="font-bold text-white text-xs">Load Email Sequence</h6>
                <p className="text-[11px] text-zinc-400">
                  Import ATS email template into outreach platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Stage Switcher Footer */}
        <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Real Application Flow · 0 Unsupported Hallucinations</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(activeStep > 1 ? activeStep - 1 : 5)}
              className="px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-xs font-semibold"
            >
              Previous Stage
            </button>
            <button
              onClick={() => setActiveStep(activeStep < 5 ? activeStep + 1 : 1)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
            >
              <span>Next Stage ({activeStep < 5 ? activeStep + 1 : 1}/5)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
