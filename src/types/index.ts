export type EvidenceType = 'FACT' | 'INFERENCE' | 'RECOMMENDATION' | 'WARNING';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ConflictSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type ConflictStatus = 'UNRESOLVED' | 'HUMAN_VERIFIED' | 'DISMISSED';

export type JobStatus =
  | 'draft'
  | 'queued'
  | 'validating'
  | 'researching'
  | 'extracting'
  | 'normalizing'
  | 'analyzing'
  | 'generating'
  | 'validating_output'
  | 'awaiting_review'
  | 'approved'
  | 'rejected'
  | 'partial'
  | 'failed'
  | 'paused'
  | 'cancelling'
  | 'cancelled'
  | 'archived';

export type SourceStatus = 'pending' | 'fetching' | 'completed' | 'partial' | 'failed';

export type SourceFailureReason =
  | 'UNREACHABLE'
  | 'AUTH_REQUIRED'
  | 'TIMEOUT'
  | 'PARSE_ERROR'
  | 'RATE_LIMITED'
  | 'EMPTY_CONTENT'
  | 'BLOCKED'
  | 'INVALID_URL';

export type ResearchCategory =
  | 'Product'
  | 'Pricing'
  | 'Features'
  | 'Positioning'
  | 'Audience'
  | 'Messaging'
  | 'Call To Action'
  | 'Differentiators'
  | 'Pain Points'
  | 'Potential Gaps'
  | 'Trust Signals';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  businessName: string;
  description: string;
  industry: string;
  targetAudience: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchSource {
  id: string;
  jobId: string;
  workspaceId: string;
  url: string;
  title: string;
  canonicalUrl?: string;
  status: SourceStatus;
  httpStatus?: number;
  failureReason?: SourceFailureReason;
  errorMessage?: string;
  retrievedAt: string;
  rawTextSnippet?: string;
  wordCount?: number;
  isCompetitor: boolean;
}

export interface EvidenceVersionEntry {
  version: number;
  claim: string;
  supportingText: string;
  category: ResearchCategory;
  confidence: ConfidenceLevel;
  changedAt: string;
  changedBy: string;
  changeReason: string;
}

