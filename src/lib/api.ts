import {
  Workspace,
  ResearchJob,
  ResearchSource,
  Evidence,
  ConflictItem,
  IntelligenceReport,
  CampaignBrief,
  CampaignAsset,
  ExecutionTask,
  ActionableTaskItem,
  AuditEvent,
  EvaluationCase,
  EvaluationRun,
  BaselineMetric,
  SearchResponse,
  ExecutiveSummaryResult,
  WorkspaceMember,
  ResearchShareLink,
  ResearchReviewAssignment
} from '../types';

const getStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
};

const setStorageItem = (key: string, value: string | null) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      if (value !== null) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    } catch {}
  }
};

let currentWorkspaceId = 'ws_demo_sandbox';
let currentAuthToken: string | null = getStorageItem('rf_auth_token');
let currentDemoMode = getStorageItem('rf_demo_mode') === 'true';

export function setActiveWorkspaceHeader(workspaceId: string) {
  currentWorkspaceId = workspaceId;
}

export function setAuthToken(token: string | null) {
  currentAuthToken = token;
  setStorageItem('rf_auth_token', token);
}

export function setDemoModeHeader(isDemo: boolean) {
  currentDemoMode = isDemo;
  if (isDemo) {
    setStorageItem('rf_demo_mode', 'true');
  } else {
    setStorageItem('rf_demo_mode', null);
  }
}

