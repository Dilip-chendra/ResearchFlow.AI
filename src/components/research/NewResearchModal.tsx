import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { VoiceDictationSection } from './VoiceDictationSection';
import {
  X,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Mic,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  FileSpreadsheet,
  Download,
  ClipboardPaste,
  Globe,
  Layers,
  Check,
  RefreshCw,
  Edit3
} from 'lucide-react';

type IngestionMode = 'file' | 'paste' | 'discover' | 'manual';

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

  // Ingestion Mode State
  const [ingestionMode, setIngestionMode] = useState<IngestionMode>('file');

  const [competitorUrls, setCompetitorUrls] = useState<string[]>([
    'https://en.wikipedia.org/wiki/Resume',
    'https://news.ycombinator.com',
  ]);
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');

  // Bulk Paste State
  const [bulkPasteText, setBulkPasteText] = useState('');

  // File Upload State
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Auto-Discovery State
  const [discovering, setDiscovering] = useState(false);
  const [discoveredCompetitors, setDiscoveredCompetitors] = useState<
    Array<{ name: string; url: string; reason?: string; selected: boolean }>
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showVoiceDictation, setShowVoiceDictation] = useState(false);
  const [activeDictationTarget, setActiveDictationTarget] = useState<
    'businessDescription' | 'campaignObjective' | 'targetAudience' | 'notes'
  >('notes');

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

  // Helper to extract and normalize URLs from raw text
  const extractUrlsFromText = (text: string): string[] => {
    if (!text) return [];
    // Match http/https URLs or clean domain patterns
    const regex = /(https?:\/\/[^\s,;"'<>()\\]+)/gi;
    const matches = text.match(regex) || [];
    const cleanList: string[] = [];

    for (const raw of matches) {
      try {
        const cleaned = raw.trim().replace(/[.,;:]+$/, '');
        const parsed = new URL(cleaned);
        if (['http:', 'https:'].includes(parsed.protocol)) {
          cleanList.push(parsed.toString());
        }
      } catch {}
    }

    // Also look for line-separated naked domains (e.g. novoresume.com/pricing)
    const lines = text.split(/[\r\n,;]+/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        if (/^[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
          try {
            const url = new URL(`https://${trimmed}`);
            cleanList.push(url.toString());
          } catch {}
        }
      }
    }

    return Array.from(new Set(cleanList));
  };

  const appendUniqueUrls = (newUrls: string[]) => {
    if (newUrls.length === 0) return;
    const combined = [...competitorUrls];
    let addedCount = 0;

    for (const u of newUrls) {
      if (!combined.includes(u)) {
        combined.push(u);
        addedCount++;
      }
    }

    setCompetitorUrls(combined);
    if (addedCount > 0) {
      addToast(`Added ${addedCount} competitor URL(s) to research queue`, 'success');
      setValidationError(null);
    } else {
      addToast('All URLs were already in the queue (deduplicated)', 'info');
    }
  };

  // Single URL manual add
  const handleAddCompetitorUrl = () => {
    if (!newCompetitorUrl.trim()) return;
    const extracted = extractUrlsFromText(newCompetitorUrl.trim());
    if (extracted.length > 0) {
      appendUniqueUrls(extracted);
      setNewCompetitorUrl('');
    } else {
      setValidationError('Please enter a valid URL starting with https:// or http://');
    }
  };

  const handleRemoveCompetitorUrl = (index: number) => {
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
  };

  const handleClearAllUrls = () => {
    setCompetitorUrls([]);
    addToast('Cleared all competitor URLs', 'info');
  };

  // Handle Multi-line Paste
  const handleApplyBulkPaste = () => {
    if (!bulkPasteText.trim()) {
      addToast('Please paste one or more URLs into the text area', 'warning');
      return;
    }
    const extracted = extractUrlsFromText(bulkPasteText);
    if (extracted.length > 0) {
      appendUniqueUrls(extracted);
      setBulkPasteText('');
    } else {
      setValidationError('No valid URLs found in pasted text. Ensure URLs contain http:// or domain.com');
    }
  };

  // Handle File Upload (CSV, TXT, TSV)
  const processUploadedFile = (file: File) => {
    const validExtensions = ['.csv', '.txt', '.tsv', '.json'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      addToast('Please upload a .csv, .txt, .tsv, or .json file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        addToast('File is empty', 'error');
        return;
      }

      const extracted = extractUrlsFromText(content);
      if (extracted.length > 0) {
        appendUniqueUrls(extracted);
        addToast(`Parsed ${extracted.length} valid URL(s) from "${file.name}"`, 'success');
      } else {
        setValidationError(`No valid URLs found in "${file.name}". Ensure columns contain full web addresses.`);
      }
    };
    reader.onerror = () => {
      addToast('Failed to read file', 'error');
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  // Sample CSV Template Downloader
  const handleDownloadSampleCsv = () => {
    const csvContent = `Competitor Name,Website URL,Category,Notes
Novoresume,https://novoresume.com/pricing,Direct Resume SaaS,Starter tier $19 billed annually
Kickresume,https://kickresume.com/pricing,AI Resume & ATS,Has free single-page tier
Teal,https://www.tealhq.com/features/ai-resume-builder,Career Tech Platform,Subscription based ATS optimizer
Rezi,https://www.rezi.ai/pricing,ATS Optimization AI,Monthly $29 subscription
Enhancv,https://enhancv.com/pricing,Visual Resume Builder,Popular for tech pivoters`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'researchflow_competitors_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Downloaded sample CSV competitor template', 'info');
  };

  // AI 1-Click Competitor Discovery
  const handleAutoDiscoverCompetitors = async () => {
    if (!businessName.trim() && !businessDescription.trim()) {
      addToast('Please enter your Product Name or Business Description first', 'warning');
      return;
    }

    setDiscovering(true);
    try {
      addToast('Scanning market landscape for top competitors...', 'info');
      const res = await api.discoverCompetitors({
        businessName,
        businessDescription,
        targetAudience,
      });

      if (res.competitors && res.competitors.length > 0) {
        const enriched = res.competitors.map(c => ({ ...c, selected: true }));
        setDiscoveredCompetitors(enriched);
        addToast(`Discovered ${res.competitors.length} relevant competitor websites!`, 'success');
      } else {
        addToast('No competitors discovered. Try expanding your business description.', 'warning');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to auto-discover competitors', 'error');
    } finally {
      setDiscovering(false);
    }
  };

  const handleAddSelectedDiscoveredCompetitors = () => {
    const selectedUrls = discoveredCompetitors.filter(c => c.selected).map(c => c.url);
    if (selectedUrls.length > 0) {
      appendUniqueUrls(selectedUrls);
      setDiscoveredCompetitors([]);
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
      setValidationError('At least one Competitor URL is required. Upload a file, paste links, or use AI Auto-Discover.');
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
      });

      addToast(`Created research job with ${competitorUrls.length} source(s). Running pipeline...`, 'success');
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
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900">
                Create Competitive Research Sprint
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Layers className="w-3 h-3 text-emerald-600" />
                Bulk Ingestion Ready
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-600">
              Bulk import competitor URLs from files, text, or 1-click AI discovery for automated SWOT and campaign assets.
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
              <span>Quick Test Presets:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadSample('resume')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200 text-[11px] shadow-2xs transition-colors cursor-pointer"
              >
                AI Resume Builder
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('devtool')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200 text-[11px] shadow-2xs transition-colors cursor-pointer"
              >
                DevTool CI/CD
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('water')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-200 text-[11px] shadow-2xs transition-colors cursor-pointer"
              >
                Industrial Hardware
              </button>
            </div>
          </div>

          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Business Name & Target Audience */}
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
                  className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-indigo-600 transition-colors"
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

          {/* Business Value Proposition */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-800">
                Business Value Proposition & Core Offering *
              </label>
              <button
                type="button"
                onClick={() => handleStartFieldDictation('businessDescription')}
                className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-indigo-600 transition-colors"
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

          {/* Campaign Objective */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-800">
                Campaign Objective *
              </label>
              <button
                type="button"
                onClick={() => handleStartFieldDictation('campaignObjective')}
                className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-indigo-600 transition-colors"
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

          {/* Optional Voice Dictation Drawer */}
          {showVoiceDictation && (
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-zinc-800 text-xs flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-indigo-600" />
                  Voice Dictation (Target: {activeDictationTarget})
                </span>
                <button
                  type="button"
                  onClick={() => setShowVoiceDictation(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <VoiceDictationSection
                activeFieldFocus={activeDictationTarget}
                onInsertText={handleInsertDictatedText}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* BULK COMPETITOR INGESTION SUITE */}
          {/* ========================================================= */}
          <div className="pt-2 border-t border-zinc-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Competitor Source Ingestion *</span>
                </label>
                <p className="text-[11px] text-zinc-500">
                  Import competitor websites via file upload, multi-line paste, AI discovery, or manual URL entry.
                </p>
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-[11px] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIngestionMode('file')}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    ingestionMode === 'file'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIngestionMode('paste')}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    ingestionMode === 'paste'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Bulk Paste</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIngestionMode('discover')}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    ingestionMode === 'discover'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>AI Discover</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIngestionMode('manual')}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    ingestionMode === 'manual'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Manual</span>
                </button>
              </div>
            </div>

            {/* TAB 1: FILE UPLOAD (CSV, TXT, TSV) */}
            {ingestionMode === 'file' && (
              <div className="space-y-2.5 animate-in fade-in">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv,.json"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) processUploadedFile(file);
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDraggingFile
                      ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
                      : 'border-zinc-300 hover:border-indigo-400 bg-zinc-50/50 hover:bg-zinc-50'
                  }`}
                >
                  <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-full mb-2">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-zinc-800 text-xs">
                    Drop your CSV, TXT, or Excel list here, or <span className="text-indigo-600 underline">browse</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Automatically extracts all competitor URLs from any column or rows (Up to 500 URLs).
                  </p>
                </div>

                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sample CSV Template</span>
                  </button>
                  <span className="text-[10px] text-zinc-400">Supports .csv, .txt, .tsv</span>
                </div>
              </div>
            )}

            {/* TAB 2: MULTI-LINE BULK PASTE */}
            {ingestionMode === 'paste' && (
              <div className="space-y-2 animate-in fade-in">
                <textarea
                  rows={4}
                  value={bulkPasteText}
                  onChange={e => setBulkPasteText(e.target.value)}
                  placeholder="Paste 1 to 500+ competitor URLs, one per line or separated by commas/spaces:&#10;https://novoresume.com/pricing&#10;https://kickresume.com/pricing&#10;https://tealhq.com/features"
                  className="w-full p-2.5 font-mono rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">
                    URLs with or without http:// will be automatically normalized.
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyBulkPaste}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Extract & Append URLs</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: 1-CLICK AI COMPETITOR DISCOVERY */}
            {ingestionMode === 'discover' && (
              <div className="space-y-3 animate-in fade-in bg-amber-50/40 p-4 rounded-xl border border-amber-200/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Autonomous Competitor Discovery</span>
                    </h4>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      AI scans live market signals to find the top 5–10 direct competitors for "{businessName || 'your business'}".
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={discovering}
                    onClick={handleAutoDiscoverCompetitors}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${discovering ? 'animate-spin' : ''}`} />
                    <span>{discovering ? 'Scanning Market...' : '✨ Auto-Discover Competitors'}</span>
                  </button>
                </div>

                {discoveredCompetitors.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-800 text-[11px]">
                        Discovered {discoveredCompetitors.length} Competitors:
                      </span>
                      <button
                        type="button"
                        onClick={handleAddSelectedDiscoveredCompetitors}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Add Selected to Queue</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {discoveredCompetitors.map((item, idx) => (
                        <label
                          key={idx}
                          className="flex items-start gap-2 p-2 bg-white rounded-lg border border-amber-200/80 text-[11px] cursor-pointer hover:bg-amber-50/50"
                        >
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={e => {
                              const updated = [...discoveredCompetitors];
                              updated[idx].selected = e.target.checked;
                              setDiscoveredCompetitors(updated);
                            }}
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-900 truncate">{item.name}</span>
                              <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[180px]">{item.url}</span>
                            </div>
                            {item.reason && (
                              <p className="text-[10px] text-zinc-600 mt-0.5 line-clamp-1">{item.reason}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MANUAL SINGLE URL INPUT */}
            {ingestionMode === 'manual' && (
              <div className="flex flex-col sm:flex-row gap-2 animate-in fade-in">
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
                  className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-lg text-xs flex items-center justify-center gap-1 border border-zinc-200 shrink-0 min-h-[38px] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add URL
                </button>
              </div>
            )}

            {/* ACTIVE SOURCES PREVIEW QUEUE */}
            <div className="pt-2 border-t border-zinc-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-800 text-xs">
                    Configured Competitor Sources
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {competitorUrls.length} total
                  </span>
                </div>

                {competitorUrls.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllUrls}
                    className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {competitorUrls.length === 0 ? (
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-center text-zinc-500 text-[11px]">
                  No competitor URLs added yet. Use File Upload, Bulk Paste, or AI Auto-Discover above.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {competitorUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] hover:bg-zinc-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 mr-2">
                        <span className="text-[10px] font-bold text-zinc-400 shrink-0">{idx + 1}.</span>
                        <span className="font-mono text-zinc-700 truncate">{url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitorUrl(idx)}
                        className="text-zinc-400 hover:text-rose-600 p-1 shrink-0 cursor-pointer"
                        aria-label="Remove URL"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-zinc-200 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-zinc-600 text-center sm:text-left">
              Ready to extract verified evidence from {competitorUrls.length} source(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewResearchModalOpen(false)}
                className="flex-1 sm:flex-initial px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold min-h-[40px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-research-job"
                disabled={submitting || competitorUrls.length === 0}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[40px] cursor-pointer"
              >
                <span>{submitting ? 'Initializing Pipeline...' : `Launch Research (${competitorUrls.length})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
