import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { ResearchJob, ActionableTaskItem, ExecutionTask } from '../../types';
import { SeverityBadge } from '../common/Badge';
import {
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  Mic,
  MicOff,
  RefreshCw,
  CheckSquare,
  AlertCircle,
  Tag,
  Lightbulb,
  FileText,
  Share2
} from 'lucide-react';

interface ActionableTasksExtractorProps {
  job: ResearchJob;
  existingTasks: ExecutionTask[];
  onTaskCreated?: (task: ExecutionTask) => void;
  onTasksBatchCreated?: (tasks: ExecutionTask[]) => void;
  onShareNote?: (noteText: string) => void;
}

export const ActionableTasksExtractor: React.FC<ActionableTasksExtractorProps> = ({
  job,
  existingTasks,
  onTaskCreated,
  onTasksBatchCreated,
  onShareNote,
}) => {
  const { addToast, setActiveView } = useWorkspace();
  const [identifiedTasks, setIdentifiedTasks] = useState<ActionableTaskItem[]>([]);
  const [syncedTitles, setSyncedTitles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [creatingTaskIdx, setCreatingTaskIdx] = useState<number | null>(null);

  // Custom notes / Voice dictation state
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isDictating, setIsDictating] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Sync state tracking with existing tasks
  useEffect(() => {
    const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase().trim()));
    setSyncedTitles(existingTitles);
  }, [existingTasks]);

  // Voice dictation initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        if (transcript.trim()) {
          setCustomNotes((prev) => {
            const base = prev.trim();
            return base ? `${base}\n${transcript.trim()}` : transcript.trim();
          });
        }
      };

      recognition.onerror = () => {
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleDictation = () => {
    if (!speechSupported) {
      addToast('Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
      addToast('Dictation paused.', 'info');
    } else {
      try {
        recognitionRef.current?.start();
        setIsDictating(true);
        addToast('Listening for research notes...', 'info');
      } catch {
        setIsDictating(false);
      }
    }
  };

  // Extract actionable tasks from notes
  const handleExtractTasks = async (notesToUse?: string) => {
    setLoading(true);
    try {
      const res = await api.extractTasksFromJobNotes(job.id, notesToUse !== undefined ? notesToUse : customNotes);
      setIdentifiedTasks(res.tasks || []);
      if (res.tasks && res.tasks.length > 0) {
        addToast(`Identified ${res.tasks.length} actionable tasks from research notes.`, 'success');
      } else {
        addToast('No new actionable items detected in the provided notes.', 'info');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to extract actionable tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    handleExtractTasks('');
  }, [job.id]);

  // Create single task and sync directly to TasksView
  const handleCreateTask = async (item: ActionableTaskItem, idx: number) => {
    setCreatingTaskIdx(idx);
    try {
      const newTask = await api.createTask({
        researchJobId: job.id,
        title: item.title,
        description: item.description,
        priority: item.priority,
        category: item.category,
        reason: item.reason,
        evidenceReference: item.evidenceReference,
      });

      setSyncedTitles((prev) => new Set([...prev, item.title.toLowerCase().trim()]));
      if (onTaskCreated) onTaskCreated(newTask);
      addToast(`Task "${item.title}" created and synced to TasksView!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to create task.', 'error');
    } finally {
      setCreatingTaskIdx(null);
    }
  };

  // Sync all identified tasks at once
  const handleSyncAll = async () => {
    const unsynced = identifiedTasks.filter(
      (item) => !syncedTitles.has(item.title.toLowerCase().trim())
    );

    if (unsynced.length === 0) {
      addToast('All identified tasks are already synced to TasksView.', 'info');
      return;
    }

    setSyncingAll(true);
    try {
      const payload = unsynced.map((item) => ({
        researchJobId: job.id,
        title: item.title,
        description: item.description,
        priority: item.priority,
        category: item.category,
        reason: item.reason,
        evidenceReference: item.evidenceReference,
      }));

      const res = await api.createTasksBatch(payload);
      const newTitles = new Set(syncedTitles);
      unsynced.forEach((t) => newTitles.add(t.title.toLowerCase().trim()));
      setSyncedTitles(newTitles);

      if (onTasksBatchCreated && res.tasks) {
        onTasksBatchCreated(res.tasks);
      }

      addToast(`Synced ${res.count || unsynced.length} tasks directly to TasksView!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to sync tasks.', 'error');
    } finally {
      setSyncingAll(false);
    }
  };

  const unsyncedCount = identifiedTasks.filter(
    (item) => !syncedTitles.has(item.title.toLowerCase().trim())
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 bg-linear-to-r from-indigo-900 via-indigo-800 to-zinc-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/30 rounded-lg border border-indigo-400/30">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </span>
            <h3 className="text-sm font-bold tracking-tight">
              Actionable Task Identification Engine
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 rounded uppercase tracking-wide">
              Gemini GTM Ops
            </span>
          </div>
          <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
            Automatically extracts actionable operational tasks from dictated research notes, market opportunities, and competitor evidence.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {identifiedTasks.length > 0 && (
            <button
              id="btn-sync-all-tasks"
              onClick={handleSyncAll}
              disabled={syncingAll || unsyncedCount === 0}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all ${
                unsyncedCount === 0
                  ? 'bg-emerald-600/80 text-white cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {syncingAll ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : unsyncedCount === 0 ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>
                {unsyncedCount === 0 ? 'All Tasks Synced' : `Sync All (${unsyncedCount}) to TasksView`}
              </span>
            </button>
          )}

          <button
            id="btn-go-to-tasksview"
            onClick={() => setActiveView('tasks')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
            title="Open global TasksView checklist"
          >
            <span>Open TasksView</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
          </button>
        </div>
      </div>

      {/* Interactive Research Notes & Directives Bar */}
      <div className="p-4 bg-zinc-50 border-b border-zinc-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-800">
              Live Research Notes & Directives
            </span>
          </div>

          <div className="flex items-center gap-2">
            {speechSupported && (
              <button
                id="btn-dictate-notes-inline"
                type="button"
                onClick={toggleDictation}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                  isDictating
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                {isDictating ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Dictate Note</span>
                  </>
                )}
              </button>
            )}

            {onShareNote && (
              <button
                id="btn-share-current-note"
                type="button"
                onClick={() => {
                  if (!customNotes.trim()) {
                    addToast('Please write or dictate a note first to share or assign for review.', 'info');
                    return;
                  }
                  onShareNote(customNotes);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
                title="Assign a teammate to review this note or generate a share link"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Share / Assign Review</span>
              </button>
            )}

            <button
              id="btn-re-extract-tasks"
              onClick={() => handleExtractTasks()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Identify Tasks from Notes'}</span>
            </button>
          </div>
        </div>

        <textarea
          id="textarea-custom-research-notes"
          rows={2}
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="Type or dictate additional research notes, competitor directives, or feature priorities (e.g. 'Must add a comparison calculator for ATS pricing and follow up on email copy with recruiter pain point')..."
          className="w-full text-xs p-2.5 bg-white border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed"
        />
      </div>

      {/* Identified Actionable Tasks List */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span className="font-semibold text-zinc-800">
            Actionable Tasks Identified ({identifiedTasks.length})
          </span>
          <span className="text-[11px] text-zinc-500">
            {identifiedTasks.filter((t) => syncedTitles.has(t.title.toLowerCase().trim())).length} synced to TasksView
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-xs space-y-2">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
            <p className="font-semibold text-zinc-800">Analyzing research directives & notes...</p>
            <p className="text-[11px] text-zinc-500">Extracting high-impact operational execution tasks</p>
          </div>
        ) : identifiedTasks.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-500 space-y-2">
            <CheckSquare className="w-7 h-7 text-zinc-400 mx-auto" />
            <p className="font-semibold text-zinc-800">No Actionable Tasks Extracted Yet</p>
            <p className="max-w-md mx-auto text-zinc-500">
              Type or dictate research notes above, or click &quot;Identify Tasks from Notes&quot; to auto-generate execution items from competitor evidence.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {identifiedTasks.map((item, idx) => {
              const isSynced = syncedTitles.has(item.title.toLowerCase().trim());
              const isCreatingThis = creatingTaskIdx === idx;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isSynced
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                      : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Tags & Priority */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <SeverityBadge severity={item.priority} />
                        <span className="text-[10px] font-semibold px-2 py-0.2 bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
                          {item.category}
                        </span>
                        {item.suggestedFrom && (
                          <span className="text-[10px] font-medium px-2 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {item.suggestedFrom}
                          </span>
                        )}
                      </div>

                      {isSynced && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Synced
                        </span>
                      )}
                    </div>

                    {/* Task Title & Description */}
                    <h4 className="text-xs font-bold text-zinc-900 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Reason / Trigger Quote */}
                    {item.reason && (
                      <div className="text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100 space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-zinc-700">
                          <Lightbulb className="w-3 h-3 text-amber-500" />
                          <span>Identified from Notes/Evidence:</span>
                        </div>
                        <p className="italic text-zinc-600 pl-4">{item.reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action: Create Task Button */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Job: {job.businessName.slice(0, 20)}
                    </span>

                    <button
                      id={`btn-create-task-${idx}`}
                      onClick={() => handleCreateTask(item, idx)}
                      disabled={isSynced || isCreatingThis}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        isSynced
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-98'
                      }`}
                    >
                      {isCreatingThis ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : isSynced ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>In TasksView</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Task</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
