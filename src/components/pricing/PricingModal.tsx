import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { SubscriptionPlan, BillingInterval, AIMode } from '../../types';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  KeyRound,
  Cpu,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    activeWorkspace,
    subscription,
    refreshSubscription,
    addToast,
    setActiveView,
  } = useWorkspace();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [interval, setInterval] = useState<BillingInterval>('MONTHLY');
  const [selectedAIMode, setSelectedAIMode] = useState<AIMode>('MANAGED');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoadingPlans(true);
    api
      .getSubscriptionPlans()
      .then((res) => {
        if (mounted && res.success) {
          setPlans(res.plans);
        }
      })
      .catch((err) => {
        console.error('Failed to load plans:', err);
      })
      .finally(() => {
        if (mounted) setLoadingPlans(false);
      });

    loadRazorpayScript();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter plans based on the selected AI Mode toggle
  // Free Community plan is always shown on both modes
  const visiblePlans = plans.filter((p) => {
    if (p.tier === 'FREE') return true;
    return p.aiMode === selectedAIMode;
  });

  const handleCheckout = async (plan: SubscriptionPlan) => {
    setProcessingPlanId(plan.id);

    try {
      // 1. Create order on server
      const orderRes = await api.createCheckoutOrder(plan.id, interval);

      // Free plan immediate enrollment
      if (orderRes.isFreePlan || plan.monthlyPriceINR === 0) {
        await refreshSubscription();
        addToast(`Switched to ${plan.name} plan successfully!`, 'success');
        setProcessingPlanId(null);
        onClose();
        return;
      }

      // Ensure Razorpay SDK is ready
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        addToast('Unable to load Razorpay checkout SDK. Check your internet connection.', 'error');
        setProcessingPlanId(null);
        return;
      }

      const options = {
        key: orderRes.keyId,
        amount: orderRes.amountINR * 100, // paise
        currency: orderRes.currency || 'INR',
        name: 'ResearchFlow AI',
        description: `${plan.name} (${interval === 'YEARLY' ? 'Annual' : 'Monthly'})`,
        image: 'https://research-flow-ai-nine.vercel.app/brand-logo.png',
        order_id: orderRes.razorpayOrderId,
        notes: {
          app: 'researchflow_ai',
          planId: plan.id,
          workspaceId: activeWorkspace?.id || 'ws_default_prod',
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#D4AF37', // Brand gold accent
        },
        handler: async (response: any) => {
          try {
            addToast('Payment captured! Verifying subscription...', 'info');

            const verifyRes = await api.verifyPayment({
              orderId: orderRes.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              await refreshSubscription();
              addToast(`🎉 Welcome to ${plan.name}! Your workspace is upgraded.`, 'success');
              onClose();
            } else {
              addToast('Payment verification could not be confirmed.', 'error');
            }
          } catch (err: any) {
            addToast(`Verification error: ${err.message}`, 'error');
          } finally {
            setProcessingPlanId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPlanId(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        addToast(`Payment failed: ${response.error.description || 'Transaction cancelled'}`, 'error');
        setProcessingPlanId(null);
      });
      rzp.open();
    } catch (err: any) {
      addToast(`Checkout failed: ${err.message}`, 'error');
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-start justify-center p-3 sm:p-6 md:p-8 py-8 sm:py-12 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#0C0E17] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] border border-amber-400/20 overflow-hidden flex flex-col my-auto">
        {/* Header Section */}
        <div className="relative px-6 py-8 md:px-10 bg-gradient-to-b from-[#141724] to-[#0C0E17] border-b border-amber-400/15 flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close pricing modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-[#F5D77F] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent SaaS Monetization & Flexible Key Options</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            Plans Built for Relentless Market Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mt-2 leading-relaxed">
            Choose between all-inclusive <strong className="text-white">Managed AI</strong> (platform covers model compute) or <strong className="text-white">Bring Your Own Key (BYOK)</strong> (connect your own OpenAI, Anthropic, or Gemini keys with zero token markup).
          </p>

          {/* Clean Segmented Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6">
            {/* AI Compute Architecture Switch */}
            <div className="inline-flex p-1 bg-black/60 rounded-xl border border-white/10">
              <button
                onClick={() => setSelectedAIMode('MANAGED')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedAIMode === 'MANAGED'
                    ? 'bg-amber-400/20 text-[#F5D77F] border border-amber-400/40 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                    : 'text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-[#F5D77F]" />
                <span>Managed AI</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-medium">Zero Setup</span>
              </button>
              <button
                onClick={() => setSelectedAIMode('BYOK')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedAIMode === 'BYOK'
                    ? 'bg-amber-400/20 text-[#F5D77F] border border-amber-400/40 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                    : 'text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                <span>Bring Your Own Key</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-medium">Direct Provider</span>
              </button>
            </div>

            {/* Monthly vs Annual Billing Switch */}
            <div className="inline-flex p-1 bg-black/60 rounded-xl border border-white/10">
              <button
                onClick={() => setInterval('MONTHLY')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  interval === 'MONTHLY'
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval('YEARLY')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  interval === 'YEARLY'
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wide">
                  Save 2 Mo
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid - No Internal Scrollbar, Seamless Heights */}
        <div className="p-6 md:p-8">
          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#F5D77F]" />
              <p className="text-xs font-medium">Fetching subscription tier catalog...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visiblePlans.map((plan) => {
                const isCurrent = subscription?.planId === plan.id;
                const isProcessing = processingPlanId === plan.id;
                const price = interval === 'YEARLY' ? plan.yearlyPriceINR : plan.monthlyPriceINR;
                const monthlyEquiv = interval === 'YEARLY' && price > 0 ? Math.round(price / 12) : price;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all ${
                      plan.highlighted
                        ? 'border-2 border-amber-400/60 bg-gradient-to-b from-[#181C2B] to-[#11131E] shadow-[0_0_35px_rgba(212,175,55,0.15)] ring-1 ring-amber-400/20'
                        : 'border border-white/10 bg-[#12141F]/80 hover:border-amber-400/30'
                    }`}
                  >
                    {plan.badge && (
                      <div
                        className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-lg z-20 whitespace-nowrap ${
                          plan.highlighted
                            ? 'bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 font-black shadow-[0_0_16px_rgba(212,175,55,0.5)]'
                            : 'bg-[#0C0E17] border border-amber-400/40 text-[#F5D77F] shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
                        }`}
                      >
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      {/* Title & Description */}
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-white">{plan.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      {/* Price display */}
                      <div className="mb-5 pb-5 border-b border-white/10">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-zinc-400">₹</span>
                          <span className="text-3xl font-extrabold text-white tracking-tight">
                            {monthlyEquiv.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-medium text-zinc-400">/mo</span>
                        </div>
                        {interval === 'YEARLY' && price > 0 && (
                          <div className="text-[11px] text-[#F5D77F] font-semibold mt-1">
                            Billed ₹{price.toLocaleString('en-IN')} annually (2 months free)
                          </div>
                        )}
                        {price === 0 && (
                          <div className="text-[11px] text-zinc-400 font-medium mt-1">
                            No credit card required
                          </div>
                        )}
                      </div>

                      {/* Feature Bullet Points */}
                      <div className="space-y-2.5 mb-6">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#F5D77F]/80">
                          Included Entitlements
                        </div>
                        {plan.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleCheckout(plan)}
                        disabled={isCurrent || isProcessing}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isCurrent
                            ? 'bg-white/5 text-zinc-500 border border-white/10 cursor-not-allowed'
                            : plan.highlighted
                            ? 'bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 hover:shadow-[0_0_24px_rgba(245,215,127,0.7)] hover:scale-[1.01] active:scale-[0.99]'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 hover:border-amber-400/30'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : isCurrent ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Active Plan</span>
                          </>
                        ) : price === 0 ? (
                          <span>Downgrade to Free</span>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Upgrade with Razorpay</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cryptographic Security & BYOK Explanation Footer */}
          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-black/50 border border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Cryptographically Verified Payments: </span>
                <span className="text-zinc-400">Powered by Razorpay Standard Checkout with instant server HMAC signature validation.</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setActiveView('settings');
              }}
              className="text-[#F5D77F] hover:text-white font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>Manage BYOK Keys in Settings</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
