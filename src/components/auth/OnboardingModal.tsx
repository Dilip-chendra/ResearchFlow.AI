import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Building, Target, Compass, X, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Globe, Shield } from 'lucide-react';

const DRAFT_KEY = 'rf_onboarding_draft_v2';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, createWorkspace, addToast, setActiveView, setIsNewResearchModalOpen } = useWorkspace();

  const [step, setStep] = useState<number>(1);
  const [workspaceName, setWorkspaceName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('B2B SaaS / Productivity');
  const [targetAudience, setTargetAudience] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('Feature White-Space & Product Gaps');
  const [initialCompetitors, setInitialCompetitors] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore saved draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.workspaceName) setWorkspaceName(parsed.workspaceName);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.industry) setIndustry(parsed.industry);
        if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
        if (parsed.primaryGoal) setPrimaryGoal(parsed.primaryGoal);
        if (parsed.initialCompetitors) setInitialCompetitors(parsed.initialCompetitors);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist draft on change
  useEffect(() => {
    if (workspaceName || businessName || targetAudience) {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            workspaceName,
            businessName,
            description,
            industry,
            targetAudience,
            primaryGoal,
            initialCompetitors,
          })
        );
      } catch {
        // Ignore storage errors
      }
    }
  }, [workspaceName, businessName, description, industry, targetAudience, primaryGoal, initialCompetitors]);

  if (!isOnboardingOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!workspaceName.trim() || !businessName.trim()) {
        addToast('Please enter both workspace and product/brand name to proceed.', 'warning');
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim() || !businessName.trim()) {
      addToast('Please enter your workspace and product name.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkspace({
        name: workspaceName.trim(),
        businessName: businessName.trim(),
        description: description.trim() || `${primaryGoal} for ${businessName.trim()} (${industry})`,
        industry: industry.trim() || 'Software & Technology',
        targetAudience: targetAudience.trim() || 'Founders, leaders, and prospective customers',
      });

      // Clear draft on successful creation
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}

      setIsOnboardingOpen(false);
      setActiveView('overview');
      addToast(`Workspace "${workspaceName}" ready!`, 'success');

      // If user provided competitors, prompt to launch first run
      if (initialCompetitors.trim()) {
        setTimeout(() => {
          setIsNewResearchModalOpen(true);
        }, 600);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to setup workspace', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh]">
        <button
          onClick={() => setIsOnboardingOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Step Indicator */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Setup Your Growth Workspace</h3>
            <p className="text-xs text-slate-400">Step {step} of 3 • Guided Setup</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mb-5 overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Workspace / Team Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Apex Growth Studio"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Primary Product / Brand Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. FlowState AI"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Industry Vertical / Category
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. B2B Developer Tools / FinTech / Healthcare AI"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: STRATEGIC OBJECTIVE & AUDIENCE */}
          {step === 2 && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Primary Strategic Objective
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Feature White-Space & Product Gaps',
                    'Competitor Pricing & Package Discrepancies',
                    'Sales Battlecards & Counter-Positioning',
                    'Customer Pain Points & Demand Signals',
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setPrimaryGoal(goal)}
                      className={`text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        primaryGoal === goal
                          ? 'border-indigo-500 bg-indigo-950/60 text-white font-semibold'
                          : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Target Audience
                </label>
                <div className="relative">
                  <Target className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. VP of Product, Engineering Leads, Growth Marketers"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: INITIAL COMPETITORS & VALUE PROPOSITION */}
          {step === 3 && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Known Competitor Domains (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={initialCompetitors}
                    onChange={(e) => setInitialCompetitors(e.target.value)}
                    placeholder="e.g. linear.app, notion.so, monday.com (comma separated)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  We will pre-load these domains for your first autonomous evidence scan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Your Value Proposition / Brief Summary
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. The fastest autonomous market intelligence engine that turns raw competitor claims into verified strategy."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  All research runs in isolated tenant sandboxes with cryptographic citation hashing and anti-hallucination verification.
                </span>
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div className="pt-3 flex gap-2.5">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Configuring...' : 'Launch Workspace'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
