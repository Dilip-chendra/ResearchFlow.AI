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
  ValidationReport,
  SearchResponse,
  ExecutiveSummaryResult,
  WorkspaceMember,
  ResearchShareLink,
  ResearchReviewAssignment,
  WarRoomOverviewResponse,
  WarRoomCompetitor,
  CompetitorMove,
  ProductGap,
  CustomerDemandSignal,
  MarketOpportunity,
  MarketThreat,
  WarRoomRecommendation,
  ScenarioSimulation,
  StrategicDecision,
  StrategicExperiment,
  CompanyScorecard,
  ExecutiveBrief,
  MarketKnowledgeGraph,
  CompanyProfile,
  DigitalProperty,
  DigitalPropertyCategory,
  LeadershipProfile,
  ProductDeepProfile,
  CustomerIntelligenceProfile,
  BusinessIntelligenceProfile,
  DeepCrawlJob,
  UserFactCorrection,
  SubscriptionPlan,
  UserSubscription,
  QuotaUsageRecord,
  BillingOrder,
  BillingTransaction,
  BYOKPublicSummary,
  WorkspaceAIConfig,
  AIProviderType,
  BillingInterval,
  AIMode,
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
  login: (data: { email: string; password?: string; clientAccountSync?: any }) =>
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
    request<{ success: boolean; message: string; user?: any; token?: string; workspaces?: Workspace[]; activeWorkspaceId?: string }>('/api/auth/reset-password', {
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
  discoverCompetitors: (data: {
    businessName?: string;
    businessDescription?: string;
    industry?: string;
    targetAudience?: string;
  }) =>
    request<{
      success: boolean;
      count: number;
      competitors: Array<{ name: string; url: string; reason?: string }>;
    }>('/api/research/discover-competitors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  runResearchJob: (id: string) =>
    request<ResearchJob>(`/api/research/jobs/${id}/run`, { method: 'POST' }),
  deleteResearchJob: (id: string) =>
    request<{ success: boolean }>(`/api/research/jobs/${id}`, { method: 'DELETE' }),
  getAllEvidence: () => request<Evidence[]>('/api/evidence'),
  getJobEvidence: (jobId: string) => request<Evidence[]>(`/api/research/jobs/${jobId}/evidence`),

  // Conflicts
  resolveConflict: (id: string, data: { status: 'HUMAN_VERIFIED' | 'DISMISSED'; resolutionNotes: string }) =>
    request<ConflictItem>(`/api/conflicts/${id}/resolve`, { method: 'POST', body: JSON.stringify(data) }),

  // Enterprise Campaigns
  getCampaigns: () => request<any[]>('/api/campaigns'),
  getCampaign: (id: string) => request<{ campaign: CampaignBrief; job: ResearchJob; assets: CampaignAsset[]; evidence: Evidence[]; intelligence: any }>(`/api/campaigns/${id}`),
  selectCampaignAngle: (id: string, angleId: string) =>
    request<CampaignBrief>(`/api/campaigns/${id}/angles/select`, { method: 'POST', body: JSON.stringify({ angleId }) }),
  updateCampaignAsset: (id: string, assetId: string, data: { content?: any; title?: string; reviewStatus?: string }) =>
    request<CampaignAsset>(`/api/campaigns/${id}/assets/${assetId}`, { method: 'PUT', body: JSON.stringify(data) }),
  regenerateCampaignAsset: (id: string, data: { assetId: string; channel: string; instruction: string }) =>
    request<CampaignAsset>(`/api/campaigns/${id}/regenerate-asset`, { method: 'POST', body: JSON.stringify(data) }),
  validateCampaign: (id: string) =>
    request<ValidationReport>(`/api/campaigns/${id}/validate`, { method: 'POST' }),
  approveCampaign: (id: string, data?: { reviewNotes?: string; approvedBy?: string }) =>
    request<{ brief: CampaignBrief; tasks: ExecutionTask[] }>(`/api/campaigns/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }),
  rejectCampaign: (id: string, reason?: string) =>
    request<CampaignBrief>(`/api/campaigns/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),

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

  // ----------------------------------------------------
  // Market War Room — Strategic Intelligence Operating System
  // ----------------------------------------------------
  getWarRoomOverview: () => request<WarRoomOverviewResponse>('/api/war-room/overview'),
  mapMyMarket: (data: {
    marketCategory: string;
    targetCustomers: string;
    strategicGoal?: string;
    knownCompetitors?: string[];
    keyDifferentiators?: string[];
  }) => request<WarRoomOverviewResponse>('/api/war-room/map-market', { method: 'POST', body: JSON.stringify(data) }),
  getWarRoomCompetitors: () => request<{ success: boolean; competitors: WarRoomCompetitor[] }>('/api/war-room/competitors'),
  discoverWarRoomCompetitors: (query?: string) =>
    request<{ success: boolean; candidates: WarRoomCompetitor[] }>('/api/war-room/competitors/discover', { method: 'POST', body: JSON.stringify({ query }) }),
  updateCompetitorStatus: (id: string, status: 'CONFIRMED' | 'REJECTED', notes?: string) =>
    request<{ success: boolean; competitor: WarRoomCompetitor }>(`/api/war-room/competitors/${id}/status`, { method: 'POST', body: JSON.stringify({ status, notes }) }),
  getCompetitorMoves: () => request<{ success: boolean; moves: CompetitorMove[] }>('/api/war-room/moves'),
  getProductGaps: () => request<{ success: boolean; productGaps: ProductGap[] }>('/api/war-room/product-gaps'),
  evaluateProductGap: (gap: Partial<ProductGap>) =>
    request<{ success: boolean; productGaps: ProductGap[] }>('/api/war-room/product-gaps/evaluate', { method: 'POST', body: JSON.stringify(gap) }),
  getDemandSignals: () => request<{ success: boolean; demandSignals: CustomerDemandSignal[] }>('/api/war-room/demand-signals'),
  getMarketOpportunities: () => request<{ success: boolean; opportunities: MarketOpportunity[] }>('/api/war-room/opportunities'),
  convertOpportunityToCampaign: (opportunityId: string) =>
    request<{ success: boolean; campaign: CampaignBrief }>(`/api/war-room/opportunities/${opportunityId}/campaign`, { method: 'POST' }),
  getMarketThreats: () => request<{ success: boolean; threats: MarketThreat[] }>('/api/war-room/threats'),
  convertThreatToTask: (threatId: string) =>
    request<{ success: boolean; task: ExecutionTask }>(`/api/war-room/threats/${threatId}/task`, { method: 'POST' }),
  convertProductGapToTask: (gapId: string) =>
    request<{ success: boolean; task: ExecutionTask }>(`/api/war-room/product-gaps/${gapId}/task`, { method: 'POST' }),
  getWarRoomRecommendations: () => request<{ success: boolean; recommendations: WarRoomRecommendation[] }>('/api/war-room/recommendations'),
  approveRecommendation: (id: string, rationale?: string) =>
    request<{ success: boolean; decision: StrategicDecision }>(`/api/war-room/recommendations/${id}/approve`, { method: 'POST', body: JSON.stringify({ rationale }) }),
  rejectRecommendation: (id: string, rationale?: string) =>
    request<{ success: boolean; decision: StrategicDecision }>(`/api/war-room/recommendations/${id}/reject`, { method: 'POST', body: JSON.stringify({ rationale }) }),
  convertRecommendationToExperiment: (id: string) =>
    request<{ success: boolean; experiment: StrategicExperiment }>(`/api/war-room/recommendations/${id}/experiment`, { method: 'POST' }),
  runScenarioSimulation: (data: { scenarioTitle: string; triggerDescription: string; competitorName?: string }) =>
    request<{ success: boolean; simulation: ScenarioSimulation }>('/api/war-room/scenarios/run', { method: 'POST', body: JSON.stringify(data) }),
  getScenarioSimulations: () => request<{ success: boolean; scenarios: ScenarioSimulation[] }>('/api/war-room/scenarios'),
  getMarketGraph: () => request<{ success: boolean; graph: MarketKnowledgeGraph }>('/api/war-room/market-graph'),
  getExecutiveBrief: () => request<{ success: boolean; brief: ExecutiveBrief }>('/api/war-room/brief'),
  getCompanyScorecard: () => request<{ success: boolean; scorecard: CompanyScorecard }>('/api/war-room/scorecard'),
  getStrategicDecisions: () => request<{ success: boolean; decisions: StrategicDecision[] }>('/api/war-room/decisions'),
  getStrategicExperiments: () => request<{ success: boolean; experiments: StrategicExperiment[] }>('/api/war-room/experiments'),
  searchWarRoom: (q: string) => request<any>(`/api/war-room/search?q=${encodeURIComponent(q)}`),

  // ----------------------------------------------------
  // Deep Company Intelligence & Digital Footprint
  // ----------------------------------------------------
  getCompanyProfile: () => request<{ success: boolean; profile: CompanyProfile }>('/api/company/profile'),
  updateCompanyProfile: (profile: Partial<CompanyProfile>) =>
    request<{ success: boolean; profile: CompanyProfile }>('/api/company/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
  getDigitalProperties: () => request<{ success: boolean; properties: DigitalProperty[] }>('/api/company/footprint'),
  addDigitalProperty: (property: { category: DigitalPropertyCategory; name: string; url: string; connectionType?: string }) =>
    request<{ success: boolean; property: DigitalProperty }>('/api/company/footprint', {
      method: 'POST',
      body: JSON.stringify(property),
    }),
  deleteDigitalProperty: (id: string) => request<{ success: boolean }>(`/api/company/footprint/${id}`, { method: 'DELETE' }),
  getLeadershipProfiles: () => request<{ success: boolean; leadership: LeadershipProfile[] }>('/api/company/leadership'),
  saveLeadershipProfile: (leader: Partial<LeadershipProfile>) =>
    request<{ success: boolean; leader: LeadershipProfile }>('/api/company/leadership', {
      method: 'POST',
      body: JSON.stringify(leader),
    }),
  deleteLeadershipProfile: (id: string) => request<{ success: boolean }>(`/api/company/leadership/${id}`, { method: 'DELETE' }),
  getProductProfiles: () => request<{ success: boolean; products: ProductDeepProfile[] }>('/api/company/products'),
  saveProductProfile: (product: Partial<ProductDeepProfile>) =>
    request<{ success: boolean; product: ProductDeepProfile }>('/api/company/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  deleteProductProfile: (id: string) => request<{ success: boolean }>(`/api/company/products/${id}`, { method: 'DELETE' }),
  getCustomerIntelligence: () => request<{ success: boolean; customerIntelligence: CustomerIntelligenceProfile | null }>('/api/company/customer-intelligence'),
  saveCustomerIntelligence: (cust: Partial<CustomerIntelligenceProfile>) =>
    request<{ success: boolean; customerIntelligence: CustomerIntelligenceProfile }>('/api/company/customer-intelligence', {
      method: 'PUT',
      body: JSON.stringify(cust),
    }),
  getBusinessIntelligence: () => request<{ success: boolean; businessIntelligence: BusinessIntelligenceProfile | null }>('/api/company/business-intelligence'),
  triggerDeepCrawl: (options?: { maxPageBudget?: number; maxDepth?: number }) =>
    request<{ success: boolean; job: DeepCrawlJob }>('/api/company/crawl', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),
  getDeepCrawlJobs: () => request<{ success: boolean; jobs: DeepCrawlJob[] }>('/api/company/crawl/jobs'),
  getDeepCrawlJob: (jobId: string) => request<{ success: boolean; job: DeepCrawlJob }>(`/api/company/crawl/jobs/${jobId}`),
  correctFact: (factId: string, correctedText: string) =>
    request<{ success: boolean; correction: UserFactCorrection }>('/api/company/facts/correct', {
      method: 'POST',
      body: JSON.stringify({ factId, correctedText }),
    }),
  getFactCorrections: () => request<{ success: boolean; corrections: UserFactCorrection[] }>('/api/company/facts/corrections'),

  // SaaS Monetization & Razorpay Billing
  getSubscriptionPlans: () => request<{ success: boolean; plans: SubscriptionPlan[] }>('/api/billing/plans'),
  getSubscription: () =>
    request<{ success: boolean; subscription: UserSubscription; plan: SubscriptionPlan; usage: QuotaUsageRecord }>(
      '/api/billing/subscription'
    ),
  createCheckoutOrder: (planId: string, interval: BillingInterval) =>
    request<{
      success: boolean;
      orderId: string;
      razorpayOrderId: string;
      amountINR: number;
      currency: string;
      keyId: string;
      plan: SubscriptionPlan;
      isFreePlan?: boolean;
    }>('/api/billing/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId, interval }),
    }),
  verifyPayment: (payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) =>
    request<{ success: boolean; subscription: UserSubscription; transaction: BillingTransaction }>(
      '/api/billing/verify-payment',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  getBillingTransactions: () =>
    request<{ success: boolean; transactions: BillingTransaction[] }>('/api/billing/transactions'),
  getBillingOrders: () => request<{ success: boolean; orders: BillingOrder[] }>('/api/billing/orders'),

  // Enterprise BYOK & AI Configuration
  getBYOKKeys: () => request<{ success: boolean; keys: BYOKPublicSummary[] }>('/api/byok/keys'),
  testBYOKKey: (provider: AIProviderType, apiKey: string, modelId?: string) =>
    request<{ success: boolean; healthy: boolean; latencyMs: number; error?: string }>('/api/byok/test', {
      method: 'POST',
      body: JSON.stringify({ provider, apiKey, modelId }),
    }),
  saveBYOKKey: (provider: AIProviderType, apiKey: string, preferredModel?: string) =>
    request<{ success: boolean; key: BYOKPublicSummary }>('/api/byok/save', {
      method: 'POST',
      body: JSON.stringify({ provider, apiKey, preferredModel }),
    }),
  deleteBYOKKey: (provider: string) =>
    request<{ success: boolean }>(`/api/byok/${provider}`, { method: 'DELETE' }),
  getAIConfig: () =>
    request<{ success: boolean; config: WorkspaceAIConfig; effectiveMode: AIMode }>('/api/byok/config'),
  updateAIConfig: (updates: Partial<WorkspaceAIConfig>) =>
    request<{ success: boolean; config: WorkspaceAIConfig; effectiveMode: AIMode }>('/api/byok/config', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

