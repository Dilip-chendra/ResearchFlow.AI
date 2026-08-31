# ResearchFlow AI — Route & Action Inventory Audit

**Audit Date**: August 31, 2026  
**Auditor**: Principal Systems Engineer & QA Lead  
**Status**: 100% Verified & Tested  

---

## 1. Frontend Route & View Inventory

| View ID | Route / View Name | Access Level | Auth Required | Data Source | Primary User Actions | Test Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `landing` | Public Landing Page | Public | No | Static & Client State | "Start Researching", "Explore Live Benchmark Demo", "Login / Sign Up", Interactive Architecture Walkthrough | PASS |
| `login` | Authentication Portal | Public | No | `/api/auth/login` | Email/Password login, Quick Demo Founder login, Password recovery modal toggle | PASS |
| `signup` | Founder Registration | Public | No | `/api/auth/register` | Account registration, Workspace initialization, Auto-login token exchange | PASS |
| `overview` | Executive Intelligence Hub | Authenticated | Yes (JWT/Tok) | `/api/workspaces/:id`, `/api/ai/executive-summary`, `/api/tasks` | Quickstart Onboarding (Fresh), Live Gemini Executive Summary, Recharts Category Breakdown, Sprint Task Counter | PASS |
| `research` | Competitor Research Hub | Authenticated | Yes | `/api/research/jobs`, `/api/research/jobs/:id` | Launch `+ New Research Job`, Live Progress Stepper, View Extracted Claims, Restart / Retry Job | PASS |
| `evidence` | Grounded Evidence Repository | Authenticated | Yes | `/api/evidence` | Search claims, Filter by Category (Pricing, Gaps, Strengths), Inspect Source URL and Confidence Score | PASS |
| `campaigns` | Campaign Studio & Approvals | Authenticated | Yes | `/api/campaigns/:id`, `/api/campaigns/:id/decision` | Review LinkedIn, Email, SEO Drafts, Copy Asset to Clipboard, Founder Approval / Rejection Gate with Feedback Notes | PASS |
| `tasks` | 5-Day Sprint Task Board | Authenticated | Yes | `/api/tasks` | Create Sprint Task, Toggle Status (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`), Filter by Priority & Lineage | PASS |
| `evaluation` | 12-TC Reliability Suite | Authenticated | Yes | `/api/evaluation/cases`, `/api/evaluation/run` | Execute individual / batch adversarial test cases (TC01–TC12), View latency, quality, and human intervention scorecards | PASS |
| `audit` | Immutable System Audit Trail | Authenticated | Yes | `/api/audit` | Filter by Event Type (`research_started`, `approval_recorded`, `ai_repair`), Chronological Actor Attribution | PASS |
| `settings` | Workspace Settings & RBAC | Authenticated | Yes | `/api/workspaces/:id/members` | Update Business Name/Audience, Manage Team Members (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`), Switch AI Routing Mode | PASS |

---

## 2. Backend REST API Endpoints Inventory

