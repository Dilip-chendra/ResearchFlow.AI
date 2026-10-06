import React, { useState } from 'react';
import { X, Sparkles, Target, Compass, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useWorkspace } from '../../context/WorkspaceContext';

interface MapMyMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    marketCategory?: string;
    targetCustomers?: string;
    strategicGoal?: string;
    knownCompetitors?: string[];
    keyDifferentiators?: string[];
  };
}

export const MapMyMarketModal: React.FC<MapMyMarketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { addToast } = useWorkspace();
  const [marketCategory, setMarketCategory] = useState(initialData?.marketCategory || '');
  const [targetCustomers, setTargetCustomers] = useState(initialData?.targetCustomers || '');
  const [strategicGoal, setStrategicGoal] = useState(initialData?.strategicGoal || '');
  const [knownCompetitors, setKnownCompetitors] = useState(
    (initialData?.knownCompetitors || []).join(', ')
  );
  const [keyDifferentiators, setKeyDifferentiators] = useState(
    (initialData?.keyDifferentiators || []).join(', ')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketCategory.trim() || !targetCustomers.trim()) {
      addToast('Market Category and Target Customers are required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.mapMyMarket({
        marketCategory: marketCategory.trim(),
        targetCustomers: targetCustomers.trim(),
        strategicGoal: strategicGoal.trim(),
        knownCompetitors: knownCompetitors
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        keyDifferentiators: keyDifferentiators
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      });

      addToast('Market Model mapped successfully.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to map market', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Map My Market</h2>
              <p className="text-xs text-zinc-500">
                Define your operating theater, customer segment, and initial competitor universe.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Market Category <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. B2C Career Tech & AI Resume Optimization"
              value={marketCategory}
              onChange={e => setMarketCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Target Customers <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. University seniors, junior software engineers, and mid-career pivoters targeting top tech jobs"
              value={targetCustomers}
              onChange={e => setTargetCustomers(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Strategic Goal
            </label>
            <input
              type="text"
              placeholder="e.g. Establish defensible market leadership by delivering verifiable ATS parse diagnostics"
              value={strategicGoal}
              onChange={e => setStrategicGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Known Competitors <span className="text-zinc-400 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Jobscan, Teal, Kickresume, Rezi"
              value={knownCompetitors}
              onChange={e => setKnownCompetitors(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              ResearchFlow will also discover candidate competitors continuously from verified web evidence.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Key Differentiators <span className="text-zinc-400 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Verifiable ATS parse proofs, Grounded metric bullet formulator, Zero-lockin pricing"
              value={keyDifferentiators}
              onChange={e => setKeyDifferentiators(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Verification Guardrail Badge */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Anti-Hallucination & Evidence Grounding:</span>
              <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                Strategic recommendations and gap analysis generated from this model will strictly distinguish between observed facts, inferences, and forecasts.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Compass className="w-4 h-4" />
              {isSubmitting ? 'Building Market Model...' : 'Build Market Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
