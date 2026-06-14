/**
 * FilterTube – Content Script
 * Injected into every YouTube page. Reads settings from storage,
 * scans video elements, and applies filtering logic in real-time.
 *
 * Uses MutationObserver to catch dynamically loaded content as
 * the user scrolls or navigates (YouTube is a SPA).
 */

// ─── Inline Imports (bundled for MV3 compatibility) ───────────────────────────
// Since MV3 content scripts don't support ES modules directly in all configs,
// all logic is self-contained in this file.

// ─── Settings Cache ───────────────────────────────────────────────────────────
let currentSettings = {
  filterKeywords: [],
  blockedKeywords: [],
  whitelistedChannels: [],
  hideShorts: false,
  focusMode: false,
  filterEnabled: true,
};

let isInitialized = false;
let observerActive = false;
let filterObserver = null;
let lastFilterRun = 0;
const FILTER_THROTTLE_MS = 150; // Max one filter pass per 150ms

// ─── Utility Functions ────────────────────────────────────────────────────────

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

function containsAny(text, keywords) {
  if (!keywords || keywords.length === 0) return false;
  const norm = normalize(text);
  return keywords.some((k) => norm.includes(normalize(k)));
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ─── DOM Helpers ──────────────────────────────────────────────────────────────

const VIDEO_SELECTORS = [
  'ytd-video-renderer',
  'ytd-rich-item-renderer',
  'ytd-compact-video-renderer',
  'ytd-grid-video-renderer',
  'ytd-playlist-video-renderer',
].join(', ');

const SHORTS_CONTAINER_SELECTORS = [
  'ytd-reel-shelf-renderer',
  'ytd-rich-shelf-renderer[is-shorts]',
  'ytd-shorts',
  'ytd-reel-item-renderer',
];

function extractTitle(el) {
  const titleEl =
    el.querySelector('#video-title') ||
    el.querySelector('yt-formatted-string#video-title') ||
    el.querySelector('h3 a') ||
    el.querySelector('a#video-title');

  if (titleEl) {
    return titleEl.getAttribute('title') || titleEl.textContent || '';
  }

  // Fallback: aria-label on anchor
  const anchor = el.querySelector('a#thumbnail');
  if (anchor) return anchor.getAttribute('aria-label') || '';

  return '';
}

function extractChannel(el) {
  const channelEl =
    el.querySelector('#channel-name a') ||
    el.querySelector('ytd-channel-name a') ||
    el.querySelector('yt-formatted-string.ytd-channel-name') ||
    el.querySelector('[id="channel-name"]');

  return channelEl ? (channelEl.textContent || '').trim() : '';
}

function isShortVideo(el) {
  // Check Shorts badge
  if (el.querySelector('[overlay-style="SHORTS"]')) return true;
  if (el.querySelector('ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]')) return true;

  // Check href
  const anchor = el.querySelector('a#thumbnail, a[href*="/shorts/"]');
  if (anchor?.href?.includes('/shorts/')) return true;

  // Check duration badge (0:XX = short)
  const durationEl = el.querySelector('ytd-thumbnail-overlay-time-status-renderer span.ytd-thumbnail-overlay-time-status-renderer');
  if (durationEl) {
    const d = durationEl.textContent.trim();
    if (/^0:\d{2}$/.test(d)) return true;
  }

  return false;
}

function hideElement(el) {
  if (el.dataset.filtube === 'hidden') return;
  el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  el.style.opacity = '0';
  el.style.transform = 'scale(0.96)';
  el.style.pointerEvents = 'none';
  setTimeout(() => {
    if (el.style.opacity === '0') {
      el.style.display = 'none';
    }
  }, 220);
  el.dataset.filtube = 'hidden';
}

function showElement(el) {
  if (el.dataset.filtube === 'visible') return;
  el.style.display = '';
  el.style.opacity = '';
  el.style.transform = '';
  el.style.pointerEvents = '';
  el.dataset.filtube = 'visible';
}

// ─── Decision Engine ──────────────────────────────────────────────────────────

function shouldShowVideo(title, channel, settings) {
  const {
    filterKeywords = [],
    blockedKeywords = [],
    whitelistedChannels = [],
    filterEnabled = true,
  } = settings;

  if (!filterEnabled) return true;

  const normChannel = normalize(channel);
  const combinedText = `${normalize(title)} ${normChannel}`;

  // Rule 1: Whitelisted channel → always show
  if (whitelistedChannels.length > 0) {
    const whitelisted = whitelistedChannels.some((wc) => {
      const normWc = normalize(wc);
      return normChannel.includes(normWc) || normWc.includes(normChannel);
    });
    if (whitelisted) return true;
  }

  // Rule 2: Blocked keyword → always hide
  if (blockedKeywords.length > 0 && containsAny(combinedText, blockedKeywords)) {
    return false;
  }

  // Rule 3: Filter keywords (allowlist) – hide if no match
  if (filterKeywords.length > 0 && !containsAny(combinedText, filterKeywords)) {
    return false;
  }

  return true;
}

// ─── Main Filter Runner ───────────────────────────────────────────────────────

function runFilter() {
  const now = Date.now();
  if (now - lastFilterRun < FILTER_THROTTLE_MS) return;
  lastFilterRun = now;

  const settings = currentSettings;

  // 1. Filter video cards
  const videoEls = document.querySelectorAll(VIDEO_SELECTORS);
  videoEls.forEach((el) => {
    // Skip if inside a Shorts shelf (handled separately)
    if (el.closest('ytd-reel-shelf-renderer')) return;

    const title = extractTitle(el);
    const channel = extractChannel(el);

    // Handle Shorts toggle
    if (settings.hideShorts && isShortVideo(el)) {
      hideElement(el);
      return;
    }

    const show = shouldShowVideo(title, channel, settings);
    show ? showElement(el) : hideElement(el);
  });

  // 2. Hide Shorts shelves/containers
  if (settings.hideShorts) {
    applyShortsSuppression();
  }

  // 3. Apply Focus Mode
  if (settings.focusMode) {
    applyFocusMode();
  } else {
    removeFocusMode();
  }
}

// ─── Shorts Suppression ───────────────────────────────────────────────────────

function applyShortsSuppression() {
  // Target Shorts shelf containers
  const shortsSelectors = [
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-shorts',
    'ytm-shorts-lockup-view-model',
  ];

  shortsSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      hideElement(el);
    });
  });

  // Hide Shorts navigation item in sidebar
  document.querySelectorAll('ytd-guide-entry-renderer a, ytd-mini-guide-entry-renderer a').forEach((a) => {
    if (a.href && a.href.includes('/shorts')) {
      const parent = a.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
      if (parent) parent.style.display = 'none';
    }
  });

  // Hide rich section renderers that contain Shorts
  document.querySelectorAll('ytd-rich-section-renderer').forEach((el) => {
    if (el.querySelector('ytd-reel-shelf-renderer, [is-shorts]')) {
      hideElement(el);
    }
  });
}

