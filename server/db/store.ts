import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
} from '../types';
import { logger } from '../utils/logger';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  resetToken?: string;
  resetTokenExpires?: number;
}

export interface UserSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// Default user & workspace for instant demo sandbox
const DEFAULT_USER: User = {
  id: 'usr_default_founder',
  email: 'founder@researchflow.ai',
  name: 'Alex Chen',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  createdAt: new Date('2026-08-20T10:00:00Z').toISOString(),
};

const DEFAULT_WORKSPACE: Workspace = {
  id: 'ws_default_prod',
  name: 'Acme Growth Labs',
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
    workspaceId: DEFAULT_WORKSPACE.id,
    name: 'Alex Chen',
    email: 'alex@growthlabs.io',
    role: 'OWNER',
    title: 'Founder & CEO',
    department: 'Executive',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    joinedAt: new Date('2026-08-20T10:05:00Z').toISOString(),
  },
  {
    id: 'mem_2',
    workspaceId: DEFAULT_WORKSPACE.id,
    name: 'Sarah Jenkins',
    email: 'sarah.j@growthlabs.io',
    role: 'GTM_STRATEGIST',
    title: 'Principal GTM Strategist',
    department: 'Marketing Strategy',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    joinedAt: new Date('2026-08-21T09:15:00Z').toISOString(),
  },
  {
    id: 'mem_3',
    workspaceId: DEFAULT_WORKSPACE.id,
    name: 'Marcus Vance',
    email: 'marcus.v@growthlabs.io',
    role: 'RESEARCHER',
    title: 'Competitive Intelligence Lead',
    department: 'Market Research',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    joinedAt: new Date('2026-08-22T11:30:00Z').toISOString(),
  },
  {
    id: 'mem_4',
    workspaceId: DEFAULT_WORKSPACE.id,
    name: 'Elena Rostova',
    email: 'elena.r@growthlabs.io',
    role: 'CONTENT_LEAD',
    title: 'Head of Messaging & Content',
    department: 'Content Strategy',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    joinedAt: new Date('2026-08-23T14:20:00Z').toISOString(),
  },
  {
    id: 'mem_5',
    workspaceId: DEFAULT_WORKSPACE.id,
    name: 'David Kim',
    email: 'david.k@growthlabs.io',
    role: 'REVIEWER',
    title: 'Product Marketing Manager',
    department: 'Product Marketing',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    joinedAt: new Date('2026-08-24T16:00:00Z').toISOString(),
  },
];

const DEFAULT_BASELINE: BaselineMetric = {
  id: 'bm_default',
  workspaceId: DEFAULT_WORKSPACE.id,
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

class PersistentDatabaseStore {
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

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        logger.warn('Could not create data directory:', err);
      }
    }
    this.dataFilePath = path.join(dataDir, 'researchflow_db.json');

    this.loadFromDisk();

    // Ensure default founder exists if empty
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

    if (!this.workspaces.has(DEFAULT_WORKSPACE.id)) {
      this.workspaces.set(DEFAULT_WORKSPACE.id, DEFAULT_WORKSPACE);
    }

    if (this.members.size === 0) {
      DEFAULT_MEMBERS.forEach(m => this.members.set(m.id, m));
    }

    if (!this.baselineMetrics.has(DEFAULT_BASELINE.id)) {
      this.baselineMetrics.set(DEFAULT_BASELINE.id, DEFAULT_BASELINE);
    }

    this.saveToDiskSync();
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  }

  private loadFromDisk(): void {
    if (!fs.existsSync(this.dataFilePath)) return;
    try {
      const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
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
      };

      const tempPath = `${this.dataFilePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dataFilePath);
    } catch (err) {
      logger.error('Failed to persist database to disk:', err);
    }
  }

  // ----------------------------------------------------
  // Authentication & Session Management
  // ----------------------------------------------------
  registerUser(data: { email: string; password?: string; name: string; avatarUrl?: string }): { user: User; token: string } {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (this.userAccounts.has(normalizedEmail)) {
      throw new Error(`An account with email "${data.email}" already exists.`);
    }

    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(data.password || crypto.randomBytes(16).toString('hex'), salt);

    const user: User = {
      id: userId,
      email: data.email.trim(),
      name: data.name.trim(),
      avatarUrl: data.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };

    const account: UserAccount = {
      id: userId,
      email: normalizedEmail,
      name: user.name,
      avatarUrl: user.avatarUrl,
      passwordHash,
      salt,
      createdAt: user.createdAt,
    };

    this.users.set(userId, user);
    this.userAccounts.set(normalizedEmail, account);

    const token = this.createSession(userId);
    this.scheduleSave();
    return { user, token };
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

    return this.users.get(session.userId) || null;
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
    return this.users.get(id);
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
    const owned = Array.from(this.workspaces.values()).filter(w => w.ownerId === userId);
    const memberWsIds = Array.from(this.members.values())
      .filter(m => m.id === userId || m.email === this.getUser(userId)?.email)
      .map(m => m.workspaceId);

    const memberWorkspaces = Array.from(this.workspaces.values()).filter(w => memberWsIds.includes(w.id));
    const all = [...owned, ...memberWorkspaces];

    // Deduplicate
    const map = new Map<string, Workspace>();
    all.forEach(w => map.set(w.id, w));
    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  isUserAuthorizedForWorkspace(userId: string, workspaceId: string): boolean {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return false;
    if (ws.ownerId === userId) return true;

    const user = this.getUser(userId);
    const members = this.listMembers(workspaceId);
    return members.some(m => m.id === userId || (user && m.email.toLowerCase() === user.email.toLowerCase()));
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
  getResearchJob(id: string, workspaceId: string): ResearchJob | undefined {
    const job = this.researchJobs.get(id);
    if (!job || job.workspaceId !== workspaceId) return undefined;
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

  getCampaignBrief(id: string): CampaignBrief | undefined {
    return this.campaignBriefs.get(id);
  }

  getCampaignBriefByJobId(jobId: string): CampaignBrief | undefined {
    return Array.from(this.campaignBriefs.values()).find(b => b.researchJobId === jobId);
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
      .filter(t => t.workspaceId === workspaceId && (!jobId || t.researchJobId === jobId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateTask(task: ExecutionTask): ExecutionTask {
    this.tasks.set(task.id, task);
    this.scheduleSave();
    return task;
  }

  getTask(id: string): ExecutionTask | undefined {
    return this.tasks.get(id);
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
}

export const db = new PersistentDatabaseStore();

