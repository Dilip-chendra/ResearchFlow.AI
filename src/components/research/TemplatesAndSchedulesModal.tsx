import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  X,
  Sparkles,
  Calendar,
  Layers,
  Play,
  Plus,
  Trash2,
  Clock,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (jobId: string) => void;
}

export const TemplatesAndSchedulesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onJobCreated,
}) => {
  const { addToast } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'templates' | 'schedules'>('templates');

  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    defaultObjective: '',
    targetAudience: '',
    sourceUrls: '',
    researchCategories: 'Pricing, Features, Positioning, Retention',
  });

  // Schedules state
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    frequency: 'WEEKLY',
    businessName: '',
    businessDescription: '',
    campaignObjective: '',
    targetAudience: '',
    sourceUrls: '',
  });

  const loadData = async () => {
    try {
      if (activeTab === 'templates') {
        setLoadingTemplates(true);
        const data = await api.getTemplates();
        setTemplates(data || []);
      } else {
        setLoadingSchedules(true);
        const data = await api.getSchedules();
        setSchedules(data || []);
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoadingTemplates(false);
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const urls = templateForm.sourceUrls
        .split('\n')
        .map(u => u.trim())
        .filter(Boolean);
      const categories = templateForm.researchCategories
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      await api.createTemplate({
        name: templateForm.name,
        description: templateForm.description,
        defaultObjective: templateForm.defaultObjective,
        targetAudience: templateForm.targetAudience,
        sourceUrls: urls,
        researchCategories: categories,
      });

      addToast('Research template created', 'success');
      setIsCreatingTemplate(false);
      setTemplateForm({
        name: '',
        description: '',
        defaultObjective: '',
        targetAudience: '',
        sourceUrls: '',
        researchCategories: 'Pricing, Features, Positioning, Retention',
      });
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleRunTemplate = async (templateId: string) => {
    try {
      const job = await api.runTemplate(templateId);
      addToast(`Initiated research run from template`, 'success');
      onJobCreated(job.id);
      onClose();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await api.deleteTemplate(id);
      addToast('Template deleted', 'info');
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const urls = scheduleForm.sourceUrls
        .split('\n')
        .map(u => u.trim())
        .filter(Boolean);

      await api.createSchedule({
        ...scheduleForm,
        sourceUrls: urls,
      });

      addToast('Recurring research schedule activated', 'success');
      setIsCreatingSchedule(false);
      setScheduleForm({
        name: '',
        frequency: 'WEEKLY',
        businessName: '',
        businessDescription: '',
        campaignObjective: '',
        targetAudience: '',
        sourceUrls: '',
      });
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleRunScheduleNow = async (id: string) => {
    try {
      const job = await api.runScheduleNow(id);
      addToast('Scheduled scan triggered immediately', 'success');
      onJobCreated(job.id);
      onClose();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await api.deleteSchedule(id);
      addToast('Schedule deleted', 'info');
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Templates & Automated Radar</h2>
              <p className="text-xs text-zinc-500">Reusable research recipes and recurring competitor change scans.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-200 px-5 bg-white text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('templates');
              setIsCreatingTemplate(false);
            }}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Research Templates ({templates.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('schedules');
              setIsCreatingSchedule(false);
            }}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'schedules'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Recurring Schedules ({schedules.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'templates' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-zinc-600">
                  Save time by executing standard research blueprints tailored for pricing, feature gap analysis, or campaign strategy.
                </p>
                {!isCreatingTemplate && (
                  <button
                    onClick={() => setIsCreatingTemplate(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Template</span>
                  </button>
                )}
              </div>

              {isCreatingTemplate ? (
                <form onSubmit={handleCreateTemplate} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-900">New Research Template</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Template Name *</label>
                      <input
                        type="text"
                        required
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        placeholder="e.g. Enterprise Pricing Teardown"
                        className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Target Audience</label>
                      <input
                        type="text"
                        value={templateForm.targetAudience}
                        onChange={(e) => setTemplateForm({ ...templateForm, targetAudience: e.target.value })}
                        placeholder="e.g. VP Engineering & CTOs"
                        className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-zinc-700 font-semibold mb-1">Default Campaign Objective *</label>
                    <textarea
                      rows={2}
                      required
                      value={templateForm.defaultObjective}
                      onChange={(e) => setTemplateForm({ ...templateForm, defaultObjective: e.target.value })}
                      placeholder="Extract exact tier structures, enterprise add-ons, seat minimums..."
                      className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block text-zinc-700 font-semibold mb-1">Default Competitor URLs (One per line)</label>
                    <textarea
                      rows={2}
                      value={templateForm.sourceUrls}
                      onChange={(e) => setTemplateForm({ ...templateForm, sourceUrls: e.target.value })}
                      placeholder="https://competitor.com/pricing&#10;https://competitor2.com"
                      className="w-full p-2 border border-zinc-300 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTemplate(false)}
                      className="px-3 py-1.5 border border-zinc-300 hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold text-white shadow-xs"
                    >
                      Save Template
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {loadingTemplates ? (
                    <div className="p-8 text-center text-xs text-zinc-500">Loading templates...</div>
                  ) : templates.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-500">
                      No templates created yet. Save standard research recipes for your team.
                    </div>
                  ) : (
                    templates.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-zinc-900">{tmpl.name}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                              {tmpl.runCount || 0} runs
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 line-clamp-1">{tmpl.defaultObjective}</p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                            {tmpl.targetAudience && <span>Audience: {tmpl.targetAudience}</span>}
                            {tmpl.sourceUrls?.length > 0 && (
                              <span>• {tmpl.sourceUrls.length} default source URLs</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleRunTemplate(tmpl.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Run Job</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(tmpl.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedules' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-zinc-600">
                  Automatically rerun competitive scans on a schedule to detect pricing shifts and feature launches.
                </p>
                {!isCreatingSchedule && (
                  <button
                    onClick={() => setIsCreatingSchedule(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Schedule</span>
                  </button>
                )}
              </div>

              {isCreatingSchedule ? (
                <form onSubmit={handleCreateSchedule} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-900">New Automated Schedule</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Schedule Name *</label>
                      <input
                        type="text"
                        required
                        value={scheduleForm.name}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                        placeholder="e.g. Weekly Linear vs Jira Scan"
                        className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Frequency</label>
                      <select
                        value={scheduleForm.frequency}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                        className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="DAILY">Daily (24 Hours)</option>
                        <option value="WEEKLY">Weekly (Every 7 Days)</option>
                        <option value="BIWEEKLY">Bi-Weekly (Every 14 Days)</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Target Business Name *</label>
                      <input
                        type="text"
                        required
                        value={scheduleForm.businessName}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, businessName: e.target.value })}
                        placeholder="e.g. Linear App"
                        className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Target Audience</label>
                      <input
                        type="text"
                        value={scheduleForm.targetAudience}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, targetAudience: e.target.value })}
                        placeholder="e.g. Product Managers & Developers"
                        className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-zinc-700 font-semibold mb-1">Competitor Source URLs (One per line)</label>
                    <textarea
                      rows={2}
                      value={scheduleForm.sourceUrls}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, sourceUrls: e.target.value })}
                      placeholder="https://linear.app/pricing&#10;https://jira.atlassian.com"
                      className="w-full p-2 border border-zinc-300 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingSchedule(false)}
                      className="px-3 py-1.5 border border-zinc-300 hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold text-white shadow-xs"
                    >
                      Activate Schedule
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {loadingSchedules ? (
                    <div className="p-8 text-center text-xs text-zinc-500">Loading schedules...</div>
                  ) : schedules.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-500">
                      No automated schedules active. Schedule recurring radar runs to monitor competitors automatically.
                    </div>
                  ) : (
                    schedules.map((sched) => (
                      <div
                        key={sched.id}
                        className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-zinc-900">{sched.name}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                              {sched.frequency}
                            </span>
                            {sched.isActive && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-600">Target: {sched.businessName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                            <Clock className="w-3 h-3" />
                            <span>Next Run: {new Date(sched.nextRunAt).toLocaleDateString()}</span>
                            {sched.lastRunAt && (
                              <span>• Last Run: {new Date(sched.lastRunAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleRunScheduleNow(sched.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            <span>Run Now</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(sched.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