// ─── Focus Mode ───────────────────────────────────────────────────────────────

const FOCUS_MODE_CLASS = 'filtertube-focus-mode';

function applyFocusMode() {
  document.documentElement.classList.add(FOCUS_MODE_CLASS);

  // Hide secondary sidebar on watch pages
  const secondary = document.querySelector('#secondary');
  if (secondary) secondary.style.display = 'none';

  // Hide "Up Next" sections
  document.querySelectorAll('ytd-watch-next-secondary-results-renderer').forEach((el) => {
    el.style.display = 'none';
  });

  // On homepage, hide trending/notification sections
  document.querySelectorAll('ytd-rich-section-renderer').forEach((el) => {
    const title = el.querySelector('#title')?.textContent?.toLowerCase() || '';
    if (title.includes('trending') || title.includes('news') || title.includes('recommended')) {
      el.style.display = 'none';
    }
  });
}

function removeFocusMode() {
  document.documentElement.classList.remove(FOCUS_MODE_CLASS);

  const secondary = document.querySelector('#secondary');
  if (secondary) secondary.style.display = '';

  document.querySelectorAll('ytd-watch-next-secondary-results-renderer').forEach((el) => {
    el.style.display = '';
  });
}

// ─── MutationObserver Setup ───────────────────────────────────────────────────

const debouncedFilter = debounce(runFilter, 200);

function startObserver() {
  if (observerActive) return;

  const targetNode = document.body;
  const config = {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  };

  filterObserver = new MutationObserver((mutations) => {
    // Only re-run if actual node additions happened
    const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasAddedNodes) {
      debouncedFilter();
    }
  });

  filterObserver.observe(targetNode, config);
  observerActive = true;
  console.log('[FilterTube] Observer started.');
}

function stopObserver() {
  if (filterObserver) {
    filterObserver.disconnect();
    filterObserver = null;
    observerActive = false;
    console.log('[FilterTube] Observer stopped.');
  }
}

// ─── Settings Loader ──────────────────────────────────────────────────────────

function loadSettings(callback) {
  const defaults = {
    filterKeywords: [],
    blockedKeywords: [],
    whitelistedChannels: [],
    hideShorts: false,
    focusMode: false,
    filterEnabled: true,
  };

  chrome.storage.sync.get(defaults, (result) => {
    currentSettings = result;
    if (callback) callback(result);
  });
}

// ─── Storage Change Listener ──────────────────────────────────────────────────

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;

  // Update local settings cache
  Object.keys(changes).forEach((key) => {
    currentSettings[key] = changes[key].newValue;
  });

  console.log('[FilterTube] Settings updated, re-filtering...');
  runFilter();
});

// ─── YouTube SPA Navigation Detection ────────────────────────────────────────

// YouTube navigates without full page reloads (SPA).
// We listen for the yt-navigate-finish event to re-run filters after navigation.
document.addEventListener('yt-navigate-finish', () => {
  console.log('[FilterTube] Navigation detected, re-filtering...');
  setTimeout(runFilter, 500);
  setTimeout(runFilter, 1500); // Second pass for late-loading elements
});

// ─── Initialization ───────────────────────────────────────────────────────────

function init() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('[FilterTube] Initializing on:', window.location.href);

  loadSettings(() => {
    runFilter();
    startObserver();

    // Extra passes for slow-loading content
    setTimeout(runFilter, 1000);
    setTimeout(runFilter, 3000);
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
