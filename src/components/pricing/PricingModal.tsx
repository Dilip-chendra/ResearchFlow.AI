import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { SubscriptionPlan, BillingInterval, AIMode } from '../../types';
import {
  X,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  KeyRound,
  Cpu,
  Loader2,
  ExternalLink,
  HelpCircle,
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
          color: '#4F46E5', // Indigo-600
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="relative px-6 py-8 md:px-10 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100 flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent SaaS Monetization & Direct BYOK Flexibility</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Plans Built for Relentless Market Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl mt-2">
            Choose between all-inclusive <strong>Managed AI</strong> (platform covers model compute) or discounted{' '}
            <strong>BYOK</strong> (bring your own OpenAI, Anthropic, or Gemini keys with zero token markup).
          </p>

          {/* Dual Toggle Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {/* AI Mode Toggle */}
            <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-zinc-200/80">
              <button
                onClick={() => setSelectedAIMode('MANAGED')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedAIMode === 'MANAGED'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mode A: Managed AI</span>
              </button>
              <button
                onClick={() => setSelectedAIMode('BYOK')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedAIMode === 'BYOK'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                <span>Mode B: BYOK (60% Off)</span>
              </button>
            </div>

            {/* Monthly vs Yearly Toggle */}
            <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-zinc-200/80">
              <button
                onClick={() => setInterval('MONTHLY')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  interval === 'MONTHLY'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval('YEARLY')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  interval === 'YEARLY'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                  Save 2 Mo
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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
                    className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                      plan.highlighted
                        ? 'border-indigo-500 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      {/* Title & Description */}
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-zinc-900">{plan.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      {/* Price display */}
                      <div className="mb-5 pb-5 border-b border-zinc-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-zinc-400">₹</span>
                          <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                            {monthlyEquiv.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-medium text-zinc-500">/mo</span>
                        </div>
                        {interval === 'YEARLY' && price > 0 && (
                          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                            Billed ₹{price.toLocaleString('en-IN')} annually (2 months free)
                          </div>
                        )}
                        {price === 0 && (
                          <div className="text-[11px] text-zinc-500 font-medium mt-1">
                            No credit card required
                          </div>
                        )}
                      </div>

                      {/* Feature Bullet Points */}
                      <div className="space-y-2.5 mb-6">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Included Entitlements
                        </div>
                        {plan.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
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
                            ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                            : plan.highlighted
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : isCurrent ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-zinc-400" />
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

          {/* Guarantee & BYOK explanation footer */}
          <div className="mt-8 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-zinc-800">100% Cryptographically Verified Payments: </span>
                <span>Powered by Razorpay Standard Checkout with instant server HMAC signature validation.</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setActiveView('settings');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Manage BYOK Keys in Settings</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
