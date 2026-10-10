import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { BillingTransaction } from '../../types';
import {
  CreditCard,
  Sparkles,
  Zap,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  Cpu,
  KeyRound,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';

export const BillingSettingsTab: React.FC = () => {
  const {
    subscription,
    subscriptionPlan,
    quotaUsage,
    refreshSubscription,
    setIsPricingModalOpen,
    addToast,
  } = useWorkspace();

  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    setLoadingTx(true);
    try {
      const res = await api.getBillingTransactions();
      if (res.success) {
        setTransactions(res.transactions);
      }
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSubscription();
      await fetchTransactions();
      addToast('Billing status and quotas refreshed.', 'success');
    } finally {
      setRefreshing(false);
    }
  };

  // Quota percentages
  const runsLimit = subscriptionPlan?.quotas.monthlyResearchRuns || 2;
  const runsUsed = quotaUsage?.researchRunsUsed || 0;
  const runsPct = Math.min(Math.round((runsUsed / runsLimit) * 100), 100);

  const crawlsLimit = subscriptionPlan?.quotas.monthlyCompetitorCrawls || 5;
  const crawlsUsed = quotaUsage?.competitorCrawlsUsed || 0;
  const crawlsPct = Math.min(Math.round((crawlsUsed / crawlsLimit) * 100), 100);

  const isBYOK = subscriptionPlan?.aiMode === 'BYOK';
  const tokensLimit = subscriptionPlan?.quotas.monthlyAITokens || 50000;
  const tokensUsed = quotaUsage?.aiTokensUsed || 0;
  const tokensPct = Math.min(Math.round((tokensUsed / tokensLimit) * 100), 100);

  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-zinc-900 text-white shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold tracking-wide uppercase mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Active Subscription Tier</span>
          </div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>{subscriptionPlan?.name || 'Free Community'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                subscription?.status === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {subscription?.status || 'ACTIVE'}
            </span>
          </h3>
          <p className="text-xs text-zinc-300 mt-1">
            Billing Cycle: {subscription?.interval === 'YEARLY' ? 'Annual' : 'Monthly'} · Renews{' '}
            {renewalDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Usage</span>
          </button>
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>Change Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quota Usage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Research Runs Meter */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Research Runs</span>
            </span>
            <span className="font-mono text-zinc-900 font-bold">
              {runsUsed} / {runsLimit}
            </span>
          </div>

          <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                runsPct > 90 ? 'bg-rose-500' : runsPct > 70 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${runsPct}%` }}
            />
          </div>

          <p className="text-[11px] text-zinc-500 leading-tight">
            {runsLimit - runsUsed > 0
              ? `${runsLimit - runsUsed} runs remaining this billing month.`
              : 'Monthly limit reached. Upgrade to unlock more runs.'}
          </p>
        </div>

        {/* Competitor Crawls Meter */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Competitor Crawls</span>
            </span>
            <span className="font-mono text-zinc-900 font-bold">
              {crawlsUsed} / {crawlsLimit}
            </span>
          </div>

          <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                crawlsPct > 90 ? 'bg-rose-500' : crawlsPct > 70 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${crawlsPct}%` }}
            />
          </div>

          <p className="text-[11px] text-zinc-500 leading-tight">
            Deep website page audits and digital footprint crawls.
          </p>
        </div>

        {/* AI Tokens / Compute Meter */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 flex items-center gap-1.5">
              {isBYOK ? (
                <KeyRound className="w-4 h-4 text-amber-600" />
              ) : (
                <Cpu className="w-4 h-4 text-indigo-600" />
              )}
              <span>AI Model Compute</span>
            </span>
            <span className="font-mono text-zinc-900 font-bold">
              {isBYOK ? 'BYOK Direct' : `${tokensUsed.toLocaleString()} / ${tokensLimit.toLocaleString()}`}
            </span>
          </div>

          {isBYOK ? (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Direct provider billed: No platform token caps.</span>
            </div>
          ) : (
            <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  tokensPct > 90 ? 'bg-rose-500' : tokensPct > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${tokensPct}%` }}
              />
            </div>
          )}

          <p className="text-[11px] text-zinc-500 leading-tight">
            {isBYOK
              ? 'Tokens are billed directly to your OpenAI/Anthropic/Gemini account.'
              : `${((tokensLimit - tokensUsed) / 1000).toFixed(0)}k platform managed tokens remaining.`}
          </p>
        </div>
      </div>

      {/* Payment Method & Security Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-zinc-900">Payment Processing & Gateway</h4>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Razorpay Standard Checkout (Live)</span>
          </span>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          Payments are securely encrypted and handled via Razorpay with automated raw-body webhook signature verification.
          Subscriptions can be upgraded, downgraded, or changed between Managed AI and BYOK modes at any time.
        </p>
      </div>

      {/* Transaction & Receipt History Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-zinc-700" />
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Billing History & Invoices</h4>
              <p className="text-[11px] text-zinc-500">All captured payments and subscription charges.</p>
            </div>
          </div>
        </div>

        {loadingTx ? (
          <div className="py-8 text-center text-xs text-zinc-500">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 text-zinc-400" />
            <span>No paid transactions yet. Free community tier active.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-100">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Payment ID</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-50/50">
                    <td className="py-2.5 px-3 font-mono text-zinc-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-zinc-900">
                      {tx.razorpayPaymentId}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-zinc-700">{tx.planId}</td>
                    <td className="py-2.5 px-3 font-bold text-zinc-900">₹{tx.amountINR.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Paid</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
