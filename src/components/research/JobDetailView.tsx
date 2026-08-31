import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import {
  ResearchJob,
  ResearchSource,
  Evidence,
  ConflictItem,
  IntelligenceReport,
  CampaignBrief,
  CampaignAsset,
  ExecutionTask,
  ResearchCategory,
  ResearchShareLink,
  ResearchReviewAssignment,
  ReviewTargetSection,
} from '../../types';
import { StatusBadge, ConfidenceBadge, EvidenceTypeBadge, SeverityBadge, CategoryBadge } from '../common/Badge';
import { EvidenceCard } from '../common/EvidenceCard';
import { ConflictBanner } from '../common/ConflictBanner';
import { ExportReportModal } from './ExportReportModal';
import { ActionableTasksExtractor } from './ActionableTasksExtractor';
import { ShareResearchModal } from './ShareResearchModal';
import { SharedResearchPreviewModal } from './SharedResearchPreviewModal';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Layers,
  Database,
  BrainCircuit,
  Megaphone,
  CheckSquare,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Globe,
  Send,
  Mail,
  Linkedin,
  SearchCheck,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Share2,
  Key,
  ListOrdered,
  ArrowRight,
  User,
  Award,
  Download,
  Printer,
  Eye
} from 'lucide-react';

export const JobDetailView: React.FC<{ jobId: string }> = ({ jobId }) => {
  const { activeWorkspace, addToast, refreshWorkspaces, setActiveView } = useWorkspace();
  const [jobData, setJobData] = useState<{
    job: ResearchJob;
    sources: ResearchSource[];
    evidence: Evidence[];
    conflicts: ConflictItem[];
    intelligence?: IntelligenceReport;
    campaignBrief?: CampaignBrief;
    assets: CampaignAsset[];
    tasks: ExecutionTask[];
    shareLinks: ResearchShareLink[];
    reviewAssignments: ResearchReviewAssignment[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    'pipeline' | 'sources' | 'evidence' | 'conflicts' | 'intelligence' | 'brief' | 'assets' | 'tasks'
  >('pipeline');

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchEvidence, setSearchEvidence] = useState<string>('');
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Share & Review Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [previewShareToken, setPreviewShareToken] = useState<string | null>(null);
  const [shareTargetNote, setShareTargetNote] = useState<string | undefined>(undefined);
  const [shareTargetSection, setShareTargetSection] = useState<ReviewTargetSection>('RESEARCH_NOTES');

  const openShareForNote = (noteText: string, section: ReviewTargetSection = 'RESEARCH_NOTES') => {
    setShareTargetNote(noteText);
    setShareTargetSection(section);
    setIsShareModalOpen(true);
  };

  const loadJob = async () => {
    try {
      const data = await api.getResearchJob(jobId);
      setJobData({
        job: data,
        sources: data.sources || [],
        evidence: data.evidence || [],
        conflicts: data.conflicts || [],
        intelligence: data.intelligence,
        campaignBrief: data.campaignBrief,
        assets: data.assets || [],
        tasks: data.tasks || [],
        shareLinks: data.shareLinks || [],
        reviewAssignments: data.reviewAssignments || [],
      });
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  useEffect(() => {
    loadJob();
  }, [jobId, activeWorkspace?.id]);

  // Polling when job is actively running
  useEffect(() => {
    if (!jobData?.job) return;
    const runningStatuses = [
      'queued',
      'validating',
      'researching',
      'extracting',
      'normalizing',
      'analyzing',
      'generating',
      'validating_output',
    ];

    if (runningStatuses.includes(jobData.job.status)) {
      setIsRunning(true);
      const interval = setInterval(async () => {
        try {
          const updated = await api.getResearchJob(jobId);
          setJobData({
            job: updated,
            sources: updated.sources || [],
            evidence: updated.evidence || [],
            conflicts: updated.conflicts || [],
            intelligence: updated.intelligence,
            campaignBrief: updated.campaignBrief,
            assets: updated.assets || [],
            tasks: updated.tasks || [],
          });
          if (!runningStatuses.includes(updated.status)) {
            setIsRunning(false);
            clearInterval(interval);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1500);

      return () => clearInterval(interval);
    } else {
      setIsRunning(false);
    }
  }, [jobData?.job?.status, jobId]);

  if (!jobData) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs">Loading research job telemetry...</p>
      </div>
    );
  }

  const { job, sources, evidence, conflicts, intelligence, campaignBrief, assets, tasks } = jobData;

  const handleRunPipeline = async () => {
    try {
      setIsRunning(true);
      addToast('Triggering research & synthesis pipeline...', 'info');
      await api.runResearchJob(jobId);
      loadJob();
    } catch (err: any) {
      addToast(err.message, 'error');
      setIsRunning(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.approveResearchJob(jobId, reviewNotes);
      addToast('Campaign approved! Actionable execution tasks generated.', 'success');
      setIsApproving(false);
      loadJob();
      refreshWorkspaces();
      setActiveTab('tasks');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      addToast('Please provide a reason for rejecting the campaign.', 'warning');
      return;
    }
    try {
      await api.rejectResearchJob(jobId, rejectReason);
      addToast('Campaign brief marked as rejected.', 'info');
      setIsRejecting(false);
      loadJob();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleCopyAsset = (channel: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(channel);
    addToast(`Copied ${channel} asset copy to clipboard`, 'success');
    setTimeout(() => setCopiedChannel(null), 2500);
  };

  const handleToggleTask = async (task: ExecutionTask) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      loadJob();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // Filter evidence
  const filteredEvidence = evidence.filter(e => {
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const q = (searchEvidence || '').toLowerCase().trim();
    const matchesSearch =
      !q ||
      (e.claim && e.claim.toLowerCase().includes(q)) ||
      (e.supportingText && e.supportingText.toLowerCase().includes(q)) ||
      (e.sourceTitle && e.sourceTitle.toLowerCase().includes(q)) ||
      (e.sourceUrl && e.sourceUrl.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const categories: ResearchCategory[] = [
    'Product',
    'Pricing',
    'Features',
    'Positioning',
    'Audience',
    'Messaging',
    'Call To Action',
    'Differentiators',
    'Pain Points',
    'Potential Gaps',
    'Trust Signals',
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 md:p-6 lg:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                {job.businessName}
              </h2>
              <StatusBadge status={job.status} />
              {job.isDemo && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded uppercase">
                  Verified Demo Sample
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 mt-1 max-w-3xl">
              <span className="font-semibold text-zinc-800">Objective:</span> {job.campaignObjective}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              <span className="font-semibold text-zinc-700">Target Audience:</span> {job.targetAudience}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {isRunning ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>Running Pipeline ({job.progressPercent}%)</span>
              </div>
            ) : (
              <button
                id="btn-run-pipeline"
                onClick={handleRunPipeline}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg border border-zinc-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
                <span>Re-run Analysis</span>
              </button>
            )}

            <button
              id="btn-share-research-job"
              onClick={() => {
                setShareTargetNote(undefined);
                setShareTargetSection('FULL_RESEARCH');
                setIsShareModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100/90 rounded-lg border border-indigo-200 transition-colors shadow-2xs"
              title="Share research dossier or assign team review"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Share & Review</span>
              {((jobData?.shareLinks?.length || 0) + (jobData?.reviewAssignments?.length || 0)) > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {(jobData?.shareLinks?.length || 0) + (jobData?.reviewAssignments?.length || 0)}
                </span>
              )}
            </button>

            <button
              id="btn-export-job-report"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg border border-zinc-200 transition-colors"
              title="Export research briefing to PDF or CSV"
            >
              <Download className="w-3.5 h-3.5 text-zinc-600" />
              <span>Export Report</span>
            </button>

            {job.status === 'awaiting_review' && (
              <>
                <button
                  id="btn-approve-campaign"
                  onClick={() => setIsApproving(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Campaign</span>
                </button>
                <button
                  id="btn-reject-campaign"
                  onClick={() => setIsRejecting(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Step Tracker / Progress Bar */}
        {job.currentStepMessage && (
          <div className="pt-4">
            <div className="flex items-center justify-between text-xs text-zinc-600 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                {job.currentStepMessage}
              </span>
              <span className="font-mono font-semibold">{job.progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${job.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* High-Level Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-4 border-t border-zinc-100 text-xs">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-[11px] text-zinc-500 font-medium">Verified Sources</span>
            <p className="text-lg font-bold text-zinc-900 mt-0.5">
              {sources.filter(s => s.status === 'completed').length} / {sources.length}
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-[11px] text-zinc-500 font-medium">Extracted Evidence</span>
            <p className="text-lg font-bold text-indigo-600 mt-0.5">{evidence.length}</p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-[11px] text-zinc-500 font-medium">Competitor Conflicts</span>
            <p className={`text-lg font-bold mt-0.5 ${conflicts.length > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>
              {conflicts.length}
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <span className="text-[11px] text-zinc-500 font-medium">Execution Tasks</span>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">
              {tasks.filter(t => t.status === 'COMPLETED').length} / {tasks.length}
            </p>
          </div>
        </div>

        {/* Active Team Review & Sharing Banner */}
        {((jobData?.reviewAssignments && jobData.reviewAssignments.length > 0) ||
          (jobData?.shareLinks && jobData.shareLinks.length > 0)) && (
          <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Team Collaboration & Active Reviews</span>
              </span>
              <button
                onClick={() => {
                  setShareTargetNote(undefined);
                  setIsShareModalOpen(true);
                }}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
              >
                <span>Manage Shares & Reviewers</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {jobData.reviewAssignments?.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-indigo-50/50 border border-indigo-200/70 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        rev.assignedToAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                      }
                      alt={rev.assignedToName}
                      className="w-7 h-7 rounded-full object-cover border border-indigo-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-900 text-xs truncate">
                        {rev.assignedToName}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        Section: {rev.targetSection.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rev.status === 'CHANGES_REQUESTED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : rev.status === 'IN_REVIEW'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {rev.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}

              {jobData.shareLinks?.map((sl) => {
                const linkUrl = `${window.location.origin}/share/research/${sl.token}`;
                return (
                  <div
                    key={sl.id}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-xs truncate">
                        <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{sl.title}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Scope: {sl.scope.replace('_', ' ')} • {sl.viewsCount || 0} views
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(linkUrl);
                          addToast('Share link copied to clipboard', 'success');
                        }}
                        className="px-2 py-1 bg-white hover:bg-zinc-100 text-zinc-700 font-semibold rounded border border-zinc-200 text-[10px] transition-colors flex items-center gap-1"
                        title="Copy Link"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => setPreviewShareToken(sl.token)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded border border-indigo-200 text-[10px] transition-colors flex items-center gap-1"
                        title="Preview Live View"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Human Review Modals */}
      {isApproving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm Human Campaign Approval</span>
            </div>
            <p className="text-xs text-zinc-600">
              Approving this campaign marks the strategy as verified and automatically generates 4+ prioritized execution tasks.
            </p>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Optional Review Notes or Execution Guidance
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="e.g., Positioning approved. Emphasize recruiter ATS scoring in first LinkedIn teardown."
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsApproving(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                Approve & Generate Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {isRejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <XCircle className="w-5 h-5" />
              <span>Reject Campaign Strategy</span>
            </div>
            <p className="text-xs text-zinc-600">
              Please specify the reason for rejection to update the audit log and refine future runs.
            </p>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g., Positioning is too generic; need stronger emphasis on technical junior talent."
                required
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setIsRejecting(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-zinc-200 flex items-center gap-1.5 overflow-x-auto pb-px">
        {[
          { id: 'pipeline', label: 'Pipeline State', icon: Layers, count: undefined },
          { id: 'sources', label: 'Sources', icon: Globe, count: sources.length },
          { id: 'evidence', label: 'Evidence Base', icon: ShieldCheck, count: evidence.length },
          { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle, count: conflicts.length },
          { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit, count: intelligence?.marketOpportunities?.length },
          { id: 'brief', label: 'Campaign Brief', icon: FileText, count: undefined },
          { id: 'assets', label: 'Channel Drafts', icon: Send, count: assets.length },
          { id: 'tasks', label: 'Execution Tasks', icon: CheckSquare, count: tasks.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Pipeline State Machine */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Multi-Stage State Machine Execution</span>
            </h3>

            <div className="space-y-3">
              {[
                { key: 'queued', title: '1. Queued & Input Validation', desc: 'Verify business parameters, deduplicate source URLs, protocol sanity.' },
                { key: 'researching', title: '2. Source Retrieval & Scraping', desc: 'Execute bounded HTTP requests, parse HTML, extract clean text, classify failures.' },
                { key: 'extracting', title: '3. Structured Evidence Extraction', desc: 'Extract explicit claims into 11 categories: Product, Pricing, Features, Audience, etc.' },
                { key: 'normalizing', title: '4. Normalization & Conflict Engine', desc: 'Detect pricing disparities ($19 vs $29) and feature contradictions across sources.' },
                { key: 'analyzing', title: '5. Intelligence Synthesis', desc: 'Formulate competitive landscape, audience signals, messaging patterns, and market gaps.' },
                { key: 'generating', title: '6. Evidence-Backed Campaign Strategy', desc: 'Synthesize positioning, campaign angle, primary messaging, and channel drafts.' },
                { key: 'validating_output', title: '7. Output & Traceability Verification', desc: 'Verify citations, prevent unsupported hallucinations, and compute confidence score.' },
                { key: 'awaiting_review', title: '8. Human Review & Execution Layer', desc: 'Human inspects brief, resolves conflicts, and generates prioritized execution tasks.' },
              ].map((step, idx) => {
                const isCurrent = job.status === step.key;
                const isPassed =
                  ['awaiting_review', 'approved', 'partial', 'completed'].includes(job.status) ||
                  (job.progressPercent >= (idx + 1) * 12.5);

                return (
                  <div
                    key={step.key}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                        : isPassed
                        ? 'border-zinc-200 bg-white'
                        : 'border-zinc-100 bg-zinc-50/50 opacity-60'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">{step.title}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                            ACTIVE STEP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sources */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {sources.map((src) => (
              <div
                key={src.id}
                className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-zinc-900">{src.title}</h4>
                      <StatusBadge status={src.status} />
                      {src.httpStatus && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
                          HTTP {src.httpStatus}
                        </span>
                      )}
                      {src.isCompetitor && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                          Competitor
                        </span>
                      )}
                    </div>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1 font-mono"
                    >
                      <span>{src.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <span className="text-[11px] text-zinc-600 font-mono">
                    {src.wordCount ? `${src.wordCount} words extracted` : '0 words'}
                  </span>
                </div>

                {src.errorMessage && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{src.errorMessage}</span>
                  </div>
                )}

                {src.rawTextSnippet && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-zinc-500 hover:text-zinc-800 font-medium select-none">
                      Inspect Scraped Text Snippet ({src.rawTextSnippet.length} chars)
                    </summary>
                    <div className="mt-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200 font-mono text-[11px] text-zinc-700 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {src.rawTextSnippet}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Evidence Table */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={searchEvidence}
                onChange={e => setSearchEvidence(e.target.value)}
                placeholder="Search claims, snippets, or sources..."
                className="text-xs p-1.5 border border-zinc-200 rounded-lg w-full sm:w-64 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-semibold text-zinc-600 shrink-0 mr-1">Category:</span>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                All ({evidence.length})
              </button>
              {categories.map((cat) => {
                const count = evidence.filter(e => e.category === cat).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {filteredEvidence.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-zinc-200 text-zinc-500 text-xs">
              No evidence matching search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredEvidence.map((ev) => (
                <EvidenceCard key={ev.id} evidence={ev} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Conflicts */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {conflicts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-zinc-200 text-zinc-600 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-zinc-900">Zero Unresolved Source Conflicts</p>
              <p className="text-zinc-500 mt-1">All extracted claims and pricing tiers are consistent across analyzed sources.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((conf) => (
                <ConflictBanner key={conf.id} conflict={conf} onResolved={loadJob} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Intelligence Matrix */}
      {activeTab === 'intelligence' && intelligence && (
        <div className="space-y-5">
          {/* Competitive Landscape */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Competitive Landscape Synthesis
            </h4>
            <p className="text-xs text-zinc-800 leading-relaxed">
              {intelligence.competitiveLandscape}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audience Signals */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                <span>Audience Signals</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-700">
                {intelligence.audienceSignals.map((sig, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Messaging Patterns */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span>Messaging Patterns Observed</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-700">
                {intelligence.messagingPatterns.map((pat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{pat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Market Opportunities */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Identified Market Opportunities & Positioning Gaps</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {intelligence.marketOpportunities.map((opp) => (
                <div key={opp.id} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{opp.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">
                      {opp.impact} IMPACT
                    </span>
                  </div>
                  <p className="text-zinc-700">{opp.description}</p>
                  <div className="pt-2 border-t border-emerald-200/60 font-semibold text-emerald-900 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-emerald-700 uppercase tracking-wider block">Recommended Action:</span>
                      {opp.recommendedAction}
                    </div>
                    <button
                      onClick={() => openShareForNote(`${opp.title}: ${opp.description} (Recommended: ${opp.recommendedAction})`, 'MARKET_OPPORTUNITIES')}
                      className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded border border-emerald-300 transition-colors flex items-center gap-1 shrink-0"
                      title="Assign teammate to review this market gap"
                    >
                      <Share2 className="w-3 h-3 text-emerald-600" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Campaign Brief */}
      {activeTab === 'brief' && campaignBrief && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-zinc-900">Evidence-Backed Campaign Brief</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded uppercase">
                  {campaignBrief.status}
                </span>
                <ConfidenceBadge level={campaignBrief.confidence} />
              </div>
              <p className="text-xs text-zinc-600 mt-1">{campaignBrief.executiveSummary}</p>
            </div>

            <button
              onClick={() => openShareForNote(`Campaign Angle: ${campaignBrief.campaignAngle}. Primary Message: ${campaignBrief.primaryMessage}`, 'CAMPAIGN_BRIEF')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Assign Brief Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Campaign Angle</span>
              <p className="text-zinc-900 font-semibold text-sm">{campaignBrief.campaignAngle}</p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="font-bold text-zinc-500 uppercase tracking-wider text-[11px]">Primary Core Message</span>
              <p className="text-zinc-900 font-semibold text-sm">{campaignBrief.primaryMessage}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-zinc-700 uppercase tracking-wider text-[11px]">Supporting Messages</span>
            <ul className="space-y-1.5">
              {campaignBrief.supportingMessages.map((msg, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Evidence Citations Table */}
          <div className="space-y-2">
            <span className="font-bold text-zinc-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Evidence Provenance Citations ({campaignBrief.evidenceReferences.length})</span>
            </span>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 text-zinc-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-2.5">Evidence ID</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Verified Claim</th>
                    <th className="p-2.5">Source URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {campaignBrief.evidenceReferences.map((ref, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="p-2.5 font-mono text-[11px] text-zinc-600">#{ref.evidenceId}</td>
                      <td className="p-2.5 font-semibold text-zinc-800">{ref.category}</td>
                      <td className="p-2.5 text-zinc-800 font-medium">{ref.claim}</td>
                      <td className="p-2.5">
                        <a
                          href={ref.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Known Limitations */}
          {campaignBrief.limitations && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                Known Research Limitations & Bounds:
              </span>
              <p>{campaignBrief.limitations}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Channel Assets with Realistic Mockups & Symbols */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {assets.map((asset) => {
              const isLinkedin = asset.channel === 'LINKEDIN';
              const isEmail = asset.channel === 'EMAIL';
              const isSEO = asset.channel === 'SEO';

              let copyableText = '';
              if (isLinkedin) {
                const c = asset.content as any;
                copyableText = `${c.hook}\n\n${c.body}\n\n${c.cta}`;
              } else if (isEmail) {
                const c = asset.content as any;
                copyableText = `Subject: ${c.subject}\nPreview: ${c.previewText}\n\n${c.body}\n\n${c.cta}`;
              } else if (isSEO) {
                const c = asset.content as any;
                copyableText = `Topic: ${c.topic}\nPrimary Keyword: ${c.primaryKeyword}\nSecondary Keywords: ${c.secondaryKeywords?.join(', ')}\n\nOutline:\n${c.outline?.join('\n')}`;
              }

              return (
                <div
                  key={asset.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2.5">
                      {isLinkedin && (
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                          <Linkedin className="w-4 h-4" />
                        </div>
                      )}
                      {isEmail && (
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Mail className="w-4 h-4" />
                        </div>
                      )}
                      {isSEO && (
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <SearchCheck className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded">
                            {asset.channel} PRODUCTION DRAFT
                          </span>
                          <span className="text-xs font-mono text-zinc-400">Ready for publish</span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{asset.title}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyAsset(asset.channel, copyableText)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg border border-zinc-200 transition-colors shadow-2xs"
                    >
                      {copiedChannel === asset.channel ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Copy Draft Asset</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* LINKEDIN POST MOCKUP */}
                  {isLinkedin && (
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-zinc-200 shadow-xs p-5 space-y-3.5 text-xs">
                      {/* Author Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                            {(job?.businessName || 'Business').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-900 text-sm">{job?.businessName || 'Target Business'}</span>
                              <span className="text-[10px] text-zinc-400 font-normal">• 1st</span>
                            </div>
                            <p className="text-[11px] text-zinc-500">Market Intelligence & Strategy • Just now • 🌐</p>
                          </div>
                        </div>
                        <button className="text-indigo-600 font-bold text-xs hover:bg-indigo-50 px-2.5 py-1 rounded-full">
                          + Follow
                        </button>
                      </div>

                      {/* Hook */}
                      <div className="font-bold text-zinc-900 text-sm leading-snug">
                        {(asset.content as any).hook}
                      </div>

                      {/* Body */}
                      <div className="text-zinc-800 whitespace-pre-wrap leading-relaxed space-y-2">
                        {(asset.content as any).body}
                      </div>

                      {/* CTA */}
                      <div className="font-bold text-indigo-700 pt-2 border-t border-zinc-100 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{(asset.content as any).cta}</span>
                      </div>

                      {/* Engagement Mock Bar */}
                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center">👍</span>
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center -ml-1.5">💡</span>
                          <span className="ml-1 font-semibold text-zinc-700">48 reactions</span>
                        </div>
                        <span>12 comments • 6 reposts</span>
                      </div>

                      <div className="grid grid-cols-4 gap-1 pt-1 text-zinc-600 font-semibold text-center text-[11px]">
                        <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer">
                          <ThumbsUp className="w-3.5 h-3.5" /> Like
                        </div>
                        <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer">
                          <MessageCircle className="w-3.5 h-3.5" /> Comment
                        </div>
                        <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer">
                          <Repeat2 className="w-3.5 h-3.5" /> Repost
                        </div>
                        <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer">
                          <Share2 className="w-3.5 h-3.5" /> Send
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COLD EMAIL MOCKUP */}
                  {isEmail && (
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden text-xs">
                      {/* Email Header */}
                      <div className="p-4 bg-zinc-50/80 border-b border-zinc-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase w-14">From:</span>
                            <span className="font-semibold text-zinc-800">Growth Team &lt;insights@{(job?.businessName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com&gt;</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">10:42 AM</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-zinc-400 uppercase w-14">To:</span>
                          <span className="font-semibold text-zinc-800">{job?.targetAudience || 'Target'} Lead &lt;prospect@targetcorp.io&gt;</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-zinc-200/60">
                          <span className="text-[11px] font-bold text-zinc-400 uppercase w-14">Subject:</span>
                          <span className="font-bold text-zinc-900">{(asset.content as any).subject}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <span className="font-bold text-zinc-400 uppercase w-14">Preview:</span>
                          <span className="italic">{(asset.content as any).previewText}</span>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="p-6 space-y-4 text-zinc-800 leading-relaxed font-sans">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {(asset.content as any).body}
                        </div>

                        {/* Call to action button */}
                        <div className="pt-2">
                          <div className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-xs text-xs">
                            {(asset.content as any).cta}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 text-zinc-500 text-[11px]">
                          <p className="font-semibold text-zinc-700">— Strategy & Growth Desk</p>
                          <p>{job?.businessName || 'Research Engine'} Market Intelligence</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEO STRATEGY & SERP MOCKUP */}
                  {isSEO && (
                    <div className="space-y-4 max-w-2xl mx-auto">
                      {/* Google SERP Preview Card */}
                      <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">G</div>
                          <span>https://www.{(job?.businessName || 'domain').toLowerCase().replace(/[^a-z0-9]/g, '')}.com › blog › pillar</span>
                        </div>
                        <h4 className="text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer">
                          {(asset.content as any).topic || asset.title}
                        </h4>
                        <p className="text-zinc-600 text-xs leading-relaxed">
                          Comprehensive guide comparing competitive benchmarks, pricing structures, and features. Discover key takeaways for {job?.targetAudience || 'market leads'}...
                        </p>
                      </div>

                      {/* Keyword & Outline Strategy Card */}
                      <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-xl border border-zinc-200 space-y-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
                              <Key className="w-3 h-3 text-indigo-600" />
                              <span>Primary Target Keyword</span>
                            </span>
                            <span className="font-bold text-zinc-900 text-sm block">
                              {(asset.content as any).primaryKeyword}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-zinc-200 space-y-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Search Intent</span>
                            </span>
                            <span className="font-semibold text-emerald-700 text-xs block">
                              Commercial / Comparison Intent (High Conversion)
                            </span>
                          </div>
                        </div>

                        {/* Secondary Keywords */}
                        {((asset.content as any).secondaryKeywords || []).length > 0 && (
                          <div>
                            <span className="text-zinc-500 font-bold block text-[11px] mb-1.5 uppercase tracking-wider">
                              Long-Tail Secondary Keywords
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {((asset.content as any).secondaryKeywords || []).map((kw: string, i: number) => (
                                <span key={i} className="px-2.5 py-1 bg-white rounded-lg border border-zinc-200 font-mono text-[11px] font-semibold text-zinc-700 shadow-2xs">
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Outline Steps */}
                        <div>
                          <span className="text-zinc-700 font-bold block text-[11px] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                            <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Pillar Article Blueprint Outline</span>
                          </span>
                          <div className="space-y-2">
                            {((asset.content as any).outline || []).map((sec: string, i: number) => (
                              <div key={i} className="p-3 bg-white rounded-xl border border-zinc-200 flex items-start gap-2.5 text-zinc-800 font-medium">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {i + 1}
                                </span>
                                <span>{sec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 8: Execution Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Actionable Tasks Identification from Research Notes */}
          <ActionableTasksExtractor
            job={job}
            existingTasks={tasks}
            onShareNote={(noteText) => openShareForNote(noteText, 'RESEARCH_NOTES')}
            onTaskCreated={(newTask) => {
              setJobData((prev) => {
                if (!prev) return prev;
                const updatedTasks = [newTask, ...prev.tasks.filter((t) => t.id !== newTask.id)];
                return {
                  ...prev,
                  tasks: updatedTasks,
                };
              });
            }}
            onTasksBatchCreated={(newTasks) => {
              setJobData((prev) => {
                if (!prev) return prev;
                const existingIds = new Set(newTasks.map((t) => t.id));
                const filtered = prev.tasks.filter((t) => !existingIds.has(t.id));
                return {
                  ...prev,
                  tasks: [...newTasks, ...filtered],
                };
              });
            }}
          />

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Strategic Execution Checklist ({tasks.length})
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Tasks synced from research notes, intelligence findings, and approved campaign directives.
                </p>
              </div>
              <span className="text-xs font-semibold text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
                Completed: <strong className="text-emerald-600">{tasks.filter(t => t.status === 'COMPLETED').length}</strong> / {tasks.length}
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="p-8 text-center bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-500 text-xs">
                <CheckSquare className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="font-semibold text-zinc-900">No Execution Tasks Created Yet</p>
                <p className="text-zinc-500 mt-1">Use the Actionable Task Identification Engine above or approve the campaign brief to generate tasks.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const isDone = task.status === 'COMPLETED';
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                        isDone
                          ? 'bg-zinc-50/70 border-zinc-200 opacity-80'
                          : 'bg-white border-zinc-200 shadow-2xs hover:border-zinc-300'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-zinc-300 bg-white hover:border-zinc-400'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${isDone ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>
                            {task.title}
                          </span>
                          <SeverityBadge severity={task.priority} />
                          <span className="text-[10px] font-semibold px-2 py-0.2 bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
                            {task.category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">{task.description}</p>
                        {task.reason && (
                          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                            <span className="font-semibold text-zinc-700">Origin Reason:</span> {task.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        jobData={{
          job,
          sources,
          evidence,
          conflicts,
          campaignBrief,
          assets,
          tasks,
        }}
      />

      {/* Share & Team Review Modal */}
      <ShareResearchModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        job={job}
        initialTargetNote={shareTargetNote}
        initialSection={shareTargetSection}
        onAssignmentCreated={loadJob}
        onOpenSharedPreview={(token) => setPreviewShareToken(token)}
      />

      {/* Shared Research Preview Reader Modal */}
      {previewShareToken && (
        <SharedResearchPreviewModal
          token={previewShareToken}
          onClose={() => setPreviewShareToken(null)}
        />
      )}
    </div>
  );
};
