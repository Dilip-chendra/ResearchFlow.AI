import { neon } from '@neondatabase/serverless';
import { logger } from '../utils/logger';
import { User, Workspace, WorkspaceMember } from '../types';
import { UserAccount, UserSession } from './store';

export class NeonDatabaseAdapter {
  private sql: ReturnType<typeof neon> | null = null;
  private isInitialized = false;

  constructor() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (dbUrl) {
      try {
        this.sql = neon(dbUrl);
        logger.info('[NEON] Connected to Neon Serverless PostgreSQL');
      } catch (err: any) {
        logger.warn('[NEON] Failed to initialize Neon client:', err.message);
      }
    } else {
      logger.info('[NEON] No DATABASE_URL found; operating in file/memory mode.');
    }
  }

  public isAvailable(): boolean {
    return this.sql !== null;
  }

  /**
   * Initializes PostgreSQL schema tables if they do not exist.
   */
  public async ensureSchema(): Promise<void> {
    if (!this.sql || this.isInitialized) return;

    try {
      await this.sql`
        CREATE TABLE IF NOT EXISTS app_users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          display_name TEXT,
          avatar_type TEXT,
          avatar_value TEXT,
          avatar_url TEXT,
          profile_image_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await this.sql`
        CREATE TABLE IF NOT EXISTS app_user_accounts (
          email TEXT PRIMARY KEY,
          id TEXT NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          reset_token TEXT,
          reset_token_expires BIGINT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await this.sql`
        CREATE TABLE IF NOT EXISTS app_workspaces (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          business_name TEXT,
          description TEXT,
          industry TEXT,
          target_audience TEXT,
          owner_id TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await this.sql`
        CREATE TABLE IF NOT EXISTS app_workspace_members (
          id TEXT PRIMARY KEY,
          workspace_id TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          role TEXT NOT NULL,
          title TEXT,
          department TEXT,
          joined_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await this.sql`
        CREATE TABLE IF NOT EXISTS app_sessions (
          token TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL
        )
      `;
      this.isInitialized = true;
      logger.info('[NEON] PostgreSQL schema initialized successfully.');
    } catch (err: any) {
      logger.warn('[NEON] Error initializing PostgreSQL schema:', err.message);
    }
  }

  /**
   * Loads all persistent user and account records from Neon Postgres into memory.
   */
  public async loadInitialRecords(): Promise<{
    users: User[];
    accounts: UserAccount[];
    workspaces: Workspace[];
    members: WorkspaceMember[];
  }> {
    if (!this.sql) return { users: [], accounts: [], workspaces: [], members: [] };

    try {
      await this.ensureSchema();

      const [usersRows, accountsRows, workspacesRows, membersRows] = (await Promise.all([
        this.sql`SELECT * FROM app_users`,
        this.sql`SELECT * FROM app_user_accounts`,
        this.sql`SELECT * FROM app_workspaces`,
        this.sql`SELECT * FROM app_workspace_members`,
      ])) as [any[], any[], any[], any[]];

      const users: User[] = usersRows.map((r: any) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        displayName: r.display_name,
        avatarType: r.avatar_type || 'INITIALS',
        avatarValue: r.avatar_value,
        avatarUrl: r.avatar_url || '',
        profileImageUrl: r.profile_image_url || '',
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
      }));

      const accounts: UserAccount[] = accountsRows.map((r: any) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        passwordHash: r.password_hash,
        salt: r.salt,
        resetToken: r.reset_token || undefined,
        resetTokenExpires: r.reset_token_expires ? Number(r.reset_token_expires) : undefined,
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
      }));

      const workspaces: Workspace[] = workspacesRows.map((r: any) => ({
        id: r.id,
        name: r.name,
        businessName: r.business_name,
        description: r.description,
        industry: r.industry,
        targetAudience: r.target_audience,
        ownerId: r.owner_id,
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
      }));

      const members: WorkspaceMember[] = membersRows.map((r: any) => ({
        id: r.id,
        workspaceId: r.workspace_id,
        name: r.name,
        email: r.email,
        role: r.role,
        title: r.title,
        department: r.department,
        joinedAt: new Date(r.joined_at).toISOString(),
      }));

      logger.info(`[NEON] Loaded ${users.length} users and ${workspaces.length} workspaces from Postgres.`);
      return { users, accounts, workspaces, members };
    } catch (err: any) {
      logger.warn('[NEON] Failed to fetch initial records from Postgres:', err.message);
      return { users: [], accounts: [], workspaces: [], members: [] };
    }
  }

  /**
   * Persists a user and user account record to Neon Postgres.
   */
  public async saveUserAndAccount(user: User, account: UserAccount): Promise<void> {
    if (!this.sql) return;

    try {
      await this.ensureSchema();
      await this.sql`
        INSERT INTO app_users (id, email, name, display_name, avatar_type, avatar_value, avatar_url, profile_image_url, created_at, updated_at)
        VALUES (${user.id}, ${user.email}, ${user.name}, ${user.displayName || user.name}, ${user.avatarType || 'INITIALS'}, ${user.avatarValue || ''}, ${user.avatarUrl || ''}, ${user.profileImageUrl || ''}, ${user.createdAt}, ${user.updatedAt || user.createdAt})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          display_name = EXCLUDED.display_name,
          avatar_type = EXCLUDED.avatar_type,
          avatar_value = EXCLUDED.avatar_value,
          avatar_url = EXCLUDED.avatar_url,
          profile_image_url = EXCLUDED.profile_image_url,
          updated_at = NOW()
      `;

      await this.sql`
        INSERT INTO app_user_accounts (email, id, name, password_hash, salt, reset_token, reset_token_expires, created_at, updated_at)
        VALUES (${account.email.toLowerCase().trim()}, ${account.id}, ${account.name}, ${account.passwordHash}, ${account.salt}, ${account.resetToken || null}, ${account.resetTokenExpires || null}, ${account.createdAt}, ${account.updatedAt || account.createdAt})
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          salt = EXCLUDED.salt,
          reset_token = EXCLUDED.reset_token,
          reset_token_expires = EXCLUDED.reset_token_expires,
          name = EXCLUDED.name,
          updated_at = NOW()
      `;
    } catch (err: any) {
      logger.warn('[NEON] Failed to save user and account to Postgres:', err.message);
    }
  }

  /**
   * Updates an account's password hash and salt in Neon Postgres.
   */
  public async updateAccountPassword(email: string, passwordHash: string, salt: string): Promise<void> {
    if (!this.sql) return;

    try {
      await this.ensureSchema();
      await this.sql`
        UPDATE app_user_accounts
        SET password_hash = ${passwordHash},
            salt = ${salt},
            reset_token = NULL,
            reset_token_expires = NULL,
            updated_at = NOW()
        WHERE email = ${email.toLowerCase().trim()}
      `;
    } catch (err: any) {
      logger.warn('[NEON] Failed to update password in Postgres:', err.message);
    }
  }

  /**
   * Updates a password reset token in Neon Postgres.
   */
  public async saveResetToken(email: string, token: string, expiresAt: number): Promise<void> {
    if (!this.sql) return;

    try {
      await this.ensureSchema();
      await this.sql`
        UPDATE app_user_accounts
        SET reset_token = ${token},
            reset_token_expires = ${expiresAt},
            updated_at = NOW()
        WHERE email = ${email.toLowerCase().trim()}
      `;
    } catch (err: any) {
      logger.warn('[NEON] Failed to save reset token to Postgres:', err.message);
    }
  }

  /**
   * Persists a workspace to Neon Postgres.
   */
  public async saveWorkspace(ws: Workspace): Promise<void> {
    if (!this.sql) return;

    try {
      await this.ensureSchema();
      await this.sql`
        INSERT INTO app_workspaces (id, name, business_name, description, industry, target_audience, owner_id, created_at, updated_at)
        VALUES (${ws.id}, ${ws.name}, ${ws.businessName || ''}, ${ws.description || ''}, ${ws.industry || ''}, ${ws.targetAudience || ''}, ${ws.ownerId}, ${ws.createdAt}, ${ws.updatedAt || ws.createdAt})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          business_name = EXCLUDED.business_name,
          description = EXCLUDED.description,
          industry = EXCLUDED.industry,
          target_audience = EXCLUDED.target_audience,
          updated_at = NOW()
      `;
    } catch (err: any) {
      logger.warn('[NEON] Failed to save workspace to Postgres:', err.message);
    }
  }

  /**
   * Persists a workspace member to Neon Postgres.
   */
  public async saveMember(m: WorkspaceMember): Promise<void> {
    if (!this.sql) return;

    try {
      await this.ensureSchema();
      await this.sql`
        INSERT INTO app_workspace_members (id, workspace_id, name, email, role, title, department, joined_at)
        VALUES (${m.id}, ${m.workspaceId}, ${m.name}, ${m.email}, ${m.role}, ${m.title || ''}, ${m.department || ''}, ${m.joinedAt})
        ON CONFLICT (id) DO NOTHING
      `;
    } catch (err: any) {
      logger.warn('[NEON] Failed to save member to Postgres:', err.message);
    }
  }

  /**
   * Fetches a single user account and user by email from Neon Postgres.
   */
  public async getUserAccountByEmail(email: string): Promise<{ user?: User; account?: UserAccount } | null> {
    if (!this.sql) return null;
    try {
      await this.ensureSchema();
      const normalizedEmail = email.toLowerCase().trim();
      const accounts = (await this.sql`
        SELECT * FROM app_user_accounts WHERE LOWER(TRIM(email)) = ${normalizedEmail} LIMIT 1
      `) as any[];
      if (!accounts || accounts.length === 0) return null;
      const accRow = accounts[0];
      const account: UserAccount = {
        id: accRow.id,
        email: accRow.email,
        name: accRow.name,
        passwordHash: accRow.password_hash,
        salt: accRow.salt,
        resetToken: accRow.reset_token || undefined,
        resetTokenExpires: accRow.reset_token_expires ? Number(accRow.reset_token_expires) : undefined,
        createdAt: new Date(accRow.created_at).toISOString(),
        updatedAt: new Date(accRow.updated_at).toISOString(),
      };

      const users = (await this.sql`
        SELECT * FROM app_users WHERE id = ${account.id} LIMIT 1
      `) as any[];
      let user: User | undefined;
      if (users && users.length > 0) {
        const uRow = users[0];
        user = {
          id: uRow.id,
          email: uRow.email,
          name: uRow.name,
          displayName: uRow.display_name,
          avatarType: uRow.avatar_type || 'INITIALS',
          avatarValue: uRow.avatar_value,
          avatarUrl: uRow.avatar_url || '',
          profileImageUrl: uRow.profile_image_url || '',
          createdAt: new Date(uRow.created_at).toISOString(),
          updatedAt: new Date(uRow.updated_at).toISOString(),
        };
      }
      return { user, account };
    } catch (err: any) {
      logger.warn('[NEON] Failed to fetch account by email from Postgres:', err.message);
      return null;
    }
  }

  /**
   * Fetches account by password reset token.
   */
  public async getAccountByResetToken(token: string): Promise<{ user?: User; account?: UserAccount } | null> {
    if (!this.sql) return null;
    try {
      await this.ensureSchema();
      const accounts = (await this.sql`
        SELECT * FROM app_user_accounts WHERE reset_token = ${token.trim()} LIMIT 1
      `) as any[];
      if (!accounts || accounts.length === 0) return null;
      const accRow = accounts[0];
      const account: UserAccount = {
        id: accRow.id,
        email: accRow.email,
        name: accRow.name,
        passwordHash: accRow.password_hash,
        salt: accRow.salt,
        resetToken: accRow.reset_token || undefined,
        resetTokenExpires: accRow.reset_token_expires ? Number(accRow.reset_token_expires) : undefined,
        createdAt: new Date(accRow.created_at).toISOString(),
        updatedAt: new Date(accRow.updated_at).toISOString(),
      };

      const users = (await this.sql`
        SELECT * FROM app_users WHERE id = ${account.id} LIMIT 1
      `) as any[];
      let user: User | undefined;
      if (users && users.length > 0) {
        const uRow = users[0];
        user = {
          id: uRow.id,
          email: uRow.email,
          name: uRow.name,
          displayName: uRow.display_name,
          avatarType: uRow.avatar_type || 'INITIALS',
          avatarValue: uRow.avatar_value,
          avatarUrl: uRow.avatar_url || '',
          profileImageUrl: uRow.profile_image_url || '',
          createdAt: new Date(uRow.created_at).toISOString(),
          updatedAt: new Date(uRow.updated_at).toISOString(),
        };
      }
      return { user, account };
    } catch (err: any) {
      logger.warn('[NEON] Failed to fetch account by reset token from Postgres:', err.message);
      return null;
    }
  }

  /**
   * Fetches workspaces and members for a given user.
   */
  public async getWorkspacesAndMembersForUser(userId: string): Promise<{ workspaces: Workspace[]; members: WorkspaceMember[] }> {
    if (!this.sql) return { workspaces: [], members: [] };
    try {
      await this.ensureSchema();
      const [wsRows, memRows] = (await Promise.all([
        this.sql`SELECT * FROM app_workspaces WHERE owner_id = ${userId}`,
        this.sql`SELECT * FROM app_workspace_members WHERE workspace_id IN (SELECT id FROM app_workspaces WHERE owner_id = ${userId})`,
      ])) as [any[], any[]];

      const workspaces: Workspace[] = wsRows.map((r: any) => ({
        id: r.id,
        name: r.name,
        businessName: r.business_name,
        description: r.description,
        industry: r.industry,
        targetAudience: r.target_audience,
        ownerId: r.owner_id,
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
      }));

      const members: WorkspaceMember[] = memRows.map((r: any) => ({
        id: r.id,
        workspaceId: r.workspace_id,
        name: r.name,
        email: r.email,
        role: r.role,
        title: r.title,
        department: r.department,
        joinedAt: new Date(r.joined_at).toISOString(),
      }));

      return { workspaces, members };
    } catch (err: any) {
      logger.warn('[NEON] Failed to fetch workspaces for user from Postgres:', err.message);
      return { workspaces: [], members: [] };
    }
  }
}

export const neonAdapter = new NeonDatabaseAdapter();
