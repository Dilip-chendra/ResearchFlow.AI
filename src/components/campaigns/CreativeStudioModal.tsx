import React, { useState } from 'react';
import { CampaignBrief, CampaignAsset } from '../../types';
import { X, Sparkles, Copy, Check, Download, Layers, Linkedin, Globe, Twitter, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  brief: CampaignBrief;
  businessName: string;
  assets: CampaignAsset[];
  onClose: () => void;
}

type ChannelTab = 'linkedin' | 'google' | 'twitter' | 'comparison';

export const CreativeStudioModal: React.FC<Props> = ({ brief, businessName, assets, onClose }) => {
  const [activeTab, setActiveTab] = useState<ChannelTab>('linkedin');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable state fields initialized from brief and assets
  const [headline, setHeadline] = useState(
    assets.find((a) => a.channel === 'LINKEDIN')?.headline || `${businessName} vs Legacy Tools | 3x Faster & Transparent Pricing`
  );
  const [primaryText, setPrimaryText] = useState(
    assets.find((a) => a.channel === 'LINKEDIN')?.body ||
      `Still paying 30% surplus for unused software seats? ${businessName} delivers complete feature parity with zero hidden surcharges.\n\n${brief.primaryMessage}`
  );
  const [googleHeadline1, setGoogleHeadline1] = useState(`${businessName} - Modern Alternative`);
  const [googleHeadline2, setGoogleHeadline2] = useState('Transparent Pricing Guarantee');
  const [googleHeadline3, setGoogleHeadline3] = useState('Instant 1-Click Migration');
  const [googleDesc1, setGoogleDesc1] = useState(
    `${brief.primaryMessage.slice(0, 85)}... Switch in minutes.`
  );
  const [ctaText, setCtaText] = useState('Start Free Trial');

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportJSON = () => {
    const payload = {
      campaignAngle: brief.campaignAngle,
      businessName,
      linkedin: { headline, primaryText, ctaText },
      googleSearch: {
        headline1: googleHeadline1,
        headline2: googleHeadline2,
        headline3: googleHeadline3,
        description1: googleDesc1,
      },
      exportTimestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${businessName}-ad-campaign-spec.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">Multi-Channel Visual Ad Creative Studio</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                  Live Previewer
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Generate and edit pixel-accurate ad creative mockups backed by verified evidence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export Ad Spec JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-200/80 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="px-6 py-3 bg-zinc-100/70 border-b border-zinc-200 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'linkedin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn Sponsored Post</span>
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'google'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google Search Ad (SERP)</span>
          </button>

          <button
            onClick={() => setActiveTab('twitter')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'twitter'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
            }`}
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>X / Twitter Thought Leader</span>
          </button>
        </div>

        {/* Studio Layout: Editor (Left) + Visual Canvas (Right) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Field Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3 text-xs">
              <span className="font-bold text-zinc-800 uppercase tracking-wider text-[10px] block">
                Copy Customization Controls
              </span>

              {activeTab === 'linkedin' && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700">Ad Card Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700">Primary Post Body</label>
                    <textarea
                      rows={5}
                      value={primaryText}
                      onChange={(e) => setPrimaryText(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700">CTA Button Text</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              {activeTab === 'google' && (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="font-semibold text-zinc-700">Headline 1</label>
                      <span className={`text-[10px] ${googleHeadline1.length > 30 ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                        {googleHeadline1.length}/30
                      </span>
                    </div>
                    <input
                      type="text"
                      value={googleHeadline1}
                      onChange={(e) => setGoogleHeadline1(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="font-semibold text-zinc-700">Headline 2</label>
                      <span className={`text-[10px] ${googleHeadline2.length > 30 ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                        {googleHeadline2.length}/30
                      </span>
                    </div>
                    <input
                      type="text"
                      value={googleHeadline2}
                      onChange={(e) => setGoogleHeadline2(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="font-semibold text-zinc-700">Headline 3</label>
                      <span className={`text-[10px] ${googleHeadline3.length > 30 ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                        {googleHeadline3.length}/30
                      </span>
                    </div>
                    <input
                      type="text"
                      value={googleHeadline3}
                      onChange={(e) => setGoogleHeadline3(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="font-semibold text-zinc-700">Description (Max 90)</label>
                      <span className={`text-[10px] ${googleDesc1.length > 90 ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                        {googleDesc1.length}/90
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={googleDesc1}
                      onChange={(e) => setGoogleDesc1(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              {activeTab === 'twitter' && (
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Tweet Text</label>
                  <textarea
                    rows={6}
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Canvas Mockups */}
          <div className="lg:col-span-7 bg-zinc-100/60 p-6 rounded-3xl border border-zinc-200/80 flex flex-col items-center justify-center">
            {/* 1. LinkedIn Mockup */}
            {activeTab === 'linkedin' && (
              <div className="bg-white rounded-2xl border border-zinc-300/80 shadow-md max-w-md w-full overflow-hidden text-xs">
                {/* Brand Header */}
                <div className="p-4 flex items-center justify-between border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                      {businessName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-zinc-900">{businessName}</span>
                        <span className="text-[10px] text-zinc-400">&bull; 1st</span>
                      </div>
                      <span className="text-[11px] text-zinc-500 block">Promoted &bull; Sponsored</span>
                    </div>
                  </div>
                  <span className="text-zinc-400 font-bold">&bull;&bull;&bull;</span>
                </div>

                {/* Body Text */}
                <div className="p-4 text-zinc-800 leading-relaxed whitespace-pre-line">
                  {primaryText}
                </div>

                {/* Visual Banner Preview */}
                <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-900 text-white p-6 relative flex flex-col justify-between h-44">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full border border-indigo-500/40">
                      Verified Benchmark
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Competitive Teardown</span>
                    <h4 className="text-base font-bold text-white line-clamp-2">{headline}</h4>
                  </div>
                </div>

                {/* Footer Callout */}
                <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">researchflow.ai</span>
                    <span className="font-bold text-zinc-800 truncate block">{headline}</span>
                  </div>
                  <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shrink-0 shadow-2xs">
                    {ctaText}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Google Search Mockup */}
            {activeTab === 'google' && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-md max-w-lg w-full space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-zinc-900">Sponsored</span>
                  <span className="text-[11px] text-zinc-400">&bull;</span>
                  <span className="text-[11px] text-zinc-700 font-mono">https://www.{businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
                </div>

                {/* Headline Links */}
                <div>
                  <h4 className="text-base font-medium text-blue-800 hover:underline cursor-pointer leading-snug">
                    {googleHeadline1} | {googleHeadline2} | {googleHeadline3}
                  </h4>
                </div>

                {/* Description */}
                <p className="text-zinc-600 leading-relaxed">
                  {googleDesc1} Compare features, calculate cost per seat savings, and start with instant sandbox provisioning.
                </p>

                {/* Sitelinks Extensions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-blue-800">
                  <div className="p-2 bg-zinc-50 rounded-lg hover:bg-zinc-100 cursor-pointer">
                    <span className="font-semibold block text-[11px]">Pricing Calculator</span>
                    <span className="text-[10px] text-zinc-500">Calculate 3x cost savings</span>
                  </div>
                  <div className="p-2 bg-zinc-50 rounded-lg hover:bg-zinc-100 cursor-pointer">
                    <span className="font-semibold block text-[11px]">Feature Matrix</span>
                    <span className="text-[10px] text-zinc-500">Side-by-side parity check</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Twitter / X Mockup */}
            {activeTab === 'twitter' && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-md max-w-md w-full space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                    {businessName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-zinc-900">{businessName}</span>
                      <span className="text-blue-500 font-bold">&check;</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">@{businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
                  </div>
                </div>

                <p className="text-zinc-900 text-sm leading-relaxed whitespace-pre-line">
                  {primaryText}
                </p>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-zinc-400 text-xs">
                  <span>💬 24</span>
                  <span>🔁 88</span>
                  <span>❤️ 412</span>
                  <span>📊 14.2K</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
