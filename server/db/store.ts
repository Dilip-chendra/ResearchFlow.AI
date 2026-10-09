import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  User,
  Workspace,
  ResearchJob,
  ResearchSource,
  Evidence,
  ConflictItem,
  IntelligenceReport,
  CampaignBrief,
  CampaignAsset,
  ExecutionTask,
  AuditEvent,
  EvaluationRun,
  BaselineMetric,
  JobStatus,
  WorkspaceMember,
  ResearchShareLink,
  ResearchReviewAssignment,
  AIRun,
  SavedResearchTemplate,
  ResearchSchedule,
  NotificationItem,
  CompetitiveChangeItem,
  SourceHealthRecord,
  ResearchHealthSummary,
  UsageMetrics,
  ApprovalDecisionRecord,
  MarketModel,
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
} from '../types';
import { logger } from '../utils/logger';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  avatarType?: 'IMAGE' | 'EMOJI' | 'INITIALS' | 'DEFAULT';
  avatarValue?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt?: string;
  resetToken?: string;
  resetTokenExpires?: number;
}

export interface UserSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// Default demo user & workspace for instant demo sandbox
export const DEMO_USER_ID = 'usr_demo_founder';
export const DEMO_WORKSPACE_ID = 'ws_demo_sandbox';

const DEFAULT_USER: User = {
  id: DEMO_USER_ID,
  email: 'founder@researchflow.ai',
  name: 'Alex Chen',
  displayName: 'Alex Chen',
  avatarType: 'INITIALS',
  avatarValue: 'AC',
  avatarUrl: '',
  createdAt: new Date('2026-08-20T10:00:00Z').toISOString(),
};

const DEFAULT_WORKSPACE: Workspace = {
  id: DEMO_WORKSPACE_ID,
  name: 'Acme Growth Labs (Demo)',
  businessName: 'NextGen Resume AI',
  description: 'AI resume builder focused on converting college graduates and career changers into high-paying tech roles.',
  industry: 'B2C SaaS / EdTech / Career Services',
  targetAudience: 'University seniors, junior software engineers, and career pivoters',
  ownerId: DEFAULT_USER.id,
  createdAt: new Date('2026-08-20T10:05:00Z').toISOString(),
  updatedAt: new Date('2026-08-20T10:05:00Z').toISOString(),
};

const DEFAULT_MEMBERS: WorkspaceMember[] = [
  {
    id: 'mem_1',
    workspaceId: DEMO_WORKSPACE_ID,
    name: 'Alex Chen',
    email: 'alex@growthlabs.io',
    role: 'OWNER',
    title: 'Founder & CEO',
    department: 'Executive',
    avatarType: 'INITIALS',
    avatarValue: 'AC',
    avatarUrl: '',
    joinedAt: new Date('2026-08-20T10:05:00Z').toISOString(),
  },
  {
    id: 'mem_2',
    workspaceId: DEMO_WORKSPACE_ID,
    name: 'Sarah Jenkins',
    email: 'sarah.j@growthlabs.io',
    role: 'GTM_STRATEGIST',
    title: 'Principal GTM Strategist',
    department: 'Marketing Strategy',
    avatarType: 'INITIALS',
    avatarValue: 'SJ',
    avatarUrl: '',
    joinedAt: new Date('2026-08-21T09:15:00Z').toISOString(),
  },
  {
    id: 'mem_3',
    workspaceId: DEMO_WORKSPACE_ID,
    name: 'Marcus Vance',
    email: 'marcus.v@growthlabs.io',
    role: 'RESEARCHER',
    title: 'Competitive Intelligence Lead',
    department: 'Market Research',
    avatarType: 'INITIALS',
    avatarValue: 'MV',
    avatarUrl: '',
    joinedAt: new Date('2026-08-22T11:30:00Z').toISOString(),
  },
  {
    id: 'mem_4',
    workspaceId: DEMO_WORKSPACE_ID,
    name: 'Elena Rostova',
    email: 'elena.r@growthlabs.io',
    role: 'CONTENT_LEAD',
    title: 'Head of Messaging & Content',
    department: 'Content Strategy',
    avatarType: 'INITIALS',
    avatarValue: 'ER',
    avatarUrl: '',
    joinedAt: new Date('2026-08-23T14:20:00Z').toISOString(),
  },
  {
    id: 'mem_5',
    workspaceId: DEMO_WORKSPACE_ID,
    name: 'David Kim',
    email: 'david.k@growthlabs.io',
    role: 'REVIEWER',
    title: 'Product Marketing Manager',
    department: 'Product Marketing',
    avatarType: 'INITIALS',
    avatarValue: 'DK',
    avatarUrl: '',
    joinedAt: new Date('2026-08-24T16:00:00Z').toISOString(),
  },
];

const DEFAULT_BASELINE: BaselineMetric = {
  id: 'bm_default',
  workspaceId: DEMO_WORKSPACE_ID,
  name: 'Competitor Intelligence & Campaign Brief Sprint',
  description: 'Manual workflow of researching 3-5 competitors, extracting pricing/features into spreadsheets, synthesizing positioning, and writing 3 channel briefs.',
  baselineTimeMinutes: 240, // 4 hours manual
  baselineManualSteps: 18,
  baselineHumanInterventions: 12,
  baselineQualityScore: 72, // 72%
  aiTimeMinutes: 12, // 12 minutes with ResearchFlow
  aiHumanInterventions: 2, // human review & approval
  aiQualityScore: 94, // 94% with rigorous evidence checks
  sourceCoveragePercent: 95,
  lastUpdated: new Date().toISOString(),
};

export class PersistentDatabaseStore {
  private dataFilePath: string;
  private saveDebounceTimer: NodeJS.Timeout | null = null;

  private users: Map<string, User> = new Map();
  private userAccounts: Map<string, UserAccount> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private workspaces: Map<string, Workspace> = new Map();
  private members: Map<string, WorkspaceMember> = new Map();
  private researchJobs: Map<string, ResearchJob> = new Map();
  private shareLinks: Map<string, ResearchShareLink> = new Map();
  private reviewAssignments: Map<string, ResearchReviewAssignment> = new Map();
  private sources: Map<string, ResearchSource> = new Map();
  private evidence: Map<string, Evidence> = new Map();
  private conflicts: Map<string, ConflictItem> = new Map();
  private intelligence: Map<string, IntelligenceReport> = new Map();
  private campaignBriefs: Map<string, CampaignBrief> = new Map();
  private campaignAssets: Map<string, CampaignAsset> = new Map();
  private tasks: Map<string, ExecutionTask> = new Map();
  private auditEvents: AuditEvent[] = [];
  private evaluationRuns: Map<string, EvaluationRun> = new Map();
  private baselineMetrics: Map<string, BaselineMetric> = new Map();
  private aiRuns: AIRun[] = [];
  private templates: Map<string, SavedResearchTemplate> = new Map();
  private schedules: Map<string, ResearchSchedule> = new Map();
  private notifications: Map<string, NotificationItem> = new Map();
  private changeItems: Map<string, CompetitiveChangeItem> = new Map();
  private sourceHealthRecords: Map<string, SourceHealthRecord> = new Map();
  private approvalDecisions: Map<string, ApprovalDecisionRecord> = new Map();
  private marketModels: Map<string, MarketModel> = new Map();
  private warRoomCompetitors: Map<string, WarRoomCompetitor> = new Map();
  private competitorMoves: Map<string, CompetitorMove> = new Map();
  private productGaps: Map<string, ProductGap> = new Map();
  private demandSignals: Map<string, CustomerDemandSignal> = new Map();
  private marketOpportunities: Map<string, MarketOpportunity> = new Map();
  private marketThreats: Map<string, MarketThreat> = new Map();
  private warRoomRecommendations: Map<string, WarRoomRecommendation> = new Map();
  private scenarioSimulations: Map<string, ScenarioSimulation> = new Map();
  private strategicDecisions: Map<string, StrategicDecision> = new Map();
  private strategicExperiments: Map<string, StrategicExperiment> = new Map();
  private companyScorecards: Map<string, CompanyScorecard> = new Map();
  private executiveBriefs: Map<string, ExecutiveBrief> = new Map();

  constructor() {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const defaultDataDir = path.join(process.cwd(), 'data');
    const writableDir = isServerless ? path.join('/tmp', 'data') : defaultDataDir;

    if (!fs.existsSync(writableDir)) {
      try {
        fs.mkdirSync(writableDir, { recursive: true });
      } catch (err) {
        logger.warn('Could not create data directory:', err);
      }
    }
    this.dataFilePath = path.join(writableDir, 'researchflow_db.json');

    this.loadFromDisk();

    // Ensure demo user exists
    if (!this.users.has(DEFAULT_USER.id)) {
      this.users.set(DEFAULT_USER.id, DEFAULT_USER);
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = this.hashPassword('DemoPassword123!', salt);
      this.userAccounts.set(DEFAULT_USER.email.toLowerCase(), {
        id: DEFAULT_USER.id,
        email: DEFAULT_USER.email,
        name: DEFAULT_USER.name,
        avatarUrl: DEFAULT_USER.avatarUrl,
        passwordHash: hash,
        salt,
        createdAt: DEFAULT_USER.createdAt,
      });
    }

    // Also support legacy ID alias
    if (!this.users.has('usr_default_founder')) {
      this.users.set('usr_default_founder', { ...DEFAULT_USER, id: 'usr_default_founder' });
    }

    if (!this.workspaces.has(DEMO_WORKSPACE_ID)) {
      this.workspaces.set(DEMO_WORKSPACE_ID, DEFAULT_WORKSPACE);
    }
    if (!this.workspaces.has('ws_default_prod')) {
      this.workspaces.set('ws_default_prod', { ...DEFAULT_WORKSPACE, id: 'ws_default_prod', name: 'Acme Growth Labs' });
    }

    if (this.members.size === 0) {
      DEFAULT_MEMBERS.forEach(m => this.members.set(m.id, m));
    }

    if (!this.baselineMetrics.has(DEFAULT_BASELINE.id)) {
      this.baselineMetrics.set(DEFAULT_BASELINE.id, DEFAULT_BASELINE);
    }

    this.seedWarRoomDataIfEmpty();
    this.saveToDiskSync();
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  }

