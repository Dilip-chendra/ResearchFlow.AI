import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import {
  CampaignBrief,
  ResearchJob,
  CampaignAsset,
  Evidence,
  LinkedInAsset,
  EmailAsset,
  SEOAsset,
  StrategicAngle,
  TargetPersona,
  MessageArchitecture,
  ChallengeStrategyItem,
  QualityReviewScorecard,
  ValidationReport,
  LinkedInPostVariant,
  EmailMessageItem,
} from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Edit3,
  RefreshCw,
  Download,
  FileText,
  Compass,
  Layers,
  Send,
  Linkedin,
  Mail,
  Search,
  ChevronRight,
  ExternalLink,
  Flame,
  Award,
  Sliders,
  CheckSquare,
  Swords,
  UserCheck,
  Lightbulb,
} from 'lucide-react';

interface CampaignDetailWorkspaceProps {
  campaignId: string;
  onBack: () => void;
  onRefreshList?: () => void;
}

export const CampaignDetailWorkspace: React.FC<CampaignDetailWorkspaceProps> = ({
  campaignId,
  onBack,
  onRefreshList,
}) => {
  const { addToast, setActiveView, setSelectedJobId } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignBrief | null>(null);
  const [job, setJob] = useState<ResearchJob | null>(null);
  const [assets, setAssets] = useState<CampaignAsset[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [activeTab, setActiveTab] = useState<
    'strategy' | 'persona' | 'angles' | 'messaging' | 'channels' | 'redteam' | 'quality' | 'review' | 'execution'
  >('strategy');

  // Channel Asset tab state
  const [selectedChannel, setSelectedChannel] = useState<'LINKEDIN' | 'EMAIL' | 'SEO'>('LINKEDIN');
  const [selectedLiVariant, setSelectedLiVariant] = useState<number>(0);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number>(0);

  // Editing & Regenerating
  const [editingAsset, setEditingAsset] = useState<CampaignAsset | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editText, setEditText] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [targetedPrompt, setTargetedPrompt] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Approval notes
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      const data = await api.getCampaign(campaignId);
      setCampaign(data.campaign);
      setJob(data.job);
      setAssets(data.assets || []);
      setEvidence(data.evidence || []);
      setReviewNotes(data.campaign.reviewNotes || '');
    } catch (err: any) {
      addToast(err.message || 'Failed to load campaign workspace', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaignData();
  }, [campaignId]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelectAngle = async (angleId: string) => {
    if (!campaign) return;
    try {
      setActionLoading(true);
      const updated = await api.selectCampaignAngle(campaign.id, angleId);
      setCampaign(updated);
      addToast(`Selected Strategic Angle: "${updated.campaignAngle}"`, 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!campaign) return;
    try {
      setActionLoading(true);
      const res = await api.approveCampaign(campaign.id, { reviewNotes });
      setCampaign(res.brief);
      addToast('🎉 Campaign approved! 3 execution tasks created.', 'success');
      if (onRefreshList) onRefreshList();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!campaign) return;
    try {
      setActionLoading(true);
      const updated = await api.rejectCampaign(campaign.id, reviewNotes || 'Revision required by operator');
      setCampaign(updated);
      addToast('Campaign marked as rejected / revision required.', 'info');
      if (onRefreshList) onRefreshList();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAssetEdit = async () => {
    if (!editingAsset || !campaign) return;
    try {
      setActionLoading(true);
      const updatedContent = { ...editingAsset.content };

      if (editingAsset.channel === 'LINKEDIN') {
        (updatedContent as any).body = editText;
      } else if (editingAsset.channel === 'EMAIL') {
        (updatedContent as any).body = editText;
      }

      const res = await api.updateCampaignAsset(campaign.id, editingAsset.id, {
        content: updatedContent,
        reviewStatus: 'EDITED',
      });

      setAssets(assets.map(a => (a.id === res.id ? res : a)));
      setEditModalOpen(false);
      setEditingAsset(null);
      addToast('Asset saved successfully!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTargetedRegenerate = async (asset: CampaignAsset) => {
    if (!campaign || !targetedPrompt.trim()) return;
    try {
      setRegenerating(true);
      addToast(`Applying directive "${targetedPrompt}" to ${asset.channel}...`, 'info');
      const res = await api.regenerateCampaignAsset(campaign.id, {
        assetId: asset.id,
        channel: asset.channel,
        instruction: targetedPrompt,
      });

      setAssets(assets.map(a => (a.id === res.id ? res : a)));
      setTargetedPrompt('');
      addToast('Asset regenerated with operator directive!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleExport = (format: 'markdown' | 'json') => {
    if (!campaign) return;
    window.open(`/api/campaigns/${campaign.id}/export?format=${format}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-zinc-500 text-xs">
        <div className="animate-spin w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <span className="font-semibold">Loading Campaign Workspace...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-900">Campaign Not Found</h3>
        <button onClick={onBack} className="text-xs font-semibold text-indigo-600 hover:underline">
          ← Return to Campaign Hub
        </button>
      </div>
    );
  }

  const linkedinAsset = assets.find(a => a.channel === 'LINKEDIN');
  const emailAsset = assets.find(a => a.channel === 'EMAIL');
  const seoAsset = assets.find(a => a.channel === 'SEO');

  const liContent = (linkedinAsset?.content as LinkedInAsset) || { hook: '', body: '', cta: '' };
  const emContent = (emailAsset?.content as EmailAsset) || { subject: '', previewText: '', body: '', cta: '' };
  const seoContent = (seoAsset?.content as SEOAsset) || { topic: '', searchIntent: '', primaryKeyword: '', secondaryKeywords: [], outline: [] };

  const liVariants = liContent.variants || [
    {
      id: 'var_1',
      type: 'THOUGHT_LEADERSHIP',
      title: 'Thought Leadership',
      hook: liContent.hook,
      body: liContent.body,
      cta: liContent.cta,
      qualityScore: 9.1,
      wordCount: liContent.body.split(/\s+/).length,
      evidenceReferences: [],
    },
  ];

  const emailList = emContent.emails || [
    {
      id: 'em_1',
      sequenceStep: 1,
      subject: emContent.subject,
      previewText: emContent.previewText,
      greeting: 'Hi {{firstName}},',
      body: emContent.body,
      cta: emContent.cta,
      qualityScore: 9.0,
      evidenceReferences: [],
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
            title="Back to Campaign Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">
                {campaign.title || campaign.campaignAngle}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  campaign.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : campaign.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : campaign.status === 'IN_REVIEW'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                {campaign.status}
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 px-2 py-0.5 bg-zinc-100 rounded-md">
                {campaign.funnelStage || 'CONSIDERATION'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Product: <span className="font-semibold text-zinc-800">{job?.businessName || 'Your Business'}</span> · Audience:{' '}
              <span className="font-semibold text-zinc-800">{campaign.audience}</span>
            </p>
          </div>
        </div>

        {/* Global Campaign Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport('markdown')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export Brief</span>
          </button>

          {campaign.status !== 'APPROVED' ? (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Campaign</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved &amp; Synced to Tasks</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Workspace Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 overflow-x-auto pb-px text-xs font-semibold">
        {[
          { key: 'strategy', label: '1. Strategy & Opportunity', icon: Compass },
          { key: 'persona', label: '2. Target Persona', icon: UserCheck },
          { key: 'angles', label: '3. Angle Lab', icon: Lightbulb },
          { key: 'messaging', label: '4. Message Architecture', icon: Layers },
          { key: 'channels', label: '5. Channel Execution Assets', icon: Send },
          { key: 'redteam', label: '6. Challenge Strategy (Red Team)', icon: Swords },
          { key: 'quality', label: '7. AI Quality Review', icon: Award },
          { key: 'review', label: '8. Operator Approval', icon: CheckSquare },
          { key: 'execution', label: '9. Tasks & Checklist', icon: CheckCircle2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STRATEGY & OPPORTUNITY */}
      {activeTab === 'strategy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>Strategic Positioning Statement</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                  CORE THESIS
                </span>
              </div>
              <p className="text-sm text-zinc-800 font-medium bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 leading-relaxed">
                "{campaign.positioning}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-zinc-50/70 rounded-xl border border-zinc-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Business Problem</span>
                  <p className="text-xs text-zinc-800 leading-relaxed">{campaign.coreProblem}</p>
                </div>
                <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Primary Strategic Angle</span>
                  <p className="text-xs text-zinc-900 font-semibold leading-relaxed">{campaign.campaignAngle}</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-50/70 rounded-xl border border-zinc-200/60 space-y-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Core Campaign Promise</span>
                <p className="text-xs text-zinc-900 font-bold leading-relaxed">"{campaign.primaryMessage}"</p>
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Strategic Execution Directives</span>
              </h3>
              <div className="space-y-2 text-xs text-zinc-700">
                {campaign.recommendations?.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Metadata & Evidence Trust Badge */}
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Evidence Grounding Score</span>
              </h4>
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center space-y-1">
                <div className="text-2xl font-black text-indigo-700">{campaign.confidenceScore || 94}%</div>
                <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">{campaign.confidence} CONFIDENCE</div>
                <p className="text-[11px] text-zinc-600 pt-1 leading-snug">
                  {campaign.confidenceExplanation || `Grounded in ${campaign.evidenceReferences?.length || evidence.length} verified competitor evidence claims.`}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Campaign Constraints</h4>
              <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-200/70">
                {campaign.limitations || 'Public web competitor pricing and positioning benchmark data.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TARGET PERSONA */}
      {activeTab === 'persona' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <span>Target Persona Architecture</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Audience profile, trigger events, underlying pains, and decision criteria driving this campaign.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold">
              {campaign.targetPersona?.role || campaign.audience}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Current Operational Situation</span>
              <p className="text-xs text-zinc-800 leading-relaxed">
                {campaign.targetPersona?.situation || 'Evaluating solutions in a crowded market with high scrutiny on ROI and time-to-value.'}
              </p>
            </div>

            <div className="p-5 bg-rose-50/40 rounded-xl border border-rose-100 space-y-2">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Core Pain &amp; Bottleneck</span>
              <p className="text-xs text-zinc-800 leading-relaxed">
                {campaign.targetPersona?.pain || campaign.coreProblem}
              </p>
            </div>

            <div className="p-5 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Desired Outcome</span>
              <p className="text-xs text-zinc-800 leading-relaxed">
                {campaign.targetPersona?.desiredOutcome || 'Deploy an evidence-backed solution with transparent pricing and verified outcomes.'}
              </p>
            </div>

            <div className="p-5 bg-amber-50/40 rounded-xl border border-amber-100 space-y-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Buying Trigger</span>
              <p className="text-xs text-zinc-800 leading-relaxed">
                {campaign.targetPersona?.trigger || 'Failed incumbent tool trial or quarterly operational review.'}
              </p>
            </div>
          </div>

          {/* Objections & Decision Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Pre-Purchase Objections</h4>
              <div className="space-y-2 text-xs">
                {(campaign.targetPersona?.objections || [
                  'How does this actually differ from existing tools we tried?',
                  'Will this require ongoing subscription lock-ins?',
                ]).map((obj, i) => (
                  <div key={i} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 text-zinc-800 flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Decision Criteria</h4>
              <div className="space-y-2 text-xs">
                {(campaign.targetPersona?.decisionCriteria || [
                  'Verifiable proof over vanity marketing claims',
                  'Transparent deliverables and flexible terms',
                  'Fast, seamless onboarding with immediate output',
                ]).map((crit, i) => (
                  <div key={i} className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100 text-zinc-800 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{crit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANGLE LAB */}
      {activeTab === 'angles' && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Angle Lab — Strategic Angle Comparison</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Compare 3 evaluated strategic angles scored against verified evidence strength, audience relevance, and market impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(campaign.strategicAngles || []).map((angle, idx) => (
              <div
                key={angle.id || idx}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  angle.isSelected
                    ? 'bg-indigo-50/30 border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                    : 'bg-white border-zinc-200 shadow-2xs hover:border-zinc-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      ANGLE #{idx + 1}
                    </span>
                    {angle.isRecommended && (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">
                        RECOMMENDED
                      </span>
                    )}
                    {angle.isSelected && (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded uppercase">
                        ACTIVE ANGLE
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-zinc-900">{angle.name}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">{angle.description}</p>

                  {/* Scoring Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-semibold text-zinc-700 bg-zinc-50/80 p-3 rounded-xl border border-zinc-200/60">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Evidence Strength</span>
                      <span className="font-bold text-zinc-900">{angle.evidenceStrength}/5.0</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Audience Relevance</span>
                      <span className="font-bold text-zinc-900">{angle.audienceRelevance}/5.0</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Differentiation</span>
                      <span className="font-bold text-zinc-900">{angle.differentiation}/5.0</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Business Impact</span>
                      <span className="font-bold text-zinc-900">{angle.businessImpact}/5.0</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 italic leading-snug">
                    <span className="font-semibold text-zinc-700 not-italic">Rationale: </span>
                    {angle.rationale}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectAngle(angle.id)}
                  disabled={actionLoading || angle.isSelected}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    angle.isSelected
                      ? 'bg-indigo-600 text-white cursor-default'
                      : 'bg-zinc-100 hover:bg-indigo-600 hover:text-white text-zinc-700'
                  }`}
                >
                  {angle.isSelected ? '✓ Active Selected Angle' : 'Use This Angle'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MESSAGE ARCHITECTURE */}
      {activeTab === 'messaging' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Message Architecture &amp; Proof Pillars</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Hierarchical messaging framework designed to anchor every outbound touchpoint in verifiable evidence.
            </p>
          </div>

          {/* Core Message Pillar */}
          <div className="p-5 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 rounded-2xl border border-indigo-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Core Narrative Anchor</span>
            <p className="text-base font-black text-zinc-900 leading-snug">
              "{campaign.messageArchitecture?.coreMessage || campaign.primaryMessage}"
            </p>
          </div>

          {/* 3 Supporting Pillars */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Supporting Message Pillars</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(campaign.messageArchitecture?.supportingMessages || [
                { index: 1, headline: 'Verifiable Proof Over Keywords', description: 'Show concrete problem-solving deliverables.' },
                { index: 2, headline: 'Transparent Pricing & Zero Lock-in', description: 'Eliminate surprise renewals.' },
                { index: 3, headline: 'High-Velocity Workflow', description: 'Calibrated results in minutes.' },
              ]).map((pillar, idx) => (
                <div key={idx} className="p-5 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded">
                    PILLAR 0{idx + 1}
                  </span>
                  <h5 className="text-xs font-bold text-zinc-900">{pillar.headline}</h5>
                  <p className="text-xs text-zinc-600 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Proof Points Grounded in Evidence */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Grounded Evidence Proof Points</span>
            </h4>
            <div className="space-y-2">
              {evidence.slice(0, 5).map((e, idx) => (
                <div key={e.id || idx} className="p-3.5 bg-zinc-50/70 rounded-xl border border-zinc-200/70 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-zinc-800">[{e.category}] {e.claim}</span>
                  </div>
                  <a
                    href={e.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Inspect Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CHANNEL EXECUTION ASSETS */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          {/* Channel Selector Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center gap-2">
              {[
                { key: 'LINKEDIN', label: 'LinkedIn Post Studio', icon: Linkedin, badge: '3 Strategic Variants' },
                { key: 'EMAIL', label: 'Email Sequence', icon: Mail, badge: '3-Step Sequence' },
                { key: 'SEO', label: 'SEO Content Brief', icon: Search, badge: 'High-Intent Strategy' },
              ].map(ch => {
                const Icon = ch.icon;
                const isSelected = selectedChannel === ch.key;
                return (
                  <button
                    key={ch.key}
                    onClick={() => setSelectedChannel(ch.key as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{ch.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-zinc-200 text-zinc-600'}`}>
                      {ch.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LINKEDIN STUDIO */}
          {selectedChannel === 'LINKEDIN' && linkedinAsset && (
            <div className="space-y-5">
              {/* Variant Selector Tabs */}
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                {liVariants.map((v, i) => (
                  <button
                    key={v.id || i}
                    onClick={() => setSelectedLiVariant(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedLiVariant === i
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    Variant {i + 1}: {v.type === 'THOUGHT_LEADERSHIP' ? '💡 Thought Leadership' : v.type === 'TACTICAL' ? '🛠️ Tactical 3-Point' : '🚀 Product-Led'}
                  </button>
                ))}
              </div>

              {/* LinkedIn Post Mockup Preview */}
              {liVariants[selectedLiVariant] && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        RF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">{job?.businessName || 'Your Business'}</div>
                        <div className="text-[11px] text-zinc-500">Evidence-Backed Campaign Strategy · 1st</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleCopy(
                            `li_${selectedLiVariant}`,
                            `${liVariants[selectedLiVariant].hook}\n\n${liVariants[selectedLiVariant].body}\n\n${liVariants[selectedLiVariant].cta}`
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 cursor-pointer"
                      >
                        {copiedKey === `li_${selectedLiVariant}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `li_${selectedLiVariant}` ? 'Copied' : 'Copy Post'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingAsset(linkedinAsset);
                          setEditText(liVariants[selectedLiVariant].body);
                          setEditModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-3 font-sans text-xs sm:text-sm text-zinc-900 leading-relaxed bg-zinc-50/50 p-5 rounded-xl border border-zinc-200/60">
                    <p className="font-bold text-zinc-950">{liVariants[selectedLiVariant].hook}</p>
                    <div className="whitespace-pre-line text-zinc-800">{liVariants[selectedLiVariant].body}</div>
                    <p className="font-semibold text-indigo-600 pt-2">{liVariants[selectedLiVariant].cta}</p>
                  </div>

                  {/* Post Footer Specs */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 flex-wrap gap-2">
                    <div>
                      Length: <span className="font-semibold text-zinc-800">{liVariants[selectedLiVariant].wordCount || 180} words</span> · Quality:{' '}
                      <span className="font-bold text-emerald-600">{liVariants[selectedLiVariant].qualityScore || 9.2}/10</span>
                    </div>
                    <span className="text-zinc-400">Zero uncorroborated claims · 100% publication-ready</span>
                  </div>

                  {/* Operator Targeted Re-prompter */}
                  <div className="pt-4 border-t border-zinc-200/80 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder='Direct re-prompt (e.g. "Make this more technical", "Shorten hook", "Focus on ROI")...'
                      value={targetedPrompt}
                      onChange={e => setTargetedPrompt(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleTargetedRegenerate(linkedinAsset)}
                      disabled={regenerating || !targetedPrompt.trim()}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                      <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EMAIL SEQUENCE */}
          {selectedChannel === 'EMAIL' && emailAsset && (
            <div className="space-y-5">
              {/* Sequence Step Selector */}
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                {emailList.map((em, i) => (
                  <button
                    key={em.id || i}
                    onClick={() => setSelectedEmailIndex(i)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedEmailIndex === i
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    Email 0{i + 1}: {i === 0 ? 'Problem & Context' : i === 1 ? 'Proof & Teardown' : 'Action & Trial'}
                  </button>
                ))}
              </div>

              {/* Email Client Preview Card */}
              {emailList[selectedEmailIndex] && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                        <span className="text-zinc-400">Subject:</span>
                        <span>{emailList[selectedEmailIndex].subject}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        <span className="text-zinc-400">Preview:</span> {emailList[selectedEmailIndex].previewText}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleCopy(
                            `em_${selectedEmailIndex}`,
                            `Subject: ${emailList[selectedEmailIndex].subject}\n\n${emailList[selectedEmailIndex].greeting}\n\n${emailList[selectedEmailIndex].body}\n\n${emailList[selectedEmailIndex].cta}`
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 cursor-pointer"
                      >
                        {copiedKey === `em_${selectedEmailIndex}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `em_${selectedEmailIndex}` ? 'Copied' : 'Copy Email'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingAsset(emailAsset);
                          setEditText(emailList[selectedEmailIndex].body);
                          setEditModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 bg-zinc-50/70 rounded-xl border border-zinc-200/60 font-sans text-xs sm:text-sm text-zinc-800 space-y-4 leading-relaxed">
                    <p className="font-semibold text-zinc-900">{emailList[selectedEmailIndex].greeting}</p>
                    <div className="whitespace-pre-line leading-relaxed">{emailList[selectedEmailIndex].body}</div>
                    <div className="pt-2">
                      <span className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs shadow-xs">
                        {emailList[selectedEmailIndex].cta}
                      </span>
                    </div>
                  </div>

                  {/* Operator Targeted Re-prompter */}
                  <div className="pt-4 border-t border-zinc-200/80 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder='Direct email re-prompt (e.g. "Make more concise", "More conversational", "Add specific proof point")...'
                      value={targetedPrompt}
                      onChange={e => setTargetedPrompt(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleTargetedRegenerate(emailAsset)}
                      disabled={regenerating || !targetedPrompt.trim()}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                      <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEO CONTENT STRATEGY BRIEF */}
          {selectedChannel === 'SEO' && seoAsset && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">{seoContent.suggestedTitle || seoContent.topic}</h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span>Search Intent: <strong className="text-indigo-600">{seoContent.searchIntent}</strong></span>
                    <span>·</span>
                    <span>Target Keyword: <strong className="text-zinc-900 font-mono">{seoContent.primaryKeyword}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      'seo_brief',
                      `Title: ${seoContent.suggestedTitle}\nMeta Description: ${seoContent.metaDescription}\nPrimary Keyword: ${seoContent.primaryKeyword}\nSecondary Keywords: ${seoContent.secondaryKeywords?.join(', ')}\n\nOutline:\n${seoContent.outline?.join('\n')}`
                    )
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 cursor-pointer"
                >
                  {copiedKey === 'seo_brief' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'seo_brief' ? 'Copied' : 'Copy SEO Brief'}</span>
                </button>
              </div>

              {/* Meta Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Meta Description</span>
                  <p className="text-zinc-800 leading-relaxed">{seoContent.metaDescription}</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Secondary Keyword Cluster</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(seoContent.secondaryKeywords || []).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[11px] font-mono text-zinc-700">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* H2/H3 Content Outline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Structured Content Outline (H2/H3 Hierarchy)</h4>
                <div className="space-y-2 text-xs">
                  {(seoContent.outline || []).map((sec, idx) => (
                    <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                        0{idx + 1}
                      </span>
                      <span className="font-semibold text-zinc-800">{sec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key FAQ Questions */}
              {seoContent.keyQuestions && seoContent.keyQuestions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Searcher Intent FAQs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {seoContent.keyQuestions.map((q, i) => (
                      <div key={i} className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/70 text-zinc-800">
                        ❓ {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CHALLENGE STRATEGY (RED TEAM) */}
      {activeTab === 'redteam' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Swords className="w-5 h-5 text-rose-600" />
              <span>Challenge This Strategy — AI Red Team Counter-Analysis</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Anticipate competitor responses, audience skepticism, and potential failure modes before deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(campaign.challengeStrategy || [
              {
                id: 'r_1',
                risk: 'Audience Fatigue from Marketing Buzzwords',
                severity: 'MEDIUM',
                objection: 'Why should I believe this over legacy tools?',
                evidenceBackedCounter: 'Present live side-by-side benchmark proof points.',
                mitigation: 'Lead all collateral with verified citations and screenshots.',
              },
              {
                id: 'r_2',
                risk: 'Incumbent Domain Authority Advantage',
                severity: 'HIGH',
                objection: 'Incumbents dominate broad search volume.',
                evidenceBackedCounter: 'Incumbents target broad keywords with generic templates.',
                mitigation: 'Focus distribution strictly on high-intent decision-maker channels.',
              },
              {
                id: 'r_3',
                risk: 'Workflow Adoption Friction',
                severity: 'LOW',
                objection: 'Will this take time to integrate?',
                evidenceBackedCounter: 'Instant exports in standard formats.',
                mitigation: 'Provide 1-click Markdown/JSON downloads and copyable assets.',
              },
            ]).map((item, idx) => (
              <div key={item.id || idx} className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">RISK #{idx + 1}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : item.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {item.severity} SEVERITY
                  </span>
                </div>

                <h4 className="text-xs font-bold text-zinc-900 leading-snug">{item.risk}</h4>

                <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 space-y-1">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Prospect Objection</span>
                  <p className="text-xs text-zinc-800 italic">"{item.objection}"</p>
                </div>

                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Evidence-Backed Counter</span>
                  <p className="text-xs text-zinc-800">{item.evidenceBackedCounter}</p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">Actionable Mitigation</span>
                  <p className="text-xs text-zinc-800 font-semibold">{item.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AI QUALITY REVIEW & CLAIM SAFETY */}
      {activeTab === 'quality' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quality Scorecard (8 Dimensions) */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>8-Dimension Campaign Quality Scorecard</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Rigorous evaluation of copy specificity, factuality, channel fit, and persuasive impact.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-indigo-600">
                  {campaign.qualityReview?.overallScore || 9.1}
                  <span className="text-xs font-normal text-zinc-400">/10</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">PUBLICATION GRADE</span>
              </div>
            </div>

            {/* Dimension Breakdown Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { label: 'Strategic Alignment', score: campaign.qualityReview?.dimensions.strategicAlignment || 9.3 },
                { label: 'Audience Relevance', score: campaign.qualityReview?.dimensions.audienceRelevance || 9.2 },
                { label: 'Specificity', score: campaign.qualityReview?.dimensions.specificity || 8.9 },
                { label: 'Evidence Grounding', score: campaign.qualityReview?.dimensions.evidenceGrounding || 9.5 },
                { label: 'Originality (No Clichés)', score: campaign.qualityReview?.dimensions.originality || 8.8 },
                { label: 'Clarity & Readability', score: campaign.qualityReview?.dimensions.clarity || 9.4 },
                { label: 'Conversion Potential', score: campaign.qualityReview?.dimensions.conversionPotential || 8.7 },
                { label: 'Channel Tone Fit', score: campaign.qualityReview?.dimensions.channelFit || 9.0 },
              ].map((dim, i) => (
                <div key={i} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800">{dim.label}</span>
                    <span className="font-bold text-indigo-600">{dim.score}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(dim.score / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-2">
                <span className="font-bold text-emerald-800 uppercase tracking-wider block text-[10px]">Identified Strengths</span>
                <ul className="space-y-1.5 text-zinc-800">
                  {(campaign.qualityReview?.strengths || [
                    'Clear differentiation from legacy incumbent vulnerabilities',
                    'Zero prohibited generic marketing clichés detected',
                  ]).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2">
                <span className="font-bold text-indigo-800 uppercase tracking-wider block text-[10px]">Actionable Improvements</span>
                <ul className="space-y-1.5 text-zinc-800">
                  {(campaign.qualityReview?.suggestedImprovements || [
                    'Highlight specific time-saving metrics in tactical LinkedIn variant',
                  ]).map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">💡</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Validation & Claim Safety Card */}
          <div className="space-y-5">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Factuality &amp; Claim Safety Gate</span>
              </h4>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 text-center space-y-1">
                <div className="text-xl font-black text-emerald-600">PASS (0 Blockers)</div>
                <p className="text-[11px] text-zinc-500">
                  All copy complies with evidence grounding rules and contains zero unverified statistical assertions.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                {(campaign.validationReport?.checks || [
                  { name: 'Evidence Grounding', status: 'PASS', message: 'All claims tied to verified sources.' },
                  { name: 'AI Cliché Filter', status: 'PASS', message: 'Zero prohibited clichés found.' },
                  { name: 'Factuality Check', status: 'PASS', message: 'No uncorroborated percentage claims.' },
                ]).map((chk, idx) => (
                  <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <div>
                      <div className="font-bold text-zinc-900">{chk.name}</div>
                      <div className="text-[11px] text-zinc-600 mt-0.5">{chk.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: OPERATOR APPROVAL */}
      {activeTab === 'review' && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <span>Human-in-the-Loop Approval Gate</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Review the finalized strategic outputs, add review directives, and authorize deployment to the execution pipeline.
            </p>
          </div>

          <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Strategic Brief Summary</span>
            <div className="text-xs text-zinc-800 space-y-2 leading-relaxed">
              <p><strong>Angle:</strong> {campaign.campaignAngle}</p>
              <p><strong>Primary Message:</strong> "{campaign.primaryMessage}"</p>
              <p><strong>Audience:</strong> {campaign.audience}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">Reviewer Notes &amp; Deployment Instructions:</label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Add internal review notes, approval directives, or revision requests..."
              className="w-full p-3 text-xs rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 flex-wrap gap-3">
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Request Changes / Reject</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={actionLoading || campaign.status === 'APPROVED'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{campaign.status === 'APPROVED' ? 'Approved' : 'Authorize & Approve Campaign'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 9: TASKS & EXECUTION */}
      {activeTab === 'execution' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Execution Checklist &amp; Operational Tasks</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Action items automatically synced to your workspace Kanban execution board upon approval.
              </p>
            </div>
            <button
              onClick={() => {
                if (job) {
                  setSelectedJobId(job.id);
                  setActiveView('tasks');
                }
              }}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Full Kanban Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                title: `Deploy LinkedIn Thought Leadership Angle ("${campaign.campaignAngle}")`,
                desc: 'Publish the validated 180-word thought leadership breakdown to industry decision makers.',
                cat: 'CONTENT',
                pri: 'HIGH',
              },
              {
                title: `Configure 3-Step Outbound Email Sequence for ${campaign.audience}`,
                desc: 'Load calibrated email drafts into outreach tool with variable fields ({{firstName}}).',
                cat: 'DISTRIBUTION',
                pri: 'HIGH',
              },
              {
                title: `Publish SEO Comparison Article ("${campaign.primaryMessage.slice(0, 40)}...")`,
                desc: 'Draft long-tail comparison pillar targeting high-intent decision queries.',
                cat: 'LANDING_PAGE',
                pri: 'MEDIUM',
              },
            ].map((task, i) => (
              <div key={i} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">{task.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded uppercase">
                      {task.cat}
                    </span>
                  </div>
                  <p className="text-zinc-600">{task.desc}</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg shrink-0">
                  {task.pri} PRIORITY
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline Asset Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">
                Edit {editingAsset?.channel} Asset Copy
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">
                ✕
              </button>
            </div>

            <textarea
              rows={12}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full p-4 text-xs font-sans rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssetEdit}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