| HTTP Method | Endpoint Path | Authentication | Authorization Scope | Primary Function | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | None | Create user, salt/hash password, issue session token | PASS |
| `POST` | `/api/auth/login` | Public | None | Verify password hash, issue session token | PASS |
| `POST` | `/api/auth/logout` | Authenticated | Current Session | Invalidate session token from persistent store | PASS |
| `GET` | `/api/auth/me` | Authenticated | Current User | Retrieve current user profile and active workspace list | PASS |
| `POST` | `/api/auth/reset-password` | Public | None | Generate time-bounded 1h reset token | PASS |
| `GET` | `/api/workspaces` | Authenticated | User Scoped | List all workspaces owned by or joined by current user | PASS |
| `POST` | `/api/workspaces` | Authenticated | Current User | Create a new isolated workspace entity | PASS |
| `GET` | `/api/workspaces/:id` | Authenticated | IDOR Gated | Retrieve workspace metadata if authorized | PASS |
| `PATCH` | `/api/workspaces/:id` | Authenticated | `OWNER` / `ADMIN` | Update business name, description, and audience | PASS |
| `GET` | `/api/workspaces/:id/members` | Authenticated | Workspace Scoped | List all team members and their RBAC roles | PASS |
| `POST` | `/api/workspaces/:id/members` | Authenticated | `OWNER` / `ADMIN` | Invite / add a new member to workspace | PASS |
| `GET` | `/api/research/jobs` | Authenticated | Workspace Scoped | List all competitor research jobs for workspace | PASS |
| `POST` | `/api/research/jobs` | Authenticated | Workspace Scoped | Create a new research job with 1–5 competitor URLs | PASS |
| `GET` | `/api/research/jobs/:id` | Authenticated | IDOR Gated | Retrieve full research job with sources and claims | PASS |
| `POST` | `/api/research/jobs/:id/run` | Authenticated | IDOR Gated | Execute crawler $\rightarrow$ synthesis $\rightarrow$ campaign pipeline | PASS |
| `DELETE` | `/api/research/jobs/:id` | Authenticated | `OWNER` / `ADMIN` | Cascade delete job, sources, claims, and assets | PASS |
| `GET` | `/api/research/jobs/:id/export` | Authenticated | IDOR Gated | Export report in Markdown, CSV, or JSON format | PASS |
| `GET` | `/api/evidence` | Authenticated | Workspace Scoped | List all verified claims extracted across all workspace jobs | PASS |
| `GET` | `/api/campaigns/:id` | Authenticated | IDOR Gated | Retrieve campaign brief and channel drafts | PASS |
| `POST` | `/api/campaigns/:id/decision` | Authenticated | IDOR Gated | Record founder approval / rejection decision with audit log | PASS |
| `GET` | `/api/tasks` | Authenticated | Workspace Scoped | Retrieve 5-day sprint task checklist | PASS |
| `POST` | `/api/tasks` | Authenticated | Workspace Scoped | Create a new task with lineage back to evidence | PASS |
| `PATCH` | `/api/tasks/:id` | Authenticated | IDOR Gated | Update task status or priority | PASS |
| `GET` | `/api/evaluation/cases` | Authenticated | Workspace Scoped | List 12 adversarial test cases (TC01–TC12) | PASS |
| `POST` | `/api/evaluation/run` | Authenticated | Workspace Scoped | Execute test cases and return quality & latency scorecard | PASS |
| `GET` | `/api/audit` | Authenticated | Workspace Scoped | Retrieve immutable chronological audit events | PASS |
| `GET` | `/api/notifications` | Authenticated | Workspace Scoped | Retrieve notifications list | PASS |
| `PATCH` | `/api/notifications/:id/read`| Authenticated | IDOR Gated | Mark single notification as read | PASS |
| `POST` | `/api/search` | Authenticated | Workspace Scoped | Unified multi-entity search across jobs, claims, and tasks | PASS |
| `POST` | `/api/demo/seed` | Authenticated | Workspace Scoped | Populate NextGen Resume AI benchmark scenario | PASS |
| `GET` | `/api/ai/executive-summary` | Authenticated | Workspace Scoped | Generate live Gemini 3.7 Flash briefing from workspace evidence | PASS |
| `GET` | `/api/health` | Public | None | Return `{ status: "ok", uptime, version }` | PASS |

---

## 3. UI Controls & Dead Button Audit

Every button, link, and modal control in the frontend was audited for event listeners, API connectivity, and visual state response:
- **`+ New Research Job`**: Opens modal, validates 1–5 URLs, launches crawler, redirects to live pipeline visualizer.
- **`Load Sample Job`**: Seeds NextGen Resume AI benchmark, updates active workspace, navigates to research job.
- **`Run Evaluation (12 TCs)`**: Executes evaluation suite and displays live passing scorecards.
- **`Approve Strategy` / `Reject`**: Prompts for feedback notes, updates database, records audit event, unlocks sprint tasks.
- **`Copy to Clipboard`**: Copies formatted Markdown channel drafts with toast notification.
- **`Download Report` (MD / CSV / JSON)**: Triggers authenticated browser attachment download.
- **`Mark as Read` (Notifications)**: Updates database read status and decrements badge counter.
- **`Switch Workspace`**: Changes active tenant context, flushes React state, reloads workspace-isolated data.
- **`Logout`**: Invalidates session token, cleans client state, redirects cleanly to public landing page.

**Dead Control Count**: 0
