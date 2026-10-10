import { logger } from '../utils/logger';

export class EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'ResearchFlow AI <onboarding@resend.dev>';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().startsWith('re_'));
  }

  /**
   * Dispatches a branded password reset email via Resend.
   */
  public async sendPasswordResetEmail(params: {
    to: string;
    resetToken: string;
    userName?: string;
    origin?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      logger.warn('[EMAIL] Resend API key is not configured; skipping email dispatch.');
      return { success: false, error: 'Email service is not configured' };
    }

    const { to, resetToken, userName = 'Founder', origin } = params;
    const baseUrl = origin || process.env.APP_URL || 'https://research-flow-ai-nine.vercel.app';
    const resetUrl = `${baseUrl}/?mode=forgot&token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(to)}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset your ResearchFlow AI Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 36px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
    
    <!-- Header with Brand Logo -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; padding: 10px 14px; background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.05)); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px;">
        <span style="font-size: 20px; font-weight: 700; background: linear-gradient(135deg, #fcd34d, #f59e0b, #d97706); -webkit-background-clip: text; color: #f59e0b; letter-spacing: -0.5px;">
          ResearchFlow AI
        </span>
      </div>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">Autonomous Market Intelligence & Strategy</p>
    </div>

    <!-- Message -->
    <h1 style="font-size: 20px; font-weight: 600; color: #f8fafc; margin: 0 0 16px 0; text-align: center;">
      Reset your Password
    </h1>
    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 24px 0;">
      Hello ${userName},
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 28px 0;">
      We received a request to reset your ResearchFlow AI password. Click the button below to set a new password:
    </p>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">
        Reset Password
      </a>
    </div>

    <!-- Reset Token Fallback -->
    <div style="margin: 28px 0; padding: 14px; background-color: #020617; border: 1px solid #334155; border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">
        Your Direct Reset Token:
      </p>
      <code style="font-family: monospace; font-size: 13px; color: #38bdf8; word-break: break-all;">
        ${resetToken}
      </code>
    </div>

    <!-- Security Footnote -->
    <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 28px 0 0 0; border-top: 1px solid #1e293b; padding-top: 20px;">
      This password reset link is valid for <strong>1 hour</strong>. If you did not request this password reset, you can safely ignore this email and your account password will remain unchanged.
    </p>
  </div>

  <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #475569;">
    &copy; ${new Date().getFullYear()} ResearchFlow AI. Built for high-growth founders and strategists.
  </div>
</body>
</html>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject: 'Reset your ResearchFlow AI password',
          html: htmlContent,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        logger.warn('[EMAIL] Resend returned error:', data);
        return { success: false, error: data.message || 'Failed to deliver email' };
      }

      logger.info(`[EMAIL] Password reset email sent via Resend to ${to} (ID: ${data.id})`);
      return { success: true, messageId: data.id };
    } catch (err: any) {
      logger.error('[EMAIL] Failed to dispatch email via Resend:', err.message);
      return { success: false, error: err.message };
    }
  }
}

export const emailService = new EmailService();
