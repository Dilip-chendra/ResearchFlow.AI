import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SearchResultItem, SearchCategoryType } from '../../types';
import { api } from '../../lib/api';
import {
  Search,
  X,
  Layers,
  Megaphone,
  CheckSquare,
  FileText,
  ArrowRight,
  Sparkles,
  Command,
  Loader2,
  Clock,
  ShieldCheck,
  Building2
} from 'lucide-react';

const CATEGORY_TABS: { id: SearchCategoryType; label: string }[] = [
  { id: 'all', label: 'All Results' },
  { id: 'research', label: 'Research Jobs' },
  { id: 'campaign', label: 'Campaigns & Assets' },
  { id: 'task', label: 'Tasks' },
  { id: 'evidence', label: 'Evidence & Claims' },
];

const SUGGESTED_SEARCHES = [
  'pricing',
  'resume',
  'ATS scanner',
  'university',
  'campaign',
  'credit card',
  'feedback',
];

export const GlobalSearchBar: React.FC = () => {
  const {
    activeWorkspace,
    setSelectedJobId,
    setActiveView,
    setIsMobileNavOpen,
  } = useWorkspace();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategoryType>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string, category: SearchCategoryType) => {
      const q = searchQuery.trim();
      if (!q) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.search(q, category, 25);
        setResults(response.results || []);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search failed', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      performSearch(query, activeCategory);
    }, 180);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [query, activeCategory, performSearch]);

  // Keyboard shortcut: Cmd+K / Ctrl+K or '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation inside search results
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectItem(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelectItem(results[0]);
      }
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    setIsOpen(false);
    setIsMobileNavOpen(false);

    if (item.jobId) {
      setSelectedJobId(item.jobId);
    }

    switch (item.type) {
      case 'research':
        setActiveView('research');
        break;
      case 'campaign':
        setActiveView('campaigns');
        break;
      case 'task':
        setActiveView('tasks');
        break;
      case 'evidence':
        setActiveView('evidence');
        break;
      default:
        setActiveView('overview');
        break;
    }
  };

  const getItemIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'research':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'campaign':
        return <Megaphone className="w-4 h-4 text-purple-600" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-emerald-600" />;
      case 'evidence':
        return <FileText className="w-4 h-4 text-amber-600" />;
      default:
        return <Search className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getItemTypeBadge = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'research':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">RESEARCH JOB</span>;
      case 'campaign':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">CAMPAIGN</span>;
      case 'task':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">TASK</span>;
      case 'evidence':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">EVIDENCE</span>;
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md lg:max-w-xl mx-2 sm:mx-4">
      {/* Search Input Bar */}
      <div
        className={`relative flex items-center w-full transition-all duration-150 rounded-xl border ${
          isOpen
            ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
            : 'bg-zinc-100/90 hover:bg-zinc-100 border-zinc-200 hover:border-zinc-300'
        }`}
      >
        <div className="pl-3 pr-2 flex items-center pointer-events-none text-zinc-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          id="global-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Search research, campaigns, tasks, evidence..."
          className="w-full py-1.5 sm:py-2 text-xs sm:text-sm bg-transparent placeholder-zinc-400 text-zinc-900 focus:outline-none pr-8"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="p-1 mr-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-200/60"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-0.5 mr-2 px-1.5 py-0.5 bg-zinc-200/80 border border-zinc-300/80 rounded text-[10px] font-medium text-zinc-600 select-none">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        )}
      </div>

      {/* Dropdown Results Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Filter Categories Bar */}
          <div className="flex items-center gap-1.5 p-2 bg-zinc-50 border-b border-zinc-200 overflow-x-auto text-xs no-scrollbar">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  if (query.trim()) {
                    performSearch(query, tab.id);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors text-xs ${
                  activeCategory === tab.id
                    ? 'bg-white text-indigo-700 shadow-xs border border-zinc-200/90 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-zinc-100">
            {isLoading && results.length === 0 ? (
              <div className="py-10 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <p className="text-xs font-medium text-zinc-600">Searching workspace items...</p>
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <p className="text-sm font-medium text-zinc-800">No items match "{query}"</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Try searching for competitors, pricing, campaign themes, or specific verified claims.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {SUGGESTED_SEARCHES.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setQuery(tag);
                        performSearch(tag, activeCategory);
                      }}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="p-1.5 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Found {results.length} item{results.length !== 1 ? 's' : ''}</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Use ↑ ↓ and Enter to jump</span>
                </div>
                {results.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/80 border border-indigo-200 shadow-2xs'
                          : 'hover:bg-zinc-50/80 border border-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-white flex items-center justify-center shrink-0 mt-0.5 border border-zinc-200/70">
                        {getItemIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {getItemTypeBadge(item.type)}
                          {item.badge && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h4>

                        {item.subtitle && (
                          <p className="text-xs text-zinc-600 line-clamp-1 mt-0.5 font-normal">
                            {item.subtitle}
                          </p>
                        )}

                        {item.snippet && (
                          <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 bg-zinc-50/90 group-hover:bg-white p-1.5 rounded-md border border-zinc-200/60 italic">
                            {item.snippet}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity pr-1 text-indigo-600">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty query state: show helpful shortcuts & suggestions
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Popular Search Keywords</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {SUGGESTED_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setQuery(tag);
                        performSearch(tag, activeCategory);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-zinc-200 text-zinc-700 text-xs font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    Searching workspace: <strong className="text-zinc-700">{activeWorkspace?.name || 'Active Workspace'}</strong>
                  </span>
                  <span className="hidden sm:inline">Press <kbd className="px-1 py-0.5 bg-zinc-100 border border-zinc-200 rounded font-mono text-[10px]">Esc</kbd> to close</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
