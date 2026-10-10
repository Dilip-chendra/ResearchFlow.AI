import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { FactEntry } from '../../types';

interface FactCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fact: FactEntry | null;
  onSave: (factId: string, correctedText: string) => Promise<void>;
}

export const FactCorrectionModal: React.FC<FactCorrectionModalProps> = ({
  isOpen,
  onClose,
  fact,
  onSave,
}) => {
  const [correctedText, setCorrectedText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fact) {
      setCorrectedText(fact.userCorrection || fact.claim);
      setError(null);
    }
  }, [fact]);

  if (!isOpen || !fact) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedText.trim()) {
      setError('Please provide the corrected fact or statement.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(fact.id, correctedText.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h3 className="text-sm font-semibold text-zinc-900">Correct Fact & Verify Truth</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
              Current Epistemic Category
            </label>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
              {fact.epistemicStatus.replace(/_/g, ' ')}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
              Original Extracted / Inferred Statement
            </label>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed italic">
              "{fact.claim}"
            </div>
            {fact.sourceUrl && (
              <div className="mt-1 text-[11px] text-zinc-400 truncate">
                Source: <span className="font-mono text-zinc-600">{fact.sourceUrl}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Your Corrected Fact (Ground Truth)
            </label>
            <textarea
              rows={4}
              value={correctedText}
              onChange={(e) => setCorrectedText(e.target.value)}
              placeholder="State the accurate fact as verified by company leadership..."
              className="w-full px-3.5 py-2.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Applying this correction marks the fact as <strong className="text-emerald-700">User Verified (100% confidence)</strong> and instantly propagates to the Market War Room and Campaign Briefs.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving Truth...</span>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Save Verified Correction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
