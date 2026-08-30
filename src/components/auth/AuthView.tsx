import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Sparkles, Shield, ArrowRight, Lock, Mail, User, Building, Compass, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export const AuthView: React.FC = () => {
  const { login, signup, googleLogin, enterDemoMode, addToast } = useWorkspace();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Login / Signup Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Signup Onboarding Fields (Optional quick start)
  const [workspaceName, setWorkspaceName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('B2B SaaS / Growth');
  
  // Password Reset
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [generatedTokenPreview, setGeneratedTokenPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your email.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password.trim() || undefined);
    } catch (err: any) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      addToast('Please provide your name and email.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password: password.trim() || undefined,
        name: name.trim(),
        workspaceName: workspaceName.trim() || undefined,
        businessName: businessName.trim() || undefined,
        industry: industry.trim() || undefined,
      });
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOneClick = async () => {
    setLoading(true);
    try {
      await googleLogin('founder@growthlabs.io', 'Alex Chen');
    } catch (err: any) {
      addToast(err.message || 'Google sign in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your registered email.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setResetSent(true);
      if (res.resetToken) {
        setGeneratedTokenPreview(res.resetToken);
        setResetToken(res.resetToken);
      }
      addToast('Password reset token generated.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to request reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword.trim()) {
      addToast('Please enter the token and your new password.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(resetToken.trim(), newPassword.trim());
      addToast('Password reset successful! You can now log in.', 'success');
      setMode('login');
      setResetSent(false);
      setGeneratedTokenPreview(null);
    } catch (err: any) {
      addToast(err.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Background glow styling */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">ResearchFlow <span className="text-indigo-400 font-mono text-sm uppercase px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 ml-1">Enterprise</span></span>
        </div>

        <h2 className="text-center text-xl font-semibold text-slate-200">
          {mode === 'login' && 'Sign in to your Research Workspace'}
          {mode === 'signup' && 'Create your Founder Account'}
          {mode === 'forgot' && 'Reset your Account Password'}
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Autonomous competitive intelligence, grounded evidence & GTM execution
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800 backdrop-blur-md">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-800 mb-6 pb-2">
            <button
              onClick={() => { setMode('login'); setResetSent(false); }}
              className={`flex-1 text-center pb-2 text-sm font-medium transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setResetSent(false); }}
              className={`flex-1 text-center pb-2 text-sm font-medium transition-colors border-b-2 ${
                mode === 'signup'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick Sign-In Option */}
          {mode !== 'forgot' && (
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleOneClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-sm font-medium text-slate-200 transition-all shadow-sm hover:border-slate-600 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.1 0 12s.6 3.6 1.6 5.6l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                  />
                </svg>
                Continue with Google / 1-Click Founder ID
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider font-mono">or email credentials</span>
              </div>
            </div>
          )}

          {/* Mode: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@researchflow.ai"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode: Sign Up */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@growthlabs.io"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block mb-2">Initial Workspace (Optional)</span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Company / Workspace Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="Acme Growth Labs"
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Product / Brand Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="NextGen Resume AI"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Workspace...' : 'Create Account & Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode: Forgot Password */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {!resetSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Enter your email address to generate a secure reset token.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@researchflow.ai"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Generating Token...' : 'Generate Reset Token'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <span>Reset token generated.</span>
                      {generatedTokenPreview && (
                        <div className="mt-1 font-mono text-[11px] bg-slate-900 px-2 py-1 rounded select-all text-slate-200">
                          {generatedTokenPreview}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Reset Token</label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste reset token here"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Updating Password...' : 'Confirm New Password'}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 pt-2"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Direct Demo Sandbox Explorer */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col items-center">
            <button
              type="button"
              onClick={enterDemoMode}
              className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-950/80 px-3 py-1.5 rounded-full border border-indigo-800/50 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Instant Demo Sandbox (NextGen Resume AI)</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>PBKDF2 SHA-512 Encrypted Credential Vault & Multi-Tenant Data Isolation</span>
        </div>
      </div>
    </div>
  );
};
