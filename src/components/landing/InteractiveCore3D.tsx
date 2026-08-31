import React, { useState, useEffect, useRef } from 'react';
import { Globe, FileText, Sparkles, Megaphone, CheckSquare, ShieldCheck, ArrowRight, Activity, Zap } from 'lucide-react';

interface NodeInfo {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: any;
  snippet: string;
  meta: string;
  x: number; // percentage
  y: number; // percentage
}

const NODES: NodeInfo[] = [
  {
    id: 'sources',
    title: 'Live Web Sources',
    subtitle: 'Public Competitor Footprint',
    badge: '3 Sources Crawled',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: Globe,
    snippet: 'Novoresume ($19/mo annual, $29/mo monthly) · Kickresume · Teal ATS',
    meta: 'HTTP 200 · 12s Abort Guard · Clean HTML',
    x: 12,
    y: 48,
  },
  {
    id: 'evidence',
    title: 'Extracted Evidence',
    subtitle: 'Grounded Verbatim Claims',
    badge: '9 Claims Isolated',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: ShieldCheck,
    snippet: 'FACT: "$19/mo annual plan requires 1-year prepayment. Free tier capped at 1-page."',
    meta: '100% Traceability · FACT vs INFERENCE',
    x: 32,
    y: 22,
  },
  {
    id: 'intelligence',
    title: 'Strategic Intelligence',
    subtitle: 'Positioning & Market Gaps',
    badge: '1 Core Gap Identified',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    icon: Sparkles,
    snippet: 'Competitors over-index on visual templates; lack recruiter-calibrated ATS scoring.',
    meta: 'Cross-Source Conflict Detected ($19 vs $29)',
    x: 52,
    y: 72,
  },
  {
    id: 'campaign',
    title: 'Campaign Strategy',
    subtitle: 'Multi-Channel Drafts',
    badge: '3 Channels Generated',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: Megaphone,
    snippet: 'Angle: "Stop paying 30% surplus for unused templates. Meet NextGen Resume AI."',
    meta: 'LinkedIn + Cold Email + High-Intent SEO',
    x: 72,
    y: 26,
  },
  {
    id: 'tasks',
    title: 'Execution Tasks',
    subtitle: 'Actionable Work Board',
    badge: '4 Tasks Created',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: CheckSquare,
    snippet: '1. Update Hero Positioning Copy · 2. Schedule LinkedIn Breakdown · 3. Launch Outbound',
    meta: 'Human Approved · Real Kanban Persistence',
    x: 88,
    y: 56,
  },
];

export const InteractiveCore3D: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('intelligence');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x: x * 15, y: y * 15 });
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (el) el.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const activeNodeData = NODES.find((n) => n.id === activeNode) || NODES[2];

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#0F121C]/90 via-[#0A0D14]/95 to-[#06080D] p-6 sm:p-10 overflow-hidden shadow-2xl shadow-indigo-950/30 group select-none"
    >
      {/* Background Lighting & Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-20 pb-6 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Intelligence Flow Simulation
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Deterministic Grounding
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Hover over any stage node to inspect real data transformations.
            </p>
          </div>
        </div>

        {/* Stage Scrubber Indicator */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 text-[11px] overflow-x-auto">
          {NODES.map((n, idx) => (
            <button
              key={n.id}
              onClick={() => setActiveNode(n.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeNode === n.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {idx + 1}. {n.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Dimensional Node Canvas with SVG Dynamic Connector Lines */}
      <div
        className="relative h-72 sm:h-80 my-4 transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateY(${mousePos.x * 0.4}deg) rotateX(${-mousePos.y * 0.4}deg)`,
        }}
      >
        {/* SVG Continuous Flow Connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="25%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
              <stop offset="75%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connect node to node */}
          <path
            d="M 12% 48% Q 22% 22% 32% 22% T 52% 72% T 72% 26% T 88% 56%"
            fill="none"
            stroke="url(#flowGrad)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="animate-[dash_20s_linear_infinite]"
          />
        </svg>

        {/* Interactive Floating Nodes */}
        {NODES.map((node) => {
          const Icon = node.icon;
          const isActive = activeNode === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setActiveNode(node.id)}
              onMouseEnter={() => setActiveNode(node.id)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-300 z-10 ${
                isActive ? 'scale-110 z-30' : 'scale-95 hover:scale-105 opacity-85 hover:opacity-100'
              }`}
            >
              <div
                className={`flex flex-col items-center gap-2 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-zinc-900/95 border-indigo-500 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500/40 backdrop-blur-md'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 backdrop-blur-xs'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/50'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-bold text-white block leading-tight whitespace-nowrap">
                    {node.title}
                  </span>
                  <span className="text-[9px] text-zinc-400 hidden sm:block whitespace-nowrap mt-0.5">
                    {node.subtitle}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Data Inspection Card (Contextual Reveal) */}
      <div className="relative z-20 mt-2 p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {activeNodeData.title}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeNodeData.badgeColor}`}>
              {activeNodeData.badge}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {activeNodeData.meta}
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-mono bg-black/40 p-2.5 rounded-xl border border-zinc-800/60 leading-relaxed mt-1.5">
            {activeNodeData.snippet}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Active Pipeline Stage</span>
            <span className="text-xs font-bold text-indigo-400 font-mono">Verified Grounded</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>
    </div>
  );
};
