import React, { useState, useEffect } from 'react';
import {
  Target,
  ShieldAlert,
  Compass,
  Network,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Play,
  RotateCw,
  BookOpen,
  HelpCircle,
  Activity,
  Users,
  Briefcase,
  DollarSign,
  Cpu
} from 'lucide-react';
import { api } from '../../lib/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  WarRoomOverviewResponse,
  WarRoomRolePerspective,
  ProductGap,
  CompetitorMove,
  MarketOpportunity,
  MarketThreat,
  WarRoomRecommendation
} from '../../types';
import { MapMyMarketModal } from './MapMyMarketModal';
import { ScenarioSimulatorModal } from './ScenarioSimulatorModal';
import { MarketGraphModal } from './MarketGraphModal';
import { StrategicSearchModal } from './StrategicSearchModal';

export const WarRoomView: React.FC = () => {
  const { activeWorkspace, addToast, setActiveView } = useWorkspace();
  const [perspective, setPerspective] = useState<WarRoomRolePerspective>('all');
  const [overview, setOverview] = useState<WarRoomOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedMoveId, setExpandedMoveId] = useState<string | null>(null);
  const [expandedGapId, setExpandedGapId] = useState<string | null>(null);

  // Modals
  const [isMapMarketOpen, setIsMapMarketOpen] = useState<boolean>(false);
  const [isScenarioOpen, setIsScenarioOpen] = useState<boolean>(false);
  const [isGraphOpen, setIsGraphOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Discovery Drawer
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveredCandidates, setDiscoveredCandidates] = useState<any[]>([]);

  // Custom Gap Form
  const [isAddingGap, setIsAddingGap] = useState<boolean>(false);
  const [newGapName, setNewGapName] = useState<string>('');
  const [newGapCategory, setNewGapCategory] = useState<string>('Product Capability');

  useEffect(() => {
    loadOverview();
  }, [activeWorkspace?.id]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getWarRoomOverview();
      setOverview(res);
    } catch (err: any) {
      addToast(err.message || 'Failed to load War Room overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverCompetitors = async () => {
    try {
      setIsDiscovering(true);
      const res = await api.discoverWarRoomCompetitors();
      if (res.candidates) {
        setDiscoveredCandidates(res.candidates);
        addToast(`Found ${res.candidates.length} candidate competitors from evidence.`, 'info');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleConfirmCompetitor = async (id: string, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      await api.updateCompetitorStatus(id, status);
      addToast(`Competitor marked as ${status.toLowerCase()}.`, 'success');
      loadOverview();
      setDiscoveredCandidates(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleAddProductGap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGapName.trim()) return;

    try {
      await api.evaluateProductGap({
        featureName: newGapName.trim(),
        category: newGapCategory.trim(),
        customerDemandScore: 8,
        competitiveUrgencyScore: 8,
        differentiationScore: 8,
        strategicImpactScore: 8,
        complexityScore: 4,
        riskScore: 2,
        evidenceStrengthScore: 8,
      });
      addToast('Product capability evaluated and scored.', 'success');
      setNewGapName('');
      setIsAddingGap(false);
      loadOverview();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleConvertOpportunity = async (oppId: string) => {
    try {
      const res = await api.convertOpportunityToCampaign(oppId);
      addToast('Campaign draft created in Campaign Hub.', 'success');
      loadOverview();
      setActiveView('campaigns');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleConvertThreat = async (threatId: string) => {
    try {
      await api.convertThreatToTask(threatId);
      addToast('Defensive task created in Execution Tasks.', 'success');
      loadOverview();
      setActiveView('tasks');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleConvertGap = async (gapId: string) => {
    try {
      await api.convertProductGapToTask(gapId);
      addToast('Product sprint task created in Execution Tasks.', 'success');
      loadOverview();
      setActiveView('tasks');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleApproveRec = async (recId: string) => {
    try {
      await api.approveRecommendation(recId, 'Approved by founder in War Room');
      addToast('Recommendation approved and logged in Decision Memory.', 'success');
      loadOverview();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleRejectRec = async (recId: string) => {
    try {
      await api.rejectRecommendation(recId, 'Rejected in War Room');
      addToast('Recommendation marked as rejected.', 'info');
      loadOverview();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleLaunchExperiment = async (recId: string) => {
    try {
      await api.convertRecommendationToExperiment(recId);
      addToast('Strategic Experiment launched in Evaluation framework.', 'success');
      loadOverview();
      setActiveView('evaluation');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-3">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
        <div className="text-xs font-semibold text-zinc-600 uppercase tracking-wider font-mono">
          Loading Strategic Market Model...
        </div>
      </div>
    );
  }

  // EMPTY STATE (Section 6 of requirements)
  if (!overview || !overview.marketModel) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="p-10 rounded-2xl border-2 border-dashed border-zinc-200 bg-white text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <Target className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Your market model has not been built yet
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              ResearchFlow builds a living model of your competitive landscape, customer demand, and product whitespace based on verified evidence.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsMapMarketOpen(true)}
              className="px-6 py-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              [ Map My Market ]
            </button>
          </div>
        </div>

        <MapMyMarketModal
          isOpen={isMapMarketOpen}
          onClose={() => setIsMapMarketOpen(false)}
          onSuccess={loadOverview}
        />
      </div>
    );
  }

  const {
    marketModel,
    pulse,
    competitors,
    recentMoves,
    productGaps,
    demandSignals,
    opportunities,
    threats,
    recommendations,
    scorecard,
    executiveBrief,
  } = overview;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. WAR ROOM TOP HERO & TITLE */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-transparent pointer-events-none rounded-bl-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono tracking-wider">
                Living Market Model & Strategy Decisions
              </span>
              <span className="text-zinc-400 text-xs">•</span>
              <span className="text-xs text-zinc-500 font-medium">
                Category: <strong>{marketModel.marketCategory}</strong>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 tracking-tight">
              MARKET WAR ROOM
            </h1>
            <p className="text-sm font-semibold text-indigo-700">
              "Your living model of the market."
            </p>
            <p className="text-xs text-zinc-600 leading-relaxed">
              ResearchFlow continuously connects competitor moves, customer signals, product gaps, market trends, and your own strategy into decisions.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              Strategic Search
            </button>

            <button
              onClick={() => setIsGraphOpen(true)}
              className="px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Network className="w-3.5 h-3.5 text-zinc-500" />
              Knowledge Graph
            </button>

            <button
              onClick={() => setIsScenarioOpen(true)}
              className="px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-900 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 text-purple-600 fill-current" />
              Scenario Simulator
            </button>

            <button
              onClick={() => setIsMapMarketOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5" />
              Update Market
            </button>
          </div>
        </div>

        {/* Perspective Switcher */}
        <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-2 shrink-0">
            Perspective:
          </span>
          {[
            { id: 'all', label: 'All Perspectives' },
            { id: 'executive', label: 'Executive View' },
            { id: 'product', label: 'Product Team' },
            { id: 'marketing', label: 'Marketing Team' },
            { id: 'sales', label: 'Sales View' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setPerspective(tab.id as WarRoomRolePerspective)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                perspective === tab.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MARKET PULSE METRICS BAR WITH EXPLANATIONS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1 shadow-2xs group relative" title="Overall market health calculated from competitor aggressiveness, evidence freshness, and unresolved threats.">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Market Health
            </span>
            <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-600" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                pulse.healthStatus === 'HEALTHY'
                  ? 'bg-emerald-500'
                  : pulse.healthStatus === 'NEEDS_ATTENTION'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-bold text-zinc-900">{pulse.healthStatus.replace('_', ' ')}</span>
          </div>
          <p className="text-[10px] text-zinc-400 hidden group-hover:block">Strategic posture score</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1 shadow-2xs group relative" title="Active competitor domains and product alternatives monitored in this workspace.">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Competitor Coverage
            </span>
            <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-600" />
          </div>
          <div className="text-base font-extrabold text-zinc-900">
            {pulse.competitorCoverageCount} <span className="text-xs font-normal text-zinc-500">Tracked</span>
          </div>
          <p className="text-[10px] text-zinc-400 hidden group-hover:block">Monitored rivals</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1 shadow-2xs group relative" title="Percentage of citations, pricing claims, and feature proof verified within the last 30 days.">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Evidence Freshness
            </span>
            <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-600" />
          </div>
          <div className="text-base font-extrabold text-indigo-600">
            {pulse.evidenceFreshnessPercent}% <span className="text-xs font-normal text-zinc-500">Last 30d</span>
          </div>
          <p className="text-[10px] text-zinc-400 hidden group-hover:block">Verified recently</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1 shadow-2xs col-span-2 lg:col-span-1" title="Highest leverage opportunity or defensive action ranked by revenue potential.">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Top Priority
          </span>
          <div className="text-xs font-bold text-zinc-900 truncate" title={pulse.topPriorityTitle}>
            {pulse.topPriorityTitle}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1 shadow-2xs col-span-2 lg:col-span-1" title="Most urgent competitor release, price cut, or marketing shift requiring response.">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Imminent Threat
          </span>
          <div className="text-xs font-bold text-rose-600 truncate" title={pulse.topThreatTitle}>
            {pulse.topThreatTitle}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1 shadow-2xs col-span-2 lg:col-span-1" title="Unaddressed buyer pain point or underserved feature where competitors are weak.">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Whitespace Opening
          </span>
          <div className="text-xs font-bold text-emerald-600 truncate" title={pulse.biggestOpportunityTitle}>
            {pulse.biggestOpportunityTitle}
          </div>
        </div>
      </div>

      {/* 3. DAILY EXECUTIVE BRIEFING */}
      {(perspective === 'all' || perspective === 'executive') && executiveBrief && (
        <div className="p-5 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/20 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                Daily Strategic Executive Briefing
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              {new Date(executiveBrief.generatedDate).toLocaleDateString()}
            </span>
          </div>

          <p className="text-xs text-zinc-700 leading-relaxed font-medium">
            {executiveBrief.statusSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white border border-indigo-100 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Key Developments
              </div>
              <ul className="text-xs text-zinc-700 space-y-1">
                {executiveBrief.topDevelopments.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-white border border-rose-100 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Critical Risks
              </div>
              <ul className="text-xs text-zinc-700 space-y-1">
                {executiveBrief.topRisks.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-100 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Recommended Actions
              </div>
              <ul className="text-xs text-zinc-700 space-y-1">
                {executiveBrief.recommendedActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION: COMPETITOR UNIVERSE & COVERAGE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Competitor Universe</h2>
            <p className="text-xs text-zinc-500">
              Active tiering, verified positioning claims, and continuous change detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscoverCompetitors}
              disabled={isDiscovering}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {isDiscovering ? 'Discovering...' : 'Discover Candidates'}
            </button>
          </div>
        </div>

        {/* Discovered Candidates Drawer */}
        {discoveredCandidates.length > 0 && (
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Discovered Candidate Competitors ({discoveredCandidates.length})
              </h4>
              <button
                onClick={() => setDiscoveredCandidates([])}
                className="text-[11px] text-purple-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {discoveredCandidates.map(c => (
                <div key={c.id} className="p-3 bg-white rounded-lg border border-purple-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-900">{c.name}</div>
                    <div className="text-[11px] text-zinc-500 line-clamp-1">{c.positioningSummary}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={() => handleConfirmCompetitor(c.id, 'CONFIRMED')}
                      className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-semibold hover:bg-emerald-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleConfirmCompetitor(c.id, 'REJECTED')}
                      className="px-2 py-1 bg-zinc-200 text-zinc-700 rounded text-[10px] font-semibold hover:bg-zinc-300"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {competitors.map(comp => (
            <div
              key={comp.id}
              className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all space-y-3 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-bold border border-zinc-200">
                    {comp.tier} · {comp.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {comp.sourceConfidence}% Confidence
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-950">{comp.name}</h3>
                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                  {comp.positioningSummary}
                </p>

                <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5 text-xs">
                  <div className="text-zinc-600">
                    <span className="font-semibold text-zinc-900">Pricing:</span> {comp.pricingModel}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Strengths:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {comp.strengths.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-700 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Updated {comp.lastCrawledAt ? new Date(comp.lastCrawledAt).toLocaleDateString() : 'Active'}</span>
                <a
                  href={comp.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 font-semibold"
                >
                  Site <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SECTION: COMPETITOR MOVE MONITOR & "WHY THIS MATTERS" ENGINE */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Competitor Move Monitor</h2>
          <p className="text-xs text-zinc-500">
            Detected pricing adjustments, feature launches, and messaging pivots evaluated by the Change Significance Engine.
          </p>
        </div>

        <div className="space-y-3">
          {recentMoves.map(move => {
            const isExpanded = expandedMoveId === move.id;
            const isHighOrCrit = move.significance === 'HIGH' || move.significance === 'CRITICAL';
            return (
              <div
                key={move.id}
                className={`rounded-xl border transition-all ${
                  isHighOrCrit
                    ? 'border-amber-200/80 bg-amber-50/20'
                    : 'border-zinc-200 bg-white'
                }`}
              >
                <div
                  onClick={() => setExpandedMoveId(isExpanded ? null : move.id)}
                  className="p-4 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${
                        move.significance === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : move.significance === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {move.significance}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">{move.competitorName}:</span>
                        <span className="text-xs font-semibold text-zinc-800">{move.title}</span>
                      </div>
                      <span className="text-[11px] text-zinc-500 line-clamp-1">{move.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {new Date(move.detectedAt).toLocaleDateString()}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </div>
                </div>

                {/* Expanded "Why This Matters" Engine */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-zinc-100 space-y-3 text-xs bg-white/80 rounded-b-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Strategic Implication
                        </span>
                        <p className="text-xs text-zinc-700">{move.whyThisMatters.strategicImplication}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                          Competitor Intent
                        </span>
                        <p className="text-xs text-zinc-700">{move.whyThisMatters.competitorIntent}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                          Our Vulnerability
                        </span>
                        <p className="text-xs text-zinc-700">{move.whyThisMatters.ourVulnerability}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Recommended Response
                        </span>
                        <p className="text-xs text-zinc-700 font-medium">{move.whyThisMatters.recommendedResponse}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span className="truncate max-w-md">Snippet: "{move.evidenceSnippet}"</span>
                      {move.sourceUrl && (
                        <a
                          href={move.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          Verify Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. SECTION: PRODUCT GAP RADAR & "WHAT SHOULD WE BUILD NEXT?" */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Product Gap Radar & Roadmap Scoring</h2>
            <p className="text-xs text-zinc-500">
              Scored via: (Demand × Urgency × Differentiation × Impact × Evidence) ÷ (Complexity + Risk)
            </p>
          </div>

          <button
            onClick={() => setIsAddingGap(!isAddingGap)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            Evaluate New Capability
          </button>
        </div>

        {/* Add Gap Form */}
        {isAddingGap && (
          <form onSubmit={handleAddProductGap} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
              Evaluate New Product Capability
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Capability Name (e.g. Chrome Extension 1-Click Scanner)"
                value={newGapName}
                onChange={e => setNewGapName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Category (e.g. Workflow Automation)"
                value={newGapCategory}
                onChange={e => setNewGapCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingGap(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Run Scoring Algorithm
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {productGaps.map(gap => {
            const isExpanded = expandedGapId === gap.id;
            const actionColor =
              gap.recommendationAction === 'BUILD'
                ? 'bg-emerald-100 text-emerald-800'
                : gap.recommendationAction === 'TEST'
                ? 'bg-blue-100 text-blue-800'
                : gap.recommendationAction === 'PARTNER'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-zinc-100 text-zinc-700';

            return (
              <div key={gap.id} className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-bold border border-zinc-200">
                        {gap.classification.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${actionColor}`}>
                        ACTION: {gap.recommendationAction}
                      </span>
                      <span className="text-[11px] text-zinc-400">Our Status: <strong>{gap.ourStatus}</strong></span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900">{gap.featureName}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-indigo-700">
                        Score: {gap.buildPriorityScore.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-400">Roadmap Rank</div>
                    </div>

                    <button
                      onClick={() => handleConvertGap(gap.id)}
                      className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-black rounded-lg text-xs font-semibold transition-all shadow-2xs"
                    >
                      Convert to Task
                    </button>

                    <button
                      onClick={() => setExpandedGapId(isExpanded ? null : gap.id)}
                      className="p-1 text-zinc-400 hover:text-zinc-700"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Scoring factors pills */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 font-mono pt-1">
                  <span className="px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">Demand: {gap.customerDemandScore}/10</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">Urgency: {gap.competitiveUrgencyScore}/10</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">Diff: {gap.differentiationScore}/10</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">Impact: {gap.strategicImpactScore}/10</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">Evidence: {gap.evidenceStrengthScore}/10</span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Complexity: {gap.complexityScore}/10</span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Risk: {gap.riskScore}/10</span>
                </div>

                {/* Expanded Details: Counter-Analysis & Do Nothing */}
                {isExpanded && (
                  <div className="pt-3 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-zinc-50/50 p-3 rounded-lg">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                        Why Not Build This? (Counter-Analysis)
                      </span>
                      <p className="text-xs text-zinc-700">{gap.whyNotBuild}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Do Nothing Scenario
                      </span>
                      <p className="text-xs text-zinc-700">{gap.doNothingScenario}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. SECTION: CUSTOMER DEMAND SIGNALS (VOICE-OF-CUSTOMER) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Customer Demand Signals</h2>
          <p className="text-xs text-zinc-500">
            Voice-of-Customer pain points clustered by frequency across verified reviews, threads, and feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demandSignals.map(signal => (
            <div key={signal.id} className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                  {signal.customerRole}
                </span>
                <span className="text-xs font-bold text-indigo-600 font-mono">
                  {signal.frequencyCount} Citations
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-900">{signal.clusterTitle}</h4>
                <p className="text-[11px] text-zinc-600 mt-1">{signal.painPoint}</p>
              </div>

              <div className="pt-2 border-t border-zinc-100 space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Verified Quotes:
                </span>
                {signal.rawQuotes.map((q, i) => (
                  <div key={i} className="text-[11px] text-zinc-700 italic bg-zinc-50 p-2 rounded border border-zinc-100">
                    "{q.quote}"
                    <div className="text-[9px] text-zinc-400 not-italic text-right mt-0.5">— {q.source}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. SECTION: OPPORTUNITY & THREAT RADAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opportunities Radar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Strategic Opportunities
              </h3>
              <p className="text-[11px] text-zinc-500">Whitespace openings ready to convert into GTM campaigns.</p>
            </div>
          </div>

          <div className="space-y-3">
            {opportunities.map(opp => (
              <div key={opp.id} className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                    {opp.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Confidence: <strong>{opp.confidenceScore}%</strong>
                  </span>
                </div>

                <h4 className="text-xs font-bold text-zinc-900">{opp.title}</h4>
                <p className="text-[11px] text-zinc-600 leading-relaxed">{opp.description}</p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">Impact: {opp.expectedImpact}</span>
                  <button
                    onClick={() => handleConvertOpportunity(opp.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs"
                  >
                    Convert to Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threats Radar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Strategic Threats
              </h3>
              <p className="text-[11px] text-zinc-500">Competitor expansion signals with defensive plans.</p>
            </div>
          </div>

          <div className="space-y-3">
            {threats.map(threat => (
              <div key={threat.id} className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
                    {threat.threatLevel} THREAT
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Source: {threat.competitorName || 'Market'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-zinc-900">{threat.title}</h4>
                <p className="text-[11px] text-zinc-600 leading-relaxed">{threat.description}</p>

                <div className="text-[11px] text-rose-900 bg-white p-2 rounded border border-rose-100">
                  <span className="font-semibold">Countermeasure:</span> {threat.defensiveCountermeasure}
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => handleConvertThreat(threat.id)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs"
                  >
                    Convert to Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. SECTION: STRATEGIC RECOMMENDATIONS */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Strategic Recommendations</h2>
          <p className="text-xs text-zinc-500">
            Rigorous, evidence-backed actions explicitly distinguishing between Observed Facts, Inferences, and Forecasts.
          </p>
        </div>

        <div className="space-y-3">
          {recommendations.map(rec => {
            const typeColor =
              rec.type === 'FACT'
                ? 'bg-emerald-100 text-emerald-800'
                : rec.type === 'INFERENCE'
                ? 'bg-blue-100 text-blue-800'
                : rec.type === 'FORECAST'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-indigo-100 text-indigo-800';

            return (
              <div key={rec.id} className="p-5 rounded-xl border border-zinc-200 bg-white space-y-3 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${typeColor}`}>
                      {rec.type}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold">
                      {rec.priority} · {rec.actionType.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-zinc-400">Confidence: {rec.confidence}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLaunchExperiment(rec.id)}
                      className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-lg text-xs font-semibold"
                    >
                      Run Experiment
                    </button>
                    <button
                      onClick={() => handleApproveRec(rec.id)}
                      className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRec(rec.id)}
                      className="px-3 py-1 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-lg text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-zinc-950">{rec.title}</h3>
                <p className="text-xs text-zinc-700 leading-relaxed">{rec.rationale}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      What If We Do Nothing?
                    </span>
                    <p className="text-[11px] text-zinc-600">{rec.whatIfWeDoNothing}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                      Why This Could Fail:
                    </span>
                    <p className="text-[11px] text-zinc-600">{rec.whyThisCouldFail}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Metric To Evaluate:
                    </span>
                    <p className="text-[11px] text-zinc-600 font-medium">{rec.metricToEvaluate}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10. SECTION: COMPANY SCORECARD */}
      {scorecard && (
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Our Company Defensibility Scorecard</h3>
              <p className="text-xs text-zinc-500">
                Grounded in {scorecard.evidenceGroundingCount} verified research claims. No synthetic or hallucinated metrics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500">Defensibility:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                {scorecard.defensibilityRating} ({scorecard.moatScore}/100)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Verified Competitive Strengths
              </h4>
              <ul className="space-y-1.5 text-zinc-700">
                {scorecard.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                Critical Vulnerabilities & Areas to Shore Up
              </h4>
              <ul className="space-y-1.5 text-zinc-700">
                {scorecard.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MapMyMarketModal
        isOpen={isMapMarketOpen}
        onClose={() => setIsMapMarketOpen(false)}
        onSuccess={loadOverview}
        initialData={{
          marketCategory: marketModel.marketCategory,
          targetCustomers: marketModel.targetCustomers,
          strategicGoal: marketModel.strategicGoal,
          knownCompetitors: marketModel.knownCompetitors,
          keyDifferentiators: marketModel.keyDifferentiators,
        }}
      />

      <ScenarioSimulatorModal
        isOpen={isScenarioOpen}
        onClose={() => setIsScenarioOpen(false)}
        competitorNames={competitors.map(c => c.name)}
      />

      <MarketGraphModal
        isOpen={isGraphOpen}
        onClose={() => setIsGraphOpen(false)}
      />

      <StrategicSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};