export interface Evidence {
  id: string;
  researchJobId: string;
  workspaceId: string;
  sourceId: string;
  category: ResearchCategory;
  claim: string;
  supportingText: string;
  sourceUrl: string;
  sourceTitle: string;
  retrievedAt: string;
  evidenceType: EvidenceType;
  confidence: ConfidenceLevel;
  normalizedValue?: string;
  version?: number;
  history?: EvidenceVersionEntry[];
  isVerified?: boolean;
  reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ConflictItem {
  id: string;
  researchJobId: string;
  workspaceId: string;
  category: ResearchCategory;
  description: string;
  severity: ConflictSeverity;
  status: ConflictStatus;
  conflictingValues: {
    sourceId: string;
    sourceUrl: string;
    sourceTitle: string;
    value: string;
    evidenceId: string;
  }[];
  resolutionNotes?: string;
  detectedAt: string;
  resolvedAt?: string;
}

export interface Finding {
  id: string;
  researchJobId?: string;
  category: string;
  title: string;
  statement: string;
  type: 'COMPETITIVE' | 'AUDIENCE' | 'GAP' | 'RISK' | 'ADVANTAGE';
  confidence: ConfidenceLevel;
  evidenceIds: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  evidenceIds: string[];
}

export interface IntelligenceReport {
  id: string;
  researchJobId: string;
  workspaceId: string;
  competitiveLandscape: string;
  audienceSignals: string[];
  messagingPatterns: string[];
  positioningGaps: string[];
  marketOpportunities: Opportunity[];
  potentialDifferentiators: string[];
  findings: Finding[];
  risks: string[];
  generatedAt: string;
}

export interface CampaignBrief {
  id: string;
  researchJobId: string;
  workspaceId: string;
  executiveSummary: string;
  objective: string;
  audience: string;
  coreProblem: string;
  competitiveInsights: string;
  positioning: string;
  campaignAngle: string;
  primaryMessage: string;
  supportingMessages: string[];
  recommendedChannels: string[];
  contentStrategy: string;
  recommendations: string[];
  risks: string[];
  evidenceReferences: {
    evidenceId: string;
    claim: string;
    sourceUrl: string;
    category: string;
  }[];
  confidence: ConfidenceLevel;
  limitations: string;
  generatedAt: string;
  status: 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface LinkedInAsset {
  hook: string;
  body: string;
  cta: string;
}

export interface EmailAsset {
  subject: string;
  previewText: string;
  body: string;
  cta: string;
}

export interface SEOAsset {
  topic: string;
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  outline: string[];
}

export interface CampaignAsset {
  id: string;
  researchJobId: string;
  workspaceId: string;
  channel: 'LINKEDIN' | 'EMAIL' | 'SEO';
  title: string;
  content: LinkedInAsset | EmailAsset | SEOAsset;
  evidenceReferences: string[];
  validationStatus: 'VALID' | 'WARNING' | 'INVALID';
  reviewStatus: 'PENDING' | 'APPROVED' | 'EDITED' | 'REJECTED';
  notes?: string;
}

export interface ExecutionTask {
  id: string;
  researchJobId: string;
  workspaceId: string;
  title: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'POSITIONING' | 'CONTENT' | 'VERIFICATION' | 'DISTRIBUTION' | 'LANDING_PAGE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  reason: string;
  evidenceReference?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ActionableTaskItem {
  title: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'POSITIONING' | 'CONTENT' | 'VERIFICATION' | 'DISTRIBUTION' | 'LANDING_PAGE';
  reason: string;
  evidenceReference?: string;
  sourceNoteSnippet?: string;
  suggestedFrom?: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'GTM_STRATEGIST' | 'RESEARCHER' | 'CONTENT_LEAD' | 'REVIEWER';
  title?: string;
  avatarUrl?: string;
  department?: string;
  joinedAt: string;
}

export type ShareScope = 'FULL_DOSSIER' | 'EXECUTIVE_NOTES' | 'EVIDENCE_ONLY' | 'CAMPAIGN_BRIEF';
export type SharePermission = 'VIEW_ONLY' | 'CAN_COMMENT' | 'REVIEW_APPROVAL';

export interface ResearchShareLink {
  id: string;
  token: string;
  researchJobId: string;
  workspaceId: string;
  title: string;
  scope: ShareScope;
  permission: SharePermission;
  passwordProtected?: boolean;
  password?: string;
  expiresAt?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  viewsCount: number;
  lastViewedAt?: string;
  isActive: boolean;
  shareUrl?: string;
}

export type ReviewTargetSection =
  | 'FULL_RESEARCH'
  | 'RESEARCH_NOTES'
  | 'COMPETITOR_EVIDENCE'
  | 'CAMPAIGN_BRIEF'
  | 'POSITIONING_STRATEGY'
  | 'MARKET_OPPORTUNITIES';

export type ReviewAssignmentStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED';

export interface ResearchReviewAssignment {
  id: string;
  researchJobId: string;
  workspaceId: string;
  targetSection: ReviewTargetSection;
  noteContextSnippet?: string;
  assignedToMemberId: string;
  assignedToName: string;
  assignedToEmail: string;
  assignedToAvatar?: string;
  assignedToRole?: string;
  assignedByMemberId: string;
  assignedByName: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  instructions: string;
  status: ReviewAssignmentStatus;
  reviewerFeedback?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  workspaceId: string;
  researchJobId?: string;
  eventType:
    | 'workspace_created'
    | 'research_created'
    | 'research_started'
    | 'source_started'
    | 'source_completed'
    | 'source_failed'
    | 'evidence_created'
    | 'conflict_detected'
    | 'intelligence_generated'
    | 'campaign_generated'
    | 'validation_passed'
    | 'validation_failed'
    | 'review_started'
    | 'approved'
    | 'rejected'
    | 'task_created'
    | 'task_completed'
    | 'share_link_created'
    | 'review_assigned'
    | 'review_status_updated'
    | 'ai_routing_started'
    | 'ai_model_selected'
    | 'ai_model_failed'
    | 'ai_fallback'
    | 'ai_generation_success'
    | 'ai_validation_failed'
    | 'ai_repair'
    | 'ai_run_completed';
  timestamp: string;
  summary: string;
  details?: Record<string, any>;
}

export interface ResearchJob {
  id: string;
  workspaceId: string;
  businessName: string;
  businessDescription: string;
  campaignObjective: string;
  targetAudience: string;
  competitorUrls: string[];
  additionalUrls: string[];
  status: JobStatus;
  currentStepMessage?: string;
  progressPercent: number;
  sourcesCount: number;
  evidenceCount: number;
  conflictsCount: number;
  isDemo?: boolean;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  errorMessage?: string;
  briefId?: string;
  intelligenceId?: string;
  isArchived?: boolean;
  scheduleId?: string;
  templateId?: string;
  parentJobId?: string;
  healthScore?: number;
  healthReasons?: string[];
  createdBy?: string;
}

export interface ValidationIssue {
  stage: 'INPUT' | 'SOURCE' | 'EVIDENCE' | 'AI_OUTPUT' | 'CAMPAIGN' | 'APPROVAL';
  severity: 'CRITICAL' | 'WARNING';
  message: string;
  field?: string;
  remedy?: string;
}

export interface ValidationReport {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  validatedAt: string;
}

export interface EvaluationCase {
  id: string;
  code: string; // TC01 .. TC12
  name: string;
  description: string;
  input: {
    businessName: string;
    businessDescription: string;
    campaignObjective: string;
    targetAudience: string;
    competitorUrls: string[];
    additionalUrls?: string[];
  };
  expectedBehavior: string;
  failureCategoryExpected?: string;
}

export interface EvaluationRun {
  id: string;
  caseId: string;
  caseCode: string;
  caseName: string;
  runAt: string;
  actualBehavior: string;
  pass: boolean;
  scores: {
    accuracy: number; // 0-5
    evidenceTraceability: number; // 0-5
    completeness: number; // 0-5
    actionability: number; // 0-5
    sourceCoverage: number; // 0-5
    humanUsability: number; // 0-5
  };
  qualityScore: number; // 0-100%
  latencyMs: number;
  humanInterventionsCount: number;
  failureCategory?: string;
  notes: string;
  jobId?: string;
}

export interface BaselineMetric {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  baselineTimeMinutes: number;
  baselineManualSteps: number;
  baselineHumanInterventions: number;
  baselineQualityScore: number;
  aiTimeMinutes: number;
  aiHumanInterventions: number;
  aiQualityScore: number;
  sourceCoveragePercent: number;
  lastUpdated: string;
}

export type SearchCategoryType = 'all' | 'research' | 'campaign' | 'task' | 'evidence';

export interface SearchResultItem {
  id: string;
  type: 'research' | 'campaign' | 'task' | 'evidence';
  title: string;
  subtitle: string;
  snippet?: string;
  jobId?: string;
  badge?: string;
  badgeVariant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'zinc';
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
}

export interface ExecutiveSummaryResult {
  paragraph: string;
  keySignals: string[];
  strategicImplication: string;
  confidenceScore: number;
  evidenceItemsAnalyzed: number;
  jobCountAnalyzed: number;
  generatedAt: string;
  model: string;
  sourceDomains: string[];
}

// ----------------------------------------------------
// AI Multi-Model Orchestration & Health Types
// ----------------------------------------------------
export type AITaskType =
  | 'RESEARCH_EXTRACTION'
  | 'EVIDENCE_NORMALIZATION'
  | 'CONFLICT_ANALYSIS'
  | 'INTELLIGENCE_SYNTHESIS'
  | 'CAMPAIGN_STRATEGY'
  | 'CONTENT_GENERATION'
  | 'EXECUTIVE_SUMMARY'
  | 'TASK_IDENTIFICATION'
  | 'VALIDATION'
  | 'EVALUATION'
  | 'STRUCTURED_REPAIR';

export type FailureCategory =
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'PROVIDER_UNAVAILABLE'
  | 'MODEL_UNAVAILABLE'
  | 'CONTEXT_TOO_LARGE'
  | 'INVALID_RESPONSE'
  | 'SCHEMA_FAILURE'
  | 'CONTENT_REFUSAL'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export type ModelHealthStatus = 'HEALTHY' | 'DEGRADED' | 'QUARANTINED' | 'OFFLINE';
export type AIRoutingMode = 'FREE_ONLY' | 'BALANCED' | 'CUSTOM';

export interface ModelCapabilityProfile {
  id: string;
  name: string;
  provider: 'openrouter' | 'gemini' | 'heuristic';
  contextWindow: number;
  supportsStructuredOutput: boolean;
  supportsJsonSchema: boolean;
  reasoningLevel: 'HIGH' | 'MEDIUM' | 'BASIC' | 'NONE';
  free: boolean;
  health: ModelHealthStatus;
  quarantinedUntil?: string;
  lastHealthCheck: string;
  consecutiveFailures: number;
  totalRequests: number;
  totalSuccesses: number;
  avgLatencyMs: number;
  pricing: {
    prompt: number;
    completion: number;
  };
  strengths: string[];
}

export interface AIRun {
  id: string;
  workspaceId: string;
  taskType: AITaskType;
  provider: string;
  model: string;
  attempt: number;
  status: 'SUCCESS' | 'FALLBACK_SUCCESS' | 'FAILED' | 'REPAIRED';
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  fallbackUsed: boolean;
  fallbackChain: string[];
  failureCategory?: FailureCategory;
  validationStatus: 'VALID' | 'WARNING' | 'REPAIRED' | 'INVALID';
  promptSummary?: string;
  createdAt: string;
}

export interface AIHealthStatus {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  openRouterStatus: 'CONNECTED' | 'DEGRADED' | 'OFFLINE' | 'UNCONFIGURED';
  geminiStatus: 'CONNECTED' | 'DEGRADED' | 'OFFLINE' | 'UNCONFIGURED';
  routingMode: AIRoutingMode;
  freeModelCount: number;
  healthyFreeModelCount: number;
  quarantinedModelCount: number;
  lastCatalogSync: string;
  models: ModelCapabilityProfile[];
  recentRuns: AIRun[];
  testMode: {
    failureInjectionEnabled: boolean;
    simulatedFailureType?: FailureCategory;
  };
}

// ----------------------------------------------------
// SaaS Automation & Lifecycle Features
// ----------------------------------------------------
export interface SavedResearchTemplate {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  defaultObjective: string;
  targetAudience: string;
  sourceUrls: string[];
  researchCategories: ResearchCategory[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  runCount?: number;
}

export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface ResearchSchedule {
  id: string;
  workspaceId: string;
  name: string;
  frequency: ScheduleFrequency;
  businessName: string;
  businessDescription: string;
  campaignObjective: string;
  targetAudience: string;
  sourceUrls: string[];
  researchCategories: ResearchCategory[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  lastJobId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'RESEARCH_COMPLETED'
  | 'RESEARCH_PARTIAL'
  | 'RESEARCH_FAILED'
  | 'CONFLICT_DETECTED'
  | 'REVIEW_REQUIRED'
  | 'CAMPAIGN_READY'
  | 'SOURCE_UNAVAILABLE'
  | 'EVALUATION_COMPLETED'
  | 'MEMBER_ROLE_CHANGED';

export interface NotificationItem {
  id: string;
  workspaceId: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
  jobId?: string;
  metadata?: Record<string, any>;
}

export type ChangeSignificance = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CompetitiveChangeItem {
  id: string;
  workspaceId: string;
  sourceUrl: string;
  sourceTitle: string;
  category: ResearchCategory;
  changeType: 'PRICING' | 'FEATURE' | 'POSITIONING' | 'CTA' | 'MESSAGING' | 'CONTENT';
  beforeSnippet: string;
  afterSnippet: string;
  changeDescription: string;
  significance: ChangeSignificance;
  confidence: ConfidenceLevel;
  detectedAt: string;
  previousJobId?: string;
  currentJobId: string;
  explanation: string;
}

export interface SourceHealthRecord {
  sourceUrl: string;
  domain: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  lastSuccessfulFetch?: string;
  lastFailedFetch?: string;
  successRatePercent: number;
  avgLatencyMs: number;
  consecutiveFailures: number;
  lastChangedAt?: string;
  failureReason?: string;
  totalFetches: number;
}

export interface ResearchHealthSummary {
  score: number; // 0-100
  status: 'OPTIMAL' | 'GOOD' | 'ATTENTION_NEEDED' | 'CRITICAL';
  factors: {
    label: string;
    impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    description: string;
    weight: number;
  }[];
  calculatedAt: string;
}

export interface UsageMetrics {
  workspaceId: string;
  planTier: 'FREE' | 'PRO' | 'TEAM';
  jobsUsed: number;
  jobsLimit: number;
  sourcesUsed: number;
  sourcesLimit: number;
  aiRunsUsed: number;
  aiRunsLimit: number;
  evidenceCreated: number;
  campaignsGenerated: number;
  activeMembersCount: number;
  membersLimit: number;
}

export interface ApprovalDecisionRecord {
  id: string;
  workspaceId: string;
  resourceType: 'CAMPAIGN' | 'ASSET' | 'EVIDENCE' | 'CONFLICT';
  resourceId: string;
  decision: 'APPROVED' | 'REJECTED' | 'EDITED' | 'FLAGGED';
  originalContent?: any;
  editedContent?: any;
  reason?: string;
  reviewedBy: string;
  reviewedByName: string;
  reviewedAt: string;
}

export interface RedTeamAnalysis {
  id: string;
  researchJobId: string;
  competitorName: string;
  counterAttackAngle: string;
  anticipatedDefensiveMoves: string[];
  vulnerabilityScore: number; // 0-100 (higher = more exposed)
  vulnerabilityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vulnerabilityReasons: string[];
  preemptiveCountermeasures: string[];
  salesObjectionTalkTracks: {
    objection: string;
    verifiedRebuttal: string;
    evidenceProofPoint: string;
  }[];
  generatedAt: string;
}

export interface CompetitorBattlecard {
  id: string;
  competitorName: string;
  targetAudience: string;
  summary: string;
  competitorStrengths: string[];
  competitorWeaknesses: string[];
  ourDifferentiators: string[];
  killShotQuestions: string[];
  pricingComparisonSummary: string;
  landminesToAvoid: string[];
  evidenceIds: string[];
  generatedAt: string;
}

export interface MatrixCompetitorPoint {
  id: string;
  name: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  quadrant: 'Leaders' | 'Challengers' | 'Niche' | 'Visionaries';
  notes: string;
  keyAdvantage: string;
  evidenceCount: number;
}

export interface PerceptualMatrixData {
  xAxisLabel: string;
  yAxisLabel: string;
  points: MatrixCompetitorPoint[];
  whiteSpaceGaps: {
    title: string;
    coordinates: { x: number; y: number };
    opportunityDescription: string;
    recommendedProductAngle: string;
  }[];
}

