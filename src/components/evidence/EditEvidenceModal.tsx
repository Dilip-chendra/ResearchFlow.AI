import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Evidence } from '../../types';
import {
  X,
  History,
  FileCheck,
  Tag,
  Shield,
  Save,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  evidence: Evidence;
  onUpdated: (updated: Evidence) => void;
}

export const EditEvidenceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  evidence,
  onUpdated,
}) => {
  const { addToast } = useWorkspace();
  const [claim, setClaim] = useState(evidence.claim || '');
  const [supportingText, setSupportingText] = useState(evidence.supportingText || '');
  const [category, setCategory] = useState(evidence.category || 'Product');
  const [confidence, setConfidence] = useState(evidence.confidence || 'HIGH');
  const [changeReason, setChangeReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim()) {
      addToast('Claim text is required', 'warning');
      return;
    }

    try {
      setLoading(true);
      const updated = await api.editEvidence(evidence.id, {
        claim,
        supportingText,
        category,
        confidence,
        changeReason: changeReason.trim() || 'Manual revision by research analyst',
      });

      addToast(`Evidence claim updated to version ${updated.version || 2}`, 'success');
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900">Edit Evidence & Revision History</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 font-mono">
                  v{evidence.version || 1}
                </span>
              </div>
              <p className="text-xs text-zinc-500">Amend verified claims with audit trail preservation.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Version History Toggle */}
          {evidence.history && evidence.history.length > 0 && (
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-700 font-semibold">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Prior Revision History ({evidence.history.length} versions)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {showHistory ? 'Hide Prior Versions' : 'View Prior Versions'}
                </button>
              </div>

              {showHistory && (
                <div className="mt-3 space-y-2 pt-2 border-t border-zinc-200">
                  {evidence.history.map((h, i) => (
                    <div key={i} className="p-2.5 bg-white rounded-lg border border-zinc-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="font-bold text-zinc-800">Version {h.version}</span>
                        <span>{new Date(h.changedAt).toLocaleString()} by {h.changedBy || 'Analyst'}</span>
                      </div>
                      <p className="text-zinc-800 font-medium">{h.claim}</p>
                      {h.changeReason && (
                        <p className="text-[10px] text-zinc-500 italic">Reason: {h.changeReason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Synthesized Claim *</label>
              <textarea
                rows={3}
                required
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                className="w-full p-2.5 border border-zinc-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Supporting Verbatim Text Quote</label>
              <textarea
                rows={3}
                value={supportingText}
                onChange={(e) => setSupportingText(e.target.value)}
                className="w-full p-2.5 border border-zinc-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-700 bg-zinc-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Pricing">Pricing</option>
                  <option value="Features">Features</option>
                  <option value="Positioning">Positioning</option>
                  <option value="Market Opportunity">Market Opportunity</option>
                  <option value="Customer Friction">Customer Friction</option>
                  <option value="Retention">Retention</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Confidence Rating</label>
                <select
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value as any)}
                  className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="HIGH">HIGH (Direct Official Source Quote)</option>
                  <option value="MEDIUM">MEDIUM (Inferred from Multiple Signals)</option>
                  <option value="LOW">LOW (Unverified / Conflicting)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Reason for Revision (Recorded in Audit Log)</label>
              <input
                type="text"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="e.g. Corrected annual discount pricing calculation per 2025 update"
                className="w-full p-2 border border-zinc-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 border border-zinc-300 hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold text-white shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving Version...' : 'Save & Publish Version'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
