import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { ResearchJob, JobStatus, ExecutionTask } from '../../types';
import { StatusBadge } from '../common/Badge';
import { JobDetailView } from './JobDetailView';
import { exportResearchJobsListToCSV } from '../../lib/exportUtils';
import { ShareResearchModal } from './ShareResearchModal';
import { SharedResearchPreviewModal } from './SharedResearchPreviewModal';
import { ResearchTimelineScrubber } from './ResearchTimelineScrubber';
import { TemplatesAndSchedulesModal } from './TemplatesAndSchedulesModal';
import { CompareRunsModal } from './CompareRunsModal';
import {
  Plus,
  Search,
  Trash2,
  ArrowRight,
  Sparkles,
  Layers,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Share2,
  Clock,
  LayoutGrid,
  CheckCircle2,
  ListTodo,
  Copy,
  Archive,
  ArrowRightLeft
} from 'lucide-react';

export const ResearchListView: React.FC = () => {
  const {
    selectedJobId,
    setSelectedJobId,
    setIsNewResearchModalOpen,
    addToast,
    refreshWorkspaces
  } = useWorkspace();

  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showTimeline, setShowTimeline] = useState(true);

  // SaaS Modals
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Sharing state
  const [sharingJob, setSharingJob] = useState<ResearchJob | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const [jobsData, tasksData] = await Promise.all([
        api.getResearchJobs(),
        api.getTasks().catch(() => [] as ExecutionTask[])
      ]);
      setJobs(jobsData);
      setTasks(tasksData);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [selectedJobId]);

  const handleDeleteJob = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this research job and all related evidence?')) {
      return;
    }
    try {
      await api.deleteResearchJob(id);
      addToast('Research job deleted', 'info');
      if (selectedJobId === id) setSelectedJobId(null);
      loadJobs();
      refreshWorkspaces();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDuplicateJob = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const duplicated = await api.duplicateResearchJob(id);
      addToast(`Cloned run as "${duplicated.businessName}"`, 'success');
      loadJobs();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleArchiveJob = async (e: React.MouseEvent, id: string, isArchived: boolean) => {
    e.stopPropagation();
    try {
      await api.archiveResearchJob(id, !isArchived);
      addToast(!isArchived ? 'Archived research run' : 'Restored research run', 'info');
      loadJobs();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // If a specific job is selected, show JobDetailView with back button
  if (selectedJobId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedJobId(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
          >
            <span>← Back to All Research Jobs</span>
          </button>
        </div>
        <JobDetailView jobId={selectedJobId} />
      </div>
    );
  }

  const filteredJobs = jobs.filter((j) => {
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch =
      !q ||
      (j.businessName && j.businessName.toLowerCase().includes(q)) ||
      (j.campaignObjective && j.campaignObjective.toLowerCase().includes(q)) ||
      (j.targetAudience && j.targetAudience.toLowerCase().includes(q));
    const matchesStatus =
      statusFilter === 'ALL'
        ? !j.isArchived
        : statusFilter === 'archived'
        ? j.isArchived
        : !j.isArchived && j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportSummaryCSV = () => {
    if (filteredJobs.length === 0) {
      addToast('No research jobs to export', 'warning');
      return;
    }
    exportResearchJobsListToCSV(filteredJobs);
    addToast(`Exported ${filteredJobs.length} research jobs summary to CSV`, 'success');
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Research Jobs</h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Manage evidence extraction runs, competitor sources, and strategic campaign pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-lg border border-zinc-200 shadow-2xs transition-colors"
            title="Templates & Automated Radar Schedules"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Templates & Schedules</span>
          </button>
          {jobs.length >= 2 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-lg border border-zinc-200 shadow-2xs transition-colors"
              title="Compare 2 Research Runs & Shifts"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span>Compare Runs</span>
            </button>
          )}
          <button
            id="btn-toggle-timeline-view"
            onClick={() => setShowTimeline(!showTimeline)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
              showTimeline
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
            title="Toggle Chronological Timeline Scrubber"
          >
            <Clock className={`w-4 h-4 ${showTimeline ? 'text-indigo-600' : 'text-zinc-500'}`} />
            <span>{showTimeline ? 'Hide Timeline' : 'Timeline'}</span>
          </button>
          <button
            onClick={loadJobs}
            className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors"
            title="Refresh jobs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-export-jobs-csv"
            onClick={handleExportSummaryCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-lg border border-zinc-200 shadow-2xs transition-colors"
            title="Export research jobs table as CSV"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsNewResearchModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Job</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs by product or campaign objective..."
            className="text-xs p-1.5 border border-zinc-200 rounded-lg w-full outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'awaiting_review', 'approved', 'partial', 'failed', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors uppercase ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Chronological Timeline Scrubber */}
      {showTimeline && jobs.length > 0 && !loading && (
        <ResearchTimelineScrubber
          jobs={jobs}
          selectedJobId={selectedJobId}
          onSelectJob={(id) => setSelectedJobId(id)}
          onShareJob={(j) => setSharingJob(j)}
        />
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 text-xs">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
          <span>Loading research jobs...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-3 shadow-2xs">
          <Layers className="w-10 h-10 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900">No Research Jobs Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Create your first research job to start extracting evidence from competitor sources.
          </p>
          <button
            onClick={() => setIsNewResearchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Research Job</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
          {filteredJobs.map((j) => (
            <div
              key={j.id}
              onClick={() => setSelectedJobId(j.id)}
              className={`bg-white p-4 sm:p-5 md:p-6 rounded-2xl border transition-all cursor-pointer space-y-3 group ${
                j.isArchived
                  ? 'border-zinc-200 bg-zinc-50/70 opacity-75'
                  : 'border-zinc-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                    {j.businessName}
                  </h3>
                  <StatusBadge status={j.status} />
                  {j.isDemo && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded uppercase">
                      Sample Fixture
                    </span>
                  )}
                  {j.isArchived && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded uppercase">
                      Archived
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>{new Date(j.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => handleDuplicateJob(e, j.id)}
                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Duplicate Research Run"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleArchiveJob(e, j.id, !!j.isArchived)}
                    className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title={j.isArchived ? 'Restore Job' : 'Archive Job'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSharingJob(j);
                    }}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Share Research or Assign Review"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteJob(e, j.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-700 line-clamp-1">
                <span className="font-semibold text-zinc-900">Objective:</span> {j.campaignObjective}
              </p>

              {/* Visual Task Completion Progress Bar */}
              {(() => {
                const jobTasks = tasks.filter(t => t.researchJobId === j.id);
                const totalTasks = jobTasks.length;
                const completedTasks = jobTasks.filter(t => t.status === 'COMPLETED').length;
                const inProgressTasks = jobTasks.filter(t => t.status === 'IN_PROGRESS').length;
                const pendingTasks = jobTasks.filter(t => t.status === 'PENDING').length;
                const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <ListTodo className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-semibold text-zinc-700">Execution Task Completion</span>
                        {totalTasks > 0 ? (
                          <span className="text-[11px] text-zinc-500 font-mono">
                            ({completedTasks}/{totalTasks} done{inProgressTasks > 0 ? ` · ${inProgressTasks} in progress` : ''})
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">(0 tasks created)</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {totalTasks > 0 && percent === 100 && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                        )}
                        <span
                          className={`font-mono text-xs font-bold ${
                            totalTasks === 0
                              ? 'text-zinc-400'
                              : percent === 100
                              ? 'text-emerald-600'
                              : percent > 0
                              ? 'text-indigo-600'
                              : 'text-zinc-500'
                          }`}
                        >
                          {totalTasks > 0 ? `${percent}%` : '0%'}
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar Track and Segments */}
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200/80">
                      {totalTasks > 0 ? (
                        <>
                          <div
                            style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                            className="h-full bg-emerald-500 transition-all duration-300"
                            title={`${completedTasks} Completed`}
                          />
                          <div
                            style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                            className="h-full bg-amber-400 transition-all duration-300"
                            title={`${inProgressTasks} In Progress`}
                          />
                          <div
                            style={{ width: `${(pendingTasks / totalTasks) * 100}%` }}
                            className="h-full bg-zinc-200 transition-all duration-300"
                            title={`${pendingTasks} Pending`}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-zinc-100" title="No tasks created yet" />
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 text-xs">
                <div className="flex items-center gap-4 text-zinc-600">
                  <span>
                    <strong className="text-zinc-900">{j.sourcesCount}</strong> Sources
                  </span>
                  <span>
                    <strong className="text-indigo-600">{j.evidenceCount}</strong> Evidence Claims
                  </span>
                  <span>
                    <strong className={j.conflictsCount > 0 ? 'text-amber-600' : 'text-zinc-900'}>
                      {j.conflictsCount}
                    </strong>{' '}
                    Conflicts
                  </span>
                </div>

                <div className="flex items-center gap-1 text-indigo-600 font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates & Schedules Modal */}
      {isTemplatesModalOpen && (
        <TemplatesAndSchedulesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          onJobCreated={(jobId) => {
            setSelectedJobId(jobId);
            loadJobs();
          }}
        />
      )}

      {/* Compare Runs Modal */}
      {isCompareModalOpen && (
        <CompareRunsModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          jobs={jobs}
        />
      )}

      {/* Share Research Modal */}
      {sharingJob && (
        <ShareResearchModal
          isOpen={!!sharingJob}
          onClose={() => setSharingJob(null)}
          job={sharingJob}
          onAssignmentCreated={loadJobs}
          onOpenSharedPreview={(token) => {
            setSharingJob(null);
            setPreviewToken(token);
          }}
        />
      )}

      {/* Shared Research Reader Preview Modal */}
      {previewToken && (
        <SharedResearchPreviewModal
          token={previewToken}
          onClose={() => setPreviewToken(null)}
        />
      )}
    </div>
  );
};