  private loadFromDisk(): void {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    let currentDir = process.cwd();
    try {
      if (typeof __dirname !== 'undefined') {
        currentDir = __dirname;
      } else if (typeof import.meta !== 'undefined' && import.meta.url) {
        currentDir = path.dirname(fileURLToPath(import.meta.url));
      }
    } catch {
      currentDir = process.cwd();
    }
    const candidatePaths = [
      path.join(process.cwd(), 'data', 'researchflow_db.json'),
      path.join('/var/task', 'data', 'researchflow_db.json'),
      path.resolve(process.cwd(), 'data', 'researchflow_db.json'),
      path.join(currentDir, '..', '..', 'data', 'researchflow_db.json'),
      path.join(currentDir, '..', 'data', 'researchflow_db.json'),
      path.join(currentDir, 'data', 'researchflow_db.json'),
    ];

    let targetPath = this.dataFilePath;
    if (!fs.existsSync(targetPath)) {
      const foundCandidate = candidatePaths.find(p => {
        try { return fs.existsSync(p); } catch { return false; }
      });
      if (foundCandidate) {
        if (isServerless) {
          try {
            const destDir = path.dirname(this.dataFilePath);
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(foundCandidate, this.dataFilePath);
            targetPath = this.dataFilePath;
          } catch {
            targetPath = foundCandidate;
          }
        } else {
          targetPath = foundCandidate;
        }
      } else {
        return;
      }
    }

    try {
      const raw = fs.readFileSync(targetPath, 'utf-8');
      const parsed = JSON.parse(raw);

      if (parsed.users) this.users = new Map(parsed.users);
      if (parsed.userAccounts) this.userAccounts = new Map(parsed.userAccounts);
      if (parsed.sessions) this.sessions = new Map(parsed.sessions);
      if (parsed.workspaces) this.workspaces = new Map(parsed.workspaces);
      if (parsed.members) this.members = new Map(parsed.members);
      if (parsed.researchJobs) this.researchJobs = new Map(parsed.researchJobs);
      if (parsed.shareLinks) this.shareLinks = new Map(parsed.shareLinks);
      if (parsed.reviewAssignments) this.reviewAssignments = new Map(parsed.reviewAssignments);
      if (parsed.sources) this.sources = new Map(parsed.sources);
      if (parsed.evidence) this.evidence = new Map(parsed.evidence);
      if (parsed.conflicts) this.conflicts = new Map(parsed.conflicts);
      if (parsed.intelligence) this.intelligence = new Map(parsed.intelligence);
      if (parsed.campaignBriefs) this.campaignBriefs = new Map(parsed.campaignBriefs);
      if (parsed.campaignAssets) this.campaignAssets = new Map(parsed.campaignAssets);
      if (parsed.tasks) this.tasks = new Map(parsed.tasks);
      if (parsed.auditEvents) this.auditEvents = parsed.auditEvents;
      if (parsed.evaluationRuns) this.evaluationRuns = new Map(parsed.evaluationRuns);
      if (parsed.baselineMetrics) this.baselineMetrics = new Map(parsed.baselineMetrics);
      if (parsed.aiRuns) this.aiRuns = parsed.aiRuns;
      if (parsed.templates) this.templates = new Map(parsed.templates);
      if (parsed.schedules) this.schedules = new Map(parsed.schedules);
      if (parsed.notifications) this.notifications = new Map(parsed.notifications);
      if (parsed.changeItems) this.changeItems = new Map(parsed.changeItems);
      if (parsed.sourceHealthRecords) this.sourceHealthRecords = new Map(parsed.sourceHealthRecords);
      if (parsed.approvalDecisions) this.approvalDecisions = new Map(parsed.approvalDecisions);
      if (parsed.marketModels) this.marketModels = new Map(parsed.marketModels);
      if (parsed.warRoomCompetitors) this.warRoomCompetitors = new Map(parsed.warRoomCompetitors);
      if (parsed.competitorMoves) this.competitorMoves = new Map(parsed.competitorMoves);
      if (parsed.productGaps) this.productGaps = new Map(parsed.productGaps);
      if (parsed.demandSignals) this.demandSignals = new Map(parsed.demandSignals);
      if (parsed.marketOpportunities) this.marketOpportunities = new Map(parsed.marketOpportunities);
      if (parsed.marketThreats) this.marketThreats = new Map(parsed.marketThreats);
      if (parsed.warRoomRecommendations) this.warRoomRecommendations = new Map(parsed.warRoomRecommendations);
      if (parsed.scenarioSimulations) this.scenarioSimulations = new Map(parsed.scenarioSimulations);
      if (parsed.strategicDecisions) this.strategicDecisions = new Map(parsed.strategicDecisions);
      if (parsed.strategicExperiments) this.strategicExperiments = new Map(parsed.strategicExperiments);
      if (parsed.companyScorecards) this.companyScorecards = new Map(parsed.companyScorecards);
      if (parsed.executiveBriefs) this.executiveBriefs = new Map(parsed.executiveBriefs);

      // Auto-migrate legacy avatar URLs to individual distinct initials / custom avatars
      for (const [uid, user] of this.users.entries()) {
        if (user.avatarUrl?.includes('images.unsplash.com/photo-1534528741775-53994a69daeb')) {
          user.avatarUrl = '';
        }
        if (!user.avatarType) {
          user.avatarType = 'INITIALS';
          user.avatarValue = this.computeInitials(user.name);
        }
        this.users.set(uid, user);
      }
      for (const [memId, member] of this.members.entries()) {
        if (member.avatarUrl?.includes('images.unsplash.com/photo-1534528741775-53994a69daeb')) {
          member.avatarUrl = '';
        }
        if (!member.avatarType) {
          member.avatarType = 'INITIALS';
          member.avatarValue = this.computeInitials(member.name);
        }
        this.members.set(memId, member);
      }

      logger.info(`Loaded persistent database from disk (${this.workspaces.size} workspaces, ${this.researchJobs.size} jobs).`);
    } catch (err) {
      logger.error('Failed to load database from disk, using clean state:', err);
    }
  }

  private scheduleSave(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.saveDebounceTimer = setTimeout(() => {
      this.saveToDiskSync();
    }, 100);
  }

