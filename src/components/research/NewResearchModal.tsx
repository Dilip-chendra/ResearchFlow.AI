import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { VoiceDictationSection } from './VoiceDictationSection';
import { X, Sparkles, AlertCircle, Plus, Trash2, ArrowRight, Mic, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export const NewResearchModal: React.FC = () => {
  const {
    isNewResearchModalOpen,
    setIsNewResearchModalOpen,
    activeWorkspace,
    addToast,
    setSelectedJobId,
    setActiveView,
    refreshWorkspaces
  } = useWorkspace();

  const [businessName, setBusinessName] = useState(activeWorkspace?.businessName || 'NextGen Resume AI');
  const [businessDescription, setBusinessDescription] = useState(
    activeWorkspace?.description ||
      'Evidence-backed resume builder that helps candidates match real technical job specs.'
  );
  const [campaignObjective, setCampaignObjective] = useState(
    'Acquire 1,000 university seniors and bootcamp graduates before fall campus recruiting.'
  );
  const [targetAudience, setTargetAudience] = useState(
    activeWorkspace?.targetAudience || 'University CS seniors, bootcamp grads, and junior tech pivoters.'
  );
  const [researchNotes, setResearchNotes] = useState('');

  const [competitorUrls, setCompetitorUrls] = useState<string[]>([
    'https://en.wikipedia.org/wiki/Resume',
    'https://news.ycombinator.com',
  ]);
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');

  const [additionalUrls, setAdditionalUrls] = useState<string[]>([]);
  const [newAdditionalUrl, setNewAdditionalUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showVoiceDictation, setShowVoiceDictation] = useState(true);
  const [activeDictationTarget, setActiveDictationTarget] = useState<'businessDescription' | 'campaignObjective' | 'targetAudience' | 'notes'>('notes');

  if (!isNewResearchModalOpen) return null;

  const handleInsertDictatedText = (
    text: string,
    target: 'businessDescription' | 'campaignObjective' | 'targetAudience' | 'notes'
  ) => {
    if (!text.trim()) return;

    if (target === 'businessDescription') {
      setBusinessDescription(prev => (prev.trim() ? `${prev.trim()} ${text.trim()}` : text.trim()));
      addToast('Appended dictated notes to Business Value Proposition', 'success');
    } else if (target === 'campaignObjective') {
      setCampaignObjective(prev => (prev.trim() ? `${prev.trim()} ${text.trim()}` : text.trim()));
      addToast('Appended dictated notes to Campaign Objective', 'success');
    } else if (target === 'targetAudience') {
      setTargetAudience(prev => (prev.trim() ? `${prev.trim()} ${text.trim()}` : text.trim()));
      addToast('Appended dictated notes to Target Audience', 'success');
    } else if (target === 'notes') {
      setResearchNotes(prev => (prev.trim() ? `${prev.trim()}\n${text.trim()}` : text.trim()));
      addToast('Appended dictated notes to Research Directives', 'success');
    }
  };

  const handleStartFieldDictation = (field: 'businessDescription' | 'campaignObjective' | 'targetAudience' | 'notes') => {
    setActiveDictationTarget(field);
    setShowVoiceDictation(true);
  };

  const handleAddCompetitorUrl = () => {
    if (!newCompetitorUrl.trim()) return;
    try {
      const url = new URL(newCompetitorUrl.trim());
      if (competitorUrls.includes(url.toString())) {
        addToast('URL is already in competitor list (deduplicated)', 'warning');
        setNewCompetitorUrl('');
        return;
      }
      setCompetitorUrls([...competitorUrls, url.toString()]);
      setNewCompetitorUrl('');
      setValidationError(null);
    } catch {
      setValidationError('Please enter a valid URL starting with https:// or http://');
    }
  };

  const handleRemoveCompetitorUrl = (index: number) => {
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
  };

  const handleAddAdditionalUrl = () => {
    if (!newAdditionalUrl.trim()) return;
    try {
      const url = new URL(newAdditionalUrl.trim());
      if (additionalUrls.includes(url.toString())) {
        addToast('URL is already added', 'warning');
        setNewAdditionalUrl('');
        return;
      }
      setAdditionalUrls([...additionalUrls, url.toString()]);
      setNewAdditionalUrl('');
    } catch {
      setValidationError('Please enter a valid URL starting with https:// or http://');
    }
  };

  const handleLoadSample = (preset: 'resume' | 'devtool' | 'water') => {
    if (preset === 'resume') {
      setBusinessName('NextGen Resume AI');
      setBusinessDescription('Evidence-backed resume intelligence calibrated to real hiring benchmarks.');
      setCampaignObjective('Fall Campus Recruiting: Acquire 1,000 university seniors and junior engineers.');
      setTargetAudience('College seniors in CS/Engineering and junior career changers.');
      setCompetitorUrls([
        'https://en.wikipedia.org/wiki/Resume',
        'https://news.ycombinator.com',
      ]);
    } else if (preset === 'devtool') {
      setBusinessName('CloudRunner CI');
      setBusinessDescription('High-speed distributed CI runners with instant caching.');
      setCampaignObjective('Migrate GitHub Actions users with 3x faster build times.');
      setTargetAudience('DevOps engineers and Lead Architects at high-growth startups.');
      setCompetitorUrls([
        'https://en.wikipedia.org/wiki/Continuous_integration',
        'https://github.com',
      ]);
    } else {
      setBusinessName('HydraFlow Sensors');
      setBusinessDescription('Ultrasonic flow meters for municipal wastewater infrastructure.');
      setCampaignObjective('Generate RFP demo requests from municipal water authorities.');
      setTargetAudience('Public works directors and utility managers.');
      setCompetitorUrls([
        'https://en.wikipedia.org/wiki/Flow_measurement',
      ]);
    }
    setValidationError(null);
    addToast(`Loaded ${preset.toUpperCase()} preset parameters`, 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!businessName.trim() || !businessDescription.trim()) {
      setValidationError('Business Name and Description are required.');
      return;
    }
    if (!campaignObjective.trim()) {
      setValidationError('Campaign Objective is required.');
      return;
    }
    if (competitorUrls.length === 0) {
      setValidationError('At least one Competitor URL is required.');
      return;
    }

    try {
      setSubmitting(true);
      const combinedDescription = researchNotes.trim()
        ? `${businessDescription.trim()}\n\n[Dictated Research Directives & Notes]:\n${researchNotes.trim()}`
        : businessDescription;

      const job = await api.createResearchJob({
        businessName,
        businessDescription: combinedDescription,
        campaignObjective,
        targetAudience,
        competitorUrls,
        additionalUrls,
      });

      addToast('Created research job. Starting intelligence pipeline...', 'success');
      setIsNewResearchModalOpen(false);
      setSelectedJobId(job.id);
      setActiveView('research');

      // Auto trigger execution
      api.runResearchJob(job.id).catch(err => {
        console.error('Job run error:', err);
      });

      refreshWorkspaces();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to initialize research job.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900">
                Create Evidence-Backed Research Job
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Mic className="w-3 h-3 text-indigo-600" />
                Voice Dictation Enabled
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-600">
              Turn public competitor sources into verified intelligence and campaign assets.
            </p>
          </div>
          <button
            onClick={() => setIsNewResearchModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Quick Presets */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Load Verified Preset:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadSample('resume')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200 text-[11px] shadow-2xs transition-colors"
              >
                AI Resume Builder
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('devtool')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200 text-[11px] shadow-2xs transition-colors"
              >
                DevTool CI/CD
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('water')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200 text-[11px] shadow-2xs transition-colors"
              >
                Niche Hardware
              </button>
            </div>
          </div>

          {/* Voice Dictation Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowVoiceDictation(!showVoiceDictation)}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 hover:text-indigo-700 transition-colors"
              >
                <Mic className="w-3.5 h-3.5 text-indigo-600" />
                <span>Microphone & Voice Research Dictation</span>
                {showVoiceDictation ? (
                  <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </button>
              <span className="text-[10px] text-zinc-500">Live Speech-to-Text & Audio Waveform</span>
            </div>

            {showVoiceDictation && (
              <VoiceDictationSection
                activeFieldFocus={activeDictationTarget}
                onInsertText={handleInsertDictatedText}
              />
            )}
          </div>

          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Product / Business Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g., NextGen Resume AI"
                required
                className="w-full p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-zinc-800">
                  Target Audience *
                </label>
                <button
                  type="button"
                  onClick={() => handleStartFieldDictation('targetAudience')}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    activeDictationTarget === 'targetAudience' && showVoiceDictation
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100'
                  }`}
                  title="Dictate Target Audience via Microphone"
                >
                  <Mic className="w-3 h-3 text-indigo-500" />
                  <span>Dictate</span>
                </button>
              </div>
              <input
                type="text"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="e.g., College CS seniors and career pivoters"
                required
                className="w-full p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-800">
                Business Value Proposition & Core Offering *
              </label>
              <button
                type="button"
                onClick={() => handleStartFieldDictation('businessDescription')}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  activeDictationTarget === 'businessDescription' && showVoiceDictation
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100'
                }`}
                title="Dictate Value Proposition via Microphone"
              >
                <Mic className="w-3 h-3 text-indigo-500" />
                <span>Dictate</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={businessDescription}
              onChange={e => setBusinessDescription(e.target.value)}
              placeholder="Describe what your product does and how it differs from generic tools..."
              required
              className="w-full p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-800">
                Campaign Objective *
              </label>
              <button
                type="button"
                onClick={() => handleStartFieldDictation('campaignObjective')}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  activeDictationTarget === 'campaignObjective' && showVoiceDictation
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100'
                }`}
                title="Dictate Campaign Objective via Microphone"
              >
                <Mic className="w-3 h-3 text-indigo-500" />
                <span>Dictate</span>
              </button>
            </div>
            <input
              type="text"
              value={campaignObjective}
              onChange={e => setCampaignObjective(e.target.value)}
              placeholder="e.g., Fall Campus Recruiting: Acquire 1,000 university seniors"
              required
              className="w-full p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs"
            />
          </div>

          {/* Dedicated Dictated Field Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-600" />
                <label className="font-semibold text-zinc-800">
                  Dictated Research Notes & Field Directives (Optional)
                </label>
              </div>
              <button
                type="button"
                onClick={() => handleStartFieldDictation('notes')}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  activeDictationTarget === 'notes' && showVoiceDictation
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100'
                }`}
                title="Dictate into Research Directives"
              >
                <Mic className="w-3 h-3 text-indigo-500" />
                <span>Dictate Notes</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={researchNotes}
              onChange={e => setResearchNotes(e.target.value)}
              placeholder="Any specific angles, pricing hypotheses, customer quotes, or focus instructions dictated from your microphone..."
              className="w-full p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs font-sans placeholder:text-zinc-400"
            />
          </div>

          {/* Competitor URLs */}
          <div>
            <label className="block font-semibold text-zinc-800 mb-1">
              Competitor URLs to Research & Extract *
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                type="url"
                value={newCompetitorUrl}
                onChange={e => setNewCompetitorUrl(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCompetitorUrl();
                  }
                }}
                placeholder="https://competitor.com/pricing"
                className="flex-1 p-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs"
              />
              <button
                type="button"
                onClick={handleAddCompetitorUrl}
                className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-lg text-xs flex items-center justify-center gap-1 border border-zinc-200 shrink-0 min-h-[38px]"
              >
                <Plus className="w-3.5 h-3.5" /> Add URL
              </button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {competitorUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px]"
                >
                  <span className="font-mono text-zinc-700 truncate mr-2">{url}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetitorUrl(idx)}
                    className="text-zinc-400 hover:text-rose-600 p-1 shrink-0"
                    aria-label="Remove URL"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-zinc-200 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-zinc-600 text-center sm:text-left">
              {competitorUrls.length} source(s) configured for extraction
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewResearchModalOpen(false)}
                className="flex-1 sm:flex-initial px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold min-h-[40px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-research-job"
                disabled={submitting}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[40px]"
              >
                <span>{submitting ? 'Initializing...' : 'Start Research'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
