import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import {
  ResearchJob,
  WorkspaceMember,
  ResearchShareLink,
  ResearchReviewAssignment,
  ShareScope,
  SharePermission,
  ReviewTargetSection,
  ReviewAssignmentStatus,
} from '../../types';
import {
  Share2,
  Users,
  Link,
  Copy,
  Check,
  Calendar,
  Clock,
  Shield,
  Eye,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Send,
  UserCheck,
  FileText,
  Lock,
  Layers,
  ArrowRight,
  X,
  RefreshCw,
  Mail,
  MessageCircle,
} from 'lucide-react';

interface ShareResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ResearchJob;
  initialTargetNote?: string;
  initialSection?: ReviewTargetSection;
  onAssignmentCreated?: () => void;
  onOpenSharedPreview?: (token: string) => void;
}

export const ShareResearchModal: React.FC<ShareResearchModalProps> = ({
  isOpen,
  onClose,
  job,
  initialTargetNote,
  initialSection = 'RESEARCH_NOTES',
  onAssignmentCreated,
  onOpenSharedPreview,
}) => {
  const { addToast } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'link' | 'assign' | 'active'>('link');

  // Share Link State
  const [scope, setScope] = useState<ShareScope>('FULL_DOSSIER');
  const [permission, setPermission] = useState<SharePermission>('VIEW_ONLY');
  const [expiryDays, setExpiryDays] = useState<string>('30');
  const [passwordProtected, setPasswordProtected] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<ResearchShareLink | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedSlack, setCopiedSlack] = useState<boolean>(false);

  // Team Members & Assignment State
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [targetSection, setTargetSection] = useState<ReviewTargetSection>(initialSection);
  const [noteSnippet, setNoteSnippet] = useState<string>(initialTargetNote || '');
  const [priority, setPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [dueDate, setDueDate] = useState<string>('');
  const [instructions, setInstructions] = useState<string>(
    'Please review the extracted competitor claims, verify pricing data, and validate market gap findings.'
  );
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // New Member Modal/Inline State
  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberEmail, setNewMemberEmail] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<string>('GTM_STRATEGIST');
  const [newMemberTitle, setNewMemberTitle] = useState<string>('GTM Reviewer');
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);

  // Active Shares & Reviews State
  const [shareLinks, setShareLinks] = useState<ResearchShareLink[]>([]);
  const [reviews, setReviews] = useState<ResearchReviewAssignment[]>([]);
  const [loadingActive, setLoadingActive] = useState<boolean>(false);

  // Load team members and active items
  const loadData = async () => {
    try {
      setLoadingActive(true);
      const [membersData, linksData, reviewsData] = await Promise.all([
        api.getWorkspaceMembers(),
        api.getShareLinks(job.id),
        api.getJobReviews(job.id),
      ]);
      setMembers(membersData);
      if (membersData.length > 0 && !selectedMemberId) {
        setSelectedMemberId(membersData[0].id);
      }
      setShareLinks(linksData);
      setReviews(reviewsData);
    } catch (err: any) {
      console.error('Failed to load share/members data', err);
    } finally {
      setLoadingActive(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (initialTargetNote) {
        setNoteSnippet(initialTargetNote);
        setActiveTab('assign');
      }
    }
  }, [isOpen, job.id, initialTargetNote]);

  if (!isOpen) return null;

  // Handle Share Link Generation
  const handleGenerateLink = async () => {
    try {
      setIsGeneratingLink(true);
      const expiresAt =
        expiryDays === 'never'
          ? undefined
          : new Date(Date.now() + parseInt(expiryDays, 10) * 86400000).toISOString();

      const created = await api.createShareLink(job.id, {
        scope,
        permission,
        passwordProtected,
        password: passwordProtected ? password : undefined,
        expiresAt,
      });

      setGeneratedLink(created);
      setShareLinks((prev) => [created, ...prev]);
      addToast('Unique share link generated successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const fullShareUrl = generatedLink
    ? `${window.location.origin}/share/research/${generatedLink.token}`
    : '';

  const handleCopyLink = () => {
    if (!fullShareUrl) return;
    navigator.clipboard.writeText(fullShareUrl);
    setCopiedLink(true);
    addToast('Share link copied to clipboard', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySlackFormatted = () => {
    const slackText = `*Research Dossier Review:* ${job.businessName}
*Campaign Objective:* ${job.campaignObjective}
*Target Audience:* ${job.targetAudience}
*Sources Analyzed:* ${job.sourcesCount || 0} competitors | *Evidence Claims:* ${job.evidenceCount || 0}
*Review URL:* ${fullShareUrl || `${window.location.origin}/share/research/sample`}`;

    navigator.clipboard.writeText(slackText);
    setCopiedSlack(true);
    addToast('Slack-formatted review snippet copied to clipboard', 'success');
    setTimeout(() => setCopiedSlack(false), 2500);
  };

  // Handle Team Member Review Assignment
  const handleAssignReview = async () => {
    if (!selectedMemberId) {
      addToast('Please select a team member to review', 'warning');
      return;
    }
    if (!instructions.trim()) {
      addToast('Please provide review instructions or directives', 'warning');
      return;
    }

    try {
      setIsAssigning(true);
      const assignment = await api.assignReview(job.id, {
        memberId: selectedMemberId,
        targetSection,
        noteContextSnippet: noteSnippet || undefined,
        priority,
        dueDate: dueDate || undefined,
        instructions: instructions.trim(),
      });

      addToast(
        `Assigned review on "${job.businessName}" to ${assignment.assignedToName}`,
        'success'
      );
      setReviews((prev) => [assignment, ...prev]);
      if (onAssignmentCreated) onAssignmentCreated();
      setActiveTab('active');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Adding New Team Member
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      addToast('Name and email are required', 'warning');
      return;
    }

    try {
      setIsAddingMember(true);
      const member = await api.addWorkspaceMember({
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        role: newMemberRole as any,
        title: newMemberTitle.trim(),
      });

      setMembers((prev) => [...prev, member]);
      setSelectedMemberId(member.id);
      setShowAddMember(false);
      setNewMemberName('');
      setNewMemberEmail('');
      addToast(`Added team member "${member.name}"`, 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Handle Revoking Share Link
  const handleRevokeLink = async (linkId: string) => {
    try {
      await api.revokeShareLink(linkId);
      setShareLinks((prev) => prev.filter((l) => l.id !== linkId));
      if (generatedLink?.id === linkId) setGeneratedLink(null);
      addToast('Share link revoked', 'info');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // Handle Updating Review Status
  const handleUpdateReviewStatus = async (
    reviewId: string,
    status: ReviewAssignmentStatus,
    feedback?: string
  ) => {
    try {
      const updated = await api.updateReview(reviewId, {
        status,
        reviewerFeedback: feedback,
      });
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      addToast(`Review marked as ${status.replace('_', ' ')}`, 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-2xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                  Share & Review Research
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                  {job.businessName}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Generate secure links for stakeholders or assign team members to verify notes and findings.
              </p>
            </div>
          </div>

          <button
            id="btn-close-share-modal"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-5 gap-4 text-xs font-semibold">
          <button
            id="tab-share-link"
            onClick={() => setActiveTab('link')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'link'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Generate Unique Link</span>
          </button>

          <button
            id="tab-assign-review"
            onClick={() => setActiveTab('assign')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'assign'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Team Review</span>
            {initialTargetNote && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            )}
          </button>

          <button
            id="tab-active-shares"
            onClick={() => setActiveTab('active')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Active Shares ({shareLinks.length + reviews.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: GENERATE SHARE LINK */}
          {activeTab === 'link' && (
            <div className="space-y-5">
              {/* Generated Link Display Box if link exists */}
              {generatedLink && (
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Live Share Link Active
                    </span>
                    <span className="text-[11px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      Scope: {generatedLink.scope.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 border border-indigo-200 shadow-2xs">
                    <input
                      type="text"
                      readOnly
                      value={fullShareUrl}
                      className="bg-transparent flex-1 text-xs text-zinc-800 font-mono px-2 outline-none select-all"
                    />
                    <button
                      id="btn-copy-share-link"
                      onClick={handleCopyLink}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-bold transition-colors ${
                        copiedLink
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-copy-slack"
                        onClick={handleCopySlackFormatted}
                        className="flex items-center gap-1 text-[11px] font-semibold text-zinc-700 hover:text-indigo-700 bg-white hover:bg-zinc-50 px-2.5 py-1 rounded border border-zinc-200 shadow-2xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{copiedSlack ? 'Copied Slack Text!' : 'Copy Slack Preview'}</span>
                      </button>

                      {onOpenSharedPreview && (
                        <button
                          id="btn-open-preview"
                          onClick={() => onOpenSharedPreview(generatedLink.token)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Preview Guest View</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-zinc-500">
                      Views: <strong className="text-zinc-800">{generatedLink.viewsCount || 0}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Scope & Permissions Settings Form */}
              <div className="space-y-4">
                {/* Access Scope */}
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Included Research Content (Scope)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        id: 'FULL_DOSSIER',
                        title: 'Full Research Dossier',
                        desc: 'Executive summary, competitor claims, matrix & strategy briefs.',
                      },
                      {
                        id: 'EXECUTIVE_NOTES',
                        title: 'Executive Notes & Findings',
                        desc: 'Summary directives, market gaps, and tagged evidence.',
                      },
                      {
                        id: 'EVIDENCE_ONLY',
                        title: 'Evidence Claims & Quotes',
                        desc: 'Direct competitor statements, pricing quotes and source links.',
                      },
                      {
                        id: 'CAMPAIGN_BRIEF',
                        title: 'Campaign Strategy Brief',
                        desc: 'Target angles, messaging pillars and omnichannel assets.',
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setScope(item.id as ShareScope)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          scope === item.id
                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                            : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                      >
                        <div className="font-bold text-zinc-900 text-xs">{item.title}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permission Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Permission Level</span>
                    </label>
                    <select
                      id="select-share-permission"
                      value={permission}
                      onChange={(e) => setPermission(e.target.value as SharePermission)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="VIEW_ONLY">View Only (Read Dossier)</option>
                      <option value="CAN_COMMENT">Can Comment & Leave Notes</option>
                      <option value="REVIEW_APPROVAL">Reviewer Approval Access</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Link Expiration</span>
                    </label>
                    <select
                      id="select-share-expiry"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="7">Expires in 7 Days</option>
                      <option value="14">Expires in 14 Days</option>
                      <option value="30">Expires in 30 Days (Recommended)</option>
                      <option value="never">Never Expires</option>
                    </select>
                  </div>
                </div>

                {/* Password Protection Toggle */}
                <div className="pt-2 border-t border-zinc-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-zinc-800 flex items-center gap-1.5 cursor-pointer">
                      <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Require Password Access</span>
                    </label>
                    <input
                      type="checkbox"
                      id="chk-password-protect"
                      checked={passwordProtected}
                      onChange={(e) => setPasswordProtected(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {passwordProtected && (
                    <input
                      type="password"
                      id="input-share-password"
                      placeholder="Enter a secure access password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Generate Link Button */}
              <button
                id="btn-generate-link-submit"
                onClick={handleGenerateLink}
                disabled={isGeneratingLink}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingLink ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Link className="w-4 h-4" />
                )}
                <span>Generate New Secure Share Link</span>
              </button>
            </div>
          )}

          {/* TAB 2: ASSIGN TEAM REVIEW */}
          {activeTab === 'assign' && (
            <div className="space-y-4">
              {/* Member Selector & Add Member */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Assignee (Team Member)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddMember(!showAddMember)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddMember ? 'Cancel' : 'Add Team Member'}</span>
                  </button>
                </div>

                {/* Inline Add Member Form */}
                {showAddMember && (
                  <form
                    onSubmit={handleCreateMember}
                    className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5 animate-in fade-in"
                  >
                    <div className="font-bold text-zinc-800 text-[11px]">New Team Member Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Full Name (e.g. Jordan Smith)"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Work Email (e.g. jordan@company.com)"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Title (e.g. Product Marketing Manager)"
                        value={newMemberTitle}
                        onChange={(e) => setNewMemberTitle(e.target.value)}
                        className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="GTM_STRATEGIST">GTM Strategist</option>
                        <option value="RESEARCHER">Competitive Researcher</option>
                        <option value="CONTENT_LEAD">Content Lead</option>
                        <option value="REVIEWER">Reviewer</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddMember(false)}
                        className="px-2.5 py-1 text-zinc-500 hover:text-zinc-800 text-[11px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingMember}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-[11px]"
                      >
                        {isAddingMember ? 'Adding...' : 'Save & Select'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Member Radio Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-0.5">
                  {members.map((mem) => (
                    <button
                      key={mem.id}
                      type="button"
                      onClick={() => setSelectedMemberId(mem.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                        selectedMemberId === mem.id
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <img
                        src={mem.avatarUrl}
                        alt={mem.name}
                        className="w-8 h-8 rounded-full object-cover border border-zinc-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-zinc-900 text-xs truncate flex items-center justify-between">
                          <span>{mem.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400 font-normal">
                            {mem.role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">{mem.title || mem.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Section & Priority / Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-800">Target Section</label>
                  <select
                    id="select-target-section"
                    value={targetSection}
                    onChange={(e) => setTargetSection(e.target.value as ReviewTargetSection)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="RESEARCH_NOTES">Specific Research Directive / Note</option>
                    <option value="COMPETITOR_EVIDENCE">Competitor Pricing & Evidence Matrix</option>
                    <option value="POSITIONING_STRATEGY">Market Positioning & Gaps</option>
                    <option value="CAMPAIGN_BRIEF">Campaign Strategy Brief</option>
                    <option value="FULL_RESEARCH">Entire Research Dossier</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-800">Review Priority</label>
                  <select
                    id="select-review-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="URGENT">🔥 Urgent (24 Hours)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low / Routine</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-800">Due Date (Optional)</label>
                  <input
                    type="date"
                    id="input-review-due-date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-800 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Context Note Snippet (If reviewing specific note) */}
              {noteSnippet && (
                <div className="space-y-1 bg-amber-50/60 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 text-[11px] flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      Target Research Note Snippet
                    </span>
                    <button
                      type="button"
                      onClick={() => setNoteSnippet('')}
                      className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold"
                    >
                      Clear Snippet
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-900 italic font-mono bg-white/80 p-2 rounded border border-amber-200/60 line-clamp-3">
                    "{noteSnippet}"
                  </p>
                </div>
              )}

              {/* Reviewer Instructions Textarea */}
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-800 flex items-center justify-between">
                  <span>Review Instructions & Directives</span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    Give context on what to verify
                  </span>
                </label>
                <textarea
                  id="textarea-review-instructions"
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Please verify competitor pricing claims and double check the Workday positioning gap..."
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                />

                {/* Quick Prompts */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-zinc-400 font-semibold">Quick Prompts:</span>
                  {[
                    'Verify competitor pricing claims',
                    'Check positioning angle vs market leaders',
                    'Validate audience pain point citations',
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInstructions(prompt)}
                      className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded text-[10px] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Assignment Button */}
              <button
                id="btn-assign-review-submit"
                onClick={handleAssignReview}
                disabled={isAssigning || !selectedMemberId}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isAssigning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Assign Review & Notify Team Member</span>
              </button>
            </div>
          )}

          {/* TAB 3: ACTIVE SHARES & REVIEWS */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              {/* Active Review Assignments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Active Team Review Assignments ({reviews.length})</span>
                  </span>
                </div>

                {reviews.length === 0 ? (
                  <div className="py-6 text-center text-zinc-400 text-xs bg-zinc-50 rounded-xl border border-zinc-200/60">
                    No team review assignments active for this research item.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                rev.assignedToAvatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                              }
                              alt={rev.assignedToName}
                              className="w-7 h-7 rounded-full object-cover border border-zinc-200"
                            />
                            <div>
                              <div className="font-bold text-zinc-900 text-xs">{rev.assignedToName}</div>
                              <div className="text-[10px] text-zinc-500">{rev.assignedToRole}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                rev.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : rev.status === 'CHANGES_REQUESTED'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : rev.status === 'IN_REVIEW'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              {rev.status.replace('_', ' ')}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                rev.priority === 'URGENT'
                                  ? 'bg-rose-100 text-rose-800'
                                  : rev.priority === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-zinc-100 text-zinc-600'
                              }`}
                            >
                              {rev.priority}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-zinc-700 bg-zinc-50 p-2 rounded-lg border border-zinc-100 leading-relaxed">
                          <span className="font-bold text-zinc-900">Directives:</span> {rev.instructions}
                        </div>

                        {rev.reviewerFeedback && (
                          <div className="text-[11px] text-emerald-900 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                            <span className="font-bold">Reviewer Feedback:</span> {rev.reviewerFeedback}
                          </div>
                        )}

                        {/* Action Status Toggles for Quick Verification */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[11px]">
                          <span className="text-zinc-400">
                            Section: <strong>{rev.targetSection.replace('_', ' ')}</strong>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleUpdateReviewStatus(rev.id, 'APPROVED', 'Verified and approved.')
                              }
                              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded border border-emerald-200 transition-colors"
                            >
                              Mark Approved
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateReviewStatus(
                                  rev.id,
                                  'CHANGES_REQUESTED',
                                  'Requires additional competitor citations.'
                                )
                              }
                              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded border border-amber-200 transition-colors"
                            >
                              Request Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Unique Share Links */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <Link className="w-4 h-4 text-indigo-600" />
                    <span>Generated Unique Share Links ({shareLinks.length})</span>
                  </span>
                </div>

                {shareLinks.length === 0 ? (
                  <div className="py-6 text-center text-zinc-400 text-xs bg-zinc-50 rounded-xl border border-zinc-200/60">
                    No active share links generated yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shareLinks.map((sl) => {
                      const linkUrl = `${window.location.origin}/share/research/${sl.token}`;
                      return (
                        <div
                          key={sl.id}
                          className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-zinc-900 font-bold text-xs truncate">
                                {linkUrl}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 text-zinc-700 rounded">
                                {sl.scope.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                              <span>Views: {sl.viewsCount || 0}</span>
                              <span>•</span>
                              <span>
                                {sl.expiresAt
                                  ? `Expires ${new Date(sl.expiresAt).toLocaleDateString()}`
                                  : 'No expiration'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(linkUrl);
                                addToast('Link copied to clipboard', 'success');
                              }}
                              className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors"
                              title="Copy URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {onOpenSharedPreview && (
                              <button
                                onClick={() => onOpenSharedPreview(sl.token)}
                                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                                title="Open Live Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleRevokeLink(sl.id)}
                              className="p-1.5 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Revoke Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
