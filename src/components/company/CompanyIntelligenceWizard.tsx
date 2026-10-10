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
  ArrowRight,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Play,
  RotateCw,
  Sparkles,
  Edit3,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  CompanyProfile,
  DigitalProperty,
  LeadershipProfile,
  ProductDeepProfile,
  CustomerIntelligenceProfile,
  BusinessIntelligenceProfile,
  DeepCrawlJob,
  BusinessModelType,
  CompanyStage,
  FactEntry,
} from '../../types';
import { FactCorrectionModal } from './FactCorrectionModal';
import { AddPropertyModal } from './AddPropertyModal';

interface WizardProps {
  onFinish?: () => void;
  onViewDashboard?: () => void;
}

const STEPS = [
  { id: 1, label: 'Identity & Stage', icon: Building2 },
  { id: 2, label: 'Digital Footprint', icon: Globe },
  { id: 3, label: 'Founder & Vision', icon: Users },
  { id: 4, label: 'Product Deep Dive', icon: Package },
  { id: 5, label: 'Customer ICP', icon: HeartHandshake },
  { id: 6, label: 'Verified Facts (8D)', icon: CheckCircle2 },
  { id: 7, label: 'Crawl & Telemetry', icon: Radar },
];

export const CompanyIntelligenceWizard: React.FC<WizardProps> = ({
  onFinish,
  onViewDashboard,
}) => {
  const { addToast } = useWorkspace();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Entities state
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [digitalProps, setDigitalProps] = useState<DigitalProperty[]>([]);
  const [leaders, setLeaders] = useState<LeadershipProfile[]>([]);
  const [products, setProducts] = useState<ProductDeepProfile[]>([]);
  const [customerIntel, setCustomerIntel] = useState<CustomerIntelligenceProfile | null>(null);
  const [businessIntel, setBusinessIntel] = useState<BusinessIntelligenceProfile | null>(null);
  const [crawlJobs, setCrawlJobs] = useState<DeepCrawlJob[]>([]);
  const [isCrawling, setIsCrawling] = useState(false);

  // Modals state
  const [isAddPropOpen, setIsAddPropOpen] = useState(false);
  const [selectedFactForCorrection, setSelectedFactForCorrection] = useState<FactEntry | null>(null);

  // Load all initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pRes, fRes, lRes, prRes, cRes, bRes, jRes] = await Promise.all([
        api.getCompanyProfile(),
        api.getDigitalProperties(),
        api.getLeadershipProfiles(),
        api.getProductProfiles(),
        api.getCustomerIntelligence(),
        api.getBusinessIntelligence(),
        api.getDeepCrawlJobs(),
      ]);

      if (pRes?.profile) setProfile(pRes.profile);
      if (fRes?.properties) setDigitalProps(fRes.properties);
      if (lRes?.leadership) setLeaders(lRes.leadership);
      if (prRes?.products) setProducts(prRes.products);
      if (cRes?.customerIntelligence) setCustomerIntel(cRes.customerIntelligence);
      if (bRes?.businessIntelligence) setBusinessIntel(bRes.businessIntelligence);
      if (jRes?.jobs) setCrawlJobs(jRes.jobs);
    } catch (err: any) {
      addToast(err.message || 'Failed to load company intelligence data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Company Profile updates
  const handleSaveProfile = async (updates: Partial<CompanyProfile>) => {
    try {
      setIsSaving(true);
      const res = await api.updateCompanyProfile(updates);
      if (res?.profile) {
        setProfile(res.profile);
        addToast('Company profile saved', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Deep Crawl
  const handleTriggerCrawl = async () => {
    try {
      setIsCrawling(true);
      addToast('Launching deep discovery crawler across digital footprint...', 'info');
      const res = await api.triggerDeepCrawl({ maxPageBudget: 25, maxDepth: 2 });
      if (res?.job) {
        addToast(`Crawl completed: analyzed ${res.job.pagesAnalyzed} pages.`, 'success');
        await loadData();
      }
    } catch (err: any) {
      addToast(err.message || 'Crawl failed', 'error');
    } finally {
      setIsCrawling(false);
    }
  };

  // Add Digital Property
  const handleAddProperty = async (data: { category: any; name: string; url: string }) => {
    const res = await api.addDigitalProperty(data);
    if (res?.property) {
      setDigitalProps((prev) => [res.property, ...prev]);
      addToast('Digital property connected and queued for verification', 'success');
    }
  };

  // Delete Digital Property
  const handleDeleteProperty = async (id: string) => {
    try {
      await api.deleteDigitalProperty(id);
      setDigitalProps((prev) => prev.filter((p) => p.id !== id));
      addToast('Property removed', 'info');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // Save fact correction
  const handleSaveFactCorrection = async (factId: string, correctedText: string) => {
    const res = await api.correctFact(factId, correctedText);
    if (res?.correction) {
      addToast('Fact updated and marked as User-Verified truth', 'success');
      const bRes = await api.getBusinessIntelligence();
      if (bRes?.businessIntelligence) setBusinessIntel(bRes.businessIntelligence);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RotateCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-medium text-zinc-500">Loading Company Discovery Engine...</p>
      </div>
    );
  }

  const completeness = profile?.profileCompleteness || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Progress Header */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Deep Company Intelligence Setup
            </span>
            <span className="text-xs text-zinc-400 font-mono">Step {currentStep} of {STEPS.length}</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            {profile?.companyName || 'Your Company'} — Digital Discovery Engine
          </h1>
          <p className="text-xs text-zinc-500">
            ResearchFlow grounds strategic market recommendations in verified multi-source evidence rather than short form assumptions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Completeness</div>
            <div className="text-sm font-bold text-indigo-600">{completeness}%</div>
          </div>
          <div className="w-24 h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {onViewDashboard && (
            <button
              onClick={onViewDashboard}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Command Center
            </button>
          )}
        </div>
      </div>

      {/* Step Stepper Navigation */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 border-b border-zinc-200">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.id;
          const isDone = currentStep > s.id;

          return (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                  : isDone
                  ? 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content Area */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs">
        {/* STEP 1: IDENTITY & STAGE */}
        {currentStep === 1 && profile && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Step 1: Identify Your Business</h2>
              <p className="text-xs text-zinc-500">Provide official identity and company objectives to establish baseline context.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Company / Brand Name *</label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  placeholder="e.g. NextGen Resume AI"
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Official Website URL *</label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={profile.tagline || ''}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  placeholder="e.g. AI-powered ATS resume & technical interview acceleration platform"
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Detailed Company Description</label>
                <textarea
                  rows={3}
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  placeholder="Describe what your company does, who it serves, and your core differentiator..."
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Industry & Category</label>
                <input
                  type="text"
                  value={profile.industry}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  placeholder="e.g. EdTech / Career Services / B2C SaaS"
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Business Model</label>
                <select
                  value={profile.businessModel}
                  onChange={(e) => setProfile({ ...profile, businessModel: e.target.value as BusinessModelType })}
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="B2B">B2B (Business to Business)</option>
                  <option value="B2C">B2C (Consumer Direct)</option>
                  <option value="B2B2C">B2B2C (Hybrid)</option>
                  <option value="MARKETPLACE">Marketplace / Two-sided</option>
                  <option value="SAAS">SaaS (Software-as-a-Service)</option>
                  <option value="SERVICES">Services / Consultancy</option>
                  <option value="OPEN_SOURCE">Open Source / Developer Tool</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Company Stage</label>
                <select
                  value={profile.stage}
                  onChange={(e) => setProfile({ ...profile, stage: e.target.value as CompanyStage })}
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="IDEA">Idea / Concept</option>
                  <option value="PRE_LAUNCH">Pre-Launch / Stealth</option>
                  <option value="LAUNCHED">Launched / Early Traction</option>
                  <option value="GROWING">Growing / Scaling</option>
                  <option value="ESTABLISHED">Established / Enterprise</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Company Size</label>
                <input
                  type="text"
                  value={profile.companySize || ''}
                  onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                  placeholder="e.g. 11-50 employees"
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Main Strategic Business Objective *</label>
                <input
                  type="text"
                  value={profile.primaryObjective}
                  onChange={(e) => setProfile({ ...profile, primaryObjective: e.target.value })}
                  placeholder="e.g. Scale monthly recurring revenue by 4x and expand into university campus enterprise partnerships."
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-100">
              <div></div>
              <button
                onClick={async () => {
                  await handleSaveProfile(profile);
                  setCurrentStep(2);
                }}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>Save & Continue to Footprint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DIGITAL FOOTPRINT & SOURCES */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Step 2: Collect the Complete Digital Footprint</h2>
                <p className="text-xs text-zinc-500">Connect public URLs across your ecosystem. Unlimited properties supported without arbitrary 5-link limits.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddPropOpen(true)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Property URL</span>
                </button>
                <button
                  onClick={handleTriggerCrawl}
                  disabled={isCrawling}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isCrawling ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isCrawling ? 'Crawling...' : 'Crawl Footprint Now'}</span>
                </button>
              </div>
            </div>

            {digitalProps.length === 0 ? (
              <div className="text-center p-8 bg-zinc-50 rounded-2xl border border-zinc-200 text-zinc-500 text-xs space-y-2">
                <Globe className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="font-medium text-zinc-700">No digital properties connected yet.</p>
                <p>Add your website, pricing page, GitHub, LinkedIn, or review links to begin multi-source discovery.</p>
                <button
                  onClick={() => setIsAddPropOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Connect First Property
                </button>
              </div>
            ) : (
              <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                {digitalProps.map((prop) => (
                  <div key={prop.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/70 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
                        {prop.category.replace(/_/g, ' ')}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-900 truncate">{prop.name}</div>
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

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        prop.status === 'CONNECTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {prop.status}
                      </span>
                      {prop.pageCount !== undefined && (
                        <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                          {prop.pageCount} pages ({prop.wordCount || 0} w)
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteProperty(prop.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-zinc-100">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Leadership</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FOUNDER & LEADERSHIP */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Step 3: Founder & Leadership Profile</h2>
              <p className="text-xs text-zinc-500">Document founder's stated vision, executive priorities, and track record.</p>
            </div>

            {leaders.length === 0 ? (
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 text-center space-y-3">
                <Users className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-xs text-zinc-600">No executive profiles configured yet.</p>
                <button
                  onClick={async () => {
                    const newL = await api.saveLeadershipProfile({
                      name: 'Founder / CEO',
                      role: 'Founder & CEO',
                      strategicPriorities: ['Accelerate product-market fit', 'Maintain customer trust'],
                      isFounderStated: true,
                    });
                    if (newL?.leader) setLeaders([newL.leader]);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Add Founder Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {leaders.map((leader, idx) => (
                  <div key={leader.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Name</label>
                        <input
                          type="text"
                          value={leader.name}
                          onChange={(e) => {
                            const updated = [...leaders];
                            updated[idx].name = e.target.value;
                            setLeaders(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Role / Title</label>
                        <input
                          type="text"
                          value={leader.role}
                          onChange={(e) => {
                            const updated = [...leaders];
                            updated[idx].role = e.target.value;
                            setLeaders(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Founder's Vision Statement</label>
                      <textarea
                        rows={2}
                        value={leader.visionStatement || ''}
                        onChange={(e) => {
                          const updated = [...leaders];
                          updated[idx].visionStatement = e.target.value;
                          setLeaders(updated);
                        }}
                        placeholder="State your founding mission in your own words..."
                        className="w-full px-3 py-1.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Strategic Priorities (comma-separated)</label>
                      <input
                        type="text"
                        value={leader.strategicPriorities.join(', ')}
                        onChange={(e) => {
                          const updated = [...leaders];
                          updated[idx].strategicPriorities = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setLeaders(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`founder-stated-${leader.id}`}
                          checked={leader.isFounderStated}
                          onChange={(e) => {
                            const updated = [...leaders];
                            updated[idx].isFounderStated = e.target.checked;
                            setLeaders(updated);
                          }}
                          className="rounded text-indigo-600"
                        />
                        <label htmlFor={`founder-stated-${leader.id}`} className="text-xs text-zinc-600 font-medium">
                          Mark as Founder's Own Words (Distinguished from AI Inference)
                        </label>
                      </div>

                      <button
                        onClick={async () => {
                          await api.saveLeadershipProfile(leader);
                          addToast('Saved leadership profile', 'success');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        Save Leader
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-zinc-100">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Product</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PRODUCT DEEP DIVE */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Step 4: Understand the Product and Value Proposition</h2>
              <p className="text-xs text-zinc-500">Provide granular details on workflows, pricing, differentiators, and known product limitations.</p>
            </div>

            {products.length === 0 ? (
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 text-center space-y-3">
                <Package className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-xs text-zinc-600">No product profiles catalogued yet.</p>
                <button
                  onClick={async () => {
                    const newP = await api.saveProductProfile({
                      name: 'Core Platform',
                      corePurpose: 'Deliver market-leading automated workflow',
                      mainFeatures: ['Feature 1', 'Feature 2'],
                      valueProposition: 'Save time and achieve higher conversion',
                      differentiators: ['Transparent pricing', 'Verified evidence'],
                      maturity: 'GA',
                    });
                    if (newP?.product) setProducts([newP.product]);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Create Product Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((prod, idx) => (
                  <div key={prod.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Product Name</label>
                        <input
                          type="text"
                          value={prod.name}
                          onChange={(e) => {
                            const updated = [...products];
                            updated[idx].name = e.target.value;
                            setProducts(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Pricing & Packaging Structure</label>
                        <input
                          type="text"
                          value={prod.pricingAndPackaging || ''}
                          onChange={(e) => {
                            const updated = [...products];
                            updated[idx].pricingAndPackaging = e.target.value;
                            setProducts(updated);
                          }}
                          placeholder="e.g. Free Tier; Pro $19/mo; Lifetime $49"
                          className="w-full px-3 py-1.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Core Value Proposition</label>
                      <input
                        type="text"
                        value={prod.valueProposition}
                        onChange={(e) => {
                          const updated = [...products];
                          updated[idx].valueProposition = e.target.value;
                          setProducts(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Primary Differentiators (comma-separated)</label>
                        <input
                          type="text"
                          value={prod.differentiators.join(', ')}
                          onChange={(e) => {
                            const updated = [...products];
                            updated[idx].differentiators = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                            setProducts(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Known Limitations / Weaknesses</label>
                        <input
                          type="text"
                          value={prod.knownWeaknesses.join(', ')}
                          onChange={(e) => {
                            const updated = [...products];
                            updated[idx].knownWeaknesses = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                            setProducts(updated);
                          }}
                          placeholder="e.g. No 1-on-1 human coaching yet"
                          className="w-full px-3 py-1.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={async () => {
                          await api.saveProductProfile(prod);
                          addToast('Saved product profile', 'success');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        Save Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-zinc-100">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Customer ICP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CUSTOMER INTELLIGENCE & ICP */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Step 5: Customer ICP & Buying Triggers</h2>
              <p className="text-xs text-zinc-500">Map buyer personas, jobs-to-be-done, common objections, and why customers choose alternatives.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Ideal Customer Profile (ICP)</label>
                <textarea
                  rows={2}
                  value={customerIntel?.idealCustomerProfile || ''}
                  onChange={(e) => setCustomerIntel({ ...(customerIntel || {} as any), idealCustomerProfile: e.target.value })}
                  placeholder="e.g. Tech-focused job seekers applying to 20+ software engineering roles per month with high urgency..."
                  className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Buyer Personas (comma-separated)</label>
                  <input
                    type="text"
                    value={customerIntel?.buyerPersonas?.join(', ') || ''}
                    onChange={(e) => setCustomerIntel({
                      ...(customerIntel || {} as any),
                      buyerPersonas: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })}
                    placeholder="e.g. College Grads, Bootcamp Pivoters, Laid-off Engineers"
                    className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Core Jobs To Be Done (comma-separated)</label>
                  <input
                    type="text"
                    value={customerIntel?.coreJobsToBeDone?.join(', ') || ''}
                    onChange={(e) => setCustomerIntel({
                      ...(customerIntel || {} as any),
                      coreJobsToBeDone: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })}
                    placeholder="e.g. Pass automated ATS screening, quantify bullet points"
                    className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Purchase Triggers</label>
                  <input
                    type="text"
                    value={customerIntel?.purchaseTriggers?.join(', ') || ''}
                    onChange={(e) => setCustomerIntel({
                      ...(customerIntel || {} as any),
                      purchaseTriggers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })}
                    placeholder="e.g. Applying for weeks without callbacks, upcoming interview loop"
                    className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">Common Objections</label>
                  <input
                    type="text"
                    value={customerIntel?.commonObjections?.join(', ') || ''}
                    onChange={(e) => setCustomerIntel({
                      ...(customerIntel || {} as any),
                      commonObjections: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })}
                    placeholder="e.g. Can I just use free ChatGPT?, Will it work on Workday?"
                    className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-100">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={async () => {
                  if (customerIntel) {
                    await api.saveCustomerIntelligence(customerIntel);
                    addToast('Saved customer intelligence', 'success');
                  }
                  setCurrentStep(6);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Save & View Verified Facts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: VERIFIED FACTS & EPISTEMIC CATEGORIES (8-DIMENSION) */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Step 6: Verified Epistemic Claims & Facts</h2>
              <p className="text-xs text-zinc-500">
                Transparent epistemic categorization distinguishing verified facts from marketing claims, inferences, and uncertainties.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: What We Know */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">What We Know (Hard Facts)</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">{businessIntel?.whatWeKnow.length || 0}</span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {businessIntel?.whatWeKnow.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-emerald-100 text-xs text-zinc-800 space-y-1">
                      <div className="leading-snug">{fact.claim}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Confidence: {fact.confidenceScore}%</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Correct</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: What Company Says About Itself */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">What Company Stated (Marketing)</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-700">{businessIntel?.whatCompanySaysAboutItself.length || 0}</span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {businessIntel?.whatCompanySaysAboutItself.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-blue-100 text-xs text-zinc-800 space-y-1">
                      <div className="leading-snug">"{fact.claim}"</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Stated Claim</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Correct</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Independently Confirmed */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Independently Confirmed</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-700">{businessIntel?.whatIndependentSourcesConfirm.length || 0}</span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {businessIntel?.whatIndependentSourcesConfirm.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-purple-100 text-xs text-zinc-800 space-y-1">
                      <div className="leading-snug">{fact.claim}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Corroborated</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Correct</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 4: What We Inferred */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">What We Inferred (Analytical)</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700">{businessIntel?.whatWeInferred.length || 0}</span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {businessIntel?.whatWeInferred.map((fact) => (
                    <div key={fact.id} className="p-2.5 rounded-xl bg-white border border-amber-100 text-xs text-zinc-800 space-y-1">
                      <div className="leading-snug">{fact.claim}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Confidence: {fact.confidenceScore}%</span>
                        <button
                          onClick={() => setSelectedFactForCorrection(fact)}
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Correct</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-100">
              <button
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(7)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Crawl Telemetry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: CRAWL TELEMETRY & REFRESH */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Step 7: Crawl Telemetry & Change Detection</h2>
                <p className="text-xs text-zinc-500">Audit logs of crawled URLs, HTTP status codes, SHA-256 content hashes, and change detection.</p>
              </div>
              <button
                onClick={handleTriggerCrawl}
                disabled={isCrawling}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isCrawling ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
                <span>{isCrawling ? 'Crawling...' : 'Refresh Crawl'}</span>
              </button>
            </div>

            {/* Change Summary */}
            {businessIntel?.changeSummarySinceLastCrawl && businessIntel.changeSummarySinceLastCrawl.length > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Change Detection Since Last Crawl</span>
                </div>
                <ul className="space-y-1 pl-4 list-disc text-xs text-zinc-600">
                  {businessIntel.changeSummarySinceLastCrawl.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Latest Crawl Job Telemetry */}
            {crawlJobs.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase">Pages Discovered</div>
                    <div className="text-lg font-bold text-zinc-900">{crawlJobs[0].pagesDiscovered}</div>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase">Pages Analyzed</div>
                    <div className="text-lg font-bold text-emerald-600">{crawlJobs[0].pagesAnalyzed}</div>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase">Pages Skipped</div>
                    <div className="text-lg font-bold text-amber-600">{crawlJobs[0].pagesSkipped}</div>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase">Status</div>
                    <div className="text-xs font-bold text-indigo-600 uppercase mt-1">{crawlJobs[0].status}</div>
                  </div>
                </div>

                {crawlJobs[0].crawlInventory && crawlJobs[0].crawlInventory.length > 0 && (
                  <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="px-3 py-2">Page URL</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Words</th>
                          <th className="px-3 py-2">SHA-256 Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                        {crawlJobs[0].crawlInventory.slice(0, 10).map((page, i) => (
                          <tr key={i} className="hover:bg-zinc-50/70">
                            <td className="px-3 py-2 truncate max-w-xs text-zinc-800">{page.url}</td>
                            <td className="px-3 py-2 text-zinc-500">{page.category}</td>
                            <td className="px-3 py-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {page.httpStatus}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-zinc-600">{page.wordCount}</td>
                            <td className="px-3 py-2 text-zinc-400 text-[10px] truncate max-w-[120px]">{page.sha256Hash}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-zinc-100">
              <button
                onClick={() => setCurrentStep(6)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={onViewDashboard || onFinish}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Setup & Enter Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddPropOpen}
        onClose={() => setIsAddPropOpen(false)}
        onAdd={handleAddProperty}
      />

      {/* Fact Correction Modal */}
      <FactCorrectionModal
        isOpen={Boolean(selectedFactForCorrection)}
        onClose={() => setSelectedFactForCorrection(null)}
        fact={selectedFactForCorrection}
        onSave={handleSaveFactCorrection}
      />
    </div>
  );
};
