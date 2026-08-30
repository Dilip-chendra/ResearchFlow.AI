import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { ExecutionTask } from '../../types';
import { SeverityBadge } from '../common/Badge';
import {
  CheckSquare,
  Check,
  Filter,
  ExternalLink,
  RefreshCw,
  Plus,
  Search,
  X,
  Sparkles,
  Tag
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { activeWorkspace, addToast, setSelectedJobId, setActiveView } = useWorkspace();
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New task modal state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newCategory, setNewCategory] = useState<'POSITIONING' | 'CONTENT' | 'VERIFICATION' | 'DISTRIBUTION' | 'LANDING_PAGE'>('POSITIONING');
  const [newReason, setNewReason] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeWorkspace?.id]);

  const handleToggleTask = async (task: ExecutionTask) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const updated = await api.updateTask(task.id, { status: nextStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
      addToast(`Task marked as ${nextStatus.toLowerCase()}`, 'info');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast('Task title is required.', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const created = await api.createTask({
        title: newTitle.trim(),
        description: newDesc.trim(),
        priority: newPriority,
        category: newCategory,
        reason: newReason.trim() || 'Manual sprint execution item',
      });
      setTasks([created, ...tasks]);
      addToast(`Task "${created.title}" created successfully!`, 'success');
      setIsNewTaskOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewReason('');
    } catch (err: any) {
      addToast(err.message || 'Failed to create task.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      (t.reason && t.reason.toLowerCase().includes(query));

    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Sprint Execution Checklist
          </h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Actionable tasks automatically derived from research notes, competitor evidence, and approved strategies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs">
            Completed: <strong className="text-emerald-600">{completedCount}</strong> / {tasks.length}
          </span>

          <button
            id="btn-open-new-task-modal"
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          <button
            onClick={loadTasks}
            className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors"
            title="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs space-y-3 text-xs">
        {/* Search & Status Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, notes, or origin triggers..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-zinc-500 mr-1">Status:</span>
            {(['ALL', 'PENDING', 'COMPLETED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Category Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-zinc-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-zinc-500 mr-1">Priority:</span>
            {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                  priorityFilter === pr
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-zinc-500 mr-1">Category:</span>
            {['ALL', 'POSITIONING', 'CONTENT', 'VERIFICATION', 'DISTRIBUTION', 'LANDING_PAGE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 text-xs">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
          <span>Loading execution checklist...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-3 text-xs text-zinc-500">
          <CheckSquare className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="font-semibold text-zinc-900 text-sm">No Tasks Match Filters</p>
          <p className="max-w-md mx-auto">
            Extract actionable tasks from research notes in the Research module or create a new task above.
          </p>
          <button
            onClick={() => setActiveView('research')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Go to Research Module</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`bg-white p-4.5 rounded-2xl border transition-all flex items-start gap-3.5 shadow-2xs ${
                  isDone
                    ? 'border-zinc-200 bg-zinc-50/70 opacity-75'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-zinc-300 bg-white hover:border-zinc-400'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="flex-1 text-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold ${isDone ? 'line-through text-zinc-500' : 'text-zinc-900 text-sm'}`}>
                        {task.title}
                      </span>
                      <SeverityBadge severity={task.priority} />
                      <span className="text-[10px] font-semibold px-2 py-0.2 bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
                        {task.category}
                      </span>
                    </div>

                    {task.researchJobId && (
                      <button
                        onClick={() => {
                          setSelectedJobId(task.researchJobId);
                          setActiveView('research');
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>View Origin Job</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-zinc-700 leading-relaxed">{task.description}</p>

                  {task.reason && (
                    <div className="text-[11px] text-zinc-500 font-mono pt-1">
                      <span className="font-semibold text-zinc-700">Origin Reason:</span> {task.reason}
                    </div>
                  )}

                  {task.evidenceReference && (
                    <div className="text-[10px] text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                      <span className="font-semibold text-zinc-700">Evidence Reference:</span> &quot;{task.evidenceReference}&quot;
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Creation Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-zinc-900">Create Actionable Task</h3>
              </div>
              <button
                onClick={() => setIsNewTaskOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-800 mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Update competitor pricing matrix"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-800 mb-1">
                  Execution Description
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details and step-by-step guidance..."
                  className="w-full p-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border border-zinc-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 border border-zinc-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="POSITIONING">POSITIONING</option>
                    <option value="CONTENT">CONTENT</option>
                    <option value="VERIFICATION">VERIFICATION</option>
                    <option value="DISTRIBUTION">DISTRIBUTION</option>
                    <option value="LANDING_PAGE">LANDING_PAGE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-800 mb-1">
                  Origin Directive / Research Note Reference
                </label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Dictated note on recruiter ATS pain points"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

