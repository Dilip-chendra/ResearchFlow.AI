import React, { useState } from 'react';
import { X, Globe, Plus, AlertCircle, ShieldCheck } from 'lucide-react';
import { DigitalPropertyCategory } from '../../types';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { category: DigitalPropertyCategory; name: string; url: string }) => Promise<void>;
}

const CATEGORY_OPTIONS: { category: DigitalPropertyCategory; label: string; placeholder: string; scope: string }[] = [
  { category: 'OFFICIAL_WEBSITE', label: 'Official Website', placeholder: 'https://yourcompany.com', scope: 'Public Web HTML, Sitemap & Robots.txt directives' },
  { category: 'PRICING_PAGE', label: 'Pricing & Packaging Page', placeholder: 'https://yourcompany.com/pricing', scope: 'Public pricing tiers, billing frequency & plan limits' },
  { category: 'PRODUCT_PAGE', label: 'Product & Features Page', placeholder: 'https://yourcompany.com/features', scope: 'Product capabilities, screenshots & workflows' },
  { category: 'ABOUT_PAGE', label: 'About & Company History', placeholder: 'https://yourcompany.com/about', scope: 'Founding story, team statements & office locations' },
  { category: 'DOCS_HELP', label: 'Documentation & Help Center', placeholder: 'https://docs.yourcompany.com', scope: 'Technical guides, API documentation & FAQs' },
  { category: 'BLOG_NEWS', label: 'Blog & Newsroom', placeholder: 'https://yourcompany.com/blog', scope: 'Editorial thought leadership & launch announcements' },
  { category: 'CASE_STUDIES', label: 'Case Studies & Testimonials', placeholder: 'https://yourcompany.com/customers', scope: 'Customer proof points, logos & ROI quotes' },
  { category: 'CAREERS', label: 'Careers & Hiring Page', placeholder: 'https://yourcompany.com/careers', scope: 'Hiring growth velocity, open technical roles & team culture' },
  { category: 'LINKEDIN_COMPANY', label: 'LinkedIn Company Page', placeholder: 'https://linkedin.com/company/yourcompany', scope: 'Public OpenGraph metadata & brand description. Private data requires OAuth.' },
  { category: 'FOUNDER_PROFILE', label: 'Founder / Executive Profile', placeholder: 'https://linkedin.com/in/founder', scope: 'Public professional bio, headline & published articles' },
  { category: 'TWITTER_X', label: 'X (Twitter) Profile', placeholder: 'https://x.com/yourcompany', scope: 'Public profile metadata & public announcements' },
  { category: 'GITHUB', label: 'GitHub Organization / Repo', placeholder: 'https://github.com/yourcompany', scope: 'Public README, releases, language stats & repo signals' },
  { category: 'PRODUCT_HUNT', label: 'Product Hunt Page', placeholder: 'https://producthunt.com/products/yourproduct', scope: 'Launch ranking, community upvotes & user reviews' },
  { category: 'PUBLIC_REVIEWS', label: 'Public Reviews (G2, Capterra, Trustpilot)', placeholder: 'https://www.g2.com/products/yourcompany/reviews', scope: 'Aggregated CSAT rating, user pros/cons & category rank' },
  { category: 'APP_STORE', label: 'App Store / Google Play Listing', placeholder: 'https://apps.apple.com/app/your-app/id123', scope: 'App version notes, user ratings & feature descriptions' },
  { category: 'INVESTOR_NEWS', label: 'Investor Relations / Press Releases', placeholder: 'https://yourcompany.com/investors', scope: 'Funding disclosures, financial news & partnership updates' },
  { category: 'OTHER', label: 'Other Public Digital Source', placeholder: 'https://source-url.com', scope: 'Public web content with SSRF safety verification' },
];

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [category, setCategory] = useState<DigitalPropertyCategory>('OFFICIAL_WEBSITE');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategoryMeta = CATEGORY_OPTIONS.find((c) => c.category === category) || CATEGORY_OPTIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid URL.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must begin with http:// or https://');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAdd({
        category,
        name: name.trim() || currentCategoryMeta.label,
        url: url.trim(),
      });
      setName('');
      setUrl('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add digital property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-zinc-900">Add Digital Property / Source</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Source Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as DigitalPropertyCategory);
                if (!name) {
                  const found = CATEGORY_OPTIONS.find((c) => c.category === e.target.value);
                  if (found) setName(found.label);
                }
              }}
              className="w-full px-3.5 py-2.5 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.category} value={opt.category}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Label or Property Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={currentCategoryMeta.label}
              className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
              Source URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={currentCategoryMeta.placeholder}
              className="w-full px-3.5 py-2 text-xs text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs font-mono"
            />
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Access Scope & Security Guard</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              {currentCategoryMeta.scope}
            </p>
            <p className="text-[10px] text-zinc-400">
              All URLs are verified against SSRF, RFC 1918 private subnets, cloud metadata addresses, and respect robots.txt crawl directives.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Verifying Source...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect Property</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
