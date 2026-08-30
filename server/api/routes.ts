import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { researchService } from '../services/researchService';
import { conflictService } from '../services/conflictService';
import { evaluationService } from '../services/evaluationService';
import { demoService } from '../services/demoService';
import { searchService } from '../services/searchService';
import { geminiAIService } from '../ai/gemini';
import { aiOrchestrator } from '../ai/orchestrator';
import { freeModelRegistry } from '../ai/openrouter/registry';
import { openRouterProvider } from '../ai/providers/openrouterProvider';
import { geminiProvider } from '../ai/providers/geminiProvider';
import { logger } from '../utils/logger';

export const apiRouter = Router();

// Helper to extract authenticated user from Request
function getAuthUser(req: Request) {
  const authHeader = req.headers['authorization'] || '';
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-session-token'] as string);
  
  if (tokenFromHeader) {
    const user = db.getSessionUser(tokenFromHeader);
    if (user) return user;
  }

  // Fallback: If no token or invalid, check if explicitly requesting default founder in demo mode
  const isDemo = req.headers['x-demo-mode'] === 'true';
  if (isDemo) {
    return db.getUser('usr_default_founder') || null;
  }

  return null;
}

// Middleware to extract and authorize workspace context
function getWorkspaceId(req: Request, res?: Response): string {
  const user = getAuthUser(req);
  const requestedWsId = (req.headers['x-workspace-id'] as string) || 'ws_default_prod';

  // If user is authenticated, verify authorization
  if (user) {
    const isAuthorized = db.isUserAuthorizedForWorkspace(user.id, requestedWsId);
    if (!isAuthorized && requestedWsId !== 'ws_default_prod') {
      if (res) {
        res.status(403).json({ error: 'Access denied: You are not a member of this workspace.' });
      }
      throw new Error('UNAUTHORIZED_WORKSPACE');
    }
  }

  return requestedWsId;
}

// ----------------------------------------------------
// Authentication & User Management
// ----------------------------------------------------
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.getUser('usr_default_founder');
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  const workspaces = db.getWorkspacesForUser(user.id);
  const activeWsId = workspaces[0]?.id || 'ws_default_prod';

  res.json({
    user,
    workspaces,
    activeWorkspaceId: activeWsId,
  });
});

