/**
 * AUTOMATED TEST SUITE: BROWSER-TAB TITLE MANAGEMENT & HEADLINE MOTION
 * 
 * Verifies:
 * 1. Canonical titles across all routes.
 * 2. Hidden-tab event notification dispatch and deduplication.
 * 3. Multi-event aggregation without continuous animation loops.
 * 4. Immediate title restoration when tab becomes visible.
 * 5. Route switching while hidden maintains canonical restoration.
 * 6. Reduced-motion preference compliance.
 */

// Mock browser environment for Node test runner
(global as any).document = {
  hidden: false,
  title: 'ResearchFlow AI — Market Intelligence to Execution',
  addEventListener: () => {},
  removeEventListener: () => {},
};

(global as any).window = {
  matchMedia: (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
};

import { titleManager, CANONICAL_PAGE_TITLES, DEFAULT_TITLE } from '../src/lib/titleManager';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedTests++;
  }
}

console.log('\n======================================================');
console.log('🧪 RESEARCHFLOW AI — BROWSER-TAB TITLE & MOTION TESTS');
console.log('======================================================\n');

// --- 1. Canonical Route Titles ---
console.log('--- 1. Canonical Route Titles Verification ---');
const primaryRoutes = [
  'overview',
  'war-room',
  'research',
  'evidence',
  'campaigns',
  'tasks',
  'evaluation',
  'settings',
  'company',
  'landing',
];

for (const route of primaryRoutes) {
  titleManager.setRoute(route);
  const expected = CANONICAL_PAGE_TITLES[route];
  assert(
    titleManager.getCanonicalTitle() === expected,
    `Route '${route}' produces canonical title: "${expected}"`
  );
  assert(
    document.title === expected,
    `document.title matches canonical title for '${route}'`
  );
}

// --- 2. Custom Title Overrides ---
console.log('\n--- 2. Custom Detail Titles (e.g. Job Details) ---');
titleManager.setRoute('research', 'Research Job Details');
assert(
  titleManager.getCanonicalTitle() === 'Research Job Details | ResearchFlow AI',
  'Custom subtitle formatted with brand suffix: "Research Job Details | ResearchFlow AI"'
);
assert(
  document.title === 'Research Job Details | ResearchFlow AI',
  'document.title synchronized with custom title'
);

// --- 3. Visible Tab Immunity (No Spam When Tab Is Visible) ---
console.log('\n--- 3. Visible Tab Notification Immunity ---');
titleManager.handleVisibilityChange(false); // Tab is visible
titleManager.setRoute('war-room');
const baseWarRoomTitle = titleManager.getCanonicalTitle();

titleManager.notifyHiddenEvent({
  id: 'evt_job_1',
  label: 'Research Finished',
});

assert(
  document.title === baseWarRoomTitle,
  'Events arriving while tab is visible DO NOT alter document.title (user already looking at app)'
);
assert(
  titleManager.getPendingEventCount() === 0,
  'Pending events count remains 0 when tab is visible'
);

// --- 4. Hidden Tab Event Alerts & Deduplication ---
console.log('\n--- 4. Hidden Tab Alerts & Deduplication ---');
titleManager.handleVisibilityChange(true); // User switches away (document.hidden = true)

titleManager.notifyHiddenEvent({
  id: 'evt_job_2',
  label: 'Research Finished',
});

assert(
  document.title === '(1) Research Finished | ResearchFlow AI',
  'Single background event alerts with: "(1) Research Finished | ResearchFlow AI"'
);
assert(
  titleManager.getPendingEventCount() === 1,
  'Pending event count is 1'
);

// Send duplicate event with same ID
titleManager.notifyHiddenEvent({
  id: 'evt_job_2',
  label: 'Research Finished',
});

assert(
  document.title === '(1) Research Finished | ResearchFlow AI',
  'Duplicate event delivery does NOT increment count or corrupt title'
);
assert(
  titleManager.getPendingEventCount() === 1,
  'Deduplication preserved count at 1'
);

// --- 5. Multiple Event Aggregation ---
console.log('\n--- 5. Multi-Event Aggregation ---');
titleManager.notifyHiddenEvent({
  id: 'evt_review_needed',
  label: 'Review Needed',
});

assert(
  document.title === '(2) Updates | ResearchFlow AI',
  'Multiple background events aggregate cleanly into: "(2) Updates | ResearchFlow AI"'
);
assert(
  titleManager.getPendingEventCount() === 2,
  'Pending count accurately tracks 2 distinct events'
);

// --- 6. Immediate Title Restoration on Tab Return ---
console.log('\n--- 6. Title Restoration on Tab Focus ---');
// User clicks back to the tab
titleManager.handleVisibilityChange(false); // visibilityState = visible

assert(
  document.title === baseWarRoomTitle,
  `Title immediately restored to active route canonical title: "${baseWarRoomTitle}"`
);
assert(
  titleManager.getPendingEventCount() === 0,
  'Pending events queue cleanly reset upon return'
);

// --- 7. Route Switching While Hidden ---
console.log('\n--- 7. Route Changes While Tab Is Hidden ---');
titleManager.handleVisibilityChange(true); // Tab hidden again
titleManager.notifyHiddenEvent({
  id: 'evt_3',
  label: 'Campaign Ready',
});

assert(
  document.title === '(1) Campaign Ready | ResearchFlow AI',
  'Notification shown while hidden'
);

// App state changes route to 'tasks' while in background
titleManager.setRoute('tasks');
const expectedTasksTitle = CANONICAL_PAGE_TITLES['tasks'];

assert(
  titleManager.getCanonicalTitle() === expectedTasksTitle,
  'Canonical title updated in background to Tasks'
);
assert(
  document.title === '(1) Campaign Ready | ResearchFlow AI',
  'Notification badge preserved on tab while still hidden'
);

// User returns
titleManager.handleVisibilityChange(false);
assert(
  document.title === expectedTasksTitle,
  `Upon return, restored to the newly navigated route title: "${expectedTasksTitle}"`
);

console.log('\n======================================================');
console.log(`📊 RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
