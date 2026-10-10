import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import {
  Building2,
  Globe,
  Users,
  Package,
  HeartHandshake,
  CheckCircle2,
  Radar,
  Play,
  RotateCw,
  Plus,
  Edit3,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  Filter,
  Trash2,
  FileText,
  Lock,
} from 'lucide-react';
import {
  CompanyProfile,
  DigitalProperty,
  LeadershipProfile,
  ProductDeepProfile,
  CustomerIntelligenceProfile,
  BusinessIntelligenceProfile,
  DeepCrawlJob,
  UserFactCorrection,
  FactEntry,
} from '../../types';
import { FactCorrectionModal } from './FactCorrectionModal';
import { AddPropertyModal } from './AddPropertyModal';
import { CompanyIntelligenceWizard } from './CompanyIntelligenceWizard';

export const CompanyIntelligenceDashboard: React.FC = () => {
  const { addToast } = useWorkspace();
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'8d' | 'footprint' | 'product' | 'customer' | 'telemetry' | 'corrections'>('8d');
  const [isLoading, setIsLoading] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);

  // Entities
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [digitalProps, setDigitalProps] = useState<DigitalProperty[]>([]);
  const [leaders, setLeaders] = useState<LeadershipProfile[]>([]);
  const [products, setProducts] = useState<ProductDeepProfile[]>([]);
  const [customerIntel, setCustomerIntel] = useState<CustomerIntelligenceProfile | null>(null);
  const [businessIntel, setBusinessIntel] = useState<BusinessIntelligenceProfile | null>(null);
  const [crawlJobs, setCrawlJobs] = useState<DeepCrawlJob[]>([]);
  const [corrections, setCorrections] = useState<UserFactCorrection[]>([]);

  // Modals
  const [isAddPropOpen, setIsAddPropOpen] = useState(false);
  const [selectedFactForCorrection, setSelectedFactForCorrection] = useState<FactEntry | null>(null);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [pRes, fRes, lRes, prRes, cRes, bRes, jRes, corrRes] = await Promise.all([
        api.getCompanyProfile(),
        api.getDigitalProperties(),
        api.getLeadershipProfiles(),
        api.getProductProfiles(),
        api.getCustomerIntelligence(),
        api.getBusinessIntelligence(),
        api.getDeepCrawlJobs(),
        api.getFactCorrections(),
      ]);

      if (pRes?.profile) setProfile(pRes.profile);
      if (fRes?.properties) setDigitalProps(fRes.properties);
      if (lRes?.leadership) setLeaders(lRes.leadership);
      if (prRes?.products) setProducts(prRes.products);
      if (cRes?.customerIntelligence) setCustomerIntel(cRes.customerIntelligence);
      if (bRes?.businessIntelligence) setBusinessIntel(bRes.businessIntelligence);
      if (jRes?.jobs) setCrawlJobs(jRes.jobs);
      if (corrRes?.corrections) setCorrections(corrRes.corrections);
    } catch (err: any) {
      addToast(err.message || 'Failed to load company intelligence', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleTriggerCrawl = async () => {
    try {
      setIsCrawling(true);
      addToast('Launching deep multi-source crawl across digital footprint...', 'info');
      const res = await api.triggerDeepCrawl({ maxPageBudget: 25, maxDepth: 2 });
      if (res?.job) {
        addToast(`Crawl completed: analyzed ${res.job.pagesAnalyzed} pages.`, 'success');
        await loadAllData();
      }
    } catch (err: any) {
      addToast(err.message || 'Crawl failed', 'error');
    } finally {
      setIsCrawling(false);
    }
  };

  const handleAddProperty = async (data: { category: any; name: string; url: string }) => {
    const res = await api.addDigitalProperty(data);
    if (res?.property) {
      setDigitalProps((prev) => [res.property, ...prev]);
      addToast('Digital property connected', 'success');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await api.deleteDigitalProperty(id);
      setDigitalProps((prev) => prev.filter((p) => p.id !== id));
      addToast('Property deleted', 'info');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleSaveCorrection = async (factId: string, correctedText: string) => {
    const res = await api.correctFact(factId, correctedText);
    if (res?.correction) {
      setCorrections((prev) => [res.correction, ...prev]);
      addToast('Fact verified and updated in knowledge model', 'success');
      const bRes = await api.getBusinessIntelligence();
      if (bRes?.businessIntelligence) setBusinessIntel(bRes.businessIntelligence);
    }
  };

  if (isWizardMode) {
    return (
      <CompanyIntelligenceWizard
        onViewDashboard={() => {
          setIsWizardMode(false);
          loadAllData();
        }}
        onFinish={() => {
          setIsWizardMode(false);
          loadAllData();
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RotateCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
          Loading Verified Company Knowledge...
        </p>
      </div>
    );
  }

  const completeness = profile?.profileCompleteness || 0;
  const verifiedFactsCount = (businessIntel?.whatWeKnow.length || 0) + (businessIntel?.whatIndependentSourcesConfirm.length || 0);

  return (
    <div className="space-y-6">
      {/* Header Command Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Verified Company Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
              {profile?.stage || 'LAUNCHED'}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
              {profile?.businessModel || 'B2B'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {profile?.companyName || 'NextGen Resume AI'}
            </h1>
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-indigo-600 flex items-center gap-1 font-mono"
              >
                <span>{profile.website.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
          </div>

          <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
            {profile?.description || 'AI-powered ATS resume builder & interview coaching platform.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          <button
            onClick={() => setIsAddPropOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </button>

          <button
            onClick={() => setIsWizardMode(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Setup Wizard</span>
          </button>

          <button
            onClick={handleTriggerCrawl}
            disabled={isCrawling}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isCrawling ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isCrawling ? 'Crawling...' : 'Deep Re-Crawl'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Completeness */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Profile Completeness</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">{completeness}%</span>
            <span className="text-[11px] text-zinc-400">verified attributes</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${completeness}%` }} />
          </div>
        </div>

        {/* KPI 2: Digital Properties */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Digital Properties</span>
            <Globe className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">{digitalProps.length}</span>
            <span className="text-[11px] text-emerald-600 font-medium">active sources</span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            {digitalProps.filter((p) => p.status === 'CONNECTED').length} connected & analyzed
          </p>
        </div>

        {/* KPI 3: Ground-Truth Facts */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Verified Facts</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">{verifiedFactsCount}</span>
            <span className="text-[11px] text-purple-600 font-medium">hard evidence</span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            {corrections.length} user-verified ground-truth edits
          </p>
        </div>

        {/* KPI 4: Crawl Telemetry */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Crawl Freshness</span>
            <Radar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">
              {crawlJobs[0]?.pagesAnalyzed || digitalProps.reduce((acc, p) => acc + (p.pageCount || 0), 0)}
            </span>
            <span className="text-[11px] text-zinc-400">pages indexed</span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            Status: {crawlJobs[0]?.status || 'COMPLETED'}
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('8d')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === '8d'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          8-Dimension Strategic Truth
        </button>
        <button
          onClick={() => setActiveTab('footprint')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'footprint'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Digital Footprint ({digitalProps.length})
        </button>
        <button
          onClick={() => setActiveTab('product')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'product'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Product & Value Prop ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'customer'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Customer ICP & Buying Triggers
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'telemetry'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Crawl Telemetry & Hashes
        </button>
        <button
          onClick={() => setActiveTab('corrections')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'corrections'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Truth Audit Trail ({corrections.length})
        </button>
      </div>

      {/* TAB 1: 8-DIMENSION STRATEGIC TRUTH MATRIX */}
      {activeTab === '8d' && (
        <div className="space-y-6">
          {/* Change Detection Notice */}
          {businessIntel?.changeSummarySinceLastCrawl && businessIntel.changeSummarySinceLastCrawl.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 space-y-1">
                <div className="font-bold">Automated Change Detection</div>
                <div className="text-indigo-800 leading-relaxed">
                  {businessIntel.changeSummarySinceLastCrawl.join(' ')}
                </div>
              </div>
            </div>
          )}

          {/* 8-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. What We Know */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">What We Know</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                    {businessIntel?.whatWeKnow.length || 0}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Hard facts independently verified via code, domains, or pricing tiers.</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {businessIntel?.whatWeKnow.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-emerald-100 text-xs text-zinc-800 space-y-1 shadow-2xs">
                      <div className="leading-snug">{fact.claim}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="text-emerald-700 font-semibold">{fact.confidenceScore}% conf</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Correct</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. What Company Says */}
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">Company Stated</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                    {businessIntel?.whatCompanySaysAboutItself.length || 0}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Marketing statements, value propositions, and self-reported copy.</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {businessIntel?.whatCompanySaysAboutItself.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-blue-100 text-xs text-zinc-800 space-y-1 shadow-2xs">
                      <div className="leading-snug">"{fact.claim}"</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="text-blue-700 font-semibold">Self-Reported</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Correct</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Independently Confirmed */}
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Independently Confirmed</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/60 px-1.5 py-0.5 rounded">
                    {businessIntel?.whatIndependentSourcesConfirm.length || 0}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Corroborated by customer reviews, press, and third-party databases.</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {businessIntel?.whatIndependentSourcesConfirm.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-purple-100 text-xs text-zinc-800 space-y-1 shadow-2xs">
                      <div className="leading-snug">{fact.claim}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="text-purple-700 font-semibold">{fact.confidenceScore}% conf</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Correct</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. What We Inferred */}
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">What We Inferred</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">
                    {businessIntel?.whatWeInferred.length || 0}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Analytical deductions synthesized from market patterns.</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {businessIntel?.whatWeInferred.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-amber-100 text-xs text-zinc-800 space-y-1 shadow-2xs">
                      <div className="leading-snug">{fact.claim}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="text-amber-700 font-semibold">Analytical Deductions</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Correct</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. What Is Uncertain */}
            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider">What Is Uncertain</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100/60 px-1.5 py-0.5 rounded">
                    {businessIntel?.whatIsUncertain.length || 0}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Claims with conflicting or weak empirical evidence.</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {businessIntel?.whatIsUncertain.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-rose-100 text-xs text-zinc-800 space-y-1 shadow-2xs">
                      <div className="leading-snug">{fact.claim}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="text-rose-700 font-semibold">Low Confidence</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Clarify</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. What Is Missing */}
            <div className="p-4 rounded-2xl bg-zinc-100/60 border border-zinc-200 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span>
                    <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">What Is Missing</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-700 bg-zinc-200 px-1.5 py-0.5 rounded">
                    {businessIntel?.whatIsMissing.length || 0}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Critical strategic attributes not found on public footprint.</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {businessIntel?.whatIsMissing.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-800 space-y-1 shadow-2xs">
                      <div className="leading-snug">{fact.claim}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="text-zinc-600 font-semibold">Missing Gap</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Supply Data</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7. Sources Inaccessible */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-300 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Sources Inaccessible</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded">
                    {businessIntel?.sourcesInaccessible.length || 0}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Restricted behind auth walls with recommended alternatives.</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {businessIntel?.sourcesInaccessible.map((src, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-zinc-800 space-y-1 shadow-2xs">
                      <div className="font-mono text-[10px] text-zinc-500 truncate">{src.url}</div>
                      <div className="text-[11px] text-zinc-700">{src.reason}</div>
                      <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded-md font-medium">
                        Alternative: {src.recommendedAlternative}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 8. Needs User Confirmation */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-300 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-700" />
                    <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Needs Confirmation</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-200/70 px-1.5 py-0.5 rounded">
                    {businessIntel?.requiresUserConfirmation.length || 0}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Strategic decisions that materially impact War Room guidance.</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {businessIntel?.requiresUserConfirmation.map((q) => (
                    <div key={q.id} className="p-2.5 rounded-xl bg-white border border-indigo-200 text-xs text-zinc-800 space-y-2 shadow-2xs">
                      <div className="font-semibold text-zinc-900 leading-snug">{q.question}</div>
                      <div className="text-[11px] text-zinc-500 italic">{q.impactOnAnalysis}</div>
                      {q.options && (
                        <div className="space-y-1">
                          {q.options.map((opt, oi) => (
                            <button
                              key={oi}
                              onClick={() => handleSaveCorrection(q.id, `Confirmed: ${opt}`)}
                              className="w-full text-left px-2 py-1 rounded bg-zinc-50 hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-300 text-[11px] text-zinc-700 transition-colors cursor-pointer"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL FOOTPRINT INVENTORY */}
      {activeTab === 'footprint' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Connected Digital Properties ({digitalProps.length})</h2>
            <button
              onClick={() => setIsAddPropOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Property URL</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
            {digitalProps.map((prop) => (
              <div key={prop.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-zinc-50/70 transition-colors">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                    {prop.category.replace(/_/g, ' ')}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-900">{prop.name}</div>
                    <a
                      href={prop.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-zinc-400 hover:text-indigo-600 flex items-center gap-1 font-mono truncate"
                    >
                      <span className="truncate">{prop.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {prop.pageCount !== undefined ? `${prop.pageCount} pgs` : 'Pending'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    prop.status === 'CONNECTED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {prop.status}
                  </span>
                  <button
                    onClick={() => handleDeleteProperty(prop.id)}
                    className="text-zinc-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT & VALUE PROP */}
      {activeTab === 'product' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Catalogued Products & Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900">{prod.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {prod.maturity}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  {prod.valueProposition}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-500 text-[10px] uppercase">Pricing: </span>
                    <span className="text-zinc-800">{prod.pricingAndPackaging || 'Not disclosed'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-500 text-[10px] uppercase">Differentiators: </span>
                    <span className="text-emerald-700">{prod.differentiators.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-500 text-[10px] uppercase">Known Limitations: </span>
                    <span className="text-rose-700">{prod.knownWeaknesses.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER ICP */}
      {activeTab === 'customer' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-zinc-900">Customer ICP & Buying Dynamics</h2>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Ideal Customer Profile</span>
              <p className="text-xs text-zinc-800 leading-relaxed font-medium bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                {customerIntel?.idealCustomerProfile || 'Not documented yet.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                <span className="font-bold text-zinc-700 text-[10px] uppercase">Buyer Personas</span>
                <p className="text-zinc-600">{customerIntel?.buyerPersonas.join(', ') || 'N/A'}</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                <span className="font-bold text-zinc-700 text-[10px] uppercase">Core Jobs To Be Done</span>
                <p className="text-zinc-600">{customerIntel?.coreJobsToBeDone.join(', ') || 'N/A'}</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                <span className="font-bold text-zinc-700 text-[10px] uppercase">Purchase Triggers</span>
                <p className="text-zinc-600">{customerIntel?.purchaseTriggers.join(', ') || 'N/A'}</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                <span className="font-bold text-zinc-700 text-[10px] uppercase">Common Objections</span>
                <p className="text-zinc-600">{customerIntel?.commonObjections.join(', ') || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TELEMETRY & AUDIT */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Deep Crawl Telemetry & Content Hashes</h2>
            <button
              onClick={handleTriggerCrawl}
              disabled={isCrawling}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isCrawling ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
              <span>Re-Crawl Footprint</span>
            </button>
          </div>

          {crawlJobs.length > 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Page URL</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Words</th>
                    <th className="px-4 py-3">SHA-256 Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                  {crawlJobs[0].crawlInventory?.slice(0, 15).map((page, i) => (
                    <tr key={i} className="hover:bg-zinc-50/70">
                      <td className="px-4 py-2.5 truncate max-w-sm text-zinc-900">{page.url}</td>
                      <td className="px-4 py-2.5 text-zinc-500">{page.category}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          HTTP {page.httpStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600">{page.wordCount}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-[10px] truncate max-w-[120px]">{page.sha256Hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No crawl jobs executed yet.</p>
          )}
        </div>
      )}

      {/* TAB 6: CORRECTIONS AUDIT TRAIL */}
      {activeTab === 'corrections' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-900">User Ground-Truth Fact Corrections ({corrections.length})</h2>
          {corrections.length === 0 ? (
            <div className="p-8 bg-zinc-50 rounded-2xl border border-zinc-200 text-center text-xs text-zinc-500">
              No manual corrections made yet. Click "Correct" on any fact in the 8-Dimension grid to verify ground truth.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden shadow-xs">
              {corrections.map((corr) => (
                <div key={corr.id} className="p-4 space-y-1.5 hover:bg-zinc-50/70 transition-colors">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Actor: <strong className="text-zinc-700">{corr.correctedBy}</strong></span>
                    <span className="font-mono">{new Date(corr.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-zinc-500 line-through">
                    "{corr.originalText}"
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    "{corr.correctedText}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddPropertyModal
        isOpen={isAddPropOpen}
        onClose={() => setIsAddPropOpen(false)}
        onAdd={handleAddProperty}
      />

      <FactCorrectionModal
        isOpen={Boolean(selectedFactForCorrection)}
        onClose={() => setSelectedFactForCorrection(null)}
        fact={selectedFactForCorrection}
        onSave={handleSaveCorrection}
      />
    </div>
  );
};