  public saveToDiskSync(): void {
    try {
      const payload = {
        users: Array.from(this.users.entries()),
        userAccounts: Array.from(this.userAccounts.entries()),
        sessions: Array.from(this.sessions.entries()),
        workspaces: Array.from(this.workspaces.entries()),
        members: Array.from(this.members.entries()),
        researchJobs: Array.from(this.researchJobs.entries()),
        shareLinks: Array.from(this.shareLinks.entries()),
        reviewAssignments: Array.from(this.reviewAssignments.entries()),
        sources: Array.from(this.sources.entries()),
        evidence: Array.from(this.evidence.entries()),
        conflicts: Array.from(this.conflicts.entries()),
        intelligence: Array.from(this.intelligence.entries()),
        campaignBriefs: Array.from(this.campaignBriefs.entries()),
        campaignAssets: Array.from(this.campaignAssets.entries()),
        tasks: Array.from(this.tasks.entries()),
        auditEvents: this.auditEvents,
        evaluationRuns: Array.from(this.evaluationRuns.entries()),
        baselineMetrics: Array.from(this.baselineMetrics.entries()),
        aiRuns: this.aiRuns,
        templates: Array.from(this.templates.entries()),
        schedules: Array.from(this.schedules.entries()),
        notifications: Array.from(this.notifications.entries()),
        changeItems: Array.from(this.changeItems.entries()),
        sourceHealthRecords: Array.from(this.sourceHealthRecords.entries()),
        approvalDecisions: Array.from(this.approvalDecisions.entries()),
        marketModels: Array.from(this.marketModels.entries()),
        warRoomCompetitors: Array.from(this.warRoomCompetitors.entries()),
        competitorMoves: Array.from(this.competitorMoves.entries()),
        productGaps: Array.from(this.productGaps.entries()),
        demandSignals: Array.from(this.demandSignals.entries()),
        marketOpportunities: Array.from(this.marketOpportunities.entries()),
        marketThreats: Array.from(this.marketThreats.entries()),
        warRoomRecommendations: Array.from(this.warRoomRecommendations.entries()),
        scenarioSimulations: Array.from(this.scenarioSimulations.entries()),
        strategicDecisions: Array.from(this.strategicDecisions.entries()),
        strategicExperiments: Array.from(this.strategicExperiments.entries()),
        companyScorecards: Array.from(this.companyScorecards.entries()),
        executiveBriefs: Array.from(this.executiveBriefs.entries()),
      };

      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const tempPath = `${this.dataFilePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
      try {
        fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
        fs.renameSync(tempPath, this.dataFilePath);
      } catch {
        // Fallback for Windows file-locking race conditions
        try {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch {}
        fs.writeFileSync(this.dataFilePath, JSON.stringify(payload, null, 2), 'utf-8');
      }
    } catch (err) {
      logger.error('Failed to persist database to disk:', err);
    }
  }

  public computeInitials(name: string): string {
    if (!name || typeof name !== 'string') return 'RF';
    const clean = name.trim();
    if (!clean) return 'RF';
    const parts = clean.split(/[\s\-_\.]+/).filter(Boolean);
    if (parts.length === 0) return 'RF';
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ----------------------------------------------------
  // Authentication & Session Management
  // ----------------------------------------------------
  registerUser(data: {
    email: string;
    password?: string;
    name: string;
    displayName?: string;
    avatarUrl?: string;
    profileImageUrl?: string;
    avatarType?: 'IMAGE' | 'EMOJI' | 'INITIALS' | 'DEFAULT';
    avatarValue?: string;
  }): { user: User; token: string } {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (this.userAccounts.has(normalizedEmail)) {
      throw new Error(`An account with email "${data.email}" already exists.`);
    }

    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(data.password || crypto.randomBytes(16).toString('hex'), salt);

    const displayName = data.displayName || data.name.trim();
    let avatarType = data.avatarType;
    let avatarValue = data.avatarValue;
    const profileImageUrl = data.profileImageUrl || (data.avatarUrl && !data.avatarUrl.includes('images.unsplash.com') ? data.avatarUrl : undefined);

    if (!avatarType) {
      if (profileImageUrl) {
        avatarType = 'IMAGE';
        avatarValue = profileImageUrl;
      } else {
        avatarType = 'INITIALS';
        avatarValue = this.computeInitials(data.name);
      }
    }

    const user: User = {
      id: userId,
      email: data.email.trim(),
      name: data.name.trim(),
      displayName,
      profileImageUrl,
      avatarType,
      avatarValue,
      avatarUrl: profileImageUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const account: UserAccount = {
      id: userId,
      email: normalizedEmail,
      name: user.name,
      displayName,
      avatarUrl: user.avatarUrl,
      profileImageUrl: user.profileImageUrl,
      avatarType: user.avatarType,
      avatarValue: user.avatarValue,
      passwordHash,
      salt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    this.users.set(userId, user);
    this.userAccounts.set(normalizedEmail, account);

    const token = this.createSession(userId);
    this.scheduleSave();
    return { user, token };
  }

  updateUserProfile(
    userId: string,
    updates: {
      name?: string;
      fullName?: string;
      displayName?: string;
      profileImageUrl?: string;
      avatarType?: 'IMAGE' | 'EMOJI' | 'INITIALS' | 'DEFAULT';
      avatarValue?: string;
    }
  ): User | null {
    let user = this.users.get(userId);
    if (!user) {
      // Fallback: search user by email or in userAccounts
      for (const u of this.users.values()) {
        if (u.id === userId || u.email.toLowerCase() === userId.toLowerCase()) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      const account = this.userAccounts.get(userId.toLowerCase());
      if (account) {
        user = {
          id: account.id,
          email: account.email,
          name: account.name,
          displayName: account.displayName || account.name,
          avatarType: account.avatarType || 'INITIALS',
          avatarValue: account.avatarValue || this.computeInitials(account.name),
          avatarUrl: account.avatarUrl || '',
          profileImageUrl: account.profileImageUrl || '',
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        };
        this.users.set(user.id, user);
      }
    }

    if (!user) return null;

    const resolvedName = (updates.name || updates.fullName)?.trim();
    if (resolvedName !== undefined && resolvedName.length > 0) {
      user.name = resolvedName;
    }
    if (updates.displayName !== undefined) {
      user.displayName = updates.displayName.trim();
    }
    if (updates.avatarType !== undefined) {
      user.avatarType = updates.avatarType;
    }
    if (updates.avatarValue !== undefined && updates.avatarValue.trim() !== '') {
      user.avatarValue = updates.avatarValue.trim();
    } else if (user.avatarType === 'INITIALS') {
      user.avatarValue = this.computeInitials(user.name || user.displayName);
    }
    if (updates.profileImageUrl !== undefined) {
      user.profileImageUrl = updates.profileImageUrl;
      user.avatarUrl = updates.profileImageUrl;
    }
    this.users.set(user.id, user);
    if (user.id === 'usr_demo_founder' || user.id === 'usr_default_founder') {
      this.users.set('usr_demo_founder', { ...user, id: 'usr_demo_founder' });
      this.users.set('usr_default_founder', { ...user, id: 'usr_default_founder' });
    }

    // Also update account record
    const account = this.userAccounts.get(user.email.toLowerCase());
    if (account) {
      account.name = user.name;
      account.displayName = user.displayName;
      account.avatarType = user.avatarType;
      account.avatarValue = user.avatarValue;
      account.profileImageUrl = user.profileImageUrl;
      account.avatarUrl = user.avatarUrl;
      account.updatedAt = user.updatedAt;
      this.userAccounts.set(user.email.toLowerCase(), account);
    }

    // Synchronize workspace members belonging to this user
    for (const [memId, member] of this.members.entries()) {
      if (member.id === user.id || member.email.toLowerCase() === user.email.toLowerCase()) {
        member.name = user.name;
        member.avatarType = user.avatarType;
        member.avatarValue = user.avatarValue;
        member.avatarUrl = user.avatarUrl;
        this.members.set(memId, member);
      }
    }

    this.saveToDiskSync();
    return user;
  }

  authenticateUser(email: string, password?: string): { user: User; token: string } | null {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.userAccounts.get(normalizedEmail);
    if (!account) return null;

    if (password) {
      const candidateHash = this.hashPassword(password, account.salt);
      if (candidateHash !== account.passwordHash) {
        return null;
      }
    }

    const user = this.users.get(account.id);
    if (!user) return null;

    const token = this.createSession(user.id);
    return { user, token };
  }

  createSession(userId: string): string {
    const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
    const session: UserSession = {
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.sessions.set(token, session);
    this.scheduleSave();
    return token;
  }

  getSessionUser(token: string): User | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(token);
      this.scheduleSave();
      return null;
    }

    return this.getUser(session.userId) || null;
  }

  invalidateSession(token: string): boolean {
    const deleted = this.sessions.delete(token);
    if (deleted) this.scheduleSave();
    return deleted;
  }

  createPasswordResetToken(email: string): string | null {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.userAccounts.get(normalizedEmail);
    if (!account) return null;

    const resetToken = crypto.randomBytes(24).toString('hex');
    account.resetToken = resetToken;
    account.resetTokenExpires = Date.now() + 3600000; // 1 hour
    this.userAccounts.set(normalizedEmail, account);
    this.scheduleSave();
    return resetToken;
  }

  resetPasswordWithToken(token: string, newPass: string): boolean {
    for (const [email, account] of this.userAccounts.entries()) {
      if (account.resetToken === token && account.resetTokenExpires && account.resetTokenExpires > Date.now()) {
        const salt = crypto.randomBytes(16).toString('hex');
        account.passwordHash = this.hashPassword(newPass, salt);
        account.salt = salt;
        delete account.resetToken;
        delete account.resetTokenExpires;
        this.userAccounts.set(email, account);
        this.scheduleSave();
        return true;
      }
    }
    return false;
  }

  // Workspaces & Users
  getUser(id: string): User | undefined {
    if (!id) return undefined;
    let user = this.users.get(id);
    if (user) return user;

    for (const u of this.users.values()) {
      if (u.id === id || u.email.toLowerCase() === id.toLowerCase()) {
        return u;
      }
    }

    const account = this.userAccounts.get(id.toLowerCase()) || Array.from(this.userAccounts.values()).find(a => a.id === id);
    if (account) {
      user = {
        id: account.id,
        email: account.email,
        name: account.name,
        displayName: account.displayName || account.name,
        avatarType: account.avatarType || 'INITIALS',
        avatarValue: account.avatarValue || this.computeInitials(account.name),
        avatarUrl: account.avatarUrl || '',
        profileImageUrl: account.profileImageUrl || '',
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      };
      this.users.set(user.id, user);
      return user;
    }

    return undefined;
  }

  listUsers(): User[] {
    return Array.from(this.users.values());
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    this.scheduleSave();
    return user;
  }

  getWorkspace(id: string): Workspace | undefined {
    return this.workspaces.get(id);
  }

  getWorkspacesForUser(userId: string): Workspace[] {
    const user = this.getUser(userId);
    const userEmail = user?.email?.toLowerCase();
    const owned = Array.from(this.workspaces.values()).filter(w => w.ownerId === userId);
    const memberWsIds = Array.from(this.members.values())
      .filter(m => m.id === userId || (userEmail && m.email.toLowerCase() === userEmail))
      .map(m => m.workspaceId);

    const memberWorkspaces = Array.from(this.workspaces.values()).filter(w => memberWsIds.includes(w.id));
    const all = [...owned, ...memberWorkspaces];

    // Deduplicate
    const map = new Map<string, Workspace>();
    all.forEach(w => map.set(w.id, w));
    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  isUserAuthorizedForWorkspace(userId: string, workspaceId: string): boolean {
    if ((userId === 'usr_demo_founder' || userId === 'usr_default_founder') && (workspaceId === 'ws_demo_sandbox' || workspaceId === 'ws_default_prod')) {
      return true;
    }

    const ws = this.workspaces.get(workspaceId);
    if (!ws) return false;
    if (ws.ownerId === userId) return true;

    const user = this.getUser(userId);
    const userEmail = user?.email?.toLowerCase();
    const members = this.listMembers(workspaceId);
    return members.some(m => m.id === userId || (userEmail && m.email.toLowerCase() === userEmail));
  }

  createWorkspace(workspace: Workspace): Workspace {
    this.workspaces.set(workspace.id, workspace);
    this.recordAudit({
      workspaceId: workspace.id,
      eventType: 'workspace_created',
      summary: `Created workspace: ${workspace.name}`,
    });
    this.scheduleSave();
    return workspace;
  }

  updateWorkspace(workspace: Workspace): Workspace {
    this.workspaces.set(workspace.id, workspace);
    this.scheduleSave();
    return workspace;
  }

  // Research Jobs
  getResearchJob(id: string, workspaceId?: string): ResearchJob | undefined {
    const job = this.researchJobs.get(id);
    if (!job) return undefined;
    if (workspaceId && job.workspaceId !== workspaceId) {
      return undefined;
    }
    return job;
  }

  listResearchJobs(workspaceId: string): ResearchJob[] {
    return Array.from(this.researchJobs.values())
      .filter(j => j.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  saveResearchJob(job: ResearchJob): ResearchJob {
    this.researchJobs.set(job.id, job);
    this.scheduleSave();
    return job;
  }

  updateJobStatus(jobId: string, status: JobStatus, message?: string, progressPercent?: number): void {
    const job = this.researchJobs.get(jobId);
    if (job) {
      job.status = status;
      if (message !== undefined) job.currentStepMessage = message;
      if (progressPercent !== undefined) job.progressPercent = progressPercent;
      this.researchJobs.set(jobId, job);
      this.scheduleSave();
    }
  }

  deleteResearchJob(id: string, workspaceId: string): boolean {
    const job = this.researchJobs.get(id);
    if (!job || job.workspaceId !== workspaceId) return false;
    this.researchJobs.delete(id);
    // Cleanup cascade
    for (const [sId, s] of this.sources.entries()) {
      if (s.jobId === id) this.sources.delete(sId);
    }
    for (const [eId, e] of this.evidence.entries()) {
      if (e.researchJobId === id) this.evidence.delete(eId);
    }
    for (const [cId, c] of this.conflicts.entries()) {
      if (c.researchJobId === id) this.conflicts.delete(cId);
    }
    this.intelligence.delete(job.intelligenceId || '');
    this.campaignBriefs.delete(job.briefId || '');
    for (const [aId, a] of this.campaignAssets.entries()) {
      if (a.researchJobId === id) this.campaignAssets.delete(aId);
    }
    for (const [tId, t] of this.tasks.entries()) {
      if (t.researchJobId === id) this.tasks.delete(tId);
    }
    this.scheduleSave();
    return true;
  }

  // Sources
  saveSource(source: ResearchSource): ResearchSource {
    this.sources.set(source.id, source);
    this.scheduleSave();
    return source;
  }

  listSources(jobId: string): ResearchSource[] {
    return Array.from(this.sources.values()).filter(s => s.jobId === jobId);
  }

  getSource(id: string): ResearchSource | undefined {
    return this.sources.get(id);
  }

  // Evidence
  saveEvidence(evidence: Evidence): Evidence {
    this.evidence.set(evidence.id, evidence);
    this.scheduleSave();
    return evidence;
  }

  getEvidence(id: string): Evidence | undefined {
    return this.evidence.get(id);
  }

  listEvidence(jobId: string): Evidence[] {
    return Array.from(this.evidence.values()).filter(e => e.researchJobId === jobId);
  }

  listAllEvidenceForWorkspace(workspaceId: string): Evidence[] {
    return Array.from(this.evidence.values()).filter(e => e.workspaceId === workspaceId);
  }

  // Conflicts
  saveConflict(conflict: ConflictItem): ConflictItem {
    this.conflicts.set(conflict.id, conflict);
    this.scheduleSave();
    return conflict;
  }

  listConflicts(jobId: string): ConflictItem[] {
    return Array.from(this.conflicts.values()).filter(c => c.researchJobId === jobId);
  }

  updateConflict(conflict: ConflictItem): ConflictItem {
    this.conflicts.set(conflict.id, conflict);
    this.scheduleSave();
    return conflict;
  }

  // Intelligence
  saveIntelligence(report: IntelligenceReport): IntelligenceReport {
    this.intelligence.set(report.id, report);
    this.scheduleSave();
    return report;
  }

  getIntelligence(id: string): IntelligenceReport | undefined {
    return this.intelligence.get(id);
  }

  getIntelligenceByJobId(jobId: string): IntelligenceReport | undefined {
    return Array.from(this.intelligence.values()).find(i => i.researchJobId === jobId);
  }

  // Campaign Briefs
  saveCampaignBrief(brief: CampaignBrief): CampaignBrief {
    this.campaignBriefs.set(brief.id, brief);
    this.scheduleSave();
    return brief;
  }

  getCampaignBrief(id: string, workspaceId?: string): CampaignBrief | undefined {
    const brief = this.campaignBriefs.get(id);
    if (!brief) return undefined;
    if (workspaceId && brief.workspaceId !== workspaceId) return undefined;
    return brief;
  }

  getCampaignBriefByJobId(jobId: string, workspaceId?: string): CampaignBrief | undefined {
    const brief = Array.from(this.campaignBriefs.values()).find(b => b.researchJobId === jobId);
    if (!brief) return undefined;
    if (workspaceId && brief.workspaceId !== workspaceId) return undefined;
    return brief;
  }

  listCampaignBriefs(workspaceId?: string): CampaignBrief[] {
    return Array.from(this.campaignBriefs.values())
      .filter(b => {
        if (!workspaceId) return true;
        return b.workspaceId === workspaceId;
      })
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  updateCampaignBrief(brief: CampaignBrief): CampaignBrief {
    this.campaignBriefs.set(brief.id, brief);
    this.saveToDiskSync();
    return brief;
  }

  deleteCampaignBrief(id: string): boolean {
    const res = this.campaignBriefs.delete(id);
    if (res) this.saveToDiskSync();
    return res;
  }

  // Assets
  saveCampaignAsset(asset: CampaignAsset): CampaignAsset {
    this.campaignAssets.set(asset.id, asset);
    this.scheduleSave();
    return asset;
  }

  listCampaignAssets(jobId: string): CampaignAsset[] {
    return Array.from(this.campaignAssets.values()).filter(a => a.researchJobId === jobId);
  }

  getCampaignAsset(id: string): CampaignAsset | undefined {
    return this.campaignAssets.get(id);
  }

  // Tasks
  saveTask(task: ExecutionTask): ExecutionTask {
    this.tasks.set(task.id, task);
    this.scheduleSave();
    return task;
  }

  listTasks(workspaceId: string, jobId?: string): ExecutionTask[] {
    return Array.from(this.tasks.values())
      .filter(t => {
        if (jobId) return t.researchJobId === jobId && t.workspaceId === workspaceId;
        return t.workspaceId === workspaceId;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateTask(task: ExecutionTask): ExecutionTask {
    this.tasks.set(task.id, task);
    this.scheduleSave();
    return task;
  }

  getTask(id: string, workspaceId?: string): ExecutionTask | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    if (workspaceId && task.workspaceId !== workspaceId) return undefined;
    return task;
  }

  deleteTask(id: string): boolean {
    const res = this.tasks.delete(id);
    if (res) this.scheduleSave();
    return res;
  }

  // Audit Log
  recordAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const record: AuditEvent = {
      ...event,
      id: `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
    };
    this.auditEvents.unshift(record);
    if (this.auditEvents.length > 500) {
      this.auditEvents = this.auditEvents.slice(0, 500);
    }
    logger.audit(record.eventType, record.summary, record.details);
    this.scheduleSave();
    return record;
  }

