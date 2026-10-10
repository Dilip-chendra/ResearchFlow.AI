/**
 * RESEARCHFLOW AI — BROWSER-TAB TITLE & EVENT NOTIFICATION SYSTEM
 * 
 * Centralized, deterministic document-title manager providing:
 * 1. Stable, descriptive canonical titles for all primary application routes and SEO.
 * 2. Event-based browser-tab notification manager alerting users when real events occur
 *    WHILE the browser tab is hidden (e.g. research job completion, review needed, failure).
 * 3. Automatic, instant title restoration when the user returns to the tab.
 * 4. Multi-event aggregation without continuous blinking, sound, or polling timers.
 */

export interface TabEvent {
  id: string;
  label: string;
  timestamp?: number;
}

export const CANONICAL_PAGE_TITLES: Record<string, string> = {
  landing: 'ResearchFlow AI — Market Intelligence to Execution',
  auth: 'Sign In | ResearchFlow AI',
  overview: 'Overview | ResearchFlow AI',
  company: 'Company Intelligence | ResearchFlow AI',
  'war-room': 'Market War Room | ResearchFlow AI',
  research: 'Research Jobs | ResearchFlow AI',
  evidence: 'Evidence Explorer | ResearchFlow AI',
  intelligence: 'Competitor Matrix | ResearchFlow AI',
  campaigns: 'Campaign Strategy | ResearchFlow AI',
  tasks: 'Tasks | ResearchFlow AI',
  evaluation: 'Evaluation | ResearchFlow AI',
  audit: 'Audit Log | ResearchFlow AI',
  settings: 'Settings | ResearchFlow AI',
  pricing: 'Pricing & Plans | ResearchFlow AI',
  architecture: 'Architecture | ResearchFlow AI',
};

export const DEFAULT_TITLE = 'ResearchFlow AI — Market Intelligence to Execution';

class DocumentTitleManager {
  private canonicalTitle: string = DEFAULT_TITLE;
  private currentView: string = 'landing';
  private pendingEvents: Map<string, TabEvent> = new Map();
  private isTabHidden: boolean = false;
  private listenerAttached: boolean = false;
  private customTitleOverride: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.isTabHidden = document.hidden;
      this.canonicalTitle = document.title || DEFAULT_TITLE;
      this.attachVisibilityListener();
    }
  }

  /**
   * Set canonical route title based on active view and optional custom subtitle.
   */
  public setRoute(view: string, customTitle?: string): void {
    this.currentView = view;
    this.customTitleOverride = customTitle || null;

    if (customTitle) {
      this.canonicalTitle = customTitle.includes('ResearchFlow AI')
        ? customTitle
        : `${customTitle} | ResearchFlow AI`;
    } else {
      this.canonicalTitle = CANONICAL_PAGE_TITLES[view] || `${view.charAt(0).toUpperCase() + view.slice(1)} | ResearchFlow AI`;
    }

    // If tab is visible, apply immediately to browser tab
    if (!this.isTabHidden || this.pendingEvents.size === 0) {
      this.applyDocumentTitle(this.canonicalTitle);
    } else {
      // If tab is hidden with active notifications, update the badge without clearing
      this.renderNotificationTitle();
    }
  }

  /**
   * Retrieve the current canonical title for the route
   */
  public getCanonicalTitle(): string {
    return this.canonicalTitle;
  }

  /**
   * Retrieve current active view
   */
  public getCurrentView(): string {
    return this.currentView;
  }

  /**
   * Notify of a real application event (e.g. research job finished, review needed)
   * Only changes the document.title if the browser tab is hidden!
   */
  public notifyHiddenEvent(event: TabEvent): void {
    // If tab is currently visible, user is already looking at the app: no need to alert via tab title
    if (!this.isTabHidden) {
      return;
    }

    // Deduplicate identical events by ID
    this.pendingEvents.set(event.id, {
      ...event,
      timestamp: event.timestamp || Date.now(),
    });

    this.renderNotificationTitle();
  }

  /**
   * Remove a specific pending event by ID
   */
  public clearEvent(id: string): void {
    if (this.pendingEvents.has(id)) {
      this.pendingEvents.delete(id);
      if (this.pendingEvents.size === 0) {
        this.applyDocumentTitle(this.canonicalTitle);
      } else {
        this.renderNotificationTitle();
      }
    }
  }

  /**
   * Clear all pending notification events and restore the route's canonical title
   */
  public clearAllEvents(): void {
    this.pendingEvents.clear();
    this.applyDocumentTitle(this.canonicalTitle);
  }

  /**
   * Number of pending unacknowledged background events
   */
  public getPendingEventCount(): number {
    return this.pendingEvents.size;
  }

  /**
   * Test/mock helper: Manually trigger visibility state change (used in tests and browser events)
   */
  public handleVisibilityChange(isHidden: boolean): void {
    this.isTabHidden = isHidden;

    if (!isHidden) {
      // User returned to tab: restore canonical title and clear background alerts
      this.pendingEvents.clear();
      this.applyDocumentTitle(this.canonicalTitle);
    }
  }

  private renderNotificationTitle(): void {
    const count = this.pendingEvents.size;
    if (count === 0) {
      this.applyDocumentTitle(this.canonicalTitle);
      return;
    }

    if (count === 1) {
      const [singleEvent] = Array.from(this.pendingEvents.values());
      const label = singleEvent.label || 'Update';
      this.applyDocumentTitle(`(1) ${label} | ResearchFlow AI`);
    } else {
      this.applyDocumentTitle(`(${count}) Updates | ResearchFlow AI`);
    }
  }

  private applyDocumentTitle(title: string): void {
    if (typeof document !== 'undefined') {
      document.title = title;
    }
  }

  private attachVisibilityListener(): void {
    if (this.listenerAttached || typeof document === 'undefined') return;

    const onVisibilityChange = () => {
      this.handleVisibilityChange(document.hidden);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    this.listenerAttached = true;
  }
}

// Global singleton instance
export const titleManager = new DocumentTitleManager();
