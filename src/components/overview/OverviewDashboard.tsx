import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { ResearchJob, Evidence, ExecutionTask, AuditEvent } from '../../types';
import { StatusBadge, EvidenceTypeBadge, SeverityBadge } from '../common/Badge';
import { ResearchInsightsWidget } from './ResearchInsightsWidget';
import { CategoryDistributionWidget } from './CategoryDistributionWidget';
import {
  LayoutDashboard,
  Search,
  Database,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plus,
  TrendingUp,
  ShieldCheck,
  Zap,
  TestTube2
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    activeWorkspace,
    setActiveView,
    setSelectedJobId,
    setIsNewResearchModalOpen,
    addToast,
    refreshWorkspaces
  } = useWorkspace();

  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [recentEvidence, setRecentEvidence] = useState<Evidence[]>([]);
  const [allEvidence, setAllEvidence] = useState<Evidence[]>([]);
  const [activity, setActivity] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, tasksData, activityData] = await Promise.all([
        api.getResearchJobs(),
        api.getTasks(),
        api.getActivity(6),
      ]);
      setJobs(jobsData);
      setTasks(tasksData);
      setActivity(activityData);

      // Load all workspace evidence for category distribution visualization
      try {
        const evidenceData = await api.getAllEvidence();
        setAllEvidence(evidenceData || []);
        if (evidenceData && evidenceData.length > 0) {
          setRecentEvidence(evidenceData.slice(0, 4));
        } else if (jobsData.length > 0) {
          const latestJob = await api.getResearchJob(jobsData[0].id);
          setRecentEvidence(latestJob.evidence?.slice(0, 4) || []);
          setAllEvidence(latestJob.evidence || []);
        }
      } catch {
        // Fallback aggregation
        if (jobsData.length > 0) {
          const collected: Evidence[] = [];
          for (const j of jobsData.slice(0, 3)) {
            const jFull = await api.getResearchJob(j.id);
            if (jFull.evidence) collected.push(...jFull.evidence);
          }
          setAllEvidence(collected);
          setRecentEvidence(collected.slice(0, 4));
        }
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace?.id]);

  const reviewQueueJobs = jobs.filter((j) => j.status === 'awaiting_review' || j.status === 'partial');
  const totalEvidenceCount = jobs.reduce((acc, j) => acc + (j.evidenceCount || 0), 0);
  const totalConflictsCount = jobs.reduce((acc, j) => acc + (j.conflictsCount || 0), 0);
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Workspace Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 md:p-6 lg:p-7 shadow-sm border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Ambient glow in corner */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autonomous Intelligence Core</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-300/90 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-400/20">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Neural Synthesis Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 flex-wrap">
            <span>{activeWorkspace?.businessName || 'Market Workspace'}</span>
            {activeWorkspace?.industry && (
              <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-md bg-white/10 text-zinc-300 border border-white/10 font-mono">
                {activeWorkspace.industry}
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-300/90 max-w-2xl leading-relaxed">
            {activeWorkspace?.description ||
              'Real-time competitor evidence extraction, positioning audits, and execution-ready growth campaigns.'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveView('evaluation')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <TestTube2 className="w-4 h-4 text-indigo-300" />
            <span>Run Evaluation (12 TCs)</span>
          </button>
          <button
            onClick={() => setIsNewResearchModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Job</span>
          </button>
        </div>
      </div>

      {/* Empty Workspace Quickstart Guide vs Active Dashboard */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-10 shadow-2xs text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">
              Welcome to your {activeWorkspace?.businessName || 'Market'} Intelligence Workspace
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              No competitor research jobs have been executed yet for this workspace. Add competitor URLs to start extracting evidence claims, pricing models, and campaign briefs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 bg-gradient-to-b from-indigo-50/50 to-white rounded-xl border border-indigo-100 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Start First Research Job</span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Input 1–5 competitor website URLs to crawl claims, pricing tables, and user pain points.
                </p>
              </div>
              <button
                onClick={() => setIsNewResearchModalOpen(true)}
                className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Research Job</span>
              </button>
            </div>

            <div className="p-5 bg-zinc-50/80 rounded-xl border border-zinc-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-zinc-800 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Load Sample Benchmark</span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Explore pre-configured evidence, positioning matrices, and campaign briefs on a sample startup.
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await api.seedDemo();
                    addToast('Loaded sample benchmark scenario', 'success');
                    setSelectedJobId(res.job.id);
                    setActiveView('research');
                    refreshWorkspaces();
                  } catch (err: any) {
                    addToast(err.message, 'error');
                  }
                }}
                className="w-full py-2.5 px-3 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Load Sample Job</span>
              </button>
            </div>

            <div className="p-5 bg-zinc-50/80 rounded-xl border border-zinc-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-zinc-800 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>Run 12 Reliability Tests</span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-2 leading-relaxed">
                  Execute the 12-adversarial test case evaluation suite with live verification scorecards.
                </p>
              </div>
              <button
                onClick={() => setActiveView('evaluation')}
                className="w-full py-2.5 px-3 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <TestTube2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Run Evaluation</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 text-xs">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="font-semibold">Review Queue</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-zinc-900">{reviewQueueJobs.length}</p>
              <p className="text-[11px] text-zinc-600">Awaiting founder/operator approval</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="font-semibold">Verified Evidence Base</span>
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-600">{totalEvidenceCount}</p>
              <p className="text-[11px] text-zinc-600">Claims grounded in public sources</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="font-semibold">Detected Conflicts</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-zinc-900">{totalConflictsCount}</p>
              <p className="text-[11px] text-zinc-600">Pricing / claim discrepancies</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="font-semibold">Execution Tasks Done</span>
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {completedTasksCount} / {tasks.length}
              </p>
              <p className="text-[11px] text-zinc-600">Actionable strategic checklist</p>
            </div>
          </div>

          {/* Research Insights Executive Brief (Gemini AI Powered) */}
          <ResearchInsightsWidget
            onExploreEvidence={() => setActiveView('evidence')}
            onViewCampaigns={() => setActiveView('campaigns')}
          />

          {/* AI Research Categories Distribution Visualizer (Recharts) */}
          <CategoryDistributionWidget
            evidence={allEvidence}
            jobs={jobs}
            onExploreCategory={() => setActiveView('evidence')}
            onExploreAllEvidence={() => setActiveView('evidence')}
          />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column: Review Queue & Active Pipelines (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* Review Queue Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 md:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Campaign Approval Queue</span>
              </h3>
              <button
                onClick={() => setActiveView('research')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View all jobs
              </button>
            </div>

            {reviewQueueJobs.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-50 rounded-xl border border-zinc-100">
                Zero jobs pending review. Launch a new research pipeline to extract competitor insights.
              </div>
            ) : (
              <div className="space-y-2.5">
                {reviewQueueJobs.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => {
                      setSelectedJobId(j.id);
                      setActiveView('research');
                    }}
                    className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/80 hover:border-amber-400 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">{j.businessName}</span>
                        <StatusBadge status={j.status} />
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-0.5 line-clamp-1">{j.campaignObjective}</p>
                    </div>

                    <div className="flex items-center gap-1 text-amber-900 font-bold text-[11px] shrink-0">
                      <span>Inspect & Approve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Evidence Stream */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 md:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Recent Verified Claims</span>
              </h3>
              <button
                onClick={() => setActiveView('evidence')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Explore evidence base
              </button>
            </div>

            {recentEvidence.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-50 rounded-xl">
                No recent evidence extracted.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentEvidence.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-800">{e.category}</span>
                        <EvidenceTypeBadge type={e.evidenceType} />
                      </div>
                      <span className="text-zinc-600 truncate max-w-[160px]">{e.sourceTitle}</span>
                    </div>
                    <p className="font-medium text-zinc-900 leading-snug">{e.claim}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Execution Checklist & Audit Timeline */}
        <div className="space-y-5 sm:space-y-6 min-w-0">
          {/* Active Tasks Widget */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 md:p-6 shadow-2xs space-y-3 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 truncate">
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Tactical Tasks</span>
              </h3>
              <button
                onClick={() => setActiveView('tasks')}
                className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
              >
                Full list
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-xs bg-zinc-50 rounded-xl">
                No active tasks. Approve a campaign to generate tasks.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {tasks.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200/80 flex items-start gap-2 min-w-0"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        t.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold break-words ${t.status === 'COMPLETED' ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>
                        {t.title}
                      </p>
                      <span className="text-[10px] text-zinc-600 font-mono block truncate">{t.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline Preview */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 md:p-6 shadow-2xs space-y-3.5 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-zinc-900 truncate">Recent Audit Events</h3>
              <button
                onClick={() => setActiveView('audit')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline shrink-0 cursor-pointer"
              >
                View all ({activity.length})
              </button>
            </div>

            {activity.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-xs bg-zinc-50 rounded-xl">
                No recent audit events recorded.
              </div>
            ) : (
              <div className="space-y-2.5 text-xs max-h-[360px] overflow-y-auto pr-1">
                {activity.slice(0, 10).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 bg-zinc-50/80 hover:bg-zinc-50 rounded-xl border border-zinc-200/80 transition-colors space-y-1 min-w-0 break-words"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
                      <span className="text-zinc-500 font-mono font-medium shrink-0">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {evt.eventType && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[9px] uppercase tracking-wider font-semibold truncate max-w-[130px]">
                          {evt.eventType.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-800 text-[11px] font-medium leading-snug break-words hyphens-auto">
                      {evt.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