  logAuditEvent(event: any): AuditEvent {
    return this.recordAudit({
      workspaceId: event.workspaceId,
      eventType: event.eventType || (event.action ? `war_room_${String(event.action).toLowerCase()}` : 'war_room_action'),
      summary: event.summary || event.details?.message || `War Room action: ${event.action || 'updated'}`,
      details: event.details || {},
    });
  }

  listAuditEvents(workspaceId: string, limit = 50): AuditEvent[] {
    return this.auditEvents.filter(e => e.workspaceId === workspaceId).slice(0, limit);
  }

  // Evaluations
  saveEvaluationRun(run: EvaluationRun): EvaluationRun {
    this.evaluationRuns.set(run.id, run);
    this.scheduleSave();
    return run;
  }

  listEvaluationRuns(): EvaluationRun[] {
    return Array.from(this.evaluationRuns.values()).sort(
      (a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime()
    );
  }

  // Workspace Members
  listMembers(workspaceId: string): WorkspaceMember[] {
    return Array.from(this.members.values()).filter(m => m.workspaceId === workspaceId);
  }

  getMember(id: string): WorkspaceMember | undefined {
    return this.members.get(id);
  }

  addMember(member: WorkspaceMember): WorkspaceMember {
    this.members.set(member.id, member);
    this.scheduleSave();
    return member;
  }

  // Research Share Links
  createShareLink(link: ResearchShareLink): ResearchShareLink {
    this.shareLinks.set(link.id, link);
    this.scheduleSave();
    return link;
  }

  getShareLink(id: string): ResearchShareLink | undefined {
    return this.shareLinks.get(id);
  }

  getShareLinkByToken(token: string): ResearchShareLink | undefined {
    return Array.from(this.shareLinks.values()).find(l => l.token === token && l.isActive);
  }

  listShareLinks(jobId: string): ResearchShareLink[] {
    return Array.from(this.shareLinks.values())
      .filter(l => l.researchJobId === jobId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  revokeShareLink(id: string): boolean {
    const link = this.shareLinks.get(id);
    if (!link) return false;
    link.isActive = false;
    this.shareLinks.set(id, link);
    this.scheduleSave();
    return true;
  }

  incrementShareLinkViews(id: string): void {
    const link = this.shareLinks.get(id);
    if (link) {
      link.viewsCount = (link.viewsCount || 0) + 1;
      link.lastViewedAt = new Date().toISOString();
      this.shareLinks.set(id, link);
      this.scheduleSave();
    }
  }

  // Research Review Assignments
  createReviewAssignment(assignment: ResearchReviewAssignment): ResearchReviewAssignment {
    this.reviewAssignments.set(assignment.id, assignment);
    this.scheduleSave();
    return assignment;
  }

  getReviewAssignment(id: string): ResearchReviewAssignment | undefined {
    return this.reviewAssignments.get(id);
  }

  listReviewAssignments(jobId?: string, workspaceId?: string): ResearchReviewAssignment[] {
    return Array.from(this.reviewAssignments.values())
      .filter(r => (!jobId || r.researchJobId === jobId) && (!workspaceId || r.workspaceId === workspaceId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateReviewAssignment(id: string, updates: Partial<ResearchReviewAssignment>): ResearchReviewAssignment | undefined {
    const existing = this.reviewAssignments.get(id);
    if (!existing) return undefined;
    const updated: ResearchReviewAssignment = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.reviewAssignments.set(id, updated);
    this.scheduleSave();
    return updated;
  }

  deleteReviewAssignment(id: string): boolean {
    const res = this.reviewAssignments.delete(id);
    if (res) this.scheduleSave();
    return res;
  }

  // Baseline
  getBaselineMetric(workspaceId: string): BaselineMetric {
    const existing = Array.from(this.baselineMetrics.values()).find(b => b.workspaceId === workspaceId);
    if (existing) return existing;
    const metric = { ...DEFAULT_BASELINE, id: `bm_${Date.now()}`, workspaceId };
    this.baselineMetrics.set(metric.id, metric);
    this.scheduleSave();
    return metric;
  }

  updateBaselineMetric(metric: BaselineMetric): BaselineMetric {
    this.baselineMetrics.set(metric.id, metric);
    this.scheduleSave();
    return metric;
  }

  // AI Orchestration Runs
  recordAIRun(run: AIRun): AIRun {
    this.aiRuns.unshift(run);
    if (this.aiRuns.length > 500) {
      this.aiRuns = this.aiRuns.slice(0, 500);
    }
    this.scheduleSave();
    return run;
  }

  listAIRuns(workspaceId?: string, limit = 50): AIRun[] {
    if (!workspaceId) return this.aiRuns.slice(0, limit);
    return this.aiRuns.filter(r => r.workspaceId === workspaceId).slice(0, limit);
  }

  // ----------------------------------------------------
  // Role & Membership Management
  // ----------------------------------------------------
  getWorkspaceRole(userId: string, workspaceId: string): string | null {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return null;
    if (ws.ownerId === userId) return 'OWNER';

    const user = this.getUser(userId);
    const members = this.listMembers(workspaceId);
    const member = members.find(m => m.id === userId || (user && m.email.toLowerCase() === user.email.toLowerCase()));
    return member ? member.role : null;
  }

  updateMemberRole(memberId: string, workspaceId: string, newRole: any, actorName: string): WorkspaceMember | undefined {
    const member = this.members.get(memberId);
    if (!member || member.workspaceId !== workspaceId) return undefined;
    const oldRole = member.role;
    member.role = newRole;
    this.members.set(memberId, member);

    this.recordAudit({
      workspaceId,
      eventType: 'workspace_created',
      summary: `Changed role for "${member.name}" from ${oldRole} to ${newRole} (by ${actorName})`,
      details: { memberId, oldRole, newRole, actor: actorName },
    });

    this.createNotification({
      workspaceId,
      title: 'Workspace Role Updated',
      message: `Your role has been updated to ${newRole}.`,
      type: 'MEMBER_ROLE_CHANGED',
      isRead: false,
    });

    this.scheduleSave();
    return member;
  }

  deleteMember(memberId: string, workspaceId: string): boolean {
    const member = this.members.get(memberId);
    if (!member || member.workspaceId !== workspaceId) return false;
    this.members.delete(memberId);
    this.scheduleSave();
    return true;
  }

  // ----------------------------------------------------
  // Saved Research Templates
  // ----------------------------------------------------
  listTemplates(workspaceId: string): SavedResearchTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getTemplate(id: string, workspaceId: string): SavedResearchTemplate | undefined {
    const t = this.templates.get(id);
    if (!t || t.workspaceId !== workspaceId) return undefined;
    return t;
  }

  saveTemplate(template: SavedResearchTemplate): SavedResearchTemplate {
    this.templates.set(template.id, template);
    this.scheduleSave();
    return template;
  }

  deleteTemplate(id: string, workspaceId: string): boolean {
    const t = this.templates.get(id);
    if (!t || t.workspaceId !== workspaceId) return false;
    const res = this.templates.delete(id);
    if (res) this.scheduleSave();
    return res;
  }

  // ----------------------------------------------------
  // Research Schedules (Recurring Competitor Radar)
  // ----------------------------------------------------
  listSchedules(workspaceId: string): ResearchSchedule[] {
    return Array.from(this.schedules.values())
      .filter(s => s.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getSchedule(id: string, workspaceId: string): ResearchSchedule | undefined {
    const s = this.schedules.get(id);
    if (!s || s.workspaceId !== workspaceId) return undefined;
    return s;
  }

  saveSchedule(schedule: ResearchSchedule): ResearchSchedule {
    this.schedules.set(schedule.id, schedule);
    this.scheduleSave();
    return schedule;
  }

  deleteSchedule(id: string, workspaceId: string): boolean {
    const s = this.schedules.get(id);
    if (!s || s.workspaceId !== workspaceId) return false;
    const res = this.schedules.delete(id);
    if (res) this.scheduleSave();
    return res;
  }

  // ----------------------------------------------------
  // Notifications Center
  // ----------------------------------------------------
  listNotifications(workspaceId: string, userId?: string): NotificationItem[] {
    return Array.from(this.notifications.values())
      .filter(n => n.workspaceId === workspaceId && (!n.userId || !userId || n.userId === userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const item: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(item.id, item);
    this.scheduleSave();
    return item;
  }

  markNotificationRead(id: string, workspaceId: string): boolean {
    const notif = this.notifications.get(id);
    if (!notif || notif.workspaceId !== workspaceId) return false;
    notif.isRead = true;
    this.notifications.set(id, notif);
    this.scheduleSave();
    return true;
  }

  markAllNotificationsRead(workspaceId: string, userId?: string): void {
    for (const [id, notif] of this.notifications.entries()) {
      if (notif.workspaceId === workspaceId && (!notif.userId || !userId || notif.userId === userId)) {
        notif.isRead = true;
        this.notifications.set(id, notif);
      }
    }
    this.scheduleSave();
  }

  // ----------------------------------------------------
  // Competitive Change Radar
  // ----------------------------------------------------
  listChangeRadar(workspaceId: string): CompetitiveChangeItem[] {
    return Array.from(this.changeItems.values())
      .filter(c => c.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  saveChangeItem(item: CompetitiveChangeItem): CompetitiveChangeItem {
    this.changeItems.set(item.id, item);
    this.scheduleSave();
    return item;
  }

  // ----------------------------------------------------
  // Source Health Tracker
  // ----------------------------------------------------
  listSourceHealth(workspaceId: string): SourceHealthRecord[] {
    const sources = Array.from(this.sources.values()).filter(s => s.workspaceId === workspaceId);
    const domainMap = new Map<string, SourceHealthRecord>();

    for (const s of sources) {
      let domain = s.url;
      try {
        domain = new URL(s.url).hostname;
      } catch {
        // Fallback domain
      }

      const existing = domainMap.get(domain) || {
        sourceUrl: s.url,
        domain,
        status: 'HEALTHY' as const,
        successRatePercent: 100,
        avgLatencyMs: 450,
        consecutiveFailures: 0,
        totalFetches: 0,
      };

      existing.totalFetches += 1;
      if (s.status === 'completed') {
        existing.lastSuccessfulFetch = s.retrievedAt;
        existing.consecutiveFailures = 0;
      } else if (s.status === 'failed') {
        existing.lastFailedFetch = s.retrievedAt;
        existing.consecutiveFailures += 1;
        existing.failureReason = s.failureReason || s.errorMessage;
      }

      if (existing.consecutiveFailures >= 3) {
        existing.status = 'UNAVAILABLE';
      } else if (existing.consecutiveFailures > 0) {
        existing.status = 'DEGRADED';
      } else {
        existing.status = 'HEALTHY';
      }

      domainMap.set(domain, existing);
    }

    return Array.from(domainMap.values());
  }

  // ----------------------------------------------------
  // Central Review Queue & Approval Memory
  // ----------------------------------------------------
  getReviewQueue(workspaceId: string) {
    const jobs = this.listResearchJobs(workspaceId);
    const unapprovedBriefs = Array.from(this.campaignBriefs.values()).filter(
      b => b.workspaceId === workspaceId && b.status !== 'APPROVED'
    );
    const unverifiedConflicts = Array.from(this.conflicts.values()).filter(
      c => c.workspaceId === workspaceId && c.status === 'UNRESOLVED'
    );
    const lowConfidenceEvidence = Array.from(this.evidence.values()).filter(
      e => e.workspaceId === workspaceId && e.confidence === 'LOW' && e.reviewStatus !== 'APPROVED'
    );
    const reviewAssignments = this.listReviewAssignments(undefined, workspaceId).filter(
      r => r.status === 'PENDING' || r.status === 'IN_REVIEW'
    );

    return {
      unapprovedBriefs,
      unverifiedConflicts,
      lowConfidenceEvidence,
      reviewAssignments,
      totalPendingReviews:
        unapprovedBriefs.length +
        unverifiedConflicts.length +
        lowConfidenceEvidence.length +
        reviewAssignments.length,
    };
  }

  recordApprovalDecision(decision: ApprovalDecisionRecord): ApprovalDecisionRecord {
    this.approvalDecisions.set(decision.id, decision);
    this.scheduleSave();
    return decision;
  }

  listApprovalDecisions(workspaceId: string): ApprovalDecisionRecord[] {
    return Array.from(this.approvalDecisions.values())
      .filter(d => d.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime());
  }

  // ----------------------------------------------------
  // Research Job Lifecycle & Duplication / Comparison
  // ----------------------------------------------------
  duplicateResearchJob(id: string, workspaceId: string, createdBy?: string): ResearchJob | undefined {
    const original = this.getResearchJob(id, workspaceId);
    if (!original) return undefined;

    const newJobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const cloned: ResearchJob = {
      id: newJobId,
      workspaceId,
      businessName: `${original.businessName} (Copy)`,
      businessDescription: original.businessDescription,
      campaignObjective: original.campaignObjective,
      targetAudience: original.targetAudience,
      competitorUrls: [...original.competitorUrls],
      additionalUrls: [...(original.additionalUrls || [])],
      status: 'draft',
      progressPercent: 0,
      sourcesCount: original.competitorUrls.length + (original.additionalUrls?.length || 0),
      evidenceCount: 0,
      conflictsCount: 0,
      createdAt: new Date().toISOString(),
      parentJobId: original.id,
      createdBy,
    };

    this.researchJobs.set(newJobId, cloned);
    this.recordAudit({
      workspaceId,
      researchJobId: newJobId,
      eventType: 'research_created',
      summary: `Duplicated research job "${original.businessName}" -> "${cloned.businessName}"`,
    });

    this.scheduleSave();
    return cloned;
  }

  archiveResearchJob(id: string, workspaceId: string, isArchived = true): ResearchJob | undefined {
    const job = this.getResearchJob(id, workspaceId);
    if (!job) return undefined;
    job.isArchived = isArchived;
    job.status = isArchived ? 'archived' : 'draft';
    this.researchJobs.set(id, job);
    this.scheduleSave();
    return job;
  }

  calculateResearchHealth(jobId: string, workspaceId: string): ResearchHealthSummary {
    const job = this.getResearchJob(jobId, workspaceId);
    const sources = this.listSources(jobId);
    const evidence = this.listEvidence(jobId);
    const conflicts = this.listConflicts(jobId);

    const factors: ResearchHealthSummary['factors'] = [];
    let score = 100;

    if (!job) {
      return {
        score: 0,
        status: 'CRITICAL',
        factors: [{ label: 'Job Missing', impact: 'NEGATIVE', description: 'Job not found in workspace', weight: -100 }],
        calculatedAt: new Date().toISOString(),
      };
    }

    // Factor 1: Source Coverage
    const completedSources = sources.filter(s => s.status === 'completed').length;
    const totalSources = sources.length || 1;
    const sourceSuccessRate = Math.round((completedSources / totalSources) * 100);

    if (sourceSuccessRate >= 80) {
      factors.push({
        label: 'Source Ingestion Coverage',
        impact: 'POSITIVE',
        description: `${completedSources}/${totalSources} sources retrieved and parsed successfully.`,
        weight: 0,
      });
    } else if (sourceSuccessRate >= 50) {
      score -= 15;
      factors.push({
        label: 'Partial Source Failures',
        impact: 'NEUTRAL',
        description: `Some sources failed to fetch (${completedSources}/${totalSources} succeeded).`,
        weight: -15,
      });
    } else {
      score -= 30;
      factors.push({
        label: 'High Source Drop Rate',
        impact: 'NEGATIVE',
        description: `Most sources could not be reached or parsed (${completedSources}/${totalSources}).`,
        weight: -30,
      });
    }

    // Factor 2: Evidence Count & Diversity
    const categories = new Set(evidence.map(e => e.category));
    if (evidence.length >= 8 && categories.size >= 4) {
      factors.push({
        label: 'Rich Evidence Spectrum',
        impact: 'POSITIVE',
        description: `${evidence.length} evidence claims across ${categories.size} market categories.`,
        weight: 0,
      });
    } else if (evidence.length >= 3) {
      score -= 10;
      factors.push({
        label: 'Moderate Evidence Depth',
        impact: 'NEUTRAL',
        description: `${evidence.length} claims gathered. Expanding URLs will improve coverage.`,
        weight: -10,
      });
    } else {
      score -= 25;
      factors.push({
        label: 'Sparse Evidence',
        impact: 'NEGATIVE',
        description: `Only ${evidence.length} evidence claims extracted. Findings may have blind spots.`,
        weight: -25,
      });
    }

    // Factor 3: Conflict Status
    const unresolvedConflicts = conflicts.filter(c => c.status === 'UNRESOLVED');
    if (unresolvedConflicts.length > 0) {
      const penalty = Math.min(25, unresolvedConflicts.length * 8);
      score -= penalty;
      factors.push({
        label: 'Unresolved Market Conflicts',
        impact: 'NEGATIVE',
        description: `${unresolvedConflicts.length} conflicting claims detected (e.g., pricing, feature discrepancies).`,
        weight: -penalty,
      });
    } else if (conflicts.length > 0) {
      factors.push({
        label: 'Conflicts Reconciled',
        impact: 'POSITIVE',
        description: `All ${conflicts.length} market conflicts verified or resolved by team.`,
        weight: 0,
      });
    }

    score = Math.max(10, Math.min(100, score));
    let status: ResearchHealthSummary['status'] = 'OPTIMAL';
    if (score < 50) status = 'CRITICAL';
    else if (score < 75) status = 'ATTENTION_NEEDED';
    else if (score < 90) status = 'GOOD';

    return {
      score,
      status,
      factors,
      calculatedAt: new Date().toISOString(),
    };
  }

  compareResearchRuns(jobIdA: string, jobIdB: string, workspaceId: string) {
    const jobA = this.getResearchJob(jobIdA, workspaceId);
    const jobB = this.getResearchJob(jobIdB, workspaceId);
    if (!jobA || !jobB) {
      throw new Error('One or both research jobs not found in this workspace.');
    }

    const evidenceA = this.listEvidence(jobIdA);
    const evidenceB = this.listEvidence(jobIdB);
    const intelligenceA = this.getIntelligenceByJobId(jobIdA);
    const intelligenceB = this.getIntelligenceByJobId(jobIdB);

    const claimsA = new Set(evidenceA.map(e => e.claim.toLowerCase().trim()));
    const claimsB = new Set(evidenceB.map(e => e.claim.toLowerCase().trim()));

    const newEvidenceInB = evidenceB.filter(e => !claimsA.has(e.claim.toLowerCase().trim()));
    const removedEvidenceFromA = evidenceA.filter(e => !claimsB.has(e.claim.toLowerCase().trim()));

    return {
      jobA: { id: jobA.id, businessName: jobA.businessName, createdAt: jobA.createdAt, evidenceCount: evidenceA.length },
      jobB: { id: jobB.id, businessName: jobB.businessName, createdAt: jobB.createdAt, evidenceCount: evidenceB.length },
      newEvidenceCount: newEvidenceInB.length,
      removedEvidenceCount: removedEvidenceFromA.length,
      newEvidence: newEvidenceInB,
      removedEvidence: removedEvidenceFromA,
      intelligenceDiff: {
        landscapeA: intelligenceA?.competitiveLandscape || '',
        landscapeB: intelligenceB?.competitiveLandscape || '',
        newOpportunitiesInB: (intelligenceB?.marketOpportunities || []).filter(
          op => !(intelligenceA?.marketOpportunities || []).some(o => o.title === op.title)
        ),
      },
    };
  }

  // ----------------------------------------------------
  // Usage Metrics & Metering
  // ----------------------------------------------------
  getWorkspaceUsage(workspaceId: string): UsageMetrics {
    const jobs = this.listResearchJobs(workspaceId);
    const sources = Array.from(this.sources.values()).filter(s => s.workspaceId === workspaceId);
    const evidence = this.listAllEvidenceForWorkspace(workspaceId);
    const briefs = Array.from(this.campaignBriefs.values()).filter(b => b.workspaceId === workspaceId);
    const aiRuns = this.listAIRuns(workspaceId, 1000);
    const members = this.listMembers(workspaceId);

    return {
      workspaceId,
      planTier: 'PRO',
      jobsUsed: jobs.length,
      jobsLimit: 50,
      sourcesUsed: sources.length,
      sourcesLimit: 300,
      aiRunsUsed: aiRuns.length,
      aiRunsLimit: 1000,
      evidenceCreated: evidence.length,
      campaignsGenerated: briefs.length,
      activeMembersCount: members.length,
      membersLimit: 10,
    };
  }

  // ----------------------------------------------------
  // Market War Room — Strategic Intelligence Operations
  // ----------------------------------------------------

  public seedWarRoomDataIfEmpty(): void {
    if (this.marketModels.has(`mm_${DEMO_WORKSPACE_ID}`) && this.warRoomCompetitors.size > 0) {
      return;
    }

    const now = new Date().toISOString();
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString();
    const fiveDaysAgo = new Date(Date.now() - 86400000 * 5).toISOString();
    const nineDaysAgo = new Date(Date.now() - 86400000 * 9).toISOString();

    const targetWorkspaces = [DEMO_WORKSPACE_ID, 'ws_default_prod'];

    for (const wsId of targetWorkspaces) {
      const modelId = `mm_${wsId}`;
      const demoModel: MarketModel = {
        id: modelId,
        workspaceId: wsId,
        marketCategory: 'B2C Career Tech & AI Resume Optimization',
        targetCustomers: 'University seniors, early-career software engineers, and mid-career pivoters targeting top tech roles',
        strategicGoal: 'Transition from superficial AI text generation into verifiable ATS parse diagnostics and guaranteed interview conversion',
        knownCompetitors: ['Jobscan', 'Teal', 'Kickresume', 'Rezi'],
        keyDifferentiators: ['Verifiable ATS parse proofs', 'Grounded engineering bullet formulator', 'Deterministic keyword audit', 'Transparent match diagnostics'],
        status: 'ACTIVE',
        createdAt: new Date('2026-08-20T10:10:00Z').toISOString(),
        updatedAt: now,
      };
      this.marketModels.set(modelId, demoModel);

      // Competitors
      const compJobscan: WarRoomCompetitor = {
        id: `comp_jobscan_${wsId}`,
        workspaceId: wsId,
        name: 'Jobscan',
        website: 'https://www.jobscan.co',
        tier: 'TIER_1',
        category: 'DIRECT',
        status: 'CONFIRMED',
        sourceConfidence: 96,
        evidenceIds: ['ev_job_demo_resume_ai_1'],
        strengths: ['High brand recall in ATS optimization', 'Extensive recruiter keyword corpus', 'Direct ATS partnership credibility'],
        weaknesses: ['Cluttered, dated UI experience', 'Rigid keyword-matching without semantic context', 'Aggressive $89.85 quarterly upfront billing lock-in'],
        pricingModel: '$49.95/month or $89.85/quarter upfront',
        positioningSummary: 'Optimize your resume for applicant tracking systems with keyword matching',
        lastCrawledAt: twoDaysAgo,
        createdAt: now,
        updatedAt: now,
      };

      const compTeal: WarRoomCompetitor = {
        id: `comp_teal_${wsId}`,
        workspaceId: wsId,
        name: 'Teal',
        website: 'https://www.tealhq.com',
        tier: 'TIER_1',
        category: 'DIRECT',
        status: 'CONFIRMED',
        sourceConfidence: 94,
        evidenceIds: ['ev_job_demo_resume_ai_2'],
        strengths: ['Modern, polished SaaS workflow', 'Widely adopted Chrome Extension tracker', 'Comprehensive job search dashboard'],
        weaknesses: ['Generic AI text suggestions prone to hallucinations', 'Lacks actual ATS parse proofing', 'Premium features gated at $29/mo'],
        pricingModel: '$9/week or $29/month',
        positioningSummary: 'All-in-one career growth and job application management platform',
        lastCrawledAt: fiveDaysAgo,
        createdAt: now,
        updatedAt: now,
      };

      const compKickresume: WarRoomCompetitor = {
        id: `comp_kickresume_${wsId}`,
        workspaceId: wsId,
        name: 'Kickresume',
        website: 'https://www.kickresume.com',
        tier: 'TIER_2',
        category: 'DIRECT',
        status: 'CONFIRMED',
        sourceConfidence: 90,
        evidenceIds: ['ev_job_demo_resume_ai_1'],
        strengths: ['Visually compelling design templates', 'Multi-format PDF export options', 'Cover letter and bio generators'],
        weaknesses: ['Complex graphic templates break Workday/Greenhouse parsers', 'Paywalled downloads cause customer backlash', 'Slow mobile experience'],
        pricingModel: '$19/month (annual) or $29/month',
        positioningSummary: 'Create a beautiful, standout resume in minutes',
        lastCrawledAt: nineDaysAgo,
        createdAt: now,
        updatedAt: now,
      };

      const compRezi: WarRoomCompetitor = {
        id: `comp_rezi_${wsId}`,
        workspaceId: wsId,
        name: 'Rezi',
        website: 'https://www.rezi.ai',
        tier: 'TIER_2',
        category: 'DIRECT',
        status: 'CONFIRMED',
        sourceConfidence: 88,
        evidenceIds: ['ev_job_demo_resume_ai_3'],
        strengths: ['Strict ATS-compliant markdown layout', 'Clear formatting structure', 'Lifetime deal customer loyalty'],
        weaknesses: ['Minimalist design customization', 'Lacks integration with live job postings', 'Infrequent product feature updates'],
        pricingModel: '$29/month or $129 lifetime access',
        positioningSummary: 'The smartest ATS-compliant AI resume builder',
        lastCrawledAt: nineDaysAgo,
        createdAt: now,
        updatedAt: now,
      };

      [compJobscan, compTeal, compKickresume, compRezi].forEach(c => this.warRoomCompetitors.set(c.id, c));

      // Competitor Moves
      const move1: CompetitorMove = {
        id: `move_jobscan_${wsId}_1`,
        workspaceId: wsId,
        competitorId: compJobscan.id,
        competitorName: 'Jobscan',
        moveType: 'PRICING',
        significance: 'HIGH',
        title: 'Jobscan shifted entry tier to mandatory quarterly billing ($89.85 upfront)',
        description: 'Removed month-to-month flexibility for new sign-ups, requiring $89.85 quarterly commitment upfront.',
        whyThisMatters: {
          strategicImplication: 'Forces budget-conscious job seekers to commit 3 months upfront, triggering immediate social backlash and elevated checkout drop-off.',
          competitorIntent: 'Maximize CAC payback upfront given median job search duration is 60–90 days.',
          likelyNextMoves: ['Introduce discounted student annual plan', 'Aggressive abandoned-cart discount retargeting'],
          ourVulnerability: 'Low vulnerability; presents immediate acquisition window for ResearchFlow with transparent monthly or pay-per-search pricing.',
          recommendedResponse: 'Launch GTM acquisition campaign targeting Jobscan switchers with zero-lockin pricing.',
        },
        sourceUrl: 'https://www.kickresume.com/en/help-center/pricing/',
        evidenceSnippet: 'New user onboarding requires minimum $89.85 quarterly subscription.',
        detectedAt: twoDaysAgo,
      };

      const move2: CompetitorMove = {
        id: `move_teal_${wsId}_1`,
        workspaceId: wsId,
        competitorId: compTeal.id,
        competitorName: 'Teal',
        moveType: 'FEATURE',
        significance: 'MEDIUM',
        title: 'Teal launched Chrome Extension v4 with automatic job form filling',
        description: 'Updated browser extension to autofill application forms directly on Greenhouse and Lever postings.',
        whyThisMatters: {
          strategicImplication: 'Captures daily active usage within candidate browser workflows rather than requiring them to visit the standalone web app.',
          competitorIntent: 'Lock in candidate workflow on job boards to preempt competitors before resume drafting.',
          likelyNextMoves: ['Integrate automated follow-up email drafts', 'Direct application API integrations with ATS providers'],
          ourVulnerability: 'Users spending less time in standalone resume builders.',
          recommendedResponse: 'Deliver a lightweight Chrome extension focusing exclusively on real-time ATS parse diagnostics.',
        },
        sourceUrl: 'https://news.ycombinator.com/item?id=38874139',
        evidenceSnippet: 'Teal Chrome extension now autofills application questions across major ATS portals.',
        detectedAt: fiveDaysAgo,
      };

      const move3: CompetitorMove = {
        id: `move_kickresume_${wsId}_1`,
        workspaceId: wsId,
        competitorId: compKickresume.id,
        competitorName: 'Kickresume',
        moveType: 'MESSAGING',
        significance: 'LOW',
        title: 'Kickresume repositioned homepage hero from "AI Resume Builder" to "Your Career Superpower"',
        description: 'Removed specific AI tooling badges in favor of broad career development messaging.',
        whyThisMatters: {
          strategicImplication: 'Attempts to distance brand from commodity AI copycats, but reduces clarity on core technical capabilities.',
          competitorIntent: 'Target broader non-technical career changers with lifestyle-oriented marketing.',
          likelyNextMoves: ['Introduce video interview coaching modules', 'Expand executive coaching marketplace'],
          ourVulnerability: 'Minimal vulnerability for technical candidate segment.',
          recommendedResponse: 'Maintain rigorous, quantitative positioning focused on verifiable engineering impact.',
        },
        sourceUrl: 'https://novoresume.com/career-blog/resume-statistics',
        evidenceSnippet: 'Homepage hero copy updated to broad career superpower tagline.',
        detectedAt: nineDaysAgo,
      };

      [move1, move2, move3].forEach(m => this.competitorMoves.set(m.id, m));

      // Product Gaps
      const gap1: ProductGap = {
        id: `gap_${wsId}_1`,
        workspaceId: wsId,
        featureName: 'Live ATS Parse Diagnostic & Score Simulation',
        category: 'ATS Compatibility',
        classification: 'DIFFERENTIATOR',
        ourStatus: 'HAVE',
        competitorCoverage: [
          { competitorId: compJobscan.id, competitorName: 'Jobscan', hasCapability: true, details: 'Basic keyword match without structural parser analysis' },
          { competitorId: compTeal.id, competitorName: 'Teal', hasCapability: false, details: 'Checklist only, no parser simulation' },
          { competitorId: compKickresume.id, competitorName: 'Kickresume', hasCapability: false, details: 'Graphic layout parser fails Workday extraction' },
        ],
        customerDemandScore: 9,
        competitiveUrgencyScore: 9,
        differentiationScore: 9,
        strategicImpactScore: 9,
        complexityScore: 4,
        riskScore: 3,
        evidenceStrengthScore: 9,
        buildPriorityScore: Math.round((9 * 9 * 9 * 9 * 9) / (4 + 3)),
        recommendationAction: 'BUILD',
        whyNotBuild: 'Requires maintaining continuous parser regression tests against Workday, Greenhouse, and Lever format shifts.',
        doNothingScenario: 'Competitors like Jobscan maintain perceived monopoly on ATS parsing despite outdated technology.',
        evidenceIds: ['ev_job_demo_resume_ai_3'],
        createdAt: now,
      };

      const gap2: ProductGap = {
        id: `gap_${wsId}_2`,
        workspaceId: wsId,
        featureName: 'Chrome Extension 1-Click Job Matcher',
        category: 'Workflow Automation',
        classification: 'COMPETITIVE_PARITY',
        ourStatus: 'PARTIAL',
        competitorCoverage: [
          { competitorId: compTeal.id, competitorName: 'Teal', hasCapability: true, details: 'Full application autofill and job tracker' },
          { competitorId: compJobscan.id, competitorName: 'Jobscan', hasCapability: true, details: 'Job description scraper overlay' },
        ],
        customerDemandScore: 8,
        competitiveUrgencyScore: 8,
        differentiationScore: 5,
        strategicImpactScore: 7,
        complexityScore: 5,
        riskScore: 2,
        evidenceStrengthScore: 8,
        buildPriorityScore: Math.round((8 * 8 * 5 * 7 * 8) / (5 + 2)),
        recommendationAction: 'BUILD',
        whyNotBuild: 'Browser extension maintenance overhead and Chrome Web Store review cycle dependencies.',
        doNothingScenario: 'Candidates complete application flow in Teal without ever visiting our web application.',
        evidenceIds: ['ev_job_demo_resume_ai_2'],
        createdAt: now,
      };

      const gap3: ProductGap = {
        id: `gap_${wsId}_3`,
        workspaceId: wsId,
        featureName: 'Canva-Style Visual Template Designer',
        category: 'Visual Design',
        classification: 'COMMODITIZED',
        ourStatus: 'LACK',
        competitorCoverage: [
          { competitorId: compKickresume.id, competitorName: 'Kickresume', hasCapability: true, details: 'Multi-column graphic templates with custom icons' },
        ],
        customerDemandScore: 4,
        competitiveUrgencyScore: 2,
        differentiationScore: 2,
        strategicImpactScore: 3,
        complexityScore: 8,
        riskScore: 6,
        evidenceStrengthScore: 7,
        buildPriorityScore: Math.round((4 * 2 * 2 * 3 * 7) / (8 + 6)),
        recommendationAction: 'IGNORE',
        whyNotBuild: 'Complex visual columns break standard ATS parsing engines, directly harming user interview conversion rates and diluting our core product promise.',
        doNothingScenario: 'Candidates seeking purely decorative non-technical resumes use Kickresume or Canva; technical candidates continue using our high-parsing markdown format.',
        evidenceIds: ['ev_job_demo_resume_ai_3'],
        createdAt: now,
      };

      const gap4: ProductGap = {
        id: `gap_${wsId}_4`,
        workspaceId: wsId,
        featureName: 'Verified Engineering Metric Formulator',
        category: 'Content Generation',
        classification: 'DIFFERENTIATOR',
        ourStatus: 'HAVE',
        competitorCoverage: [
          { competitorId: compTeal.id, competitorName: 'Teal', hasCapability: false, details: 'Generic ChatGPT prompts producing generic buzzwords' },
          { competitorId: compRezi.id, competitorName: 'Rezi', hasCapability: false, details: 'Template phrases without quantified impact formula' },
        ],
        customerDemandScore: 9,
        competitiveUrgencyScore: 8,
        differentiationScore: 9,
        strategicImpactScore: 8,
        complexityScore: 3,
        riskScore: 2,
        evidenceStrengthScore: 9,
        buildPriorityScore: Math.round((9 * 8 * 9 * 8 * 9) / (3 + 2)),
        recommendationAction: 'BUILD',
        whyNotBuild: 'Users must provide actual project context or repository links; cannot be completely zero-input.',
        doNothingScenario: 'Users generate generic AI buzzwords that 82% of technical recruiters actively reject.',
        evidenceIds: ['ev_job_demo_resume_ai_3'],
        createdAt: now,
      };

      [gap1, gap2, gap3, gap4].forEach(g => this.productGaps.set(g.id, g));

      // Customer Demand Signals
      const sig1: CustomerDemandSignal = {
        id: `sig_${wsId}_1`,
        workspaceId: wsId,
        clusterTitle: 'Backlash against hidden paywalls after lengthy onboarding',
        painPoint: 'Users spend 45-60 minutes inputting career history before being hit with an unexpected $29 paywall at download.',
        customerRole: 'University Graduate / Junior Job Seeker',
        frequencyCount: 42,
        urgency: 'HIGH',
        rawQuotes: [
          { quote: 'Spent an hour making my resume on Kickresume only to find out download is $29.', source: 'Reddit r/jobs', date: '2026-08-25' },
          { quote: 'Jobscan free tier only allows 2 scans before blocking you with a credit card popup.', source: 'Hacker News', date: '2026-08-28' },
        ],
        competitorWeaknessRef: compKickresume.id,
        createdAt: now,
      };

      const sig2: CustomerDemandSignal = {
        id: `sig_${wsId}_2`,
        workspaceId: wsId,
        clusterTitle: 'Anxiety over ATS rejection despite keyword stuffing',
        painPoint: 'Candidates fear their resumes fail automated parsing filters even after stuffing buzzwords.',
        customerRole: 'Early-career Software Engineer',
        frequencyCount: 38,
        urgency: 'HIGH',
        rawQuotes: [
          { quote: 'Jobscan told me to repeat AWS 8 times. The recruiter told me it looked spammy and unnatural.', source: 'Blind', date: '2026-08-26' },
          { quote: 'I need to know if Workday can actually parse my tables and columns.', source: 'Reddit r/cscareerquestions', date: '2026-08-27' },
        ],
        competitorWeaknessRef: compJobscan.id,
        createdAt: now,
      };

      const sig3: CustomerDemandSignal = {
        id: `sig_${wsId}_3`,
        workspaceId: wsId,
        clusterTitle: 'Struggle formulating quantified impact metrics',
        painPoint: 'Junior developers cannot quantify achievements because they worked on bug fixes or maintenance.',
        customerRole: 'Junior Software Engineer',
        frequencyCount: 29,
        urgency: 'MEDIUM',
        rawQuotes: [
          { quote: 'Every AI resume tool asks for metrics like 40% growth. I was an intern fixing Jira tickets, I do not have revenue stats.', source: 'Discord Tech Careers', date: '2026-08-24' },
        ],
        competitorWeaknessRef: compTeal.id,
        createdAt: now,
      };

      [sig1, sig2, sig3].forEach(s => this.demandSignals.set(s.id, s));

      // Opportunities
      const opp1: MarketOpportunity = {
        id: `opp_${wsId}_1`,
        workspaceId: wsId,
        title: 'Zero-Lockin Transparent Pricing Campaign',
        category: 'PRICING_MISALIGNMENT',
        description: 'Exploit Jobscan mandatory $89.85 quarterly upfront pricing shift by launching month-to-month and pay-per-scan options.',
        evidenceIds: ['ev_job_demo_resume_ai_1', 'ev_job_demo_resume_ai_2'],
        expectedImpact: 'High customer acquisition among price-sensitive graduating seniors',
        difficulty: 'LOW',
        confidenceScore: 94,
        createdAt: now,
      };

      const opp2: MarketOpportunity = {
        id: `opp_${wsId}_2`,
        workspaceId: wsId,
        title: 'Verified ATS Parse Diagnostic Engine',
        category: 'WHITESPACE',
        description: 'Provide verifiable side-by-side ATS parser extraction diagnostics across Workday and Greenhouse engines rather than generic keyword scores.',
        evidenceIds: ['ev_job_demo_resume_ai_3'],
        expectedImpact: 'Defensible product moat against generic GPT wrappers',
        difficulty: 'MEDIUM',
        confidenceScore: 91,
        createdAt: now,
      };

      [opp1, opp2].forEach(o => this.marketOpportunities.set(o.id, o));

      // Threats
      const threat1: MarketThreat = {
        id: `threat_${wsId}_1`,
        workspaceId: wsId,
        title: 'Teal browser extension expanding into real-time job application lock-in',
        competitorId: compTeal.id,
        competitorName: 'Teal',
        threatLevel: 'HIGH',
        description: 'Teal is capturing candidate workflow at the moment of job board application, reducing standalone web traffic.',
        leadingIndicators: ['Teal hiring browser extension engineers', 'Integration of direct autofill across Lever and Greenhouse'],
        defensiveCountermeasure: 'Deploy lightweight browser diagnostic tool that checks resume match without leaving LinkedIn/Indeed.',
        createdAt: now,
      };

      const threat2: MarketThreat = {
        id: `threat_${wsId}_2`,
        workspaceId: wsId,
        title: 'Jobscan potential LLM modernization overhaul',
        competitorId: compJobscan.id,
        competitorName: 'Jobscan',
        threatLevel: 'MEDIUM',
        description: 'Jobscan may replace legacy keyword matcher with semantic embedding scoring in upcoming release.',
        leadingIndicators: ['Jobscan posting for AI Research Engineer', 'Beta user testing of contextual match feedback'],
        defensiveCountermeasure: 'Benchmark our parser accuracy publicly and emphasize grounded evidence vs ungrounded LLM completions.',
        createdAt: now,
      };

      [threat1, threat2].forEach(t => this.marketThreats.set(t.id, t));

      // Recommendations
      const rec1: WarRoomRecommendation = {
        id: `rec_${wsId}_1`,
        workspaceId: wsId,
        title: 'Launch GTM Acquisition Campaign against Jobscan Quarterly Lock-in',
        type: 'RECOMMENDATION',
        actionType: 'GTM_CAMPAIGN',
        priority: 'P1',
        rationale: 'Jobscan pricing change generated 42 verified negative customer signals across social channels. Providing an open monthly alternative offers immediate conversion upside.',
        whatIfWeDoNothing: 'Competitor normalizes high quarterly pricing, while our flexible pricing remains undiscovered.',
        whyThisCouldFail: 'Jobscan may revert to monthly billing if sign-up drop-off exceeds CAC recovery projections.',
        metricToEvaluate: '30% increase in qualified organic signups within 30 days',
        confidence: 93,
        status: 'PROPOSED',
        evidenceIds: ['ev_job_demo_resume_ai_1'],
        createdAt: now,
      };

      const rec2: WarRoomRecommendation = {
        id: `rec_${wsId}_2`,
        workspaceId: wsId,
        title: 'Develop 1-Click Browser ATS Validator to Counter Teal Expansion',
        type: 'INFERENCE',
        actionType: 'PRODUCT_FEATURE',
        priority: 'P2',
        rationale: 'Candidate attention is consolidating in-browser on LinkedIn and Indeed. Bringing our parse diagnostic directly into their workflow defends against Teal acquisition.',
        whatIfWeDoNothing: 'Teal captures the upstream candidate funnel before candidates ever seek external resume optimization.',
        whyThisCouldFail: 'Browser extension maintenance overhead across frequent ATS DOM changes.',
        metricToEvaluate: 'Daily active extension users and 20% lift in multi-job optimizations',
        confidence: 87,
        status: 'PROPOSED',
        evidenceIds: ['ev_job_demo_resume_ai_2'],
        createdAt: now,
      };

      const rec3: WarRoomRecommendation = {
        id: `rec_${wsId}_3`,
        workspaceId: wsId,
        title: 'Ship Grounded Impact Metric Formulator for Junior Engineers',
        type: 'FACT',
        actionType: 'PRODUCT_FEATURE',
        priority: 'P1',
        rationale: 'Verified fact: 82% of technical recruiters discard ungrounded buzzwords, while 29 customer signals cite inability to formulate quantitative bullet points.',
        whatIfWeDoNothing: 'Candidates continue generating hollow GPT claims that get rejected by hiring managers.',
        whyThisCouldFail: 'Requires lightweight guided prompts from users to extract real codebase activities.',
        metricToEvaluate: 'Recruiter response rate reported by candidates in post-application surveys',
        confidence: 95,
        status: 'PROPOSED',
        evidenceIds: ['ev_job_demo_resume_ai_3'],
        createdAt: now,
      };

      [rec1, rec2, rec3].forEach(r => this.warRoomRecommendations.set(r.id, r));

      // Scorecard
      const scorecard: CompanyScorecard = {
        id: `sc_${wsId}`,
        workspaceId: wsId,
        strengths: ['Verifiable ATS parse proofing vs generic keyword scoring', 'Grounded evidence-backed bullet generation without hallucinations', 'Transparent pricing model with zero forced lock-in'],
        weaknesses: ['Absence of in-browser job board extension workflow', 'Lower top-of-funnel brand search volume compared to Jobscan'],
        defensibilityRating: 'STRONG',
        moatScore: 86,
        competitiveAdvantages: ['Proprietary parser regression testing', 'High interview callback rate'],
        criticalVulnerabilities: ['Teal browser capture of job seekers'],
        evidenceGroundingCount: 38,
        calculatedAt: now,
      };
      this.companyScorecards.set(wsId, scorecard);

      // Executive Brief
      const brief: ExecutiveBrief = {
        workspaceId: wsId,
        statusSummary: 'Market positioning is solid, but competitor pricing changes and browser workflows require immediate strategic execution.',
        topDevelopments: [
          'Jobscan instituted mandatory $89.85 quarterly upfront billing, creating an acute customer dissatisfaction window.',
          'Teal rolled out Chrome extension application autofill, deepening browser-level candidate lock-in.',
          'Customer signals confirm heavy backlash against superficial AI buzzwords and hidden download paywalls.',
        ],
        topRisks: ['Teal expanding upstream into application workflow could bypass standalone web editors.'],
        topOpportunities: [
          'Acquire dissatisfied Jobscan users through targeted comparison positioning and flexible pricing.',
          'Establish market leadership in verifiable ATS parser diagnostics.',
        ],
        noChangeDetected: false,
        recommendedActions: [
          'Approve GTM comparison campaign against Jobscan quarterly lock-in.',
          'Initialize Chrome Extension ATS Validator sprint to protect browser touchpoints.',
        ],
        generatedDate: now,
      };
      this.executiveBriefs.set(wsId, brief);
    }
  }

  // Market Model
  getMarketModel(workspaceId: string): MarketModel | null {
    for (const m of this.marketModels.values()) {
      if (m.workspaceId === workspaceId && m.status === 'ACTIVE') return m;
    }
    return null;
  }

  saveMarketModel(model: MarketModel): MarketModel {
    this.marketModels.set(model.id, model);
    this.scheduleSave();
    return model;
  }

  // Competitors
  getWarRoomCompetitors(workspaceId: string): WarRoomCompetitor[] {
    return Array.from(this.warRoomCompetitors.values()).filter(c => c.workspaceId === workspaceId);
  }

  getWarRoomCompetitor(id: string, workspaceId?: string): WarRoomCompetitor | null {
    const comp = this.warRoomCompetitors.get(id);
    if (!comp) return null;
    if (workspaceId && comp.workspaceId !== workspaceId) return null;
    return comp;
  }

  saveWarRoomCompetitor(comp: WarRoomCompetitor): WarRoomCompetitor {
    this.warRoomCompetitors.set(comp.id, comp);
    this.scheduleSave();
    return comp;
  }

  deleteWarRoomCompetitor(id: string): boolean {
    const res = this.warRoomCompetitors.delete(id);
    if (res) this.scheduleSave();
    return res;
  }

  // Moves
  getCompetitorMoves(workspaceId: string, limit = 50): CompetitorMove[] {
    return Array.from(this.competitorMoves.values())
      .filter(m => m.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
      .slice(0, limit);
  }

  getCompetitorMove(id: string): CompetitorMove | null {
    return this.competitorMoves.get(id) || null;
  }

  saveCompetitorMove(move: CompetitorMove): CompetitorMove {
    this.competitorMoves.set(move.id, move);
    this.scheduleSave();
    return move;
  }

  // Product Gaps
  getProductGaps(workspaceId: string): ProductGap[] {
    return Array.from(this.productGaps.values())
      .filter(g => g.workspaceId === workspaceId)
      .sort((a, b) => b.buildPriorityScore - a.buildPriorityScore);
  }

  getProductGap(id: string): ProductGap | null {
    return this.productGaps.get(id) || null;
  }

  saveProductGap(gap: ProductGap): ProductGap {
    this.productGaps.set(gap.id, gap);
    this.scheduleSave();
    return gap;
  }

  // Customer Demand Signals
  getCustomerDemandSignals(workspaceId: string): CustomerDemandSignal[] {
    return Array.from(this.demandSignals.values())
      .filter(s => s.workspaceId === workspaceId)
      .sort((a, b) => b.frequencyCount - a.frequencyCount);
  }

  saveCustomerDemandSignal(signal: CustomerDemandSignal): CustomerDemandSignal {
    this.demandSignals.set(signal.id, signal);
    this.scheduleSave();
    return signal;
  }

  // Opportunities
  getMarketOpportunities(workspaceId: string): MarketOpportunity[] {
    return Array.from(this.marketOpportunities.values())
      .filter(o => o.workspaceId === workspaceId)
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  getMarketOpportunity(id: string): MarketOpportunity | null {
    return this.marketOpportunities.get(id) || null;
  }

  saveMarketOpportunity(opp: MarketOpportunity): MarketOpportunity {
    this.marketOpportunities.set(opp.id, opp);
    this.scheduleSave();
    return opp;
  }

  // Threats
  getMarketThreats(workspaceId: string): MarketThreat[] {
    const priorityOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return Array.from(this.marketThreats.values())
      .filter(t => t.workspaceId === workspaceId)
      .sort((a, b) => (priorityOrder[b.threatLevel] || 0) - (priorityOrder[a.threatLevel] || 0));
  }

  getMarketThreat(id: string): MarketThreat | null {
    return this.marketThreats.get(id) || null;
  }

  saveMarketThreat(threat: MarketThreat): MarketThreat {
    this.marketThreats.set(threat.id, threat);
    this.scheduleSave();
    return threat;
  }

  // Recommendations
  getWarRoomRecommendations(workspaceId: string): WarRoomRecommendation[] {
    return Array.from(this.warRoomRecommendations.values())
      .filter(r => r.workspaceId === workspaceId)
      .sort((a, b) => b.confidence - a.confidence);
  }

  getWarRoomRecommendation(id: string): WarRoomRecommendation | null {
    return this.warRoomRecommendations.get(id) || null;
  }

  saveWarRoomRecommendation(rec: WarRoomRecommendation): WarRoomRecommendation {
    this.warRoomRecommendations.set(rec.id, rec);
    this.scheduleSave();
    return rec;
  }

  // Scenarios
  getScenarioSimulations(workspaceId: string): ScenarioSimulation[] {
    return Array.from(this.scenarioSimulations.values())
      .filter(s => s.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.simulatedAt).getTime() - new Date(a.simulatedAt).getTime());
  }

  saveScenarioSimulation(sim: ScenarioSimulation): ScenarioSimulation {
    this.scenarioSimulations.set(sim.id, sim);
    this.scheduleSave();
    return sim;
  }

  // Decisions
  getStrategicDecisions(workspaceId: string): StrategicDecision[] {
    return Array.from(this.strategicDecisions.values())
      .filter(d => d.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());
  }

  saveStrategicDecision(decision: StrategicDecision): StrategicDecision {
    this.strategicDecisions.set(decision.id, decision);
    this.scheduleSave();
    return decision;
  }

  // Experiments
  getStrategicExperiments(workspaceId: string): StrategicExperiment[] {
    return Array.from(this.strategicExperiments.values())
      .filter(e => e.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  saveStrategicExperiment(exp: StrategicExperiment): StrategicExperiment {
    this.strategicExperiments.set(exp.id, exp);
    this.scheduleSave();
    return exp;
  }

  // Scorecard
  getCompanyScorecard(workspaceId: string): CompanyScorecard | null {
    return this.companyScorecards.get(workspaceId) || null;
  }

  saveCompanyScorecard(scorecard: CompanyScorecard): CompanyScorecard {
    this.companyScorecards.set(scorecard.workspaceId, scorecard);
    this.scheduleSave();
    return scorecard;
  }

  // Executive Brief
  getExecutiveBrief(workspaceId: string): ExecutiveBrief | null {
    return this.executiveBriefs.get(workspaceId) || null;
  }

  saveExecutiveBrief(brief: ExecutiveBrief): ExecutiveBrief {
    this.executiveBriefs.set(brief.workspaceId, brief);
    this.scheduleSave();
    return brief;
  }
}

export const db = new PersistentDatabaseStore();