async function request<T>(endpoint: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const timeoutMs = options.timeoutMs || 60000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = currentAuthToken || getStorageItem('rf_auth_token');
  const demoMode = currentDemoMode || getStorageItem('rf_demo_mode') === 'true';
  const wsId = currentWorkspaceId || getStorageItem('rf_workspace_id') || 'ws_demo_sandbox';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-workspace-id': wsId,
    ...(demoMode ? { 'x-demo-mode': 'true' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorBody.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s. Please check your network connection.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  // Auth & Session
  getMe: () => request<{ user: any; workspaces: Workspace[]; activeWorkspaceId: string }>('/api/auth/me'),
  signup: (data: {
    email: string;
    password?: string;
    name: string;
    avatarUrl?: string;
    workspaceName?: string;
    businessName?: string;
    industry?: string;
    targetAudience?: string;
  }) =>
    request<{ user: any; token: string; workspaces: Workspace[]; activeWorkspaceId: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password?: string }) =>
    request<{ user: any; token: string; workspaces: Workspace[]; activeWorkspaceId: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  googleLogin: (data: { email: string; name?: string; avatarUrl?: string }) =>
    request<{ user: any; token: string; workspaces: Workspace[]; activeWorkspaceId: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => request<{ success: boolean; message: string }>('/api/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string; resetToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    request<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
  updateProfile: (data: {
    name?: string;
    displayName?: string;
    avatarType?: 'IMAGE' | 'EMOJI' | 'INITIALS' | 'DEFAULT';
    avatarValue?: string;
    profileImageUrl?: string;
  }) =>
    request<{ success: boolean; user: any }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadAvatar: (imageBase64: string, mimeType?: string) =>
    request<{ success: boolean; user: any; profileImageUrl: string }>('/api/auth/profile/avatar', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType }),
    }),
  removeAvatar: () =>
    request<{ success: boolean; user: any }>('/api/auth/profile/avatar', {
      method: 'DELETE',
    }),
  getAiDiagnostics: () =>
    request<any>('/api/ai/diagnostics'),

  // Workspaces
  getWorkspaces: () => request<Workspace[]>('/api/workspaces'),
  createWorkspace: (data: Partial<Workspace>) =>
    request<Workspace>('/api/workspaces', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkspace: (id: string, data: Partial<Workspace>) =>
    request<Workspace>(`/api/workspaces/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Research Jobs
  getResearchJobs: () => request<ResearchJob[]>('/api/research/jobs'),
  getResearchJob: (id: string) =>
    request<ResearchJob & {
      sources: ResearchSource[];
      evidence: Evidence[];
      conflicts: ConflictItem[];
      intelligence?: IntelligenceReport;
      campaignBrief?: CampaignBrief;
      assets: CampaignAsset[];
      tasks: ExecutionTask[];
      shareLinks?: ResearchShareLink[];
      reviewAssignments?: ResearchReviewAssignment[];
    }>(`/api/research/jobs/${id}`),
  createResearchJob: (data: {
    businessName: string;
    businessDescription: string;
    campaignObjective: string;
    targetAudience: string;
    competitorUrls: string[];
    additionalUrls?: string[];
  }) => request<ResearchJob>('/api/research/jobs', { method: 'POST', body: JSON.stringify(data) }),
  runResearchJob: (id: string) =>
    request<ResearchJob>(`/api/research/jobs/${id}/run`, { method: 'POST' }),
  deleteResearchJob: (id: string) =>
    request<{ success: boolean }>(`/api/research/jobs/${id}`, { method: 'DELETE' }),
  getAllEvidence: () => request<Evidence[]>('/api/evidence'),
  getJobEvidence: (jobId: string) => request<Evidence[]>(`/api/research/jobs/${jobId}/evidence`),

  // Conflicts
  resolveConflict: (id: string, data: { status: 'HUMAN_VERIFIED' | 'DISMISSED'; resolutionNotes: string }) =>
    request<ConflictItem>(`/api/conflicts/${id}/resolve`, { method: 'POST', body: JSON.stringify(data) }),

  // Campaign Approval & Edit
  editCampaignBrief: (jobId: string, updates: Partial<CampaignBrief>) =>
    request<CampaignBrief>(`/api/research/jobs/${jobId}/campaign/edit`, { method: 'POST', body: JSON.stringify(updates) }),
  approveResearchJob: (jobId: string, reviewNotes?: string, approvedBy?: string) =>
    request<ResearchJob>(`/api/research/jobs/${jobId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes, approvedBy }),
    }),
  rejectResearchJob: (jobId: string, reason: string) =>
    request<ResearchJob>(`/api/research/jobs/${jobId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Tasks & Actionable Task Identification
  getTasks: (jobId?: string) =>
    request<ExecutionTask[]>(`/api/tasks${jobId ? `?jobId=${jobId}` : ''}`),
  createTask: (data: Partial<ExecutionTask>) =>
    request<ExecutionTask>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  createTasksBatch: (tasks: Partial<ExecutionTask>[]) =>
    request<{ count: number; tasks: ExecutionTask[] }>('/api/tasks/batch', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    }),
  updateTask: (id: string, updates: Partial<ExecutionTask>) =>
    request<ExecutionTask>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  extractTasksFromJobNotes: (jobId: string, customNotes?: string) =>
    request<{ tasks: ActionableTaskItem[]; noteSnippet: string; jobId: string }>(
      `/api/research/jobs/${jobId}/extract-tasks`,
      { method: 'POST', body: JSON.stringify({ customNotes }) }
    ),
  extractTasksFromNotes: (data: {
    notes: string;
    businessName?: string;
    campaignObjective?: string;
    targetAudience?: string;
  }) => request<{ tasks: ActionableTaskItem[] }>('/api/research/extract-tasks', { method: 'POST', body: JSON.stringify(data) }),

  // Evaluation & Baseline
  getEvaluation: () =>
    request<{
      testCases: EvaluationCase[];
      summary: {
        totalCases: number;
        executedCount: number;
        passedCount: number;
        failedCount: number;
        passRatePercent: number;
        avgQuality: number;
        avgLatencyMs: number;
        avgInterventions: number;
        recentRuns: EvaluationRun[];
      };
    }>('/api/evaluation'),
  runEvaluation: (caseCode?: string) =>
    request<{ run?: EvaluationRun; runs?: EvaluationRun[]; summary: any }>('/api/evaluation/run', {
      method: 'POST',
      body: JSON.stringify({ caseCode }),
    }),
  getBaseline: () => request<BaselineMetric>('/api/baseline'),
  updateBaseline: (data: Partial<BaselineMetric>) =>
    request<BaselineMetric>('/api/baseline', { method: 'PUT', body: JSON.stringify(data) }),

  // Activity / Audit
  getActivity: (limit = 50) => request<AuditEvent[]>(`/api/activity?limit=${limit}`),

  // Research Insights Summary (Gemini API)
  getExecutiveSummary: () => request<ExecutiveSummaryResult>('/api/research/insights/summary'),
  regenerateExecutiveSummary: () =>
    request<ExecutiveSummaryResult>('/api/research/insights/summary/regenerate', { method: 'POST' }),

  // Global Search
  search: (query: string, type?: string, limit = 30) =>
    request<SearchResponse>(
      `/api/search?q=${encodeURIComponent(query)}${type && type !== 'all' ? `&type=${encodeURIComponent(type)}` : ''}&limit=${limit}`
    ),

  // Workspace Members
  getWorkspaceMembers: () => request<WorkspaceMember[]>('/api/workspace/members'),
  addWorkspaceMember: (data: Partial<WorkspaceMember>) =>
    request<WorkspaceMember>('/api/workspace/members', { method: 'POST', body: JSON.stringify(data) }),

  // Research Share Links
  createShareLink: (
    jobId: string,
    data: {
      scope: 'FULL_DOSSIER' | 'EXECUTIVE_NOTES' | 'EVIDENCE_ONLY' | 'CAMPAIGN_BRIEF';
      permission: 'VIEW_ONLY' | 'CAN_COMMENT' | 'REVIEW_APPROVAL';
      passwordProtected?: boolean;
      password?: string;
      expiresAt?: string;
    }
  ) =>
    request<ResearchShareLink>(`/api/research/jobs/${jobId}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getShareLinks: (jobId: string) => request<ResearchShareLink[]>(`/api/research/jobs/${jobId}/share-links`),
  revokeShareLink: (id: string) =>
    request<{ success: boolean }>(`/api/research/share-links/${id}`, { method: 'DELETE' }),
  getSharedResearch: (token: string) =>
    request<{
      shareLink: ResearchShareLink;
      job: ResearchJob;
      intelligence?: IntelligenceReport;
      campaignBrief?: CampaignBrief;
      evidence: Evidence[];
      sources?: ResearchSource[];
      conflicts?: ConflictItem[];
      reviews?: ResearchReviewAssignment[];
    }>(`/api/share/research/${token}`),

  // Research Review Assignments
  assignReview: (
    jobId: string,
    data: {
      memberId: string;
      targetSection: string;
      noteContextSnippet?: string;
      priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
      dueDate?: string;
      instructions: string;
    }
  ) =>
    request<ResearchReviewAssignment>(`/api/research/jobs/${jobId}/assign-review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getJobReviews: (jobId: string) => request<ResearchReviewAssignment[]>(`/api/research/jobs/${jobId}/reviews`),
  getWorkspaceReviews: () => request<ResearchReviewAssignment[]>('/api/research/reviews'),
  updateReview: (
    id: string,
    data: {
      status: 'PENDING' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED';
      reviewerFeedback?: string;
    }
  ) =>
    request<ResearchReviewAssignment>(`/api/research/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteReview: (id: string) =>
    request<{ success: boolean }>(`/api/research/reviews/${id}`, { method: 'DELETE' }),

  // Demo
  seedDemo: () => request<{ success: boolean; job: ResearchJob }>('/api/demo/seed', { method: 'POST' }),

  // ----------------------------------------------------
  // SaaS Templates
  // ----------------------------------------------------
  getTemplates: () => request<any[]>('/api/templates'),
  createTemplate: (data: any) => request<any>('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
  deleteTemplate: (id: string) => request<{ success: boolean }>(`/api/templates/${id}`, { method: 'DELETE' }),
  runTemplate: (id: string, data?: any) =>
    request<ResearchJob>(`/api/templates/${id}/run`, { method: 'POST', body: JSON.stringify(data || {}) }),

  // ----------------------------------------------------
  // SaaS Recurring Schedules
  // ----------------------------------------------------
  getSchedules: () => request<any[]>('/api/schedules'),
  createSchedule: (data: any) => request<any>('/api/schedules', { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id: string, data: any) => request<any>(`/api/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSchedule: (id: string) => request<{ success: boolean }>(`/api/schedules/${id}`, { method: 'DELETE' }),
  runScheduleNow: (id: string) => request<ResearchJob>(`/api/schedules/${id}/run-now`, { method: 'POST' }),

  // ----------------------------------------------------
  // Competitive Change Radar & Source Health
  // ----------------------------------------------------
  getChangeRadar: () => request<any[]>('/api/change-radar'),
  getSourceHealth: () => request<any[]>('/api/sources/health'),

  // ----------------------------------------------------
  // Notifications Center
  // ----------------------------------------------------
  getNotifications: () => request<any[]>('/api/notifications'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' }),

  // ----------------------------------------------------
  // Review Queue & Approval Memory
  // ----------------------------------------------------
  getReviewQueue: () => request<any>('/api/reviews/queue'),
  recordReviewDecision: (data: {
    resourceType: 'CAMPAIGN' | 'ASSET' | 'EVIDENCE' | 'CONFLICT';
    resourceId: string;
    decision: 'APPROVED' | 'REJECTED' | 'EDITED' | 'FLAGGED';
    originalContent?: any;
    editedContent?: any;
    reason?: string;
  }) => request<any>('/api/reviews/decision', { method: 'POST', body: JSON.stringify(data) }),
  getReviewHistory: () => request<any[]>('/api/reviews/history'),

  // ----------------------------------------------------
  // Evidence Versioning & Editing
  // ----------------------------------------------------
  editEvidence: (
    id: string,
    data: {
      claim?: string;
      supportingText?: string;
      category?: string;
      confidence?: string;
      changeReason?: string;
    }
  ) => request<Evidence>(`/api/evidence/${id}/edit`, { method: 'POST', body: JSON.stringify(data) }),

  // ----------------------------------------------------
  // Workspace Members & Roles
  // ----------------------------------------------------
  updateWorkspaceMemberRole: (id: string, role: string) =>
    request<WorkspaceMember>(`/api/workspace/members/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteWorkspaceMember: (id: string) =>
    request<{ success: boolean }>(`/api/workspace/members/${id}`, { method: 'DELETE' }),

  // ----------------------------------------------------
  // Workspace Usage & Metering
  // ----------------------------------------------------
  getWorkspaceUsage: () => request<any>('/api/workspace/usage'),

  // ----------------------------------------------------
  // Research Job Lifecycle & Duplication / Comparison
  // ----------------------------------------------------
  duplicateResearchJob: (id: string) => request<ResearchJob>(`/api/research/jobs/${id}/duplicate`, { method: 'POST' }),
  archiveResearchJob: (id: string, isArchived = true) =>
    request<ResearchJob>(`/api/research/jobs/${id}/archive`, { method: 'POST', body: JSON.stringify({ isArchived }) }),
  pauseResearchJob: (id: string) => request<{ success: boolean; status: string }>(`/api/research/jobs/${id}/pause`, { method: 'POST' }),
  resumeResearchJob: (id: string) => request<ResearchJob>(`/api/research/jobs/${id}/resume`, { method: 'POST' }),
  cancelResearchJob: (id: string) => request<{ success: boolean; status: string }>(`/api/research/jobs/${id}/cancel`, { method: 'POST' }),
  getResearchHealth: (id: string) => request<any>(`/api/research/jobs/${id}/health`),
  compareResearchRuns: (jobA: string, jobB: string) =>
    request<any>(`/api/research/compare?jobA=${encodeURIComponent(jobA)}&jobB=${encodeURIComponent(jobB)}`),

  // ----------------------------------------------------
  // Cross-Tenant Automated Isolation Test
  // ----------------------------------------------------
  runCrossTenantIsolationTest: () => request<any>('/api/admin/test-cross-tenant-isolation', { method: 'POST' }),

  // ----------------------------------------------------
  // AI Red-Team Counter-Strategy & Simulation
  // ----------------------------------------------------
  runRedTeamSimulation: (campaignBriefId: string) =>
    request<any>(`/api/campaigns/${campaignBriefId}/red-team`, { method: 'POST' }),

  // ----------------------------------------------------
  // Competitor Battlecards
  // ----------------------------------------------------
  generateBattlecard: (jobId: string, competitorName?: string) =>
    request<any>(`/api/intelligence/${jobId}/battlecard`, { method: 'POST', body: JSON.stringify({ competitorName }) }),

  // ----------------------------------------------------
  // Interactive Perceptual Positioning Matrix
  // ----------------------------------------------------
  getPerceptualMatrix: (jobId: string, xAxis?: string, yAxis?: string) =>
    request<any>(`/api/intelligence/${jobId}/matrix${xAxis ? `?xAxis=${encodeURIComponent(xAxis)}&yAxis=${encodeURIComponent(yAxis || '')}` : ''}`),
  recalculatePerceptualMatrix: (jobId: string, xAxisLabel: string, yAxisLabel: string) =>
    request<any>(`/api/intelligence/${jobId}/matrix/recalculate`, {
      method: 'POST',
      body: JSON.stringify({ xAxisLabel, yAxisLabel }),
    }),

  // ----------------------------------------------------
  // Executive Audio Briefing
  // ----------------------------------------------------
  getAudioBriefing: (jobId: string) => request<any>(`/api/intelligence/${jobId}/audio-briefing`),
};