apiRouter.post('/auth/signup', (req: Request, res: Response) => {
  const { email, password, name, avatarUrl, workspaceName, businessName, industry, targetAudience } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and full name are required for signup.' });
  }

  try {
    const { user, token } = db.registerUser({
      email,
      password: password || 'DefaultPass123!',
      name,
      avatarUrl,
    });

    let initialWorkspace = null;
    if (workspaceName || businessName) {
      initialWorkspace = db.createWorkspace({
        id: `ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: workspaceName || `${name}'s Workspace`,
        businessName: businessName || `${name}'s Product`,
        description: req.body.description || `Autonomous market intelligence and campaign workspace for ${businessName || name}.`,
        industry: industry || 'Technology & Digital Services',
        targetAudience: targetAudience || 'Founders, marketers, and decision makers',
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Add user as owner member
      db.addMember({
        id: `mem_${Date.now()}`,
        workspaceId: initialWorkspace.id,
        name: user.name,
        email: user.email,
        role: 'OWNER',
        title: 'Founder & CEO',
        department: 'Leadership',
        avatarUrl: user.avatarUrl,
        joinedAt: new Date().toISOString(),
      });
    }

    const workspaces = db.getWorkspacesForUser(user.id);

    res.json({
      user,
      token,
      workspaces,
      activeWorkspaceId: initialWorkspace?.id || workspaces[0]?.id || 'ws_default_prod',
    });
  } catch (err: any) {
    logger.warn('Signup failed:', err.message);
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const authResult = db.authenticateUser(email, password);
  if (!authResult) {
    // If not found, check if it's default founder demo
    if (email.toLowerCase() === 'founder@researchflow.ai' || email.toLowerCase() === 'alex@growthlabs.io') {
      const defaultUser = db.getUser('usr_default_founder')!;
      const token = db.createSession(defaultUser.id);
      const workspaces = db.getWorkspacesForUser(defaultUser.id);
      return res.json({
        user: defaultUser,
        token,
        workspaces,
        activeWorkspaceId: workspaces[0]?.id || 'ws_default_prod',
      });
    }
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { user, token } = authResult;
  const workspaces = db.getWorkspacesForUser(user.id);

  res.json({
    user,
    token,
    workspaces,
    activeWorkspaceId: workspaces[0]?.id || 'ws_default_prod',
  });
});

apiRouter.post('/auth/google', (req: Request, res: Response) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email is required.' });
  }

  let authResult = db.authenticateUser(email);
  if (!authResult) {
    try {
      authResult = db.registerUser({
        email,
        name: name || email.split('@')[0],
        avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`,
      });

      // Auto-create personal workspace
      const newWs = db.createWorkspace({
        id: `ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: `${authResult.user.name}'s Workspace`,
        businessName: `${authResult.user.name}'s Growth Hub`,
        description: 'Autonomous research and GTM campaign intelligence workspace.',
        industry: 'B2B SaaS / Growth',
        targetAudience: 'Early adopters, founders, and growth leads',
        ownerId: authResult.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      db.addMember({
        id: `mem_${Date.now()}`,
        workspaceId: newWs.id,
        name: authResult.user.name,
        email: authResult.user.email,
        role: 'OWNER',
        title: 'Founder & Team Lead',
        department: 'Executive',
        avatarUrl: authResult.user.avatarUrl,
        joinedAt: new Date().toISOString(),
      });
    } catch {
      authResult = db.authenticateUser(email)!;
    }
  }

  const { user, token } = authResult;
  const workspaces = db.getWorkspacesForUser(user.id);

  res.json({
    user,
    token,
    workspaces,
    activeWorkspaceId: workspaces[0]?.id || 'ws_default_prod',
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-session-token'] as string);
  if (token) {
    db.invalidateSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const resetToken = db.createPasswordResetToken(email);
  res.json({
    success: true,
    message: resetToken
      ? 'Password reset instructions have been generated.'
      : 'If that email is registered, instructions have been sent.',
    resetToken: resetToken || undefined,
  });
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  const ok = db.resetPasswordWithToken(token, newPassword);
  if (!ok) {
    return res.status(400).json({ error: 'Invalid or expired password reset token.' });
  }

  res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
});

// ----------------------------------------------------
// Workspaces
// ----------------------------------------------------
apiRouter.get('/workspaces', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.getUser('usr_default_founder')!;
  const workspaces = db.getWorkspacesForUser(user.id);
  res.json(workspaces);
});

apiRouter.post('/workspaces', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.getUser('usr_default_founder')!;
  const { name, businessName, description, industry, targetAudience } = req.body;
  if (!name || !businessName) {
    return res.status(400).json({ error: 'Workspace name and business name are required' });
  }
  const ws = db.createWorkspace({
    id: `ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    businessName,
    description: description || '',
    industry: industry || 'Technology & Digital Services',
    targetAudience: targetAudience || 'Target customers and decision makers',
    ownerId: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.addMember({
    id: `mem_${Date.now()}`,
    workspaceId: ws.id,
    name: user.name,
    email: user.email,
    role: 'OWNER',
    title: 'Founder & CEO',
    department: 'Leadership',
    avatarUrl: user.avatarUrl,
    joinedAt: new Date().toISOString(),
  });

  res.json(ws);
});

apiRouter.get('/workspaces/:id', (req: Request, res: Response) => {
  const ws = db.getWorkspace(req.params.id);
  if (!ws) return res.status(404).json({ error: 'Workspace not found' });
  res.json(ws);
});

apiRouter.put('/workspaces/:id', (req: Request, res: Response) => {
  const ws = db.getWorkspace(req.params.id);
  if (!ws) return res.status(404).json({ error: 'Workspace not found' });
  const updated = db.updateWorkspace({
    ...ws,
    ...req.body,
    updatedAt: new Date().toISOString(),
  });
  res.json(updated);
});

// ----------------------------------------------------
// Workspace Members
// ----------------------------------------------------
apiRouter.get('/workspace/members', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req, res);
  const members = db.listMembers(wsId);
  res.json(members);
});

apiRouter.post('/workspace/members', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req, res);
  const { name, email, role, title, department } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Member name and email are required' });
  }

  const member = db.addMember({
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    workspaceId: wsId,
    name: name.trim(),
    email: email.trim(),
    role: role || 'REVIEWER',
    title: title || 'Team Reviewer',
    department: department || 'General',
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
    joinedAt: new Date().toISOString(),
  });

  db.recordAudit({
    workspaceId: wsId,
    eventType: 'workspace_created',
    summary: `Added team member "${member.name}" (${member.title || member.role})`,
  });

  res.json(member);
});

// ----------------------------------------------------
// Research Jobs
// ----------------------------------------------------
apiRouter.get('/research/jobs', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const jobs = db.listResearchJobs(wsId);
  res.json(jobs);
});

apiRouter.post('/research/jobs', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const {
    businessName,
    businessDescription,
    campaignObjective,
    targetAudience,
    competitorUrls,
    additionalUrls,
  } = req.body;

  try {
    const job = researchService.createJob(
      {
        businessName,
        businessDescription,
        campaignObjective,
        targetAudience,
        competitorUrls: competitorUrls || [],
        additionalUrls: additionalUrls || [],
      },
      wsId
    );
    res.json(job);
  } catch (err: any) {
    logger.error('Failed to create research job', err);
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/research/jobs/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const job = db.getResearchJob(req.params.id, wsId);
  if (!job) return res.status(404).json({ error: 'Research job not found' });

  // Include related counts and objects
  const sources = db.listSources(job.id);
  const evidence = db.listEvidence(job.id);
  const conflicts = db.listConflicts(job.id);
  const intelligence = db.getIntelligenceByJobId(job.id);
  const brief = db.getCampaignBriefByJobId(job.id);
  const assets = db.listCampaignAssets(job.id);
  const tasks = db.listTasks(wsId, job.id);
  const shareLinks = db.listShareLinks(job.id);
  const reviewAssignments = db.listReviewAssignments(job.id);

  res.json({
    ...job,
    sources,
    evidence,
    conflicts,
    intelligence,
    campaignBrief: brief,
    assets,
    tasks,
    shareLinks,
    reviewAssignments,
  });
});

apiRouter.post('/research/jobs/:id/run', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  try {
    // Run asynchronously or await
    const job = await researchService.runJob(req.params.id, wsId);
    res.json(job);
  } catch (err: any) {
    logger.error(`Failed to run research job ${req.params.id}`, err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/research/jobs/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const ok = db.deleteResearchJob(req.params.id, wsId);
  if (!ok) return res.status(404).json({ error: 'Job not found' });
  res.json({ success: true });
});

apiRouter.get('/research/jobs/:id/sources', (req: Request, res: Response) => {
  const sources = db.listSources(req.params.id);
  res.json(sources);
});

apiRouter.get('/research/jobs/:id/evidence', (req: Request, res: Response) => {
  const evidence = db.listEvidence(req.params.id);
  res.json(evidence);
});

apiRouter.get('/evidence', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const evidence = db.listAllEvidenceForWorkspace(wsId);
  res.json(evidence);
});

apiRouter.get('/research/jobs/:id/conflicts', (req: Request, res: Response) => {
  const conflicts = db.listConflicts(req.params.id);
  res.json(conflicts);
});

apiRouter.post('/conflicts/:id/resolve', (req: Request, res: Response) => {
  const { status, resolutionNotes } = req.body;
  const resolved = conflictService.resolveConflict(
    req.params.id,
    status || 'HUMAN_VERIFIED',
    resolutionNotes || ''
  );
  if (!resolved) return res.status(404).json({ error: 'Conflict item not found' });
  res.json(resolved);
});

// ----------------------------------------------------
// Research Item Sharing & Unique Link Generation
// ----------------------------------------------------
apiRouter.post('/research/jobs/:id/share', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const job = db.getResearchJob(req.params.id, wsId);
  if (!job) return res.status(404).json({ error: 'Research job not found' });

  const { scope, permission, password, passwordProtected, expiresAt } = req.body;
  const token = `rf_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;

  const shareLink = db.createShareLink({
    id: `sh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    token,
    researchJobId: job.id,
    workspaceId: wsId,
    title: `${job.businessName} - Market Intelligence & Research Brief`,
    scope: scope || 'FULL_DOSSIER',
    permission: permission || 'VIEW_ONLY',
    passwordProtected: !!passwordProtected,
    password: password || undefined,
    expiresAt: expiresAt || undefined,
    createdById: 'usr_default_founder',
    createdByName: 'Alex Chen',
    createdAt: new Date().toISOString(),
    viewsCount: 0,
    isActive: true,
  });

  db.recordAudit({
    workspaceId: wsId,
    researchJobId: job.id,
    eventType: 'share_link_created',
    summary: `Generated unique share link for "${job.businessName}" (${shareLink.scope}, ${shareLink.permission})`,
    details: { token: shareLink.token, scope: shareLink.scope, permission: shareLink.permission },
  });

  res.json(shareLink);
});

apiRouter.get('/research/jobs/:id/share-links', (req: Request, res: Response) => {
  const links = db.listShareLinks(req.params.id);
  res.json(links);
});

apiRouter.delete('/research/share-links/:id', (req: Request, res: Response) => {
  const ok = db.revokeShareLink(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Share link not found' });
  res.json({ success: true });
});

// Public resolver for shared research links
apiRouter.get('/share/research/:token', (req: Request, res: Response) => {
  const shareLink = db.getShareLinkByToken(req.params.token);
  if (!shareLink) {
    return res.status(404).json({ error: 'Share link not found, inactive, or has been revoked.' });
  }

  if (shareLink.expiresAt && new Date(shareLink.expiresAt).getTime() < Date.now()) {
    return res.status(410).json({ error: 'This research share link has expired.' });
  }

  db.incrementShareLinkViews(shareLink.id);

  const job = db.getResearchJob(shareLink.researchJobId, shareLink.workspaceId);
  if (!job) return res.status(404).json({ error: 'Referenced research item no longer exists.' });

  const sources = db.listSources(job.id);
  const evidence = db.listEvidence(job.id);
  const conflicts = db.listConflicts(job.id);
  const intelligence = db.getIntelligenceByJobId(job.id);
  const campaignBrief = db.getCampaignBriefByJobId(job.id);
  const reviews = db.listReviewAssignments(job.id);

  res.json({
    shareLink,
    job: {
      id: job.id,
      businessName: job.businessName,
      businessDescription: job.businessDescription,
      campaignObjective: job.campaignObjective,
      targetAudience: job.targetAudience,
      competitorUrls: job.competitorUrls,
      status: job.status,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      sourcesCount: job.sourcesCount,
      evidenceCount: job.evidenceCount,
      conflictsCount: job.conflictsCount,
    },
    intelligence: shareLink.scope !== 'EVIDENCE_ONLY' ? intelligence : undefined,
    campaignBrief:
      shareLink.scope === 'FULL_DOSSIER' || shareLink.scope === 'CAMPAIGN_BRIEF'
        ? campaignBrief
        : undefined,
    evidence:
      shareLink.scope === 'FULL_DOSSIER' ||
      shareLink.scope === 'EVIDENCE_ONLY' ||
      shareLink.scope === 'EXECUTIVE_NOTES'
        ? evidence
        : [],
    sources: shareLink.scope === 'FULL_DOSSIER' ? sources : [],
    conflicts: shareLink.scope === 'FULL_DOSSIER' ? conflicts : [],
    reviews,
  });
});

// ----------------------------------------------------
// Team Member Review Assignments
// ----------------------------------------------------
apiRouter.post('/research/jobs/:id/assign-review', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const job = db.getResearchJob(req.params.id, wsId);
  if (!job) return res.status(404).json({ error: 'Research job not found' });

  const {
    memberId,
    targetSection,
    noteContextSnippet,
    priority,
    dueDate,
    instructions,
  } = req.body;

  const member = db.getMember(memberId);
  if (!member) return res.status(400).json({ error: 'Selected team member not found' });

  const assignment = db.createReviewAssignment({
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    researchJobId: job.id,
    workspaceId: wsId,
    targetSection: targetSection || 'RESEARCH_NOTES',
    noteContextSnippet: noteContextSnippet || undefined,
    assignedToMemberId: member.id,
    assignedToName: member.name,
    assignedToEmail: member.email,
    assignedToAvatar: member.avatarUrl,
    assignedToRole: member.title || member.role,
    assignedByMemberId: 'usr_default_founder',
    assignedByName: 'Alex Chen',
    priority: priority || 'HIGH',
    dueDate: dueDate || undefined,
    instructions: instructions || 'Please review this research item and verify competitive findings.',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Auto-generate actionable task in workspace task board
  db.saveTask({
    id: `task_rev_${Date.now()}`,
    researchJobId: job.id,
    workspaceId: wsId,
    title: `Team Review: ${job.businessName} (${member.name})`,
    description: `Assigned to ${member.name}: ${instructions || 'Review research note and verify findings.'}`,
    priority: priority || 'HIGH',
    category: 'VERIFICATION',
    status: 'PENDING',
    reason: `Assigned review on ${targetSection || 'research note'}`,
    evidenceReference: noteContextSnippet ? noteContextSnippet.slice(0, 120) : undefined,
    createdAt: new Date().toISOString(),
  });

  db.recordAudit({
    workspaceId: wsId,
    researchJobId: job.id,
    eventType: 'review_assigned',
    summary: `Assigned research note review for "${job.businessName}" to ${member.name} (${member.title || member.role})`,
    details: { assignedTo: member.name, targetSection, priority },
  });

  res.json(assignment);
});

apiRouter.get('/research/jobs/:id/reviews', (req: Request, res: Response) => {
  const reviews = db.listReviewAssignments(req.params.id);
  res.json(reviews);
});

apiRouter.get('/research/reviews', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const reviews = db.listReviewAssignments(undefined, wsId);
  res.json(reviews);
});

apiRouter.patch('/research/reviews/:id', (req: Request, res: Response) => {
  const { status, reviewerFeedback } = req.body;
  const updated = db.updateReviewAssignment(req.params.id, {
    status,
    reviewerFeedback,
    reviewedAt:
      status === 'APPROVED' || status === 'CHANGES_REQUESTED'
        ? new Date().toISOString()
        : undefined,
  });
  if (!updated) return res.status(404).json({ error: 'Review assignment not found' });

  db.recordAudit({
    workspaceId: updated.workspaceId,
    researchJobId: updated.researchJobId,
    eventType: 'review_status_updated',
    summary: `Review on "${updated.targetSection}" by ${updated.assignedToName} updated to ${updated.status}`,
    details: { status: updated.status, feedback: reviewerFeedback },
  });

  res.json(updated);
});

apiRouter.delete('/research/reviews/:id', (req: Request, res: Response) => {
  const ok = db.deleteReviewAssignment(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Review assignment not found' });
  res.json({ success: true });
});

// ----------------------------------------------------
// Executive Insights & Summary (Gemini Powered)
// ----------------------------------------------------
apiRouter.get('/research/insights/summary', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const workspace = db.getWorkspace(wsId);
  const jobs = db.listResearchJobs(wsId);
  const evidenceList = db.listAllEvidenceForWorkspace(wsId);
  const conflicts = db.listConflicts(wsId);

  try {
    const summary = await geminiAIService.generateExecutiveSummary({
      businessName: workspace?.businessName || 'NextGen Resume AI',
      businessDescription: workspace?.description,
      targetAudience: workspace?.targetAudience,
      latestJobs: jobs,
      evidenceList,
      conflictsCount: conflicts.filter((c) => c.status === 'UNRESOLVED').length,
    });
    res.json(summary);
  } catch (err: any) {
    logger.error('Error generating executive summary', err);
    res.status(500).json({ error: 'Failed to generate executive summary' });
  }
});

apiRouter.post('/research/insights/summary/regenerate', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const workspace = db.getWorkspace(wsId);
  const jobs = db.listResearchJobs(wsId);
  const evidenceList = db.listAllEvidenceForWorkspace(wsId);
  const conflicts = db.listConflicts(wsId);

  try {
    const summary = await geminiAIService.generateExecutiveSummary({
      businessName: workspace?.businessName || 'NextGen Resume AI',
      businessDescription: workspace?.description,
      targetAudience: workspace?.targetAudience,
      latestJobs: jobs,
      evidenceList,
      conflictsCount: conflicts.filter((c) => c.status === 'UNRESOLVED').length,
    });
    res.json(summary);
  } catch (err: any) {
    logger.error('Error regenerating executive summary', err);
    res.status(500).json({ error: 'Failed to regenerate executive summary' });
  }
});

apiRouter.get('/research/jobs/:id/intelligence', (req: Request, res: Response) => {
  const intel = db.getIntelligenceByJobId(req.params.id);
  if (!intel) return res.status(404).json({ error: 'Intelligence report not found' });
  res.json(intel);
});

apiRouter.get('/research/jobs/:id/campaign', (req: Request, res: Response) => {
  const brief = db.getCampaignBriefByJobId(req.params.id);
  if (!brief) return res.status(404).json({ error: 'Campaign brief not found' });
  res.json(brief);
});

apiRouter.post('/research/jobs/:id/campaign/edit', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  try {
    const updated = researchService.editCampaignBrief(req.params.id, wsId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/research/jobs/:id/assets', (req: Request, res: Response) => {
  const assets = db.listCampaignAssets(req.params.id);
  res.json(assets);
});

apiRouter.post('/research/jobs/:id/approve', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { reviewNotes, approvedBy } = req.body;
  try {
    const job = researchService.approveJob(req.params.id, wsId, reviewNotes, approvedBy);
    res.json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/research/jobs/:id/reject', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { reason } = req.body;
  try {
    const job = researchService.rejectJob(req.params.id, wsId, reason || 'Rejected by reviewer');
    res.json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// ----------------------------------------------------
// Tasks & Actionable Task Identification
// ----------------------------------------------------
apiRouter.get('/tasks', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const jobId = req.query.jobId as string | undefined;
  const tasks = db.listTasks(wsId, jobId);
  res.json(tasks);
});

apiRouter.post('/tasks', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { researchJobId, title, description, priority, category, reason, evidenceReference } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const task = db.saveTask({
    id: taskId,
    researchJobId: researchJobId || '',
    workspaceId: wsId,
    title: title.trim(),
    description: description || '',
    priority: priority || 'MEDIUM',
    category: category || 'POSITIONING',
    status: 'PENDING',
    reason: reason || 'Created from research actionable notes.',
    evidenceReference,
    createdAt: new Date().toISOString(),
  });

  db.recordAudit({
    workspaceId: wsId,
    researchJobId: researchJobId || undefined,
    eventType: 'task_created',
    summary: `Actionable task created: "${task.title}" (${task.priority} / ${task.category})`,
  });

  res.json(task);
});

apiRouter.post('/tasks/batch', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'Array of tasks is required' });
  }

  const createdTasks = tasks.map((t: any) => {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    return db.saveTask({
      id: taskId,
      researchJobId: t.researchJobId || '',
      workspaceId: wsId,
      title: t.title?.trim() || 'Untitled Action Item',
      description: t.description || '',
      priority: t.priority || 'MEDIUM',
      category: t.category || 'POSITIONING',
      status: 'PENDING',
      reason: t.reason || 'Synced from research notes.',
      evidenceReference: t.evidenceReference,
      createdAt: new Date().toISOString(),
    });
  });

  db.recordAudit({
    workspaceId: wsId,
    researchJobId: tasks[0]?.researchJobId || undefined,
    eventType: 'task_created',
    summary: `Batch synced ${createdTasks.length} actionable tasks from research notes`,
  });

  res.json({ count: createdTasks.length, tasks: createdTasks });
});

apiRouter.post('/research/jobs/:id/extract-tasks', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const job = db.getResearchJob(req.params.id, wsId);
  if (!job) return res.status(404).json({ error: 'Research job not found' });

  const { customNotes } = req.body;
  const intelligence = db.getIntelligenceByJobId(job.id);
  const brief = db.getCampaignBriefByJobId(job.id);

  // Combine job business description (including dictated notes), campaign objective, and any ad-hoc custom notes
  const combinedNotes = [
    customNotes ? `[Live Directives & Field Notes]:\n${customNotes}` : '',
    job.businessDescription ? `[Research Context & Value Proposition]:\n${job.businessDescription}` : '',
    brief ? `[Campaign Recommendations]:\n${(brief.recommendations || []).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const identified = await geminiAIService.identifyTasksFromNotes({
      notes: combinedNotes,
      businessName: job.businessName,
      campaignObjective: job.campaignObjective,
      targetAudience: job.targetAudience,
      findings: intelligence?.findings,
      opportunities: intelligence?.marketOpportunities,
    });

    res.json({
      tasks: identified,
      noteSnippet: combinedNotes.slice(0, 300),
      jobId: job.id,
    });
  } catch (err: any) {
    logger.warn(`Task extraction error: ${err.message}`);
    const fallback = geminiAIService.heuristicIdentifyTasks({
      notes: combinedNotes,
      businessName: job.businessName,
      campaignObjective: job.campaignObjective,
      targetAudience: job.targetAudience,
      findings: intelligence?.findings,
      opportunities: intelligence?.marketOpportunities,
    });
    res.json({
      tasks: fallback,
      noteSnippet: combinedNotes.slice(0, 300),
      jobId: job.id,
    });
  }
});

apiRouter.post('/research/extract-tasks', async (req: Request, res: Response) => {
  const { notes, businessName, campaignObjective, targetAudience } = req.body;
  try {
    const tasks = await geminiAIService.identifyTasksFromNotes({
      notes: notes || '',
      businessName: businessName || 'Target Business',
      campaignObjective,
      targetAudience,
    });
    res.json({ tasks });
  } catch (err: any) {
    const fallback = geminiAIService.heuristicIdentifyTasks({
      notes: notes || '',
      businessName: businessName || 'Target Business',
      campaignObjective,
      targetAudience,
    });
    res.json({ tasks: fallback });
  }
});

apiRouter.patch('/tasks/:id', (req: Request, res: Response) => {
  const allTasks = db.listTasks(getWorkspaceId(req));
  const target = allTasks.find(t => t.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Task not found' });

  const updated = db.updateTask({
    ...target,
    ...req.body,
    completedAt: req.body.status === 'COMPLETED' ? new Date().toISOString() : target.completedAt,
  });

  db.recordAudit({
    workspaceId: target.workspaceId,
    researchJobId: target.researchJobId,
    eventType: req.body.status === 'COMPLETED' ? 'task_completed' : 'task_created',
    summary: `Task "${target.title}" status updated to ${req.body.status || target.status}`,
  });

  res.json(updated);
});

// ----------------------------------------------------
// Evaluation & Baseline
// ----------------------------------------------------
apiRouter.get('/evaluation', (req: Request, res: Response) => {
  const testCases = evaluationService.getTestCases();
  const summary = evaluationService.getEvaluationSummary();
  res.json({
    testCases,
    summary,
  });
});

apiRouter.post('/evaluation/run', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { caseCode } = req.body;
  try {
    if (caseCode) {
      const run = await evaluationService.runSingleTestCase(caseCode, wsId);
      res.json({ run, summary: evaluationService.getEvaluationSummary() });
    } else {
      const runs = await evaluationService.runAllTestCases(wsId);
      res.json({ runs, summary: evaluationService.getEvaluationSummary() });
    }
  } catch (err: any) {
    logger.error('Evaluation run failed', err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/baseline', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const baseline = db.getBaselineMetric(wsId);
  res.json(baseline);
});

apiRouter.put('/baseline', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const existing = db.getBaselineMetric(wsId);
  const updated = db.updateBaselineMetric({
    ...existing,
    ...req.body,
    lastUpdated: new Date().toISOString(),
  });
  res.json(updated);
});

// ----------------------------------------------------
// Audit & Activity Timeline
// ----------------------------------------------------
apiRouter.get('/activity', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const events = db.listAuditEvents(wsId, limit);
  res.json(events);
});

// ----------------------------------------------------
// Global Search (Jobs, Campaigns, Tasks, Evidence)
// ----------------------------------------------------
apiRouter.get('/search', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const q = (req.query.q as string) || '';
  const type = req.query.type as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;

  const results = searchService.search(wsId, q, type, limit);
  res.json({
    query: q,
    total: results.length,
    results,
  });
});

// ----------------------------------------------------
// Demo Mode Seeder
// ----------------------------------------------------
apiRouter.post('/demo/seed', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const demoJob = demoService.seedDemoJob(wsId);
  res.json({
    success: true,
    job: demoJob,
  });
});

// ----------------------------------------------------
// AI Multi-Model Orchestration & Health Diagnostics
// ----------------------------------------------------
apiRouter.get('/ai/health', (req: Request, res: Response) => {
  const health = aiOrchestrator.getHealthStatus();
  res.json(health);
});

apiRouter.post('/ai/sync-catalog', async (req: Request, res: Response) => {
  try {
    const models = await aiOrchestrator.syncCatalog();
    res.json({
      success: true,
      count: models.length,
      models,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/ai/routing-mode', (req: Request, res: Response) => {
  const { mode } = req.body;
  if (!['FREE_ONLY', 'BALANCED', 'CUSTOM'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid routing mode. Must be FREE_ONLY, BALANCED, or CUSTOM.' });
  }
  aiOrchestrator.setRoutingMode(mode);
  res.json({ success: true, mode });
});

apiRouter.post('/ai/test-mode', (req: Request, res: Response) => {
  const { enabled, failureType } = req.body;
  aiOrchestrator.setTestMode(Boolean(enabled), failureType);
  res.json({
    success: true,
    testMode: aiOrchestrator.getTestMode(),
  });
});

apiRouter.post('/ai/reset-health', (req: Request, res: Response) => {
  const { modelId } = req.body;
  freeModelRegistry.resetModelHealth(modelId);
  res.json({
    success: true,
    health: aiOrchestrator.getHealthStatus(),
  });
});

apiRouter.post('/ai/ping', async (req: Request, res: Response) => {
  const { provider, modelId } = req.body;
  try {
    if (provider === 'gemini') {
      const ping = await geminiProvider.healthCheck(modelId);
      return res.json(ping);
    }
    const ping = await openRouterProvider.healthCheck(modelId || 'openrouter/free');
    return res.json(ping);
  } catch (err: any) {
    res.status(500).json({ healthy: false, latencyMs: 0, error: err.message });
  }
});

// ----------------------------------------------------
// Research Templates
// ----------------------------------------------------
apiRouter.get('/templates', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const list = db.listTemplates(wsId);
  res.json(list);
});

apiRouter.post('/templates', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const user = getAuthUser(req) || { id: 'usr_anon', name: 'User' };
  const { name, description, defaultObjective, targetAudience, sourceUrls, researchCategories } = req.body;

  if (!name || !defaultObjective) {
    return res.status(400).json({ error: 'Template name and default objective are required.' });
  }

  const template = db.saveTemplate({
    id: `tmpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    workspaceId: wsId,
    name: name.trim(),
    description: description || '',
    defaultObjective: defaultObjective.trim(),
    targetAudience: targetAudience || '',
    sourceUrls: sourceUrls || [],
    researchCategories: researchCategories || ['Product', 'Pricing', 'Features', 'Positioning'],
    createdBy: user.id,
    createdByName: user.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    runCount: 0,
  });

  db.recordAudit({
    workspaceId: wsId,
    eventType: 'workspace_created',
    summary: `Created research template: "${template.name}"`,
  });

  res.json(template);
});

apiRouter.delete('/templates/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const ok = db.deleteTemplate(req.params.id, wsId);
  if (!ok) return res.status(404).json({ error: 'Template not found' });
  res.json({ success: true });
});

apiRouter.post('/templates/:id/run', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const template = db.getTemplate(req.params.id, wsId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  try {
    const job = researchService.createJob(
      {
        businessName: req.body.businessName || `${template.name} Execution`,
        businessDescription: req.body.businessDescription || template.description,
        campaignObjective: template.defaultObjective,
        targetAudience: template.targetAudience,
        competitorUrls: template.sourceUrls,
        additionalUrls: [],
      },
      wsId
    );

    job.templateId = template.id;
    db.saveResearchJob(job);

    template.runCount = (template.runCount || 0) + 1;
    db.saveTemplate(template);

    res.json(job);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Research Schedules (Recurring Competitor Radar)
// ----------------------------------------------------
apiRouter.get('/schedules', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const schedules = db.listSchedules(wsId);
  res.json(schedules);
});

apiRouter.post('/schedules', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const user = getAuthUser(req) || { id: 'usr_anon' };
  const { name, frequency, businessName, businessDescription, campaignObjective, targetAudience, sourceUrls, researchCategories } = req.body;

  if (!name || !businessName) {
    return res.status(400).json({ error: 'Schedule name and target business are required.' });
  }

  const schedule = db.saveSchedule({
    id: `sched_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    workspaceId: wsId,
    name: name.trim(),
    frequency: frequency || 'WEEKLY',
    businessName: businessName.trim(),
    businessDescription: businessDescription || '',
    campaignObjective: campaignObjective || 'Recurring competitive scan and change detection.',
    targetAudience: targetAudience || 'General market',
    sourceUrls: sourceUrls || [],
    researchCategories: researchCategories || ['Pricing', 'Features', 'Positioning'],
    isActive: true,
    nextRunAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.recordAudit({
    workspaceId: wsId,
    eventType: 'workspace_created',
    summary: `Configured automated research schedule: "${schedule.name}" (${schedule.frequency})`,
  });

  res.json(schedule);
});

apiRouter.put('/schedules/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const existing = db.getSchedule(req.params.id, wsId);
  if (!existing) return res.status(404).json({ error: 'Schedule not found' });

  const updated = db.saveSchedule({
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  });
  res.json(updated);
});

apiRouter.delete('/schedules/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const ok = db.deleteSchedule(req.params.id, wsId);
  if (!ok) return res.status(404).json({ error: 'Schedule not found' });
  res.json({ success: true });
});

apiRouter.post('/schedules/:id/run-now', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const schedule = db.getSchedule(req.params.id, wsId);
  if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

  try {
    const job = researchService.createJob(
      {
        businessName: schedule.businessName,
        businessDescription: schedule.businessDescription,
        campaignObjective: schedule.campaignObjective,
        targetAudience: schedule.targetAudience,
        competitorUrls: schedule.sourceUrls,
        additionalUrls: [],
      },
      wsId
    );

    job.scheduleId = schedule.id;
    db.saveResearchJob(job);

    schedule.lastRunAt = new Date().toISOString();
    schedule.lastJobId = job.id;
    db.saveSchedule(schedule);

    res.json(job);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Competitive Change Radar & Source Health
// ----------------------------------------------------
apiRouter.get('/change-radar', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const radar = db.listChangeRadar(wsId);
  res.json(radar);
});

apiRouter.get('/sources/health', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const health = db.listSourceHealth(wsId);
  res.json(health);
});

// ----------------------------------------------------
// Notifications Center
// ----------------------------------------------------
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const user = getAuthUser(req);
  const notifs = db.listNotifications(wsId, user?.id);
  res.json(notifs);
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const ok = db.markNotificationRead(req.params.id, wsId);
  res.json({ success: ok });
});

apiRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const user = getAuthUser(req);
  db.markAllNotificationsRead(wsId, user?.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// Review Queue & Approval Memory
// ----------------------------------------------------
apiRouter.get('/reviews/queue', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const queue = db.getReviewQueue(wsId);
  res.json(queue);
});

apiRouter.post('/reviews/decision', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const user = getAuthUser(req) || { id: 'usr_anon', name: 'Reviewer' };
  const { resourceType, resourceId, decision, originalContent, editedContent, reason } = req.body;

  if (!resourceType || !resourceId || !decision) {
    return res.status(400).json({ error: 'resourceType, resourceId, and decision are required' });
  }

  const decisionRecord = db.recordApprovalDecision({
    id: `dec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    workspaceId: wsId,
    resourceType,
    resourceId,
    decision,
    originalContent,
    editedContent,
    reason,
    reviewedBy: user.id,
    reviewedByName: user.name,
    reviewedAt: new Date().toISOString(),
  });

  // If decision relates to campaign brief, update brief status
  if (resourceType === 'CAMPAIGN') {
    const brief = db.getCampaignBrief(resourceId);
    if (brief && brief.workspaceId === wsId) {
      brief.status = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'DRAFT';
      db.saveCampaignBrief(brief);
    }
  }

  // If decision relates to evidence, update evidence
  if (resourceType === 'EVIDENCE') {
    const evidence = db.getEvidence(resourceId);
    if (evidence && evidence.workspaceId === wsId) {
      evidence.reviewStatus = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'FLAGGED';
      evidence.reviewNotes = reason;
      evidence.reviewedBy = user.name;
      evidence.reviewedAt = new Date().toISOString();
      db.saveEvidence(evidence);
    }
  }

  db.recordAudit({
    workspaceId: wsId,
    eventType: 'approved',
    summary: `${user.name} marked ${resourceType.toLowerCase()} ${resourceId} as ${decision}`,
    details: { decision, reason },
  });

  res.json(decisionRecord);
});

apiRouter.get('/reviews/history', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const history = db.listApprovalDecisions(wsId);
  res.json(history);
});

// ----------------------------------------------------
// Evidence Versioning & Editing
// ----------------------------------------------------
apiRouter.post('/evidence/:id/edit', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const user = getAuthUser(req) || { id: 'usr_anon', name: 'Analyst' };
  const { claim, supportingText, category, confidence, changeReason } = req.body;

  const ev = db.getEvidence(req.params.id);
  if (!ev || ev.workspaceId !== wsId) {
    return res.status(404).json({ error: 'Evidence item not found in this workspace' });
  }

  // Push previous version to history
  const history = ev.history || [];
  history.push({
    version: ev.version || 1,
    claim: ev.claim,
    supportingText: ev.supportingText,
    category: ev.category,
    confidence: ev.confidence,
    changedAt: new Date().toISOString(),
    changedBy: user.name,
    changeReason: changeReason || 'Manual analyst revision',
  });

  ev.claim = claim || ev.claim;
  ev.supportingText = supportingText || ev.supportingText;
  ev.category = category || ev.category;
  ev.confidence = confidence || ev.confidence;
  ev.version = (ev.version || 1) + 1;
  ev.history = history;

  db.saveEvidence(ev);

  db.recordAudit({
    workspaceId: wsId,
    researchJobId: ev.researchJobId,
    eventType: 'evidence_created',
    summary: `Updated evidence claim (v${ev.version}): "${ev.claim}"`,
  });

  res.json(ev);
});

// ----------------------------------------------------
// Workspace Members Management
// ----------------------------------------------------
apiRouter.put('/workspace/members/:id/role', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const user = getAuthUser(req) || { id: 'usr_anon', name: 'Admin' };
  const { role } = req.body;

  if (!role) return res.status(400).json({ error: 'New role is required' });

  const updated = db.updateMemberRole(req.params.id, wsId, role, user.name);
  if (!updated) return res.status(404).json({ error: 'Member not found in workspace' });
  res.json(updated);
});

apiRouter.delete('/workspace/members/:id', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const ok = db.deleteMember(req.params.id, wsId);
  if (!ok) return res.status(404).json({ error: 'Member not found' });
  res.json({ success: true });
});

// ----------------------------------------------------
// Workspace Usage & Metering
// ----------------------------------------------------
apiRouter.get('/workspace/usage', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const usage = db.getWorkspaceUsage(wsId);
  res.json(usage);
});

// ----------------------------------------------------
// Research Job Lifecycle: Duplicate, Archive, Pause, Compare, Export
// ----------------------------------------------------
apiRouter.post('/research/jobs/:id/duplicate', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const user = getAuthUser(req);
  const duplicated = db.duplicateResearchJob(req.params.id, wsId, user?.id);
  if (!duplicated) return res.status(404).json({ error: 'Job not found to duplicate' });
  res.json(duplicated);
});

apiRouter.post('/research/jobs/:id/archive', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const isArchived = req.body.isArchived !== false;
  const updated = db.archiveResearchJob(req.params.id, wsId, isArchived);
  if (!updated) return res.status(404).json({ error: 'Job not found' });
  res.json(updated);
});

apiRouter.post('/research/jobs/:id/pause', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const job = db.getResearchJob(req.params.id, wsId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  db.updateJobStatus(job.id, 'paused', 'Research paused by operator.');
  res.json({ success: true, status: 'paused' });
});

apiRouter.post('/research/jobs/:id/resume', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const job = db.getResearchJob(req.params.id, wsId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  db.updateJobStatus(job.id, 'researching', 'Resuming research execution...');
  try {
    const updatedJob = await researchService.runJob(job.id, wsId);
    res.json(updatedJob);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/research/jobs/:id/cancel', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const job = db.getResearchJob(req.params.id, wsId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  db.updateJobStatus(job.id, 'cancelled', 'Research cancelled by operator.');
  res.json({ success: true, status: 'cancelled' });
});

apiRouter.get('/research/jobs/:id/health', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const health = db.calculateResearchHealth(req.params.id, wsId);
  res.json(health);
});

apiRouter.get('/research/compare', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const { jobA, jobB } = req.query;
  if (!jobA || !jobB) {
    return res.status(400).json({ error: 'Query parameters jobA and jobB are required' });
  }
  try {
    const comparison = db.compareResearchRuns(jobA as string, jobB as string, wsId);
    res.json(comparison);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/research/jobs/:id/export', (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req);
  const format = (req.query.format as string) || 'markdown';
  const job = db.getResearchJob(req.params.id, wsId);
  if (!job) return res.status(404).json({ error: 'Research job not found' });

  const evidence = db.listEvidence(job.id);
  const intel = db.getIntelligenceByJobId(job.id);
  const brief = db.getCampaignBriefByJobId(job.id);

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${job.businessName.replace(/\s+/g, '_')}_report.json"`);
    return res.json({ job, evidence, intelligence: intel, campaignBrief: brief });
  }

  if (format === 'csv') {
    let csv = 'ID,Category,Claim,Source_Title,Source_URL,Confidence,Type\n';
    evidence.forEach(e => {
      csv += `"${e.id}","${e.category}","${(e.claim || '').replace(/"/g, '""')}","${(e.sourceTitle || '').replace(/"/g, '""')}","${e.sourceUrl}","${e.confidence}","${e.evidenceType}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${job.businessName.replace(/\s+/g, '_')}_evidence.csv"`);
    return res.send(csv);
  }

  // Markdown default
  let md = `# ResearchFlow Intelligence Brief: ${job.businessName}\n\n`;
  md += `**Objective**: ${job.campaignObjective}\n`;
  md += `**Target Audience**: ${job.targetAudience}\n`;
  md += `**Generated**: ${new Date().toISOString()}\n\n`;
  md += `## Key Strategic Positioning\n${brief?.executiveSummary || intel?.competitiveLandscape || 'No summary generated.'}\n\n`;
  md += `## Verified Evidence Claims (${evidence.length})\n`;
  evidence.forEach((e, idx) => {
    md += `\n### ${idx + 1}. [${e.category}] ${e.claim}\n`;
    md += `> "${e.supportingText}"\n\n`;
    md += `- Source: [${e.sourceTitle}](${e.sourceUrl})\n- Confidence: **${e.confidence}** (${e.evidenceType})\n`;
  });

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="${job.businessName.replace(/\s+/g, '_')}_brief.md"`);
  res.send(md);
});

// ----------------------------------------------------
// Automated Cross-Tenant Isolation Test Endpoint
// ----------------------------------------------------
apiRouter.post('/admin/test-cross-tenant-isolation', async (req: Request, res: Response) => {
  try {
    // 1. Create Tenant A
    const tenantAEmail = `test_tenant_a_${Date.now()}@isolation.test`;
    const authA = db.registerUser({ email: tenantAEmail, name: 'Tenant A Admin' });
    const wsA = db.createWorkspace({
      id: `ws_iso_a_${Date.now()}`,
      name: 'Tenant A Workspace',
      businessName: 'Tenant A Product',
      description: 'Private Workspace A',
      industry: 'Fintech',
      targetAudience: 'Bank Executives',
      ownerId: authA.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addMember({
      id: `mem_iso_a_${Date.now()}`,
      workspaceId: wsA.id,
      name: authA.user.name,
      email: authA.user.email,
      role: 'OWNER',
      title: 'CEO',
      department: 'Exec',
      joinedAt: new Date().toISOString(),
    });

    // 2. Create Tenant B
    const tenantBEmail = `test_tenant_b_${Date.now()}@isolation.test`;
    const authB = db.registerUser({ email: tenantBEmail, name: 'Tenant B Admin' });
    const wsB = db.createWorkspace({
      id: `ws_iso_b_${Date.now()}`,
      name: 'Tenant B Workspace',
      businessName: 'Tenant B Product',
      description: 'Private Workspace B',
      industry: 'Healthcare',
      targetAudience: 'Physicians',
      ownerId: authB.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.addMember({
      id: `mem_iso_b_${Date.now()}`,
      workspaceId: wsB.id,
      name: authB.user.name,
      email: authB.user.email,
      role: 'OWNER',
      title: 'CEO',
      department: 'Exec',
      joinedAt: new Date().toISOString(),
    });

    // 3. Create Job in Workspace A
    const jobA = researchService.createJob(
      {
        businessName: 'Private Fintech Research A1',
        businessDescription: 'Confidential Fintech Strategy',
        campaignObjective: 'Capture Enterprise Banks',
        targetAudience: 'CFOs',
        competitorUrls: ['https://stripe.com'],
        additionalUrls: [],
      },
      wsA.id
    );

    // 4. Create Job in Workspace B
    const jobB = researchService.createJob(
      {
        businessName: 'Private Healthcare Research B1',
        businessDescription: 'Confidential EHR Strategy',
        campaignObjective: 'Capture Clinics',
        targetAudience: 'Doctors',
        competitorUrls: ['https://epic.com'],
        additionalUrls: [],
      },
      wsB.id
    );

    // 5. Test Assertions
    const userAAuthForWsA = db.isUserAuthorizedForWorkspace(authA.user.id, wsA.id);
    const userAAuthForWsB = db.isUserAuthorizedForWorkspace(authA.user.id, wsB.id);

    const jobsInWsA = db.listResearchJobs(wsA.id);
    const jobsInWsB = db.listResearchJobs(wsB.id);

    const userACanSeeJobA = jobsInWsA.some(j => j.id === jobA.id);
    const userACanSeeJobB = jobsInWsA.some(j => j.id === jobB.id);

    const canDirectFetchCrossTenant = db.getResearchJob(jobB.id, wsA.id);

    const testPassed =
      userAAuthForWsA === true &&
      userAAuthForWsB === false &&
      userACanSeeJobA === true &&
      userACanSeeJobB === false &&
      canDirectFetchCrossTenant === undefined;

    res.json({
      success: testPassed,
      results: {
        testPassed,
        tenantA: { userId: authA.user.id, workspaceId: wsA.id, createdJobId: jobA.id },
        tenantB: { userId: authB.user.id, workspaceId: wsB.id, createdJobId: jobB.id },
        assertions: [
          { assertion: 'User A has access to Workspace A', passed: userAAuthForWsA === true },
          { assertion: 'User A is DENIED access to Workspace B', passed: userAAuthForWsB === false },
          { assertion: 'Workspace A listing contains Job A', passed: userACanSeeJobA === true },
          { assertion: 'Workspace A listing DOES NOT contain Job B', passed: userACanSeeJobB === false },
          { assertion: 'Direct fetch of Job B scoped to Workspace A returns undefined', passed: canDirectFetchCrossTenant === undefined },
        ],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Red-Team Counter-Strategy Simulation
// ---------------------------------------------------------------------------
apiRouter.post('/campaigns/:id/red-team', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req, res);
  const briefId = req.params.id;

  try {
    const brief = db.getCampaignBrief(briefId);
    if (!brief || brief.workspaceId !== wsId) {
      return res.status(404).json({ error: 'Campaign brief not found' });
    }

    const job = db.getResearchJob(brief.researchJobId, wsId);
    if (!job) {
      return res.status(404).json({ error: 'Associated research job not found' });
    }

    const evidence = db.listEvidence(job.id);
    const intel = db.getIntelligence(job.id);

    const simulation = await geminiAIService.generateRedTeamAnalysis({
      businessName: job.businessName,
      targetAudience: job.targetAudience,
      campaignAngle: brief.campaignAngle,
      primaryMessage: brief.primaryMessage,
      evidence,
      intelligence: intel,
    });

    const record = {
      id: `rt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      researchJobId: job.id,
      competitorName: job.businessName,
      ...simulation,
      generatedAt: new Date().toISOString(),
    };

    db.recordAudit({
      workspaceId: wsId,
      researchJobId: job.id,
      eventType: 'ai_run_completed',
      summary: `Executed AI Red-Team Counter-Strategy Simulation (Vulnerability: ${simulation.vulnerabilityLevel})`,
    });

    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Competitor Battlecard Generation
// ---------------------------------------------------------------------------
apiRouter.post('/intelligence/:jobId/battlecard', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req, res);
  const jobId = req.params.jobId;

  try {
    const job = db.getResearchJob(jobId, wsId);
    if (!job) {
      return res.status(404).json({ error: 'Research job not found' });
    }

    const competitorName = req.body.competitorName || job.businessName;
    const evidence = db.listEvidence(job.id);
    const intel = db.getIntelligence(job.id);

    const battlecard = await geminiAIService.generateBattlecard({
      competitorName,
      targetAudience: job.targetAudience,
      evidence,
      intelligence: intel,
    });

    const fullBattlecard = {
      id: `bc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      competitorName,
      targetAudience: job.targetAudience,
      ...battlecard,
      evidenceIds: evidence.slice(0, 5).map((e) => e.id),
      generatedAt: new Date().toISOString(),
    };

    db.recordAudit({
      workspaceId: wsId,
      researchJobId: job.id,
      eventType: 'ai_run_completed',
      summary: `Generated Tactical Sales Battlecard against "${competitorName}"`,
    });

    res.json(fullBattlecard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Perceptual Matrix & White-Space Detection
// ---------------------------------------------------------------------------
apiRouter.get('/intelligence/:jobId/matrix', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req, res);
  const jobId = req.params.jobId;

  try {
    const job = db.getResearchJob(jobId, wsId);
    if (!job) {
      return res.status(404).json({ error: 'Research job not found' });
    }

    const sources = db.listSources(jobId);
    const evidence = db.listEvidence(jobId);

    const xAxis = (req.query.xAxis as string) || 'Enterprise Readiness & Security';
    const yAxis = (req.query.yAxis as string) || 'Value & ROI Efficiency';

    const matrix = await geminiAIService.calculatePerceptualMatrix({
      businessName: job.businessName,
      sources,
      evidence,
      xAxisLabel: xAxis,
      yAxisLabel: yAxis,
    });

    res.json(matrix);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/intelligence/:jobId/matrix/recalculate', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req, res);
  const jobId = req.params.jobId;
  const { xAxisLabel, yAxisLabel } = req.body;

  try {
    const job = db.getResearchJob(jobId, wsId);
    if (!job) {
      return res.status(404).json({ error: 'Research job not found' });
    }

    const sources = db.listSources(jobId);
    const evidence = db.listEvidence(jobId);

    const matrix = await geminiAIService.calculatePerceptualMatrix({
      businessName: job.businessName,
      sources,
      evidence,
      xAxisLabel: xAxisLabel || 'Enterprise Scale',
      yAxisLabel: yAxisLabel || 'Cost & Speed Efficiency',
    });

    res.json(matrix);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Audio Executive Briefing Script & Metadata
// ---------------------------------------------------------------------------
apiRouter.get('/intelligence/:jobId/audio-briefing', async (req: Request, res: Response) => {
  const wsId = getWorkspaceId(req, res);
  const jobId = req.params.jobId;

  try {
    const job = db.getResearchJob(jobId, wsId);
    if (!job) {
      return res.status(404).json({ error: 'Research job not found' });
    }

    const intel = db.getIntelligence(jobId);
    const brief = db.getCampaignBriefByJobId(jobId);
    const evidence = db.listEvidence(jobId);

    const scriptSections = [
      {
        title: 'Executive Overview',
        text: `Welcome to your ResearchFlow AI competitive briefing for ${job.businessName}. We have processed ${evidence.length} verified evidence points regarding ${job.campaignObjective}.`,
      },
      {
        title: 'Market Landscape & Key Gaps',
        text: intel?.competitiveLandscape || 'Competitors exhibit standard market offerings with critical tier friction.',
      },
      {
        title: 'Campaign Strategic Positioning',
        text: brief?.primaryMessage ? `The recommended lead messaging angle is: "${brief.primaryMessage}". Supporting evidence indicates strong customer demand for predictable, transparent pricing.` : 'Direct challenger angle recommended.',
      },
      {
        title: 'High-Impact Opportunities',
        text: intel?.marketOpportunities?.length ? `Top opportunity: ${intel.marketOpportunities[0].title}. ${intel.marketOpportunities[0].recommendedAction}` : 'Capitalize on unbundling complex competitor tiers.',
      },
    ];

    const fullScript = scriptSections.map((s) => `${s.title}. ${s.text}`).join(' ');

    res.json({
      jobId,
      businessName: job.businessName,
      sections: scriptSections,
      fullScript,
      estimatedDurationSeconds: Math.ceil(fullScript.split(' ').length / 2.5),
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

