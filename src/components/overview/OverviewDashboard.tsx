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
    addToast
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
      <div className="bg-gradient-to-r from-zinc-900 to-indigo-950 text-white rounded-2xl p-5 md:p-6 lg:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded uppercase">
              Operational Wedge
            </span>
            <span className="text-xs text-zinc-400 font-mono">5-Day Sprint Engine</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {activeWorkspace?.businessName || 'NextGen Resume AI'}
          </h2>
          <p className="text-xs text-zinc-300 max-w-2xl mt-1 leading-relaxed">
            {activeWorkspace?.description ||
              'Evidence-backed competitor intelligence and strategy execution system.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveView('evaluation')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors flex items-center gap-1.5"
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
            <span className="font-semibold">Sprint Tasks Done</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {completedTasksCount} / {tasks.length}
          </p>
          <p className="text-[11px] text-zinc-600">Actionable execution checklist</p>
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
        <div className="space-y-5 sm:space-y-6">
          {/* Active Tasks Widget */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 md:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Sprint Tasks</span>
              </h3>
              <button
                onClick={() => setActiveView('tasks')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
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
                    className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200/80 flex items-start gap-2"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        t.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className={`font-semibold ${t.status === 'COMPLETED' ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>
                        {t.title}
                      </p>
                      <span className="text-[10px] text-zinc-600 font-mono">{t.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline Preview */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 md:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Recent Audit Events</h3>
              <button
                onClick={() => setActiveView('audit')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View log
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {activity.map((evt) => (
                <div key={evt.id} className="border-l-2 border-indigo-300 pl-2.5 py-0.5 space-y-0.5">
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="text-zinc-800 text-[11px] font-medium leading-snug">{evt.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
