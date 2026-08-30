import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { ResearchJob, CampaignBrief, CampaignAsset } from '../../types';
import { ConfidenceBadge } from '../common/Badge';
import {
  Megaphone,
  ExternalLink,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  User,
  Linkedin,
  Mail,
  SearchCheck,
  Layers,
  ShieldAlert,
  Swords,
} from 'lucide-react';
import { RedTeamSimulatorModal } from './RedTeamSimulatorModal';
import { CreativeStudioModal } from './CreativeStudioModal';

export const CampaignsView: React.FC = () => {
  const { activeWorkspace, addToast, setSelectedJobId, setActiveView } = useWorkspace();
  const [campaigns, setCampaigns] = useState<
    { job: ResearchJob; brief: CampaignBrief; assets: CampaignAsset[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedBriefForRedTeam, setSelectedBriefForRedTeam] = useState<{ brief: CampaignBrief; businessName: string } | null>(null);
  const [selectedBriefForCreative, setSelectedBriefForCreative] = useState<{ brief: CampaignBrief; businessName: string; assets: CampaignAsset[] } | null>(null);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const jobs = await api.getResearchJobs();
      const list: { job: ResearchJob; brief: CampaignBrief; assets: CampaignAsset[] }[] = [];

      for (const j of jobs) {
        const full = await api.getResearchJob(j.id);
        if (full.campaignBrief) {
          list.push({
            job: j,
            brief: full.campaignBrief,
            assets: full.assets || [],
          });
        }
      }
      setCampaigns(list);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [activeWorkspace?.id]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Copied asset copy to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500 text-xs">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
        <span>Loading campaign briefs...</span>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-3 shadow-2xs">
        <Megaphone className="w-10 h-10 text-zinc-400 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-900">No Campaign Briefs Generated</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Create and run a research job to generate evidence-backed campaign briefs and channel drafts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Campaign Strategy Hub</h2>
        <p className="text-xs text-zinc-600 mt-0.5">
          Review evidence-backed marketing angles, core messages, and multi-channel draft assets.
        </p>
      </div>

      <div className="space-y-6 md:space-y-8">
        {campaigns.map(({ job, brief, assets }) => (
          <div
            key={brief.id}
            className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 md:p-6 lg:p-7 shadow-xs space-y-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-zinc-900">{job.businessName}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      brief.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : brief.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {brief.status}
                  </span>
                  <ConfidenceBadge level={brief.confidence} />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-700 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{brief.campaignAngle}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedBriefForRedTeam({ brief, businessName: job.businessName })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-2xs"
                >
                  <Swords className="w-3.5 h-3.5 text-rose-600" />
                  <span>AI Red-Team Counter-Strategy</span>
                </button>

                <button
                  onClick={() => setSelectedBriefForCreative({ brief, businessName: job.businessName, assets })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-2xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Visual Ad Studio</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setActiveView('research');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-2xs"
                >
                  <span>Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Core Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Primary Core Message</span>
                </span>
                <p className="font-semibold text-zinc-900 text-sm leading-snug">
                  {brief.primaryMessage}
                </p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Target Audience</span>
                </span>
                <p className="text-zinc-800 leading-snug font-medium">{brief.audience}</p>
              </div>
            </div>

            {/* Channel Drafts Summary */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                Channel Assets Ready for Distribution ({assets.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {assets.map((asset) => {
                  const isLinkedin = asset.channel === 'LINKEDIN';
                  const isEmail = asset.channel === 'EMAIL';
                  const isSEO = asset.channel === 'SEO';

                  let textCopy = '';
                  let preview = '';
                  if (isLinkedin) {
                    const c = asset.content as any;
                    textCopy = `${c.hook}\n\n${c.body}\n\n${c.cta}`;
                    preview = c.hook;
                  } else if (isEmail) {
                    const c = asset.content as any;
                    textCopy = `Subject: ${c.subject}\n\n${c.body}\n\n${c.cta}`;
                    preview = c.subject;
                  } else if (isSEO) {
                    const c = asset.content as any;
                    textCopy = `Topic: ${c.topic}\nPrimary Keyword: ${c.primaryKeyword}\nSecondary Keywords: ${c.secondaryKeywords?.join(', ')}`;
                    preview = `SEO Target: ${c.primaryKeyword}`;
                  }

                  return (
                    <div
                      key={asset.id}
                      className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {isLinkedin && <Linkedin className="w-3.5 h-3.5 text-blue-600" />}
                          {isEmail && <Mail className="w-3.5 h-3.5 text-indigo-600" />}
                          {isSEO && <SearchCheck className="w-3.5 h-3.5 text-emerald-600" />}
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-zinc-200 text-zinc-700 rounded uppercase">
                            {asset.channel}
                          </span>
                        </div>
                        <h4 className="font-bold text-zinc-900 line-clamp-1">{asset.title}</h4>
                        <p className="text-zinc-600 mt-1 text-[11px] line-clamp-2 italic leading-relaxed">
                          "{preview}"
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopyText(asset.id, textCopy)}
                        className="w-full py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 rounded-lg border border-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        {copiedId === asset.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Copy Asset</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evidence Provenance Count */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Grounded in <strong className="text-zinc-800">{brief.evidenceReferences?.length || 0}</strong> verified citations
                </span>
              </span>
              <span className="font-mono text-[11px]">Synthesized: {new Date(brief.generatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Red Team Modal */}
      {selectedBriefForRedTeam && (
        <RedTeamSimulatorModal
          brief={selectedBriefForRedTeam.brief}
          businessName={selectedBriefForRedTeam.businessName}
          onClose={() => setSelectedBriefForRedTeam(null)}
        />
      )}

      {/* Creative Studio Modal */}
      {selectedBriefForCreative && (
        <CreativeStudioModal
          brief={selectedBriefForCreative.brief}
          businessName={selectedBriefForCreative.businessName}
          assets={selectedBriefForCreative.assets}
          onClose={() => setSelectedBriefForCreative(null)}
        />
      )}
    </div>
  );
};

